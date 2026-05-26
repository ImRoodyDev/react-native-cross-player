/*
 * Types for media and subtitle handling
 * - Keep these types small and descriptive for use across utils that create
 *   playlists, subtitle blobs and perform fetch/convert operations.
 * - Important: `VideoSource` includes `options` which control proxying.
 */
export type SubtitleTypes = "srt" | "vtt";
export type TextEncoding = "windows-1256" | "utf-8" | "iso-8859-1";
export type VideoFormats = "m3u8" | "dash" | "mp4" | "webm" | "mkv" | "flv" | "avi" | "mov" | "mpeg" | "mp3" | "aac" | "ogg" | "opus" | string; // Allow custom formats as well

export enum SourceTypes {
	BLOB = "blob",
	URL = "url",
	NATIVE_PATH = "native_path"
}

/*
 * Describes a single variant/playlist entry for HLS master playlists.
 * - `source` is the playlist URL (relative or absolute).
 * - Optional fields describe codecs, bandwidth and resolution metadata.
 */
export type M3U8PlaylistTrack = {
	source: string;
	codecs?: string;
	bandwidth?: number;
	resolution?: `${number}p` | string;
	dimensions?: `${number}x${number}`;
};

/*
 * Subtitle track descriptor used when building master playlists or creating
 * subtitle blobs. `type` indicates whether the source is `srt` or `vtt`.
 */
export type M38USubtitleTrack = {
	source: string;
	langISO: string;
	label?: string;
	default?: boolean;
	type: SubtitleTypes;
};

/*
 * Audio track descriptor used when building master playlists.
 * - `source` is the audio playlist URI.
 * - `groupId` identifies the audio group (defaults to "audio").
 */
export type M3U8AudioTrack = {
	source: string;
	langISO: string;
	label?: string;
	default?: boolean;
	groupId?: string;
	channels?: string;
};

/*
 * Options used when constructing a master M3U8 playlist blob.
 * - `playlists` holds the variant tracks.
 * - `embedSubtitles` toggles adding EXT-X-MEDIA entries.
 */
export type M3U8BlobOptions = {
	playlists: M3U8PlaylistTrack[];
	subtitles: M38USubtitleTrack[];
	audioTracks?: M3U8AudioTrack[];
	embedSubtitles?: boolean;
	embedAudioTracks?: boolean;
	fileName?: string;
};

/*
 * Options for creating a single subtitle VTT blob/file from a track.
 */
export type SubtitleBlobOptions = {
	track: M38USubtitleTrack;
	fileName?: string;
};

/*
 * Controls how remote sources are requested.
 * - `useProxy` and `overrideProxyURL` influence `fetchSource` behavior.
 */
export type SourceRequestOptions = {
	useProxy: boolean;
	overrideProxyURL?: string;
	headers?: Record<string, string>;
	nativeSendHeadersOnSourceRequest?: boolean; // For native platforms to send headers on source request
};

/*
 * A higher-level video source shape used by functions that build playlists.
 * - Extends `M3U8PlaylistTrack` and adds `id`, `label`, `format` and `options`.
 */
export type VideoSource = Pick<M3U8PlaylistTrack, "source"> & {
	/* Unique identifier for the video source (will be used for the file name) */
	id: string;
	/* Associated player ID for the subtitle source */
	playerId: string;
	label: string;
	format: VideoFormats;
	options?: SourceRequestOptions;
};

/*
 * Video source type without `id`, `playerId` and `label` properties.
 * - Used when updating or transforming video sources that is already created.
 */
export type VideoSourceWithoutId = Omit<VideoSource, "id" | "playerId" | "label">;

/*
 * Subtitle source including optional request options for fetching the track.
 */
export type SubtitleSource = M38USubtitleTrack & {
	/* Unique identifier for the subtitle source */
	id: string;
	/* Associated player ID for the subtitle source */
	playerId: string;
	options?: SourceRequestOptions;
};
