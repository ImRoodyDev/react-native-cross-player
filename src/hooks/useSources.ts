import { Platform } from "react-native";
import { SubtitleSource, VideoSource, VideoSourceWithoutId } from "../types/media";
import { ProxyURLResolverCallback } from "../types/hls";
import { createM3U8Source, createVTTSource } from "../libs/media";
import { clearBlobGroup } from "../libs/blob";
import React, { useCallback, useRef } from "react";
import { VideoRef } from "react-native-video";

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

	const createdSourcesRef = useRef<Map<string, VideoSource>>(new Map());
	const createdSubtitlesRef = useRef<Map<string, SubtitleSource>>(new Map());

	const addVideoSource = useCallback(
		async (video: VideoSource) => {
			// Check whether to update video source
			const updatedVideo = {
				...video,
				...(onLazyLoadSource ? (await onLazyLoadSource(video)) || {} : {})
			};

			if (updatedVideo.options && !updatedVideo.options.overrideProxyURL) updatedVideo.options.overrideProxyURL = proxyURL;

			if (updatedVideo.format === "m3u8" && Platform.OS !== "web") {
				updatedVideo.source = await createM3U8Source(updatedVideo, proxyResolver).catch(() => "");
			} else {
				if (proxyResolver && updatedVideo.options?.useProxy)
					updatedVideo.source = proxyResolver(updatedVideo.source, proxyURL || "", updatedVideo.options?.headers || {});
			}

			createdSourcesRef.current.set(updatedVideo.id, updatedVideo);
		},
		[proxyURL, proxyResolver, onLazyLoadSource]
	);

	const addSubtitleSource = useCallback(
		async (subtitle: SubtitleSource) => {
			if (subtitle.options && !subtitle.options.overrideProxyURL) subtitle.options.overrideProxyURL = proxyURL;

			if (proxyResolver && subtitle.options?.useProxy)
				subtitle.source = proxyResolver(subtitle.source, proxyURL || "", subtitle.options?.headers || {});

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
		if (!lazyLoadSources) {
			for (const video of videoSources) await addVideoSource(video);
		}
	}, [videoSources, lazyLoadSources, addVideoSource]);

	const initializeSubtitles = useCallback(async () => {
		if (!lazyLoadSources) {
			for (const subtitle of subtitleSources) await addSubtitleSource(subtitle);
		}
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
		createdSourcesRef,
		createdSubtitlesRef,
		addVideoSource,
		addSubtitleSource,
		initializeVideos,
		initializeSubtitles,
		cleanupSources
	};
}
