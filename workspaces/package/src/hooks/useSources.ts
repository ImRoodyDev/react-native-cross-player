import { Platform } from "react-native";
import { SubtitleSource, VideoSource, VideoSourceWithoutId } from "../types/media";
import { ProxyConfig } from "../types/hls";
import { createM3U8Source, createVTTSource } from "../libs/media";
import { clearBlobGroup } from "../libs/blob";
import { normalizeSourceURL } from "../utils/helpers";
import React, { useCallback, useRef } from "react";
import { VideoRef } from "react-native-video";
import { CNPLogger } from "../utils/logger";

/**
 * Feature flag: rewrite native m3u8 sources into local proxied playlist files
 * (via createM3U8Source). Off by default — when disabled, native m3u8 sources are
 * handed to the player as-is and the HLS proxy loader handles per-segment proxying.
 */
const NATIVE_M3U8_RESOLVE = true;

export type UseSourcesParams = {
	videoSources?: VideoSource[];
	subtitleSources?: SubtitleSource[];
	lazyLoadSources?: boolean;
	/** Player-level proxy settings applied to every proxied source (a source's own options win). */
	proxyConfig?: ProxyConfig;
	videoRef?: React.RefObject<VideoRef | null>;
	playerId?: string;
	onLazyLoadSource?: (source: VideoSource) => Promise<VideoSourceWithoutId | void>;
};

export function useSources(params: UseSourcesParams) {
	const { videoSources = [], subtitleSources = [], lazyLoadSources = true, proxyConfig, onLazyLoadSource, videoRef } = params;
	// Unpack the bundled proxy config into the fields used below.
	const { url: proxyURL, resolver: proxyResolver, headers: proxyHeaders, query: proxyQuery } = proxyConfig ?? {};

	const [initializedVideo, setInitializedVideo] = React.useState(false);
	const [initializedSubtitle, setInitializedSubtitle] = React.useState(false);
	const createdSourcesRef = useRef<Map<string, VideoSource>>(new Map());
	const createdSubtitlesRef = useRef<Map<string, SubtitleSource>>(new Map());

	const addVideoSource = useCallback(
		async (video: VideoSource) => {
			// Check whether to update video source
			const updatedVideo = {
				...video,
				...(onLazyLoadSource ? (await onLazyLoadSource(video)) || {} : {})
			};

			// If the source was updated by the callback, use the updated source for proxy resolution and blob URL creation
			// Default ProxyURL override by source options if not already set, allowing per-source proxy URL specification
			if (updatedVideo.options) {
				if (!updatedVideo.options.overrideProxyURL) updatedVideo.options.overrideProxyURL = proxyURL;
				// Player-level proxy auth as defaults; a source's own options win on key conflicts.
				if (proxyHeaders) updatedVideo.options.proxyHeaders = { ...proxyHeaders, ...updatedVideo.options.proxyHeaders };
				if (proxyQuery) updatedVideo.options.proxyQuery = { ...proxyQuery, ...updatedVideo.options.proxyQuery };
			}

			// Create m3u8 source for non-web platforms, otherwise resolve proxy if needed.
			// Gated behind NATIVE_M3U8_RESOLVE and only when a proxy + resolver are available.
			// On failure (e.g. the source isn't actually an m3u8) fall back to the original URL
			// instead of an empty source, so the player can still attempt to play it.
			if (NATIVE_M3U8_RESOLVE && updatedVideo.format === "m3u8" && Platform.OS !== "web" && updatedVideo.options?.useProxy && proxyResolver) {
				updatedVideo.source = await createM3U8Source(updatedVideo, proxyResolver).catch(() =>
					proxyResolver(updatedVideo.source, proxyURL || "", updatedVideo.options?.headers || {})
				);
			} else {
				// NOTE (m3u8): we do NOT rewrite the source to the proxy URL. A master playlist's
				// child/segment URIs are often relative, and resolving them against a proxied URL
				// breaks playback. So the m3u8 URL is handed to the player as-is (web always; native
				// when NATIVE_M3U8_RESOLVE is off), and the HLS proxy loader applies proxying per
				// segment — keeping CORS/proxy benefits without transforming the source into a blob.
				// Only non-m3u8 sources (mp4, etc.) are proxy-resolved directly below.
				if (updatedVideo.format !== "m3u8" && proxyResolver && updatedVideo.options?.useProxy)
					updatedVideo.source = proxyResolver(updatedVideo.source, proxyURL || "", updatedVideo.options?.headers || {});
				else updatedVideo.source = video.source;
			}

			// Warn (always) when a source lacks a protocol: a protocol-relative "//..." URL works on
			// web but breaks native players. It will fall back into normalizeSourceURL (prepends
			// "https:") below, but the caller should provide an absolute URL to avoid the issue.
			if (updatedVideo.source.startsWith("//"))
				CNPLogger.warn(
					`Video source id:${updatedVideo.id} has no protocol ("${updatedVideo.source}"); falling back to normalizeSourceURL which prepends "https:". Provide an absolute URL to avoid this.
					\n URL: ${normalizeSourceURL(updatedVideo.source)}`
				);

			// Guarantee the source handed to the player has a scheme. Protocol-relative URLs
			// (`//host/...`) work on web but make native players treat the URI as a local file.
			updatedVideo.source = normalizeSourceURL(updatedVideo.source);

			createdSourcesRef.current.set(updatedVideo.id, updatedVideo);
		},
		[proxyURL, proxyResolver, proxyHeaders, proxyQuery, onLazyLoadSource]
	);

	const addSubtitleSource = useCallback(
		async (subtitle: SubtitleSource) => {
			const subtitleOptions = subtitle.options
				? {
						...subtitle.options,
						overrideProxyURL: subtitle.options.overrideProxyURL || proxyURL,
						// Player-level proxy auth as defaults; the subtitle's own options win.
						proxyHeaders: { ...(proxyHeaders || {}), ...(subtitle.options.proxyHeaders || {}) },
						proxyQuery: { ...(proxyQuery || {}), ...(subtitle.options.proxyQuery || {}) }
					}
				: subtitle.options;

			// Idempotency: reuse an already-created blob for this id instead of minting a second one.
			// The player init effect can run more than once: the consumer often passes an inline
			// subtitleSources array (new identity every render) and React StrictMode double-invokes
			// effects in dev, so without this we'd create duplicate VTT blobs for the same subtitle.
			// `subtitle` is never mutated, so `subtitle.source` is always the pristine URL from props.
			const existing = createdSubtitlesRef.current.get(subtitle.id);
			const createdSubtitle = existing?.source
				? existing
				: ({
						...subtitle,
						options: subtitleOptions,
						source: await createVTTSource({ ...subtitle, options: subtitleOptions }, proxyResolver).catch(() => "")
					} satisfies SubtitleSource);

			createdSubtitlesRef.current.set(subtitle.id, createdSubtitle);

			if (Platform.OS === "web" && videoRef?.current?.nativeHtmlVideoRef?.current && createdSubtitle.source) {
				const videoEl = videoRef.current.nativeHtmlVideoRef.current;

				// Remove any <track> already attached for this id before appending. Appending without
				// this produced duplicate <track> elements (same id, different blob) and doubled
				// subtitle lines on web. Iterate a static copy since we mutate the DOM while looping.
				Array.from(videoEl.querySelectorAll("track")).forEach((track) => {
					if (track.id === createdSubtitle.id) videoEl.removeChild(track);
				});

				videoEl.appendChild(
					Object.assign(document.createElement("track"), {
						kind: "subtitles",
						label: createdSubtitle.label || createdSubtitle.langISO,
						src: createdSubtitle.source,
						srclang: createdSubtitle.langISO,
						default: false,
						id: createdSubtitle.id
					})
				);
			}
		},
		[proxyURL, proxyResolver, proxyHeaders, proxyQuery, videoRef]
	);

	const initializeVideos = useCallback(async () => {
		if (videoSources.length === 0) {
			CNPLogger.info("No video sources provided, skipping video initialization.");
			setInitializedVideo(false);
			return;
		}
		if (!lazyLoadSources) {
			for (const video of videoSources) await addVideoSource(video);
		}
		setInitializedVideo(true);
	}, [videoSources, lazyLoadSources, addVideoSource]);

	const initializeSubtitles = useCallback(async () => {
		if (subtitleSources.length === 0) {
			CNPLogger.info("No subtitle sources provided, skipping subtitle initialization.");
			setInitializedSubtitle(false);
			return;
		}
		// Lazy: create each subtitle's file only when first selected (like videos). A first selection
		// may make media3 re-prepare and restart — the controller's resume logic seeks back.
		if (!lazyLoadSources) {
			for (const subtitle of subtitleSources) await addSubtitleSource(subtitle);
		}
		setInitializedSubtitle(true);
	}, [subtitleSources, lazyLoadSources, addSubtitleSource]);

	const cleanupSources = useCallback(() => {
		const groupIds = new Set<string>();
		for (const video of createdSourcesRef.current.values()) {
			if (video && video.playerId) groupIds.add(video.playerId);
		}
		for (const subtitle of createdSubtitlesRef.current.values()) {
			if (subtitle && subtitle.playerId) groupIds.add(subtitle.playerId);
		}
		groupIds.forEach((group) => clearBlobGroup(group));

		createdSourcesRef.current.clear();
		createdSubtitlesRef.current.clear();
	}, []);

	return {
		initializedVideo,
		initializedSubtitle,
		createdSourcesRef,
		createdSubtitlesRef,
		addVideoSource,
		addSubtitleSource,
		initializeVideos,
		initializeSubtitles,
		cleanupSources
	};
}
