"use client";

import React, { forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { OnLoadData, OnProgressData } from "react-native-video";
import { Action, State, useComponentStateReducer } from "../hooks/useComponentState";
import { Easing, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from "react-native-reanimated";
import useWebKeyboard from "../hooks/useWebKeyboard";
import useTVRemote from "../hooks/useTVRemote";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveSize } from "../hooks/useResponsiveSize";
import { Platform, StyleSheet, View as RNView } from "react-native";
import { View, Text, SafeAreaView, AnimatedView } from "./styled";
import Button from "./Button";
import { sky, zinc } from "tailwindcss/colors";
import PlayerGesture, { PlayerGestureRef } from "./PlayerGesture";
import { t } from "../libs/localization";
import ComponentStatus from "./ComponentStatus";
import FocusGuide from "./FocusGuide";
import PlayerDropdown from "./PlayerDropdown";
import { Slider, SliderThemeType } from "react-native-awesome-slider";
import { formatTime } from "../utils/helpers";
import TimeDisplayer from "./TimeDisplayer";
import { PlaybackResources, PlayerState, VideoControls, AudioTrack } from "../types/player";
import { SubtitleSource } from "../types/media";

export type ControlsProps = {
	videoTitle: string;
	nextLabel?: string;
	controls: VideoControls;
	playerState: PlayerState;
	resources: PlaybackResources;
	/** Visibility duration for the controls (milliseconds)
	 * @default 3000
	 */
	visibilityDuration?: number;
	theme?: SliderThemeType;
	HeaderRightElement?: React.ReactNode;
	onControlsVisibilityChange?: (visible: boolean) => void;
	onClosePlayer?: () => void;
	onNextVideo?: () => void;
};

export type PlayerControlsRef = {
	onLoad: (event: OnLoadData) => void;
	onProgress: (event: OnProgressData) => void;
	setControlState: (action: Action) => void;
	showControls: () => void;
	state: Readonly<State>;
};

/**
 * Shared styling for every control-bar button (play, seek, mute, menus, close, ...).
 * Keeps the visual identity in ONE place instead of repeating the same 7 props per button;
 * any prop can still be overridden per-usage since {...props} spreads last.
 * Forwards ref so buttons can be used as TV focus destinations (nextFocus*).
 */
const ControlButton = forwardRef<RNView, React.ComponentProps<typeof Button>>((props, ref) => (
	<Button
		ref={ref}
		borderRadius={999999}
		textColor="white"
		focusedTextColor="white"
		pressedScale={0.9}
		backgroundColor={"transparent"}
		selectedBackgroundColor={zinc[700]}
		pressedBackgroundColor={zinc[600]}
		enableRipple={!Platform.isTV}
		{...props}
	/>
));
ControlButton.displayName = "ControlButton";

const PlayerControls = forwardRef((props: ControlsProps, ref?: Ref<PlayerControlsRef>) => {
	// Destructuring props
	const { visibilityDuration = 3000, theme, HeaderRightElement } = props;

	// Hooks
	const sizes = useResponsiveSize();
	const insets = useSafeAreaInsets();
	const defaultIconSize = sizes.h5;

	// Timeout reference for control visibility
	const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const playerCurrentTime = useSharedValue(0);
	const playerDurationTime = useSharedValue(0);
	const playerMinDuration = useSharedValue(0);
	const playerPlayableTime = useSharedValue(0);
	const visibilityOpacity = useSharedValue(1);

	// Shared values for the slider
	const [triggeredDropdown, setTriggeredDropdown] = React.useState(-1);
	const [state, dispatch] = useComponentStateReducer({ type: "loading", message: t("PREPARING") });
	const [controlsVisible, setControlVisibility] = React.useState(true);

	const controlsVisibleRef = useRef(true);
	const playButtonRef = useRef<RNView>(null);
	const seekBackwardGestureRef = useRef<PlayerGestureRef>(null);
	const seekForwardGestureRef = useRef<PlayerGestureRef>(null);
	const playGestureRef = useRef<PlayerGestureRef>(null);

	// TV: after a dropdown closes, D-pad focus must be handed back to a real control — the item
	// that held focus collapses with the dropdown and becomes unfocusable, which otherwise leaves
	// the system with no focused view (dead D-pad). Pulsing hasTVPreferredFocus on the play button
	// re-anchors focus; the pulse resets shortly after so every close re-triggers it.
	const [returnFocusPulse, setReturnFocusPulse] = React.useState(false);
	const returnFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pulseReturnFocus = useCallback(() => {
		if (!Platform.isTV) return;
		if (returnFocusTimerRef.current) clearTimeout(returnFocusTimerRef.current);
		setReturnFocusPulse(true);
		(playButtonRef.current as any)?.requestTVFocus?.();

		returnFocusTimerRef.current = setTimeout(() => setReturnFocusPulse(false), 50);
	}, []);
	useEffect(() => {
		return () => {
			if (returnFocusTimerRef.current) clearTimeout(returnFocusTimerRef.current);
		};
	}, []);

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
		controlsVisibleRef.current = false;
		setControlVisibility(false);
		props.onControlsVisibilityChange?.(false);
	}, [props.onControlsVisibilityChange]);
	const showControls = useCallback(
		(forcePlayButtonFocus = false) => {
			// Clear existing timeout
			if (visibilityTimeoutRef.current) {
				clearTimeout(visibilityTimeoutRef.current);
			}

			// Make controls visible (and interactive/focusable)
			controlsVisibleRef.current = true;
			setControlVisibility(true);
			props.onControlsVisibilityChange?.(true);
			visibilityOpacity.value = withTiming(1, { duration: 500, easing: Easing.ease });

			// Only force a focus reset when we explicitly need to recover TV D-pad focus.
			if (forcePlayButtonFocus) {
				pulseReturnFocus();
			}

			// Schedule hide with proper cleanup
			visibilityTimeoutRef.current = setTimeout(hideControls, visibilityDuration);
		},
		[props.onControlsVisibilityChange, visibilityDuration, hideControls, pulseReturnFocus]
	);
	const awakeControls = useCallback(() => {
		if (controlsVisibleRef.current) {
			showControls(); // keep controls awake; let native focus handle the move
			return;
		}
	}, [hideControls, visibilityDuration]);
	const peekScrubber = useCallback(() => {
		if (visibilityTimeoutRef.current) {
			clearTimeout(visibilityTimeoutRef.current);
		}
		visibilityOpacity.value = withTiming(1, { duration: 200, easing: Easing.ease });
		props.onControlsVisibilityChange?.(true);
		visibilityTimeoutRef.current = setTimeout(hideControls, visibilityDuration);
	}, [hideControls, visibilityDuration, props.onControlsVisibilityChange]);

	const wakeControls = useCallback(() => {
		showControls();
	}, [showControls]);

	const closeDropdown = useCallback(() => {
		setTriggeredDropdown(-1);
		showControls(true); // Restart timeout and re-anchor D-pad focus when dropdown closes
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

	const seekForward = useCallback(() => {
		seekForwardGestureRef.current?.animateTouch();
		const currentTime = Number.isFinite(playerCurrentTime.value) ? playerCurrentTime.value : 0;
		const duration = Number.isFinite(playerDurationTime.value) && playerDurationTime.value > 0 ? playerDurationTime.value : Infinity;
		props.controls.setCurrentTime(Math.min(currentTime + 10, duration));
	}, [props.controls]);
	const seekBackward = useCallback(() => {
		seekBackwardGestureRef.current?.animateTouch();
		const currentTime = Number.isFinite(playerCurrentTime.value) ? playerCurrentTime.value : 0;
		props.controls.setCurrentTime(Math.max(currentTime - 10, 0));
	}, [props.controls]);
	const togglePlay = useCallback(() => {
		playGestureRef.current?.animateTouch();
		props.controls.setPause(!props.playerState.paused);
	}, [props.controls, props.playerState.paused]);
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
		showControls(Platform.isTV); // Show controls initially; TV gets one deliberate focus anchor

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
			},
			showControls: showControls
		}),
		[state, showControls]
	);

	// Map Web keyboard events
	useWebKeyboard({
		" ": togglePlay,
		ArrowRight: seekForward,
		ArrowLeft: seekBackward,
		f: toggleFullscreen
	});

	// Map TV remote / D-pad events (no-op off-TV).
	useTVRemote(
		{
			up: showControls,
			down: showControls,
			menu: showControls,
			longSelect: showControls,
			playPause: togglePlay,
			select: awakeControls,
			left: () => {
				awakeControls();
				if (!controlsVisibleRef.current) seekBackward();
			},
			right: () => {
				awakeControls();
				if (!controlsVisibleRef.current) seekForward();
			},
			rewind: () => {
				awakeControls();
				if (!controlsVisibleRef.current) peekScrubber();
				seekBackward();
			},
			fastForward: () => {
				awakeControls();
				if (!controlsVisibleRef.current) peekScrubber();
				seekForward();
			}
		},
		Platform.isTV
	);

	const safeStyle = useMemo(
		() => ({
			paddingTop: insets.top,
			paddingBottom: Math.max(insets.bottom - sizes.sidePadding, 0)
		}),
		[insets, sizes.sidePadding]
	);

	const opacityStyle = useAnimatedStyle(() => ({
		opacity: visibilityOpacity.value
	}));

	return (
		<SafeAreaView className="player-controls" style={[StyleSheet.absoluteFill, safeStyle]} onPointerMove={wakeControls} onTouchStart={wakeControls}>
			<AnimatedView className={"player-controls-ctn"} pointerEvents={controlsVisible ? "auto" : "none"}>
				<FocusGuide autoFocus trapFocusLeft trapFocusRight trapFocusUp className={"player-header"}>
					<AnimatedView className={"player-header-ctn"} style={[opacityStyle]}>
						<ControlButton
							onPress={props.onClosePlayer}
							icon="xmark"
							className={`close-btn`}
							iconSize={sizes.span2}
							backgroundColor={"#0000005f"}
							style={{
								outlineColor: "white",
								outlineStyle: "solid",
								outlineWidth: 2
							}}
							{...(playButtonRef.current ? ({ nextFocusDown: playButtonRef.current } as object) : {})}
						/>
						<Text className={"only-landscape player-title"}>{props.videoTitle}</Text>
						{HeaderRightElement}
					</AnimatedView>
				</FocusGuide>

				<View className={"player-actions"}>
					{state.type !== "idle" && (
						<View className={"player-status-overlay"}>
							<ComponentStatus state={state.type} messages={state.message} enteringAnimation={ZoomIn} />
						</View>
					)}

					<View className={"player-gestures"} style={state.type !== "idle" && { pointerEvents: "none", opacity: 0 }}>
						<PlayerGesture ref={seekBackwardGestureRef} icon={"backward_10_seconds"} onPress={seekBackward} autoHide disable={props.playerState.isLive} />
						<PlayerGesture
							ref={playGestureRef}
							icon={props.playerState.paused ? "play" : "pause"}
							onPress={togglePlay}
							tap={1}
							autoHide={!props.playerState.paused}
						/>
						<PlayerGesture ref={seekForwardGestureRef} icon={"forward_10_seconds"} onPress={seekForward} autoHide disable={props.playerState.isLive} />
					</View>

					<AnimatedView
						className={"player-menus"}
						style={[opacityStyle, { pointerEvents: Platform.OS === "web" || state.type !== "idle" ? "none" : "box-none" }]}
					>
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
						/>

						<PlayerDropdown
							open={triggeredDropdown == 4}
							title={t("PLAYBACK_RATE")}
							defaultValue={props.playerState.rate}
							items={props.resources.rates}
							onSelect={(rate) => props.controls.setPlaybackRate(rate)}
							afterSelect={closeDropdown}
							getItemText={(rate) => `${String(rate).replace(/\.0$/, "")}x`}
						/>

						{/* Audio track selector — only rendered when the media has multiple audio tracks */}
						<PlayerDropdown
							open={triggeredDropdown == 3}
							title={t("AUDIO_TRACKS")}
							defaultSelected={props.playerState.audioIndex}
							items={props.resources.audioTracks}
							onSelect={(_, index) => props.controls.setAudioTrack(index)}
							afterSelect={closeDropdown}
							getItemText={(i: AudioTrack) => (i.lang ? `${i.name} (${i.lang})` : i.name)}
						/>
					</AnimatedView>
				</View>

				<AnimatedView className={"player-progress"} style={[opacityStyle, { height: sizes.span6 - 2 }]}>
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
						sliderHeight={Platform.isTV ? sizes.span6 : sizes.span6 - 2}
						style={{ height: sizes.h1 }}
						theme={{
							minimumTrackTintColor: sky[500],
							maximumTrackTintColor: zinc[700],
							cacheTrackTintColor: zinc[500],
							bubbleBackgroundColor: sky[500],
							...theme
						}}
						bubbleTextStyle={{
							fontSize: sizes.span2,
							fontFamily: "Montserrat-Medium",
							color: "black"
						}}
					/>
				</AnimatedView>

				<FocusGuide autoFocus trapFocusLeft trapFocusRight trapFocusDown className={"player-buttons"}>
					<AnimatedView className={"player-buttons-ctn"} style={[opacityStyle]}>
						<ControlButton
							ref={playButtonRef}
							onPress={togglePlay}
							icon={!props.playerState.paused ? "pause" : "play"}
							className={`player-button`}
							iconSize={defaultIconSize}
							hasTVPreferredFocus={returnFocusPulse}
						/>

						{/* Seek buttons are hidden and disabled for live streams */}
						<ControlButton
							hideAndDisable={props.playerState.isLive}
							onPress={seekBackward}
							icon="backward_10_seconds"
							className={`only-landscape player-button`}
							iconSize={defaultIconSize}
						/>

						<ControlButton
							hideAndDisable={props.playerState.isLive}
							onPress={seekForward}
							icon="forward_10_seconds"
							className={`only-landscape player-button`}
							iconSize={defaultIconSize}
						/>

						<ControlButton
							onPress={toggleMute}
							icon={props.playerState.volume == 0 ? "volume_slash" : "volume_high"}
							className={`only-landscape player-button`}
							iconSize={defaultIconSize}
						/>

						{props.onNextVideo && (
							<ControlButton
								onPress={props.onNextVideo}
								icon={"next"}
								text={props.nextLabel || t("NEXT_VIDEO")}
								className={"only-landscape next-button"}
								iconSize={defaultIconSize}
							/>
						)}

						<TimeDisplayer currentTime={playerCurrentTime} fullTime={playerDurationTime} />

						<View className={"player-buttons-separator"} />

						<ControlButton
							onPress={() => openDropdown(4)}
							icon="speed"
							className={`player-button only-landscape`}
							iconSize={defaultIconSize - 4}
							// focusable:false alongside display:none — a hidden button is otherwise still a
							// 0-size focus candidate on Android TV and derails directional navigation.
							{...((props.resources.rates.length < 1 || props.playerState.isLive) && { style: { display: "none" }, focusable: false })}
						/>

						<ControlButton onPress={() => openDropdown(0)} icon="globe" className={`player-button`} iconSize={defaultIconSize} />

						{/* Audio track button — hidden when there is only one (or zero) audio tracks */}
						<ControlButton
							onPress={() => openDropdown(3)}
							icon="audio_wave"
							className={`player-button`}
							iconSize={defaultIconSize}
							{...(props.resources.audioTracks.length <= 1 && { style: { display: "none" }, focusable: false })}
						/>

						<ControlButton
							onPress={() => openDropdown(1)}
							icon="subtitle"
							className={`player-button`}
							iconSize={defaultIconSize}
							{...(props.resources.subtitles.length === 0 && { style: { display: "none" }, focusable: false })}
						/>

						<ControlButton
							onPress={() => openDropdown(2)}
							icon="settings"
							className={`player-button`}
							iconSize={defaultIconSize}
							{...(props.resources.levels.length === 0 && { style: { display: "none" }, focusable: false })}
						/>

						{Platform.OS === "web" && (
							<ControlButton
								onPress={toggleFullscreen}
								icon={props.playerState.isFullscreen ? "compress" : "expand"}
								className={`player-button`}
								iconSize={defaultIconSize}
							/>
						)}
					</AnimatedView>
				</FocusGuide>
			</AnimatedView>
		</SafeAreaView>
	);
});
PlayerControls.displayName = "PlayerControls";

export default memo(PlayerControls);
