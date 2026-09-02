"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import { Platform, StatusBar, StyleProp, View as RNView, ViewStyle } from "react-native";
import Video, { OnProgressData, ReactVideoProps, SubtitleStyle, VideoRef } from "react-native-video";
import PlayerControls, { ControlsProps, PlayerControlsRef } from "./PlayerControls";
import { PlayerControllerProps, usePlayerController } from "../hooks/usePlayerController";
import { Languages, setLanguage } from "../libs/localization";
import { useResponsiveSize, useResponsiveSizeType, useResponsiveVars } from "../hooks/useResponsiveSize";
import { View } from "./styled";
import { CNPLogger } from "../utils/logger";
import clsx from "clsx";
import { State } from "../hooks/useComponentState";
import { SliderThemeType } from "react-native-awesome-slider";
import { SubtitleSource, VideoSource } from "../types/media";
import { PlayerError } from "../types/player";

export type VideoPlayerProps = {
	videoTitle: string;
	nextLabel?: string;
	language?: Languages;
	playerConfig: Omit<PlayerControllerProps, "playerViewRef" | "videoRef" | "controlsRef">;
	viewStyle?: StyleProp<ViewStyle>;
	videoStyle?: StyleProp<ViewStyle>;
	/**
	 * Native subtitle rendering style (Android/iOS). Merged over a responsive default
	 * (`fontSize` from the active size tokens, TV-scaled). A zero/undefined font size can
	 * make native subtitles invisible, hence the explicit default.
	 */
	subtitleStyle?: SubtitleStyle;
	theme?: SliderThemeType;
	onClosePlayer?: () => void;
	onNextVideo?: () => void;
	onControlVisibilityChange?: (visible: boolean) => void;
	onSourceChange?: (index: number, source: VideoSource) => void;
	onSubtitleChange?: (index: number, subtitle: SubtitleSource) => void;
	onPlaybackChange?: (isPlaying: boolean) => void;
	onProgress?: (currentTime: number) => void;
	onEnd?: () => void;
	/**
	 * Called when a source fails — while preparing, while switching, or during playback.
	 * The player still renders its own error state; this only reports the failure.
	 *
	 * Switch away on `fatal` only: non-fatal hls.js errors are recoverable and retried
	 * internally. See {@link PlayerError}.
	 */
	onError?: (error: PlayerError) => void;
} & Pick<ControlsProps, "HeaderRightElement" | "visibilityDuration">;

export type VideoPlayerRef = {
	setState: (state: State) => void;
	setSubtitle: (index: number) => Promise<void>;
	setVideoSource: (index: number) => Promise<void>;
	seek: (time: number) => void;
	play: () => void;
	pause: () => void;
	getCurrentTime: () => Promise<number>;
	getCurrentVideoIndex: () => number;
	getCurrentSubtitleIndex: () => number;
};

const TracksControlsVisibility = Platform.OS === "web";

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
	const {
		videoTitle,
		language,
		playerConfig,
		viewStyle,
		videoStyle,
		subtitleStyle,
		nextLabel,
		theme,
		HeaderRightElement,
		visibilityDuration,

		// Callbacks
		onNextVideo,
		onControlVisibilityChange,
		onSourceChange,
		onSubtitleChange,
		onPlaybackChange,
		onProgress,
		onEnd
	} = props;
	const videoRef = React.useRef<VideoRef>(null);
	const controlsRef = React.useRef<PlayerControlsRef>(null);
	const playerViewRef = React.useRef<RNView>(null);

	// `.cnp-video-controls-on` only shifts native <track> cues on web (::-webkit-media-text-track-container).
	// Off web nothing reads it, so don't hold it in state there: every show/hide would otherwise
	// re-render <Video> + the whole controls tree.
	const [controlsVisible, setControlsVisible] = React.useState(true);

	// Consumer callbacks read through a ref: inline props from the host would otherwise churn the
	// identity of every handler below and defeat memo(PlayerControls).
	const callbacksRef = React.useRef({
		onControlVisibilityChange,
		onSourceChange,
		onSubtitleChange,
		onPlaybackChange,
		onProgress,
		onEnd,
		onClosePlayer: props.onClosePlayer,
		onNextVideo,
		onError: props.onError
	});

	// Identity-stable seam for the controller, which keeps it for the player's lifetime.
	const handlePlaybackError = useCallback((error: PlayerError) => callbacksRef.current.onError?.(error), []);

	// Injects the responsive CSS variables (scaled by the TV pixel-ratio) onto the player root so
	// every `var(--...)` in styles.css resolves on native — otherwise the whole control layout
	// collapses because `.responsive-vars` is never mounted by a host on native.
	const responsiveVars = useResponsiveVars();
	const screenType = useResponsiveSizeType(); // read to trigger re-render on breakpoint change
	const { h5, span2, span3, span1 } = useResponsiveSize();

	// Initialize player controller
	const { nativeVideoProps, playerState, playbackResources, controls } = usePlayerController({
		videoRef,
		controlsRef,
		playerViewRef,
		...playerConfig,
		onPlaybackError: handlePlaybackError
	});

	// Memoized: <Video> re-diffs (and re-sends) its props whenever handler identities change, so
	// the wrapper object and its callbacks must stay stable across unrelated re-renders.
	const handleProgress = useCallback(
		(event: OnProgressData) => {
			nativeVideoProps?.onProgress?.(event);
			callbacksRef.current.onProgress?.(event.currentTime);
		},
		[nativeVideoProps?.onProgress]
	);
	const handleEnd = useCallback(() => {
		nativeVideoProps?.onEnd?.();
		callbacksRef.current.onEnd?.();
	}, [nativeVideoProps?.onEnd]);

	// Stable handlers handed to PlayerControls.
	const handleControlsVisibility = useCallback((visible: boolean) => {
		if (TracksControlsVisibility) setControlsVisible(visible);
		callbacksRef.current.onControlVisibilityChange?.(visible);
	}, []);
	const handleClosePlayer = useCallback(() => callbacksRef.current.onClosePlayer?.(), []);
	const handleNextVideo = useCallback(() => callbacksRef.current.onNextVideo?.(), []);

	const videoProps: ReactVideoProps = useMemo(
		() => ({
			...(nativeVideoProps || {}),
			onProgress: handleProgress,
			onEnd: handleEnd
		}),
		[nativeVideoProps, handleProgress, handleEnd]
	);

	// Stable style/prop objects for the native video view (inline literals churn the prop diff).
	const videoStyleMerged = useMemo(() => [{ width: "100%", height: "auto", margin: "auto" } as ViewStyle, videoStyle], [videoStyle]);
	const subtitleStyleMerged = useMemo(() => {
		if (screenType === "mobile") return { fontSize: span3, ...subtitleStyle };
		else if (screenType === "mobile_landscape") {
			return { fontSize: span2, ...subtitleStyle };
		} else if (screenType === "tablet") {
			return { fontSize: span1, ...subtitleStyle };
		}
		return { fontSize: h5, ...subtitleStyle };
	}, [h5, span2, span3, span1, screenType, subtitleStyle]);
	const rootStyle = useMemo(() => [responsiveVars, viewStyle], [responsiveVars, viewStyle]);

	// Callbacks for source and subtitle changes
	useEffect(() => {
		callbacksRef.current = {
			onControlVisibilityChange,
			onSourceChange,
			onSubtitleChange,
			onPlaybackChange,
			onProgress,
			onEnd,
			onClosePlayer: props.onClosePlayer,
			onNextVideo,
			onError: props.onError
		};
	});
	useEffect(() => {
		const source = playbackResources.sources[playerState.sourceIndex];
		if (source) callbacksRef.current.onSourceChange?.(playerState.sourceIndex, source);
	}, [playbackResources.sources, playerState.sourceIndex]);
	useEffect(() => {
		const subtitle = playbackResources.subtitles[playerState.subtitleIndex];
		if (subtitle) callbacksRef.current.onSubtitleChange?.(playerState.subtitleIndex, subtitle);
	}, [playbackResources.subtitles, playerState.subtitleIndex]);
	useEffect(() => {
		callbacksRef.current.onPlaybackChange?.(!playerState.paused);
	}, [playerState.paused]);

	useLayoutEffect(() => {
		if (Platform.OS !== "web") return;
		const htmlVideo = videoRef.current?.nativeHtmlVideoRef?.current;
		if (!htmlVideo) return;

		htmlVideo.controls = false;
		// htmlVideo.removeAttribute("controls");
	}, [nativeVideoProps?.source, playerState.sourceId]);

	// Set language for video localization
	useEffect(() => {
		setLanguage(language ?? "en");
		CNPLogger.info(`Language set to: ${language ?? "en"}`);
	}, [language]);

	useImperativeHandle(
		ref,
		() => ({
			getCurrentTime: async () => videoRef.current?.getCurrentPosition() ?? videoRef.current?.nativeHtmlVideoRef?.current?.currentTime ?? 0,
			setState: (state: State) => controlsRef.current?.setControlState(state),
			setSubtitle: (index: number) => controls.setSubtitle(index),
			setVideoSource: (index: number) => controls.setSource(index),
			seek: (time: number) => videoRef.current?.seek(time),
			play: () => controls.setPause(false),
			pause: () => controls.setPause(true),
			getCurrentVideoIndex: () => playerState.sourceIndex,
			getCurrentSubtitleIndex: () => playerState.subtitleIndex
		}),
		[controls, playerState.sourceIndex, playerState.subtitleIndex]
	);

	const handlePointerActivity = useCallback(() => {
		controlsRef.current?.showControls();
	}, []);

	return (
		<View
			id={"video-player"}
			className={clsx("cnp-video-player responsive-vars", controlsVisible && "cnp-video-controls-on")}
			ref={playerViewRef}
			style={rootStyle}
			onPointerMove={handlePointerActivity}
			onTouchStart={handlePointerActivity}
		>
			{Platform.OS === "ios" && <StatusBar hidden={playerState.isFullscreen} />}

			<Video
				ref={videoRef}
				focusable={false}
				disableDisconnectError={false}
				preventsDisplaySleepDuringVideoPlayback={false}
				resizeMode={"contain"}
				style={videoStyleMerged}
				subtitleStyle={subtitleStyleMerged}
				{...videoProps}
				controls={false}
				paused={playerState.paused}
			/>

			<PlayerControls
				ref={controlsRef}
				theme={theme}
				videoTitle={videoTitle}
				controls={controls}
				resources={playbackResources}
				playerState={playerState}
				nextLabel={nextLabel}
				HeaderRightElement={HeaderRightElement}
				onControlsVisibilityChange={handleControlsVisibility}
				onClosePlayer={handleClosePlayer}
				onNextVideo={onNextVideo ? handleNextVideo : undefined}
				visibilityDuration={visibilityDuration}
			/>
		</View>
	);
});

export default VideoPlayer;
