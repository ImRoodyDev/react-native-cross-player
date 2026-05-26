import { M3U8AudioTrack, M3U8BlobOptions, SourceTypes, SubtitleSource, VideoSource } from "../types/media";
import { fetchSource, fetchSubtitleTrackRawData } from "./network";
import { Parser, PlaylistItem } from "m3u8-parser";
import { ProxyURLResolverCallback } from "../types/hls";
import { createM3U8File, createVTTFile, readLocalFileContent } from "./blob";
import { detectSourceType, detectSubtitleType } from "../utils/detectors";
import { CNPLogger } from "../utils/logger";
import { default as pLimit } from "p-limit";

export type ResolutionKey = keyof typeof RESOLUTIONS;

export const SRTWebSTYLE = `STYLE
				::cue {
					background-image: var(--darkblackTransparent);
					color: white;
				}
` as const;

export const RESOLUTIONS = {
	"360p": { bandwidth: 800000, width: 640, height: 360 },
	"720p": { bandwidth: 3000000, width: 1280, height: 720 },
	"1080p": { bandwidth: 6000000, width: 1920, height: 1080 },
	"1440p": { bandwidth: 12000000, width: 2560, height: 1440 },
	"2160p": { bandwidth: 25000000, width: 3840, height: 2160 }
} as const;

// Typed variant results to keep shape clear
type VariantSuccess = {
	file: string;
	uri: string;
	absoluteVariantUrl: string;
	raw: string;
	success: true;
	index: number;
};

type VariantFailure = {
	uri: string;
	error?: string;
	success: false;
	index: number;
};

type VariantResult = VariantSuccess | VariantFailure;

// Audio track info extracted from parsed master playlist
type AudioTrackInfo = {
	uri: string;
	name: string;
	language: string;
	default: boolean;
	groupId: string;
};

// Typed audio track results to keep shape clear
type AudioTrackSuccess = {
	file: string;
	uri: string;
	absoluteUrl: string;
	success: true;
	name: string;
	groupId: string;
};

type AudioTrackFailure = {
	uri: string;
	error?: string;
	success: false;
	name: string;
	groupId: string;
};

type AudioTrackResult = AudioTrackSuccess | AudioTrackFailure;

type RewriteVariantsOptions = {
	videoSource: VideoSource;
	requestOptions: {
		useProxy: boolean;
		proxyURL: string;
		proxyHeaders: Record<string, string>;
		proxyResolver?: ProxyURLResolverCallback;
	};
};

const PLAYLIST_SPLIT_EXP = /\r?\n/;
const EXT_X_STREAM_INF_EXP = /^#EXT-X-STREAM-INF:/i;
const EXT_X_MEDIA_AUDIO_EXP = /^#EXT-X-MEDIA:.*TYPE=AUDIO/i;
const EXT_X_MEDIA_URI_EXP = /URI="([^"]+)"/;

/**
 * Creates a rewritten M3U8 playlist file/blob with all URIs resolved and optionally proxied.
 * Handles both master playlists (with variants) and media playlists (direct segments).
 */
export async function createM3U8Source(videoSource: VideoSource, proxyResolver?: ProxyURLResolverCallback): Promise<string> {
	try {
		// Get the original playlist URL
		// This can be an blob, url, or native path location
		const videoURL = videoSource.source;
		const sourceType = detectSourceType(videoURL);
		CNPLogger.info(`[M3U8] Creating M3U8 file for source type: ${sourceType} - ${videoURL}`);

		// Determine request proxy options
		const requestOptions = {
			useProxy: !!videoSource.options?.useProxy,
			proxyURL: videoSource.options?.overrideProxyURL || "",
			proxyHeaders: videoSource.options?.headers || {},
			proxyResolver
		};

		// Fetch the playlist text. Use local file reader for native paths, otherwise fetch remotely.
		const playlistText =
			sourceType === SourceTypes.NATIVE_PATH
				? await readLocalFileContent(videoURL)
				: await fetchSource(videoURL, requestOptions).then(async (res) => {
						if (res.ok) return await res.text();
						else throw new Error(`HTTP ${res.status}`);
					});

		// Parse to detect master/variant structure
		const parser = new Parser();
		parser.push(playlistText);
		parser.end();
		const isMaster = !!parser.manifest.playlists && parser.manifest.playlists.length > 0;

		// Handle master playlist with variants
		if (isMaster) {
			CNPLogger.info("[M3U8] Detected master playlist with variants");
			const playlistVariants = parser.manifest.playlists || [];

			// Process variants with error handling for each , ( with limit to avoid too many concurrent fetches )
			const limit = pLimit(5); // Limit to 5 concurrent fetches
			const variantResults = await Promise.allSettled(
				playlistVariants.map(async (playlist, index) => limit(() => rewriteM3U8Variants(playlist, index, { videoSource, requestOptions })))
			);

			// Collect successful and failed variants (handle rejected promises too)
			const successfulVariants = variantResults
				.filter((r): r is PromiseFulfilledResult<VariantSuccess> => r.status === "fulfilled" && r.value.success)
				.map((r) => r.value);
			const failedVariants = variantResults
				.map((r, i) => {
					if (r.status === "rejected") return { index: i, error: String(r.reason) };
					if (r.status === "fulfilled" && !r.value.success) return { index: r.value.index, error: r.value.error || "unknown" };
					return null;
				})
				.filter(Boolean) as Array<{ index: number; error: string }>;

			// Log warnings for failed variants
			if (failedVariants.length > 0)
				CNPLogger.warn(
					`Failed to fetch ${failedVariants.length} variant(s):`,
					failedVariants.map((v) => `Variant ${v.index}: ${v.error}`)
				);

			// If all variants failed, throw an error
			if (successfulVariants.length === 0 && playlistVariants.length > 0) {
				CNPLogger.error(`All ${playlistVariants.length} variants failed to fetch`);
				throw new Error(`All ${playlistVariants.length} variants failed to fetch`);
			}

			// Build a lookup map and rewrite master playlist to point to processed variant files
			const variantMap = new Map(successfulVariants.map((v) => [v.uri, v.file]));

			// Extract and process audio tracks from the master playlist
			const audioTracks = extractAudioTracks(parser.manifest.mediaGroups);
			const audioMap = new Map<string, string>();

			if (audioTracks.length > 0) {
				CNPLogger.info(`[M3U8] Found ${audioTracks.length} audio track(s)`);
				const audioResults = await Promise.allSettled(
					audioTracks.map((track, index) => limit(() => rewriteM3U8AudioTrack(track, index, { videoSource, requestOptions })))
				);

				// Collect successful audio tracks
				const successfulAudio = audioResults
					.filter((r): r is PromiseFulfilledResult<AudioTrackSuccess> => r.status === "fulfilled" && r.value.success)
					.map((r) => r.value);

				// Log warnings for failed audio tracks
				const failedAudio = audioResults.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success));
				if (failedAudio.length > 0) CNPLogger.warn(`[M3U8] Failed to process ${failedAudio.length} audio track(s)`);

				// Build audio track URI lookup
				successfulAudio.forEach((a) => audioMap.set(a.uri, a.file));
			}

			// Rewrite master playlist lines
			const masterLines = playlistText.split(PLAYLIST_SPLIT_EXP);
			const rewrittenMasterLines: string[] = [];

			// Iterate through master playlist lines
			for (let i = 0; i < masterLines.length; i++) {
				const line = masterLines[i];
				const trimmed = line.trim();

				if (!trimmed) {
					rewrittenMasterLines.push(line);
					continue;
				}

				// Rewrite audio track URIs in EXT-X-MEDIA lines
				if (EXT_X_MEDIA_AUDIO_EXP.test(trimmed)) {
					const uriMatch = trimmed.match(EXT_X_MEDIA_URI_EXP);
					if (uriMatch) {
						const audioUri = uriMatch[1];
						const audioFile = audioMap.get(audioUri);
						if (audioFile) {
							// Replace the original URI with the local file path
							rewrittenMasterLines.push(line.replace(`URI="${audioUri}"`, `URI="${audioFile}"`));
						}
						// Skip audio tracks that failed processing
					} else {
						// No URI attribute (muxed audio), keep as-is
						rewrittenMasterLines.push(line);
					}
					continue;
				}

				// If this is a STREAM-INF line, keep it and process the next line (URI)
				if (EXT_X_STREAM_INF_EXP.test(trimmed)) {
					// Find the next URI line
					let uriLineIndex = -1;
					let uriValue = "";

					// Look ahead for the URI line
					for (let j = i + 1; j < masterLines.length; j++) {
						const nextTrimmed = masterLines[j].trim();
						if (!nextTrimmed || nextTrimmed.startsWith("#")) continue;
						uriLineIndex = j;
						uriValue = nextTrimmed;
						break;
					}

					if (uriLineIndex === -1) {
						// Malformed playlist - no URI found
						rewrittenMasterLines.push(line);
						continue;
					}

					// Check if this variant succeeded
					const variantData = variantMap.get(uriValue);
					if (variantData) {
						// Keep the STREAM-INF line and add the rewritten URI
						rewrittenMasterLines.push(line);
						// Add any lines between STREAM-INF and URI
						for (let k = i + 1; k < uriLineIndex; k++) {
							rewrittenMasterLines.push(masterLines[k]);
						}
						rewrittenMasterLines.push(variantData);
						i = uriLineIndex; // Skip to after the URI line
					} else {
						// Skip this variant entirely (both STREAM-INF and URI)
						i = uriLineIndex;
					}
				} else {
					rewrittenMasterLines.push(line);
				}
			}

			// Create final master playlist file/blob
			const finalMasterContent = rewrittenMasterLines.join("\n");
			const masterFileName = `${videoSource.id || videoSource.label || "master"}.m3u8`;
			return await createM3U8File(finalMasterContent, masterFileName, videoSource.playerId);
		} else {
			CNPLogger.info("[M3U8] Detected media playlist (no variants)");
			// Handle media playlist (no variants)
			// Use original base URL for rewriting, not the proxy URL
			const rewrittenMedia = rewriteM3U8URIs(playlistText, videoURL, requestOptions.useProxy, (url) =>
				!requestOptions.proxyResolver ? url : requestOptions.proxyResolver(url, requestOptions.proxyURL, requestOptions.proxyHeaders)
			);

			// Create media playlist file/blob
			const mediaFileName = `${videoSource.id || videoSource.label || "media"}.m3u8`;
			return await createM3U8File(rewrittenMedia, mediaFileName, videoSource.playerId);
		}
	} catch (error) {
		CNPLogger.error(`Failed to create M3U8 blob file: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}

async function rewriteM3U8Variants(playlist: PlaylistItem, index: number, options: RewriteVariantsOptions): Promise<VariantResult> {
	// Deconstruct options
	const variantURI = playlist.uri.trim();
	const { videoSource, requestOptions } = options;
	try {
		// Check if its empty throw an error
		if (!variantURI || variantURI.trim() === "") throw new Error("Variant URI is empty");
		CNPLogger.info(`[M3U8] Found variant URI: ${playlist.uri}`);

		// Resolve variant URL against ORIGINAL base
		const absoluteVariantUrl = new URL(variantURI, videoSource.source).toString();
		const absoluteVariantType = detectSourceType(absoluteVariantUrl);
		CNPLogger.info(`[M3U8] Processing variant ${index}: ${absoluteVariantUrl} (type=${absoluteVariantType})`);
		CNPLogger.info(`Fetching variant ${index}: ${absoluteVariantUrl} (proxy=${requestOptions.useProxy})`);

		// Fetch or read the variant playlist segment depending on scheme
		const rawSegments =
			absoluteVariantType === SourceTypes.NATIVE_PATH
				? await readLocalFileContent(absoluteVariantUrl)
				: await fetchSource(absoluteVariantUrl, requestOptions).then(async (variantResponse) => {
						if (!variantResponse.ok) throw new Error(`HTTP ${variantResponse.status}`);
						return await variantResponse.text();
					});

		// Rewrite variant's segments using the variant's original base URL
		const rewrittenRawSegments = rewriteM3U8URIs(rawSegments, absoluteVariantUrl, requestOptions.useProxy, (url) =>
			!requestOptions.proxyResolver ? url : requestOptions.proxyResolver(url, requestOptions.proxyURL, requestOptions.proxyHeaders)
		);

		// Create file/blob for this variant
		const variantFileName = `${videoSource.id || "master"}_variant_${index}.m3u8`;
		const variantFileUrl = await createM3U8File(rewrittenRawSegments, variantFileName, videoSource.playerId);
		CNPLogger.info(`Created variant file for variant ${index}: ${variantFileUrl}`);

		return {
			file: variantFileUrl,
			uri: variantURI,
			absoluteVariantUrl,
			raw: rewrittenRawSegments,
			success: true,
			index
		};
	} catch (error) {
		CNPLogger.warn(`Failed to fetch/process variant ${index} (${variantURI}): ${error instanceof Error ? error.message : String(error)}`);
		return {
			uri: variantURI,
			error: error instanceof Error ? error.message : String(error),
			success: false,
			index
		};
	}
}

/**
 * Fetch and rewrite an audio track playlist, resolving its segment URIs.
 * Follows the same pattern as rewriteM3U8Variants but for audio renditions.
 */
async function rewriteM3U8AudioTrack(track: AudioTrackInfo, index: number, options: RewriteVariantsOptions): Promise<AudioTrackResult> {
	const { videoSource, requestOptions } = options;
	try {
		if (!track.uri || track.uri.trim() === "") throw new Error("Audio track URI is empty");
		CNPLogger.info(`[M3U8] Processing audio track ${index}: ${track.name} (${track.language})`);

		// Resolve audio track URL against the original base
		const absoluteUrl = new URL(track.uri, videoSource.source).toString();
		const sourceType = detectSourceType(absoluteUrl);
		CNPLogger.info(`[M3U8] Fetching audio track ${index}: ${absoluteUrl} (type=${sourceType})`);

		// Fetch audio playlist content
		const rawContent =
			sourceType === SourceTypes.NATIVE_PATH
				? await readLocalFileContent(absoluteUrl)
				: await fetchSource(absoluteUrl, requestOptions).then(async (res) => {
						if (!res.ok) throw new Error(`HTTP ${res.status}`);
						return await res.text();
					});

		// Rewrite segment URIs in the audio playlist
		const rewrittenContent = rewriteM3U8URIs(rawContent, absoluteUrl, requestOptions.useProxy, (url) =>
			!requestOptions.proxyResolver ? url : requestOptions.proxyResolver(url, requestOptions.proxyURL, requestOptions.proxyHeaders)
		);

		// Create file for this audio track
		const fileName = `${videoSource.id || "master"}_audio_${index}.m3u8`;
		const fileUrl = await createM3U8File(rewrittenContent, fileName, videoSource.playerId);
		CNPLogger.info(`[M3U8] Created audio track file ${index}: ${fileUrl}`);

		return { file: fileUrl, uri: track.uri, absoluteUrl, success: true, name: track.name, groupId: track.groupId };
	} catch (error) {
		CNPLogger.warn(`[M3U8] Failed to process audio track ${index} (${track.uri}): ${error instanceof Error ? error.message : String(error)}`);
		return {
			uri: track.uri,
			error: error instanceof Error ? error.message : String(error),
			success: false,
			name: track.name,
			groupId: track.groupId
		};
	}
}

/**
 * Extract audio track info from the parsed manifest's mediaGroups.
 * Returns a flat list of audio tracks with their URIs and metadata.
 */
function extractAudioTracks(mediaGroups: any): AudioTrackInfo[] {
	const tracks: AudioTrackInfo[] = [];
	if (!mediaGroups?.AUDIO) return tracks;

	for (const [groupId, group] of Object.entries(mediaGroups.AUDIO as Record<string, Record<string, any>>)) {
		for (const [name, track] of Object.entries(group)) {
			// Only include tracks with a URI (skip muxed audio without a separate stream)
			if (track.uri) {
				tracks.push({ uri: track.uri, name, language: track.language || "", default: !!track.default, groupId });
			}
		}
	}

	return tracks;
}

/** Rewrite function: replace URI lines with resolved URLs
 * - Resolves relative URIs against the playlist URL
 * - Applies proxying if `useProxy` is true
 *
 * NOTE :
 * 	(Blob URLs cannot be used as base URLs for relative resolution in the URL constructor)
 * 		🔴 base=blob:http://localhost/550e8400-e29b-41d4-a716-446655440000
 *   rel=/absolute/path/variant.m3u8
 *   => ERROR: TypeError: Invalid URL
 *
 *    🟢 base=blob:http://localhost/550e8400-e29b-41d4-a716-446655440000
 *   rel=http://cdn.example.com/variant.m3u8
 *   => http://cdn.example.com/variant.m3u80
 *
 * @param text The original playlist text
 * @param playlistURL The base URL of the playlist for resolving relative URIs (## NOT the proxy URL ##DD)
 * @param useProxy Whether to apply proxying
 * @param proxyResolver Function to resolve proxied URLs
 * @returns The rewritten playlist text with resolved URIs
 *
 */
function rewriteM3U8URIs(text: string, playlistURL: string, useProxy: boolean = false, proxyResolver: (url: string) => string): string {
	const lines = text.split(/\r?\n/);
	const rewrittenLines = lines.map((line) => {
		const trimmed = line.trim();

		// Keep empty lines and comments/tags unchanged
		if (!trimmed || trimmed.startsWith("#")) {
			// Resolve URI attributes inside EXT-X-MEDIA tags (audio/subtitle tracks)
			if (trimmed.startsWith("#EXT-X-MEDIA:") && trimmed.includes("URI=")) {
				return line.replace(/URI="([^"]+)"/, (_match, uri: string) => {
					let absoluteUrl: string;
					try {
						absoluteUrl = new URL(uri, playlistURL).toString();
					} catch {
						if (uri.startsWith("http") || uri.startsWith("//")) absoluteUrl = uri;
						else return `URI="${uri}"`; // Can't resolve, keep as-is
					}
					const sourceType = detectSourceType(absoluteUrl);
					return `URI="${useProxy && sourceType === SourceTypes.URL ? proxyResolver(absoluteUrl) : absoluteUrl}"`;
				});
			}
			return line;
		}

		// This is a URI line - resolve it
		let absoluteUrl: string;
		try {
			absoluteUrl = new URL(trimmed, playlistURL).toString();
		} catch {
			// If URL resolution fails, try to handle it as absolute URL
			if (trimmed.startsWith("http") || trimmed.startsWith("//")) {
				absoluteUrl = trimmed;
			} else {
				// If we can't resolve it, return as-is
				console.warn(`Failed to resolve URL: ${trimmed} with base: ${playlistURL}`);
				return trimmed;
			}
		}

		// Only use proxy if the type is not file:// or blob:
		const sourceType = detectSourceType(absoluteUrl);
		return useProxy && sourceType === SourceTypes.URL ? proxyResolver(absoluteUrl) : absoluteUrl;
	});

	return rewrittenLines.join("\n");
}

/**
 * Build an HLS master M3U8 playlist from variant playlists, subtitle and audio tracks.
 * - Adds `#EXT-X-MEDIA` lines for subtitle and audio tracks.
 * - Adds `#EXT-X-STREAM-INF` entries for each variant playlist.
 * @param options The M3U8BlobOptions containing playlists, subtitles, and audio tracks
 * @returns The text content of the master M3U8 playlist
 */
export function createMasterM3U8Raw(options: M3U8BlobOptions): string {
	CNPLogger.info(`[M3U8] Creating master playlist with ${options.playlists.length} variants and ${options.subtitles.length} subtitles`);
	let masterPlaylist = "#EXTM3U\n#EXT-X-VERSION:6\n"; // #EXT-X-VERSION:3 is low for subtitles support

	// Add subtitle tracks
	if (options.embedSubtitles)
		options.subtitles.forEach((subtitle) => {
			if (subtitle.type !== "vtt")
				return console.warn(`[M3U8] Subtitle track with URL ${subtitle.source} is not of type 'vtt' and will be skipped in the master playlist.`);
			masterPlaylist +=
				`#EXT-X-MEDIA:TYPE=SUBTITLES,` +
				`GROUP-ID="subs",` +
				`NAME="${subtitle.label || subtitle.langISO}",` +
				`LANGUAGE="${subtitle.langISO}",` +
				`AUTOSELECT=YES,` +
				`DEFAULT=${subtitle.default ? "YES" : "NO"},` +
				`URI="${subtitle.source}"\n`;
		});

	// Add audio tracks
	if (options.embedAudioTracks && options.audioTracks)
		options.audioTracks.forEach((track) => {
			masterPlaylist +=
				`#EXT-X-MEDIA:TYPE=AUDIO,` +
				`GROUP-ID="${track.groupId || "audio"}",` +
				`NAME="${track.label || track.langISO}",` +
				`LANGUAGE="${track.langISO}",` +
				`AUTOSELECT=YES,` +
				`DEFAULT=${track.default ? "YES" : "NO"},` +
				`${track.channels ? `CHANNELS="${track.channels}",` : ""}` +
				`URI="${track.source}"\n`;
		});

	// Check if we need to reference audio/subtitle groups in stream-inf
	const hasAudio = options.embedAudioTracks && options.audioTracks && options.audioTracks.length > 0;

	// Add playlist tracks
	options.playlists.forEach((playlist) => {
		const resolution =
			playlist.dimensions ||
			`${RESOLUTIONS[playlist.resolution as ResolutionKey]?.width || 0}x${RESOLUTIONS[playlist.resolution as ResolutionKey]?.height || 0}`;

		masterPlaylist +=
			`#EXT-X-STREAM-INF:` +
			`BANDWIDTH=${playlist.bandwidth || 0}` +
			`${playlist.codecs ? `,CODECS="${playlist.codecs}"` : ""}` +
			`${playlist.resolution || playlist.dimensions ? `,RESOLUTION=${resolution}` : ""}` +
			`${options.embedSubtitles ? ',SUBTITLES="subs"' : ""}` +
			`${hasAudio ? ',AUDIO="audio"' : ""}` +
			`\n${playlist.source}\n`;
	});

	return masterPlaylist;
}

/** Create a VTT subtitle source file/blob from a subtitle track.
 * - Fetches the subtitle content, detects its type, converts to VTT if needed,
 *   and creates a VTT file/blob.
 * - Supports SRT to VTT conversion.
 * @param trackSource The subtitle track source descriptor
 * @param proxyResolver Optional proxy URL resolver function
 * @returns The URL of the created VTT file/blob
 * @throws Error if fetching or conversion fails
 */
export async function createVTTSource(trackSource: SubtitleSource, proxyResolver?: ProxyURLResolverCallback): Promise<string> {
	try {
		// Get the video URL for source type detection
		const sourceType = detectSourceType(trackSource.source);
		CNPLogger.info(`[VTT] Creating VTT source for type: ${sourceType} - ${trackSource.source}`);

		// Fetch raw subtitle content
		const rawData =
			sourceType === SourceTypes.NATIVE_PATH ? await readLocalFileContent(trackSource.source) : await fetchSubtitleTrackRawData(trackSource, proxyResolver);

		if (rawData === null) throw new Error(`Failed to fetch subtitle from ${trackSource.source}`);

		const type = detectSubtitleType(rawData);
		if (type === null) throw new Error(`Could not detect subtitle type for track from ${trackSource.source}`);

		let vttData = rawData;
		if (type === "srt") vttData = convertSRTtoVTT(rawData);

		const fileName = `${trackSource.id || trackSource.langISO || "subtitle"}.vtt`;
		return await createVTTFile(vttData, fileName, trackSource.playerId, trackSource.playerId);
	} catch (error) {
		CNPLogger.error(`Failed to create VTT source for ${trackSource.source}: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}

/**
 * Convert SRT subtitle content to WebVTT format.
 * - Converts timestamps from comma-milliseconds to VTT-compatible dot format.
 * - Strips SRT formatting blocks and simple HTML-like tags.
 * @param srtData SRT file contents as a string
 * @param style Optional VTT `STYLE` block to prefix (defaults to `SRTWebSTYLE`)
 * @returns A string containing the converted WebVTT content
 */
export function convertSRTtoVTT(srtData: string, style: string = SRTWebSTYLE): string {
	const vttContent = srtData
		.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2") // Convert timestamps , keeps milliseconds
		.replace(/{.*?}/g, "") // Remove SRT formatting tags
		.replace(/<.*?>/g, ""); // Remove HTML-like tags
	return "WEBVTT\n" + style.trim() + "\n\n" + vttContent.trim(); // Some Android players choke if there’s extra whitespace
}
