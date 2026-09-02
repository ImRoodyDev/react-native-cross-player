"use client";

import React, { forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { OnLoadData, OnProgressData } from "react-native-video";
import { Action, State, useComponentStateReducer } from "../hooks/useComponentState";
import { Easing, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from "react-native-reanimated";
import useWebKeyboard from "../hooks/useWebKeyboard";
import useTVRemote from "../hooks/useTVRemote";
import { useResponsiveSize } from "../hooks/useResponsiveSize";
import { Platform, StyleSheet, View as RNView, BackHandler, Dimensions } from "react-native";
import { View, Text, AnimatedView } from "./styled";
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
import { PlaybackResources, PlayerState, VideoControls, AudioTrack, QualityLevel } from "../types/player";
import { SubtitleSource, VideoSource } from "../types/media";

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

const CLOSE_BUTTON_STYLE = { outlineColor: "white", outlineStyle: "solid", outlineWidth: 2 } as const;
const HIDDEN_PROPS = { style: { display: "none" }, focusable: false } as const;

/**
 * Shared styling for every control-bar button (play, seek, mute, menus, close, ...).
 * Keeps the visual identity in ONE place instead of repeating the same 7 props per button;
 * any prop can still be overridden per-usage since {...props} spreads last.
 * Forwards ref so buttons can be used as TV focus destinations (nextFocus*).
 */
const ControlButton = memo(
	forwardRef<RNView, React.ComponentProps<typeof Button>>((props, ref) => (
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
	))
);
ControlButton.displayName = "ControlButton";

const getSourceText = (i: VideoSource) => i.label;
const getSubtitleText = (i: SubtitleSource) => i.label || i.langISO;
const getLevelText = (i: QualityLevel) => i.name;
const getRateText = (rate: number) => `${String(rate).replace(/\.0$/, "")}x`;
const getAudioText = (i: AudioTrack) => (i.lang ? `${i.name} (${i.lang})` : i.name);

const PlayerControls = forwardRef((props: ControlsProps, ref?: Ref<PlayerControlsRef>) => {
	// Destructuring props
	const { visibilityDuration = 3000, theme, HeaderRightElement } = props;

	// Hooks
	const sizes = useResponsiveSize();
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
	const playButtonRef = useRef<RNView | null>(null);
	const seekBackwardGestureRef = useRef<PlayerGestureRef>(null);
	const seekForwardGestureRef = useRef<PlayerGestureRef>(null);
	const playGestureRef = useRef<PlayerGestureRef>(null);

	// Node kept in state as well: `nextFocusDown` needs the mounted view, and a ref alone never
	// re-renders the close button to apply it (it only ever landed by luck on an unrelated render).
	const [playButtonNode, setPlayButtonNode] = React.useState<RNView | null>(null);
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

	const setPlayButton = useCallback((node: RNView | null) => {
		// `nextFocusDown` is a TV-only D-pad concern. Off-TV, writing the mounted node into
		// state here re-renders the close button (which consumes it via `nextFocusDown`), which
		// re-mounts the play button, which fires this ref callback again — an infinite re-render
		// loop that grows the tree until the app is OOM-killed. Only track the node on TV.
		playButtonRef.current = node;
		if (Platform.isTV) setPlayButtonNode(node);
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

		// BUG FIX: this will let the navigator act like immersive mode,
		// because when add immersive mode in the navigator it causes issue with the screen size and insets
		const { width, height } = Dimensions.get("window");
		if (Platform.OS !== "web") {
			// using require so it doesnt hit metro react-native-system-navigation-bar
			require("react-native-system-navigation-bar").default[width > height ? "hide" : "show"]("both");
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

	// Stable per-dropdown open handlers — `() => openDropdown(n)` inline would hand every trigger
	// button a new onPress each render and defeat memo(ControlButton).
	const openSourceDropdown = useCallback(() => openDropdown(0), [openDropdown]);
	const openSubtitleDropdown = useCallback(() => openDropdown(1), [openDropdown]);
	const openQualityDropdown = useCallback(() => openDropdown(2), [openDropdown]);
	const openAudioDropdown = useCallback(() => openDropdown(3), [openDropdown]);
	const openRateDropdown = useCallback(() => openDropdown(4), [openDropdown]);

	// Stable dropdown/slider handlers, same reason.
	const selectSource = useCallback((_: VideoSource, index: number) => props.controls.setSource(index), [props.controls]);
	const selectSubtitle = useCallback(
		(_: SubtitleSource, index: number) => {
			if (index === 0) props.controls.setSubtitleOff();
			else props.controls.setSubtitle(index - 1);
		},
		[props.controls]
	);
	const selectLevel = useCallback((_: QualityLevel, index: number) => props.controls.setResolution(index), [props.controls]);
	const selectRate = useCallback((rate: number) => props.controls.setPlaybackRate(rate), [props.controls]);
	const selectAudio = useCallback((_: AudioTrack, index: number) => props.controls.setAudioTrack(index), [props.controls]);
	const seekTo = useCallback((value: number) => props.controls.setCurrentTime(value), [props.controls]);

	// `t()` is a plain lookup, so keep resolving it every render; the memo only rebuilds the array
	// when the label or the list actually changes (so a language switch still propagates).
	const subtitlesOffLabel = t("SUBTITLES_OFF");
	const subtitleItems = useMemo(
		() => [{ id: "off", label: subtitlesOffLabel, langISO: "off" } as SubtitleSource, ...props.resources.subtitles],
		[props.resources.subtitles, subtitlesOffLabel]
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

	// FIX 4: Handle hardware back button on Android to prevent issue with the SafeAreaView => where you see wierd padding onscreen after pressing backhandler
	// NOTE: StatusBar in the VideoPlayer UI was causing issue too and upgraded to react-native-system-navigation-bar@3.0.0
	useEffect(() => {
		const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
			props.controls.setFullscreen(false);
			props.onClosePlayer?.();
			return true;
		});
		return () => subscription.remove();
	}, [props.onClosePlayer]);

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

	// Map Web keyboard and remote keys events
	useWebKeyboard({
		" ": togglePlay,
		ArrowRight: seekForward,
		ArrowLeft: seekBackward,
		f: toggleFullscreen
	});
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

	const animOpacityStyle = useAnimatedStyle(() => ({
		opacity: visibilityOpacity.value
	}));

	const statusHiddenStyle = useMemo(() => (state.type !== "idle" ? ({ pointerEvents: "none", opacity: 0 } as const) : undefined), [state.type]);
	const menusStyle = useMemo(
		() => [
			animOpacityStyle,
			{ pointerEvents: Platform.OS === "web" || (state.type !== "idle" && triggeredDropdown == -1) ? ("none" as const) : ("box-none" as const) }
		],
		[animOpacityStyle, triggeredDropdown, state.type]
	);
	const actionsStyle = useMemo(() => [{ pointerEvents: Platform.OS === "web" ? ("none" as const) : ("box-none" as const) }], []);
	const progressStyle = useMemo(() => [animOpacityStyle, { height: sizes.h1 }], [animOpacityStyle, sizes.span6]);
	const sliderStyle = useMemo(() => ({ height: sizes.h1, borderRadius: 999999 }), [sizes.h1]);
	const sliderContainerStyle = useMemo(() => ({ borderRadius: 999999 }), [sizes.h1]);
	const sliderTheme = useMemo(
		() => ({
			maximumTrackTintColor: "rgba(40, 40, 40, .6)",
			minimumTrackTintColor: sky[500],
			cacheTrackTintColor: zinc[500],
			bubbleBackgroundColor: sky[500],
			...theme
		}),
		[theme]
	);
	const bubbleTextStyle = useMemo(() => ({ fontSize: sizes.span2, fontFamily: "Montserrat-Medium", color: "black" }), [sizes.span2]);
	// TV only: hand the close button an explicit D-pad target. Off-TV this must stay empty —
	// `nextFocusDown` there feeds the play-button-node re-render loop (see setPlayButton).
	const closeButtonFocus = useMemo(() => (Platform.isTV && playButtonNode ? ({ nextFocusDown: playButtonNode } as object) : {}), [playButtonNode]);

	return (
		<View className="cnp-player-controls" style={[StyleSheet.absoluteFill]} onPointerMove={wakeControls} onTouchStart={wakeControls}>
			<AnimatedView className={"cnp-player-controls-ctn"} pointerEvents={controlsVisible ? "auto" : "none"}>
				<FocusGuide trapFocusUp trapFocusLeft trapFocusRight className={"cnp-player-header"}>
					<AnimatedView className={"cnp-player-header-ctn"} style={animOpacityStyle}>
						<ControlButton
							onPress={props.onClosePlayer}
							icon="xmark"
							className={"cnp-plyr-close-btn"}
							iconSize={sizes.span2}
							backgroundColor={"#0000005f"}
							style={CLOSE_BUTTON_STYLE}
							{...closeButtonFocus}
						/>
						<Text className={"cnp-player-title"}>{props.videoTitle}</Text>
						{HeaderRightElement}
					</AnimatedView>
				</FocusGuide>

				<View className={"cnp-player-gestures"} style={statusHiddenStyle}>
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

				<View className={"cnp-player-actions"} style={actionsStyle}>
					{state.type !== "idle" && (
						<View className={"cnp-player-status-overlay"}>
							<ComponentStatus state={state.type} messages={state.message} enteringAnimation={ZoomIn} />
						</View>
					)}

					<AnimatedView className={"cnp-player-menus"} style={menusStyle}>
						<PlayerDropdown
							open={triggeredDropdown == 0}
							title={t("VIDEO_SOURCES")}
							defaultSelected={props.playerState.sourceIndex}
							items={props.resources.sources}
							onSelect={selectSource}
							afterSelect={closeDropdown}
							getItemText={getSourceText}
						/>
						<PlayerDropdown
							open={triggeredDropdown == 1}
							title={t("VIDEO_CAPTION")}
							defaultSelected={props.playerState.subtitleIndex + 1}
							items={subtitleItems}
							onSelect={selectSubtitle}
							afterSelect={closeDropdown}
							getItemText={getSubtitleText}
						/>
						<PlayerDropdown
							open={triggeredDropdown == 2}
							title={t("VIDEO_QUALITY")}
							defaultSelected={props.playerState.levelIndex}
							items={props.resources.levels}
							onSelect={selectLevel}
							afterSelect={closeDropdown}
							getItemText={getLevelText}
						/>

						<PlayerDropdown
							open={triggeredDropdown == 4}
							title={t("PLAYBACK_RATE")}
							defaultValue={props.playerState.rate}
							items={props.resources.rates}
							onSelect={selectRate}
							afterSelect={closeDropdown}
							getItemText={getRateText}
						/>

						{/* Audio track selector — only rendered when the media has multiple audio tracks */}
						<PlayerDropdown
							open={triggeredDropdown == 3}
							title={t("AUDIO_TRACKS")}
							defaultSelected={props.playerState.audioIndex}
							items={props.resources.audioTracks}
							onSelect={selectAudio}
							afterSelect={closeDropdown}
							getItemText={getAudioText}
						/>
					</AnimatedView>
				</View>

				<AnimatedView className={"cnp-player-progress"} style={progressStyle}>
					<Slider
						progress={playerCurrentTime}
						minimumValue={playerMinDuration}
						maximumValue={playerDurationTime}
						cache={playerPlayableTime}
						// Configurations
						onValueChange={seekTo}
						bubble={formatTime}
						hapticMode={"step"}
						forceSnapToStep={false}
						disableTapEvent={false}
						// Styling
						thumbTouchSize={sizes.span1}
						thumbWidth={sizes.span4}
						sliderHeight={Platform.isTV ? sizes.span6 : sizes.span6 - 2}
						containerStyle={sliderContainerStyle}
						style={sliderStyle}
						theme={sliderTheme}
						bubbleTextStyle={bubbleTextStyle}
					/>
				</AnimatedView>

				<FocusGuide autoFocus trapFocusLeft trapFocusRight trapFocusDown className={"cnp-player-buttons"}>
					<AnimatedView className={"cnp-player-buttons-ctn"} style={animOpacityStyle}>
						<ControlButton
							ref={setPlayButton}
							onPress={togglePlay}
							icon={!props.playerState.paused ? "pause" : "play"}
							className={`cnp-player-button`}
							iconSize={defaultIconSize}
							hasTVPreferredFocus={returnFocusPulse}
						/>

						{/* Seek buttons are hidden and disabled for live streams */}
						<ControlButton
							hideAndDisable={props.playerState.isLive}
							onPress={seekBackward}
							icon="backward_10_seconds"
							className={`only-landscape cnp-player-button`}
							iconSize={defaultIconSize}
						/>

						<ControlButton
							hideAndDisable={props.playerState.isLive}
							onPress={seekForward}
							icon="forward_10_seconds"
							className={`only-landscape cnp-player-button`}
							iconSize={defaultIconSize}
						/>

						<ControlButton
							onPress={toggleMute}
							icon={props.playerState.volume == 0 ? "volume_slash" : "volume_high"}
							className={`only-landscape cnp-player-button`}
							iconSize={defaultIconSize}
						/>

						{props.onNextVideo && (
							<ControlButton
								onPress={props.onNextVideo}
								icon={"next"}
								text={props.nextLabel || t("NEXT_VIDEO")}
								className={"only-landscape cnp-next-button"}
								iconSize={defaultIconSize}
							/>
						)}

						<TimeDisplayer currentTime={playerCurrentTime} fullTime={playerDurationTime} visibility={visibilityOpacity} />

						<View className={"cnp-player-buttons-separator"} />

						<ControlButton
							onPress={openRateDropdown}
							icon="speed"
							className={`cnp-player-button only-landscape`}
							iconSize={defaultIconSize - 4}
							{...((props.resources.rates.length < 1 || props.playerState.isLive) && HIDDEN_PROPS)}
						/>

						<ControlButton onPress={openSourceDropdown} icon="globe" className={`cnp-player-button`} iconSize={defaultIconSize} />

						{/* Audio track button — hidden when there is only one (or zero) audio tracks */}
						<ControlButton
							onPress={openAudioDropdown}
							icon="audio_wave"
							className={`cnp-player-button`}
							iconSize={defaultIconSize}
							{...(props.resources.audioTracks.length <= 1 && HIDDEN_PROPS)}
						/>

						<ControlButton
							onPress={openSubtitleDropdown}
							icon="subtitle"
							className={`cnp-player-button`}
							iconSize={defaultIconSize}
							{...(props.resources.subtitles.length === 0 && HIDDEN_PROPS)}
						/>

						<ControlButton
							onPress={openQualityDropdown}
							icon="settings"
							className={`cnp-player-button`}
							iconSize={defaultIconSize}
							{...(props.resources.levels.length === 0 && HIDDEN_PROPS)}
						/>

						{Platform.OS === "web" && (
							<ControlButton
								onPress={toggleFullscreen}
								icon={props.playerState.isFullscreen ? "compress" : "expand"}
								className={`cnp-player-button`}
								iconSize={defaultIconSize}
							/>
						)}
					</AnimatedView>
				</FocusGuide>
			</AnimatedView>
		</View>
	);
});
PlayerControls.displayName = "PlayerControls";

export default memo(PlayerControls);
