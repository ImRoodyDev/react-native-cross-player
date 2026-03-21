"use client";

import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { StatusBar, StyleProp, View as RNView, ViewStyle } from "react-native";
import Video, { VideoRef } from "react-native-video";
import PlayerControls, { PlayerControlsRef } from "./PlayerControls";
import { PlayerControllerProps, usePlayerController } from "../hooks/usePlayerController";
import { Languages, setLanguage } from "../libs/localization";
import { View } from "./styled";
import { CNPLogger } from "../utils/logger";
import clsx from "clsx";
import { State } from "../hooks/useComponentState";
import { SliderThemeType } from "react-native-awesome-slider";
import { SubtitleSource, VideoSource } from "../types/media";

export type VideoPlayerProps = {
	videoTitle: string;
	nextLabel?: string;
	language?: Languages;
	playerConfig: Omit<PlayerControllerProps, "playerViewRef" | "videoRef" | "controlsRef">;
	viewStyle?: StyleProp<ViewStyle>;
	videoStyle?: StyleProp<ViewStyle>;
	theme?: SliderThemeType;
	onClosePlayer?: () => void;
	onNextVideo?: () => void;
	onControlVisibilityChange?: (visible: boolean) => void;
	onSourceChange?: (index: number, source: VideoSource) => void;
	onSubtitleChange?: (index: number, subtitle: SubtitleSource) => void;
	onPlaybackChange?: (isPlaying: boolean) => void;
};

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

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
	const {
		videoTitle,
		language,
		playerConfig,
		viewStyle,
		videoStyle,
		nextLabel,
		theme,
		// Callbacks
		onNextVideo,
		onControlVisibilityChange,
		onSourceChange,
		onSubtitleChange,
		onPlaybackChange
	} = props;
	const videoRef = React.useRef<VideoRef>(null);
	const controlsRef = React.useRef<PlayerControlsRef>(null);
	const playerViewRef = React.useRef<RNView>(null);
	const [controlsVisible, setControlsVisible] = React.useState(true);

	// Initialize player controller
	const { nativeVideoProps, playerState, playbackResources, controls } = usePlayerController({
		videoRef,
		controlsRef,
		playerViewRef,
		...playerConfig
	});

	// Callbacks for source and subtitle changes
	useEffect(() => {
		const source = playbackResources.sources[playerState.sourceIndex];
		if (source) onSourceChange?.(playerState.sourceIndex, source);
	}, [onSourceChange, playbackResources.sources, playerState.sourceIndex]);
	useEffect(() => {
		const subtitle = playbackResources.subtitles[playerState.subtitleIndex];
		if (subtitle) onSubtitleChange?.(playerState.subtitleIndex, subtitle);
	}, [onSubtitleChange, playbackResources.subtitles, playerState.subtitleIndex]);
	useEffect(() => {
		onControlVisibilityChange?.(controlsVisible);
	}, [controlsVisible, onControlVisibilityChange]);
	useEffect(() => {
		onPlaybackChange?.(!playerState.paused);
	}, [onPlaybackChange, playerState.paused]);

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

	return (
		<View id={"video-player"} className={clsx("video-player", controlsVisible && "video-controls-on")} ref={playerViewRef} style={viewStyle}>
			<StatusBar hidden={playerState.isFullscreen} />

			<Video
				ref={videoRef}
				focusable={false}
				controls={false}
				disableDisconnectError={false}
				preventsDisplaySleepDuringVideoPlayback={false}
				style={[{ width: "100%", height: "auto", margin: "auto" }, videoStyle]}
				resizeMode={"contain"}
				{...nativeVideoProps}
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
				onControlsVisibilityChange={setControlsVisible}
				onClosePlayer={props.onClosePlayer}
				onNextVideo={onNextVideo}
			/>
		</View>
	);
});

export default VideoPlayer;
