import { Platform } from "react-native";
import { SubtitleSource, VideoSource, VideoSourceWithoutId } from "../types/media";
import { ProxyURLResolverCallback } from "../types/hls";
import { createM3U8Source, createVTTSource } from "../libs/media";
import { clearBlobGroup } from "../libs/blob";
import React, { useCallback, useRef } from "react";
import { VideoRef } from "react-native-video";
import { CNPLogger } from "../utils/logger";

export type UseSourcesParams = {
	videoSources?: VideoSource[];
	subtitleSources?: SubtitleSource[];
	lazyLoadSources?: boolean;
	proxyURL?: string;
	videoRef?: React.RefObject<VideoRef | null>;
	playerId?: string;
	proxyResolver?: ProxyURLResolverCallback;
	onLazyLoadSource?: (source: VideoSource) => Promise<VideoSourceWithoutId | void>;
};

export function useSources(params: UseSourcesParams) {
	const { videoSources = [], subtitleSources = [], lazyLoadSources = true, proxyURL, proxyResolver, onLazyLoadSource, videoRef } = params;

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
			if (updatedVideo.options && !updatedVideo.options.overrideProxyURL) updatedVideo.options.overrideProxyURL = proxyURL;

			// Create m3u8 source for non-web platforms, otherwise resolve proxy if needed
			if (updatedVideo.format === "m3u8" && Platform.OS !== "web" && updatedVideo.options?.useProxy) {
				updatedVideo.source = await createM3U8Source(updatedVideo, proxyResolver).catch(() => "");
			} else {
				// NOTE:
				// On web resolve if we resolve the source to the proxy URL and the source is an m3u8 and it contains playlist tag with
				// relative segments, the player will fail to load the source because it won't be able to resolve the relative segment URLs from the proxy URL.
				// To avoid this we only resolve the proxy URL on web without transforming the source into a blob URL, allowing the player to handle the m3u8 parsing and segment loading as if it were a regular URL, while still benefiting from the proxy for CORS and other proxy-related features.
				if (updatedVideo.format !== "m3u8" && proxyResolver && updatedVideo.options?.useProxy)
					updatedVideo.source = proxyResolver(updatedVideo.source, proxyURL || "", updatedVideo.options?.headers || {});
				else updatedVideo.source = video.source;
			}

			createdSourcesRef.current.set(updatedVideo.id, updatedVideo);
		},
		[proxyURL, proxyResolver, onLazyLoadSource]
	);

	const addSubtitleSource = useCallback(
		async (subtitle: SubtitleSource) => {
			const subtitleOptions = subtitle.options
				? {
						...subtitle.options,
						overrideProxyURL: subtitle.options.overrideProxyURL || proxyURL
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
		[proxyURL, proxyResolver, videoRef]
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
