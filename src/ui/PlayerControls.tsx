"use client";

import React, { forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { OnLoadData, OnProgressData } from "react-native-video";
import { Action, State, useComponentStateReducer } from "../hooks/useComponentState";
import Animated, { Easing, useSharedValue, withTiming, ZoomIn } from "react-native-reanimated";
import useWebKeyboard from "../hooks/useWebKeyboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveSize } from "../hooks/useResponsiveSize";
import { Platform } from "react-native";
import { View, Text, SafeAreaView, AnimatedView } from "./styled";
import Button from "./Button";
import { sky, zinc } from "tailwindcss/colors";
import PlayerGesture from "./PlayerGesture";
import { t } from "../libs/localization";
import ComponentStatus from "./ComponentStatus";
import PlayerDropdown from "./PlayerDropdown";
import { Slider } from "react-native-awesome-slider";
import { formatTime } from "../utils/helpers";
import TimeDisplayer from "./TimeDisplayer";
import { PlaybackResources, PlayerState, VideoControls, AudioTrack } from "../types/player";
import { CNPLogger } from "../utils/logger";
import { SubtitleSource } from "../types/media";
import clsx from "clsx";

export type ControlsProps = {
	videoTitle: string;
	nextLabel?: string;
	controls: VideoControls;
	playerState: PlayerState;
	resources: PlaybackResources;
	visibilityDuration?: number;
	onControlsVisibilityChange?: (visible: boolean) => void;
	onClosePlayer?: () => void;
	onNextVideo?: () => void;
};

export type PlayerControlsRef = {
	onLoad: (event: OnLoadData) => void;
	onProgress: (event: OnProgressData) => void;
	setControlState: (action: Action) => void;
	state: Readonly<State>;
};

const PlayerControls = forwardRef((props: ControlsProps, ref?: Ref<PlayerControlsRef>) => {
	// Destructuring props
	const { visibilityDuration = 3000 } = props;

	// Hooks
	const sizes = useResponsiveSize();
	const insets = useSafeAreaInsets();
	const defaultIconSize = sizes.h5;

	// Timeout reference for control visibility
	const visibilityTimeoutRef = useRef<NodeJS.Timeout | number>(undefined);
	const playerCurrentTime = useSharedValue(0);
	const playerDurationTime = useSharedValue(0);
	const playerMinDuration = useSharedValue(0);
	const playerPlayableTime = useSharedValue(0);
	const visibilityOpacity = useSharedValue(1);

	// Shared values for the slider
	const [triggeredDropdown, setTriggeredDropdown] = React.useState(-1);
	const [state, dispatch] = useComponentStateReducer({ type: "loading", message: t("PREPARING") });
	const [_, setControlVisibility] = React.useState(true);

	// FIX 1: Use ref to track latest values in timeout
	const latestValuesRef = useRef({
		paused: props.playerState.paused,
		stateType: state.type,
		triggeredDropdown: triggeredDropdown
	});

	const hideControls = useCallback(() => {
		// Check CURRENT values, not stale closure values
		if (latestValuesRef.current.paused || ["error", "loading"].includes(latestValuesRef.current.stateType) || latestValuesRef.current.triggeredDropdown >= 0) {
			return; // Don't hide
		}

		visibilityOpacity.value = withTiming(0, { duration: 500, easing: Easing.ease });
		setControlVisibility(false);
		props.onControlsVisibilityChange?.(false);
	}, [props.onControlsVisibilityChange]);
	const showControls = useCallback(() => {
		// Clear existing timeout
		if (visibilityTimeoutRef.current) {
			clearTimeout(visibilityTimeoutRef.current);
		}

		// Make controls visible
		setControlVisibility(true);
		props.onControlsVisibilityChange?.(true);
		visibilityOpacity.value = withTiming(1, { duration: 500, easing: Easing.ease });

		// Schedule hide with proper cleanup
		visibilityTimeoutRef.current = setTimeout(hideControls, visibilityDuration);
	}, [state.type, props.onControlsVisibilityChange, visibilityDuration, hideControls]);
	const closeDropdown = useCallback(() => {
		setTriggeredDropdown(-1);
		showControls(); // Restart timeout when dropdown closes
	}, [showControls]);
	const openDropdown = useCallback(
		(index: number) => {
			if (triggeredDropdown == index) {
				closeDropdown();
			} else {
				setTriggeredDropdown(index);
				// Clear timeout so controls don't hide while dropdown is open
				if (visibilityTimeoutRef.current) {
					clearTimeout(visibilityTimeoutRef.current);
				}
			}
		},
		[closeDropdown, triggeredDropdown]
	);

	const seekForward = useCallback(() => props.controls.setCurrentTime(Math.min(playerCurrentTime.value + 10, playerDurationTime.value)), [props.controls]);
	const seekBackward = useCallback(() => props.controls.setCurrentTime(Math.max(playerCurrentTime.value - 10, 0)), [props.controls]);
	const togglePlay = useCallback(() => props.controls.setPause(!props.playerState.paused), [props.controls, props.playerState.paused]);
	const toggleFullscreen = useCallback(() => props.controls.setFullscreen(!props.playerState.isFullscreen), [props.controls, props.playerState.isFullscreen]);
	const toggleMute = useCallback(() => props.controls.setMuted(props.playerState.volume > 0), [props.controls, props.playerState.volume]);

	// FIX 2: Restart timeout when relevant values change & Update ref when values change
	useEffect(() => {
		latestValuesRef.current = {
			paused: props.playerState.paused,
			stateType: state.type,
			triggeredDropdown: triggeredDropdown
		};

		// If video is paused or dropdown is open, clear timeout
		if (props.playerState.paused || triggeredDropdown >= 0) {
			if (visibilityTimeoutRef.current) {
				clearTimeout(visibilityTimeoutRef.current);
			}
		}
		// If video is playing and dropdown is closed, restart timeout
		else if (!props.playerState.paused && triggeredDropdown < 0 && state.type === "idle") {
			showControls();
		}
	}, [props.playerState.paused, triggeredDropdown, state.type, showControls]);

	// FIX 3: Effect to set up and clear the timeout on component mount/unmount
	useEffect(() => {
		showControls(); // Show controls initially

		// Cleanup on unmount
		return () => {
			if (visibilityTimeoutRef.current) {
				clearTimeout(visibilityTimeoutRef.current);
			}
		};
	}, []); // Run once on mount

	useImperativeHandle(
		ref,
		() => ({
			state: state,
			onLoad: (event: OnLoadData) => {
				playerCurrentTime.value = event.currentTime;
				playerDurationTime.value = event.duration;
			},
			onProgress: (event: OnProgressData) => {
				playerCurrentTime.value = event.currentTime;
				playerPlayableTime.value = event.playableDuration;
			},
			setControlState: (action: Action) => {
				dispatch(action);
			}
		}),
		[state]
	);

	// Map Web keyboard events
	useWebKeyboard({
		" ": togglePlay,
		ArrowRight: seekForward,
		ArrowLeft: seekBackward,
		f: toggleFullscreen
	});

	const safeStyle = useMemo(
		() => ({
			paddingTop: insets.top,
			paddingBottom: Math.max(insets.bottom - sizes.sidePadding, 0)
		}),
		[insets, sizes.sidePadding]
	);

	return (
		<SafeAreaView className="player-controls" style={[safeStyle]} onPointerMove={showControls} onTouchStart={showControls}>
			<AnimatedView className={"player-controls-ctn"} style={{ opacity: visibilityOpacity }}>
				<View className={"player-header"}>
					<Button
						onPress={props.onClosePlayer}
						icon="xmark"
						className={`close-btn`}
						iconSize={sizes.span2}
						borderRadius={999999}
						focusedTextColor="white"
						textColor="white"
						pressedScale={0.9}
						backgroundColor={"#0000005f"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
					/>
					<Text className={"player-title"}>{props.videoTitle}</Text>
				</View>
				<View className={"player-actions"}>
					{state.type !== "idle" && (
						<View className={"player-status-overlay"}>
							<ComponentStatus state={state.type} messages={state.message} enteringAnimation={ZoomIn} />
						</View>
					)}

					<View className={"player-gestures"} style={state.type !== "idle" && { pointerEvents: "none", opacity: 0 }}>
						<PlayerGesture icon={"backward_10_seconds"} onPress={seekBackward} autoHide disable={props.playerState.isLive} />
						<PlayerGesture icon={props.playerState.paused ? "play" : "pause"} onPress={togglePlay} tap={1} autoHide={!props.playerState.paused} />
						<PlayerGesture icon={"forward_10_seconds"} onPress={seekForward} autoHide disable={props.playerState.isLive} />
					</View>

					<View className={"player-menus"} style={{ pointerEvents: Platform.OS === "web" || state.type !== "idle" ? "none" : "box-none" }}>
						<PlayerDropdown
							open={triggeredDropdown == 0}
							title={t("VIDEO_SOURCES")}
							defaultSelected={props.playerState.sourceIndex}
							items={props.resources.sources}
							onSelect={(_, index) => props.controls.setSource(index)}
							afterSelect={closeDropdown}
							getItemText={(i) => i.label}
						/>
						<PlayerDropdown
							open={triggeredDropdown == 1}
							title={t("VIDEO_CAPTION")}
							defaultSelected={props.playerState.subtitleIndex + 1}
							items={[{ id: "off", label: t("SUBTITLES_OFF"), langISO: "off" } as SubtitleSource, ...props.resources.subtitles]}
							onSelect={(_, index) => {
								if (index === 0) {
									props.controls.setSubtitleOff();
								} else {
									props.controls.setSubtitle(index - 1);
								}
							}}
							afterSelect={closeDropdown}
							getItemText={(i) => i.label || i.langISO}
						/>
						<PlayerDropdown
							open={triggeredDropdown == 2}
							title={t("VIDEO_QUALITY")}
							defaultSelected={props.playerState.levelIndex}
							items={props.resources.levels}
							onSelect={(_, index) => props.controls.setResolution(index)}
							afterSelect={closeDropdown}
							getItemText={(i) => i.name}
						/>{" "}
						{/* Audio track selector — only rendered when the media has multiple audio tracks */}
						<PlayerDropdown
							open={triggeredDropdown == 3}
							title={t("AUDIO_TRACKS")}
							defaultSelected={props.playerState.audioIndex}
							items={props.resources.audioTracks}
							onSelect={(_, index) => props.controls.setAudioTrack(index)}
							afterSelect={closeDropdown}
							getItemText={(i: AudioTrack) => (i.lang ? `${i.name} (${i.lang})` : i.name)}
						/>{" "}
					</View>
				</View>
				<View className={"player-progress"} style={{ height: sizes.span6 - 2 }}>
					<Slider
						progress={playerCurrentTime}
						minimumValue={playerMinDuration}
						maximumValue={playerDurationTime}
						cache={playerPlayableTime}
						// Configurations
						onValueChange={(value) => props.controls.setCurrentTime(value)}
						bubble={formatTime}
						hapticMode={"step"}
						forceSnapToStep={false}
						disableTapEvent={false}
						// Styling
						thumbTouchSize={sizes.span1}
						sliderHeight={sizes.span6 - 2}
						style={{ height: sizes.h1 }}
						theme={{
							minimumTrackTintColor: sky[500],
							maximumTrackTintColor: zinc[700],
							cacheTrackTintColor: zinc[500],
							bubbleBackgroundColor: sky[500]
						}}
						bubbleTextStyle={{
							fontSize: sizes.span2,
							fontFamily: "Montserrat-Medium",
							color: "black"
						}}
					/>
				</View>
				<View className={"player-buttons"}>
					<Button
						onPress={togglePlay}
						icon={!props.playerState.paused ? "pause" : "play"}
						className={`player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
					/>

					<Button
						hideAndDisable={props.playerState.isLive} // Hide and disable seek buttons for live streams
						onPress={seekBackward}
						icon="backward_10_seconds"
						className={`landscape-btn player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
					/>

					<Button
						hideAndDisable={props.playerState.isLive} // Hide and disable seek buttons for live streams
						onPress={seekForward}
						icon="forward_10_seconds"
						className={`landscape-btn player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
					/>

					<Button
						onPress={toggleMute}
						icon={props.playerState.volume == 0 ? "volume_slash" : "volume_high"}
						className={`landscape-btn player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
					/>

					{props.onNextVideo && (
						<Button
							onPress={props.onNextVideo}
							icon={"next"}
							text={props.nextLabel || t("NEXT_VIDEO")}
							className={"player-button next-button"}
							iconSize={defaultIconSize}
							borderRadius={999999}
							textColor="white"
							focusedTextColor="white"
							pressedScale={0.9}
							backgroundColor={"transparent"}
							selectedBackgroundColor={zinc[700]}
							pressedBackgroundColor={zinc[600]}
						/>
					)}

					<TimeDisplayer currentTime={playerCurrentTime} fullTime={playerDurationTime} />

					<View className={"player-buttons-separator"} />

					<Button
						onPress={() => openDropdown(0)}
						icon="globe"
						className={`player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
					/>

					{/* Audio track button — hidden when there is only one (or zero) audio tracks */}
					<Button
						onPress={() => openDropdown(3)}
						icon="audio_wave"
						className={`player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
						{...(props.resources.audioTracks.length <= 1 && { style: { display: "none" } })}
					/>

					<Button
						onPress={() => openDropdown(1)}
						icon="subtitle"
						className={`player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
						{...(props.resources.subtitles.length === 0 && { style: { display: "none" } })}
					/>

					<Button
						onPress={() => openDropdown(2)}
						icon="settings"
						className={`player-button`}
						iconSize={defaultIconSize}
						borderRadius={999999}
						textColor="white"
						focusedTextColor="white"
						pressedScale={0.9}
						backgroundColor={"transparent"}
						selectedBackgroundColor={zinc[700]}
						pressedBackgroundColor={zinc[600]}
						{...(props.resources.levels.length === 0 && { style: { display: "none" } })}
					/>

					{Platform.OS === "web" && (
						<Button
							onPress={toggleFullscreen}
							icon={props.playerState.isFullscreen ? "compress" : "expand"}
							className={`player-button`}
							iconSize={defaultIconSize}
							borderRadius={999999}
							textColor="white"
							focusedTextColor="white"
							pressedScale={0.9}
							backgroundColor={"transparent"}
							selectedBackgroundColor={zinc[700]}
							pressedBackgroundColor={zinc[600]}
						/>
					)}
				</View>
			</AnimatedView>
		</SafeAreaView>
	);
});

export default memo(PlayerControls);
