import Hls, { AudioTrackSwitchedData, ErrorData, LevelSwitchedData } from "hls.js";
import { HlsProxy } from "../controllers/hls-proxy";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { HlsProxyConfig } from "../types/hls";
import { SourceRequestOptions } from "../types/media";
import { OnLoadData, OnVideoErrorData } from "react-native-video";
import { CNPLogger } from "../utils/logger";

const DEFAULT_HLS_PROXY_CONFIG: HlsProxyConfig = {
	useProxyLoader: false,
	hlsConfig: {
		debug: true,
		enableWorker: true,
		lowLatencyMode: true,
		backBufferLength: 90,
		autoStartLoad: true
	}
};

type Props = {
	hlsConfig?: HlsProxyConfig["hlsConfig"];
	videoRef?: React.RefObject<any>;
	onManifestParsed: () => void;
	onLevelSwitched: (event: string, data: LevelSwitchedData) => void;
	onAudioTrackSwitched?: (event: string, data: AudioTrackSwitchedData) => void;
	onError: (data: OnVideoErrorData | ErrorData) => void;
};

export function useHlsProxy(props: Props) {
	const { hlsConfig, videoRef, onManifestParsed, onLevelSwitched, onAudioTrackSwitched, onError } = props || {};
	const hlsRef = useRef<HlsProxy | null>(null);
	const [hlsCreated, setHlsCreated] = React.useState(false);
	const isHlsSupported = useMemo(() => HlsProxy.isSupported() && typeof window !== "undefined", []);

	useEffect(() => {
		if (!hlsRef.current || !hlsCreated) return;

		hlsRef.current.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
		hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
		hlsRef.current.on(Hls.Events.ERROR, (_, data) => onError(data));
		if (onAudioTrackSwitched) hlsRef.current.on(Hls.Events.AUDIO_TRACK_SWITCHED, onAudioTrackSwitched);

		return () => {
			if (!hlsRef.current) return;
			hlsRef.current.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
			hlsRef.current.off(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
			hlsRef.current.off(Hls.Events.ERROR, (_, data) => onError(data));
			if (onAudioTrackSwitched) hlsRef.current.off(Hls.Events.AUDIO_TRACK_SWITCHED, onAudioTrackSwitched);
		};
	}, [hlsCreated, onManifestParsed, onLevelSwitched, onAudioTrackSwitched, onError]);

	const createHLS = useCallback(() => {
		runDestroy();
		videoRef?.current?.setSource({ uri: undefined });

		if (isHlsSupported && !hlsRef.current) {
			hlsRef.current = new HlsProxy({
				...DEFAULT_HLS_PROXY_CONFIG,
				hlsConfig: {
					...DEFAULT_HLS_PROXY_CONFIG.hlsConfig,
					...(hlsConfig || {})
				}
			});

			if (videoRef?.current?.nativeHtmlVideoRef?.current) {
				hlsRef.current.attachMedia(videoRef.current.nativeHtmlVideoRef.current);
			}

			setHlsCreated(true);
		}
	}, [hlsConfig, videoRef, isHlsSupported, onManifestParsed, onLevelSwitched, onError]);

	const setSource = useCallback(
		(source: string, options?: SourceRequestOptions, startTime?: number) => {
			CNPLogger.info("HLS_SET_SOURCE: ", { source, options, startTime });
			if (!isHlsSupported) return;
			if (!hlsRef.current) createHLS();
			// Forward optional startTime to underlying HlsProxy implementation
			hlsRef.current?.setSource(source, options, startTime);
		},
		[createHLS, isHlsSupported]
	);

	const stopLoad = useCallback(() => {
		hlsRef.current?.stopLoad?.();
	}, []);

	const runDestroy = useCallback(() => {
		hlsRef.current?.runDestroy();
		hlsRef.current = null;
		setHlsCreated(false);
	}, []);

	return {
		hlsRef,
		hlsCreated,
		isHlsSupported,
		createHLS,
		setSource,
		stopLoad,
		runDestroy
	};
}
