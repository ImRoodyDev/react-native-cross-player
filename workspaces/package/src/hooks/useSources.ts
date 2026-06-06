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
			if (subtitle.options && !subtitle.options.overrideProxyURL) subtitle.options.overrideProxyURL = proxyURL;

			if (proxyResolver && subtitle.options?.useProxy) subtitle.source = proxyResolver(subtitle.source, proxyURL || "", subtitle.options?.headers || {});

			const source = await createVTTSource(subtitle, proxyResolver).catch(() => "");
			subtitle.source = source;
			createdSubtitlesRef.current.set(subtitle.id, subtitle);

			if (Platform.OS === "web" && videoRef?.current?.nativeHtmlVideoRef?.current && subtitle.source) {
				videoRef.current.nativeHtmlVideoRef.current.appendChild(
					Object.assign(document.createElement("track"), {
						kind: "subtitles",
						label: subtitle.label || subtitle.langISO,
						src: subtitle.source,
						srclang: subtitle.langISO,
						default: false,
						id: subtitle.id
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
