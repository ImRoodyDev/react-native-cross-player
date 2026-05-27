import {
	OnBufferData,
	OnLoadData,
	OnPlaybackStateChangedData,
	OnVideoErrorData,
	ReactVideoProps,
	SelectedTrackType,
	SelectedVideoTrackType,
	VideoRef
} from "react-native-video";
import { Platform, View } from "react-native";
import React, { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SubtitleSource, VideoSource, VideoSourceWithoutId } from "../types/media";
import { HlsProxyConfig, ProxyURLResolverCallback } from "../types/hls";
import { CNPLogger } from "../utils/logger";

// source creation and blob cleanup moved to useSources
import { useSources } from "./useSources";
import { useHlsProxy } from "./useHlsProxy";
import Hls, { AudioTrackSwitchedData, ErrorData, LevelSwitchedData } from "hls.js";
import { PlayerControlsRef } from "../ui/PlayerControls";
import { useFullscreen } from "./useFullscreen";
import { t } from "../libs/localization";
import { isCustomPlayerError } from "../libs/error";
import { AudioTrack, PlayerControllerState, PlayerState, QualityLevel } from "../types/player";
import { isValidTime } from "../utils/helpers";

export type PlayerControllerProps = {
	/**
	 * Reference to the player container view. Used for fullscreen and measurements.
	 */
	playerViewRef: React.RefObject<View | null>;

	/**
	 * Ref to the controls component so the controller can update UI state.
	 */
	controlsRef: React.RefObject<PlayerControlsRef | null>;

	/**
	 * Reference to the underlying video instance (react-native-video ref).
	 */
	videoRef: React.RefObject<VideoRef | null>;

	/**
	 * Optional HLS configuration forwarded to the HLS proxy/hls.js instance.
	 */
	hlsConfig?: HlsProxyConfig["hlsConfig"];

	/**
	 * Unique identifier for this player instance. Used for source/scoped blob names.
	 */
	playerId: string;

	/**
	 * Optional maximum resolution height. Useful for filtering very large quality levels.
	 */
	maxResolutionHeight?: number;

	/**
	 * Index of the initial video source to load (index into `videoSources`).
	 * Use `-1` or omit to not auto-select a source.
	 */
	initialVideoSource?: number;

	/**
	 * Index of the initial subtitle to enable (index into `subtitleSources`).
	 * Use `-1` or omit to keep subtitles off by default.
	 */
	initialSubtitleSource?: number;

	/**
	 * Index of the initial audio track to enable. NOTE: audio tracks are discovered
	 * after media load; this value is applied once audio tracks become available.
	 */
	initialAudioTrack?: number;

	/**
	 * List of available video sources supplied by the consumer app.
	 */
	videoSources: VideoSource[];

	/**
	 * List of available subtitle sources supplied by the consumer app.
	 */
	subtitleSources: SubtitleSource[];

	// Settings
	/**
	 * Optional proxy tunnel URL used when constructing proxied playlist requests.
	 */
	proxyURL?: string;

	/**
	 * Optional resolver callback to produce proxy URLs for remote sources.
	 */
	proxyResolver?: ProxyURLResolverCallback;

	// Player options
	/**
	 * Start playback automatically after load completes.
	 */
	autoStart?: boolean;

	/**
	 * Initial seek position in seconds when the media starts.
	 */
	startPosition?: number;

	/**
	 * When true, video/subtitle source creation is deferred until first use.
	 */
	lazyLoadSources?: boolean;

	/**
	 * Optional hook invoked to lazily load a `VideoSource` before it's used.
	 */
	onLazyLoadSource?: (source: VideoSource) => Promise<VideoSourceWithoutId | void>;

	/**
	 * Preserve current playback time when switching sources (default true).
	 */
	preservePlaybackOnSourceChange?: boolean;
};

export function usePlayerController(props: PlayerControllerProps): PlayerControllerState {
	const {
		playerId,
		playerViewRef,
		controlsRef,

		// HLS Settings
		hlsConfig,

		// Native Player
		maxResolutionHeight = Infinity,
		initialVideoSource = -1,
		initialSubtitleSource = -1,
		initialAudioTrack = -1,
		subtitleSources = [],
		videoSources = [],
		videoRef,

		// Proxy Settings
		proxyURL,
		proxyResolver,

		// Player options
		autoStart = false,
		startPosition = 0,
		lazyLoadSources = true,
		preservePlaybackOnSourceChange = true,
		onLazyLoadSource
	} = props;

	// States and refs
	const isMountedRef = useRef(true); // Track if component is mounted
	const bufferTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // For buffering debounce
	const lastPositionRef = useRef<number>(startPosition || 0);
	const pendingSeekRef = useRef<number | undefined>(undefined);
	const pendingSeekRetryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const pendingSeekAttemptsRef = useRef<number>(0);
	const pendingSeekSourceRef = useRef<"source-change" | "user">("source-change");
	const sourceSwitchInFlightRef = useRef<boolean>(false);
	const blockPositionUpdatesRef = useRef<boolean>(false);
	const [paused, setPaused] = useState<boolean>(!autoStart);
	const [rate, setRate] = useState<number>(1.0);
	const [volume, setVolumeState] = useState<number>(1.0);
	const [levelId, setLevelId] = useState<number>(-1);
	const [sourceId, setSourceId] = useState<string | number>(-1);
	const [subtitleId, setSubtitleId] = useState<string | number>(-1);
	const [levels, setLevels] = useState<QualityLevel[]>([]);
	const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]); // Discovered audio tracks
	const [audioId, setAudioId] = useState<number>(-1); // Active audio track id
	const [isLive, setIsLive] = useState<boolean>(false); // Whether the current media is live
	const [nativeVideoProps, setNativeVideoProps] = useState<ReactVideoProps>();

	// Fullscreen management hook
	const { isFullscreen, onFullscreenEnter, onFullscreenExit, requestFullscreen } = useFullscreen({ videoRef, playerViewRef });

	// Source management hooks
	const {
		createdSourcesRef,
		createdSubtitlesRef,
		addVideoSource,
		addSubtitleSource,
		initializeVideos,
		initializeSubtitles,
		cleanupSources,
		initializedVideo,
		initializedSubtitle
	} = useSources({
		videoSources,
		subtitleSources,
		lazyLoadSources,
		proxyURL,
		videoRef,
		playerId,
		proxyResolver,
		onLazyLoadSource
	});

	// Lifecycle
	useEffect(() => {
		isMountedRef.current = true;
		CNPLogger.info(`Initializing player controller for playerId: ${playerId}`);
		CNPLogger.info("Is hls.js supported:", { isHlsSupported: Hls.isSupported() && typeof window !== "undefined" });

		return () => {
			isMountedRef.current = false;
			// run cleanup on unmount or playerId change
			cleanup();
		};
		// Run only on mount/unmount or playerId change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playerId]);

	// Initialize state and controller methods here
	useEffect(() => {
		(async () => {
			try {
				CNPLogger.info("Running player initialization effect with props:", {
					videos: videoSources.length,
					subtitles: subtitleSources.length,
					defaultVideo: initialVideoSource,
					defaultSubtitle: initialSubtitleSource
				});

				if (!initializedVideo) {
					// Initialize video and subtitle sources
					controlsRef.current?.setControlState({ type: "loading", message: t("PREPARING") });

					await initializeVideos();

					// Apply initial video index if valid
					if (initialVideoSource >= 0 && videoSources.length > 0) {
						await setVideoSource(initialVideoSource);
					}
				} else {
					CNPLogger.info("Video already initialized, skipping initialization effect.");
				}

				if (!initializedSubtitle) {
					await initializeSubtitles().then(null); // Video should not wait for subtitles to fail

					// Apply initial subtitle index if valid
					if (initialSubtitleSource >= 0 && subtitleSources.length > 0) {
						await setSubtitleSource(initialSubtitleSource);
					}
				} else {
					CNPLogger.info("Subtitles already initialized, skipping initialization effect.");
				}

				// Apply initial audio track index if valid (deferred until tracks are discovered at onLoad)
				// initialAudioTrack is applied inside onLoadMetadata after tracks are populated
			} catch (error) {
				CNPLogger.error("Failed to initialize player:", error);
				// Show error on controls
				if (isCustomPlayerError(error)) controlsRef.current?.setControlState({ type: "error", message: error.stateMessage() });
				else controlsRef.current?.setControlState({ type: "error", message: t("PREPARING_ERROR") });
			}
		})();

		// Run only on mount/unmount or playerId change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playerId, videoSources, subtitleSources]);

	// initialVideoSource and initialSubtitleSource are applied in the init effect above because
	// those lists come from props and are available immediately at mount time.
	// initialAudioTrack is different — audio tracks are discovered dynamically from the media
	// manifest (HLS) or native onLoad event, so audioTracks is always [] at mount.
	// This effect waits until onLoadMetadata populates audioTracks, then applies the initial selection.
	useEffect(() => {
		if (initialAudioTrack >= 0 && audioTracks.length > 0 && audioId === -1) {
			setAudioTrack(initialAudioTrack);
		}
		// Only fire when the audio track list is first populated
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [audioTracks]);

	const clearPendingSeekRetry = useCallback(() => {
		if (pendingSeekRetryRef.current) {
			clearTimeout(pendingSeekRetryRef.current);
			pendingSeekRetryRef.current = undefined;
		}
	}, []);

	const clearPendingSeek = useCallback(() => {
		pendingSeekRef.current = undefined;
		pendingSeekAttemptsRef.current = 0;
		pendingSeekSourceRef.current = "source-change";
		clearPendingSeekRetry();
	}, [clearPendingSeekRetry]);

	const applyPendingSeek = useCallback(() => {
		if (!isMountedRef.current || !videoRef.current) return;

		const seekTime = pendingSeekRef.current;
		if (!isValidTime(seekTime)) {
			clearPendingSeek();
			return;
		}

		try {
			const pendingSeekSource = pendingSeekSourceRef.current;
			// On web, the HTMLVideoElement may not be ready immediately after source change, even if the React ref is set.
			if (Platform.OS === "web" && videoRef.current.nativeHtmlVideoRef?.current) {
				const htmlVideo = videoRef.current.nativeHtmlVideoRef.current;
				if (htmlVideo.readyState < 1) {
					if (pendingSeekAttemptsRef.current < 15) {
						pendingSeekAttemptsRef.current += 1;
						clearPendingSeekRetry();
						pendingSeekRetryRef.current = setTimeout(applyPendingSeek, 120);
					}
					return;
				}
			}

			if (Platform.OS === "web" && videoRef.current.nativeHtmlVideoRef?.current) {
				videoRef.current.nativeHtmlVideoRef.current.currentTime = seekTime;
			} else {
				videoRef.current.seek(seekTime);
			}

			lastPositionRef.current = seekTime;
			CNPLogger.info(`Applied pending ${pendingSeekSource} seek:`, seekTime);
			clearPendingSeek();
		} catch (error) {
			if (pendingSeekAttemptsRef.current < 15) {
				pendingSeekAttemptsRef.current += 1;
				clearPendingSeekRetry();
				pendingSeekRetryRef.current = setTimeout(applyPendingSeek, 120);
				return;
			}

			CNPLogger.warn("Unable to apply pending seek after source change:", { seekTime, error });
			clearPendingSeek();
		}
	}, [videoRef, clearPendingSeek, clearPendingSeekRetry]);

	/****************/
	/****************/
	/****************/
	/** Video Event Handlers
	 * ******************
	 */

	const onError = useCallback((data: OnVideoErrorData | ErrorData) => {
		if ("target" in data && data.error) {
			CNPLogger.warn("Native Video Error:", data.error);
			controlsRef.current?.setControlState({
				type: "error",
				message: [data.error.code?.toString() || "400", t("ERROR")]
			});
		} else if ("type" in data) {
			CNPLogger.warn("HLS.js Error:", data);
			let stateMessage;
			switch (data.type) {
				case Hls.ErrorTypes.NETWORK_ERROR:
					stateMessage = [t("NETWORK_ERROR")];
					break;
				case Hls.ErrorTypes.MEDIA_ERROR:
					stateMessage = [t("DECODE_ERROR")];
					break;
				case Hls.ErrorTypes.MUX_ERROR:
					stateMessage = [t("DECODE_ERROR")];
					break;
				default:
					stateMessage = [t("ERROR")];
					break;
			}

			if (data.fatal)
				controlsRef.current?.setControlState({
					type: "error",
					message: stateMessage
				});
		}

		// If a source switch is in-flight and errors, keep the last known good
		// playback position intact (don't allow the failed load to overwrite it).
		if (sourceSwitchInFlightRef.current) {
			blockPositionUpdatesRef.current = true;
			sourceSwitchInFlightRef.current = false;
		}
	}, []);

	const onBuffer = useCallback(
		(data: OnBufferData) => {
			CNPLogger.info("Buffering state changed:", data.isBuffering);
			// If not sources is set or selected should ignore settign this to loading or idle state
			if (sourceId === -1 || videoSources.length < 1) return;

			const isBuffering = data.isBuffering;
			if (!isBuffering && bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);

			bufferTimeoutRef.current = setTimeout(
				() => {
					controlsRef.current?.setControlState({
						type: isBuffering ? "loading" : "idle",
						message: isBuffering ? t("LOADING") : ""
					});
					bufferTimeoutRef.current = undefined;
				},
				isBuffering ? 500 : 0
			);
		},
		[sourceId, videoSources]
	);

	const onLoadMetadata = useCallback(
		(data?: OnLoadData) => {
			CNPLogger.info("Video Metadata Loaded:", data);

			/** --- Quality levels --- */
			let levels: QualityLevel[] = [];

			// Extract quality levels from HLS or native video tracks
			// In cases where data is not from native fallback extract from HLS levels
			if (!isHlsSupported && data && data.videoTracks.length > 0) {
				levels = data.videoTracks
					.map((track) => ({
						id: track.index,
						height: track.height || 0,
						width: track.width || 0,
						bitrate: track.bitrate || 0,
						name: `${track.height || track.width}p`
					}))
					.sort((a, b) => b.height - a.height); // Sort by height descending
			} else if (isHlsSupported) {
				levels =
					hlsRef.current?.levels
						.map((level, index) => ({
							id: index,
							height: level.height,
							width: level.width,
							bitrate: level.bitrate,
							name: `${level.height || level.width}p`
						}))
						?.sort((a, b) => b.height - a.height) || [];
			}

			// Push auto level
			if (levels && levels.length > 0) {
				levels.unshift({
					id: -1,
					height: 0,
					width: 0,
					bitrate: 0,
					name: "Auto"
				});
			}

			// Filter levels by maxResolutionHeight and update state
			const filteredLevels = (levels || []).filter((l) => (typeof l.height === "number" ? l.height : 0) <= maxResolutionHeight);
			// If filtering results in an empty list, fallback to original levels to avoid leaving user with no options
			setLevels(filteredLevels.length == 0 ? levels : filteredLevels);
			CNPLogger.info("Available quality levels:", filteredLevels);
			CNPLogger.info(
				"Selected quality level:",
				filteredLevels.find((l) => l.id === levelId)
			);

			// Detect live streams
			let detectedLive = false;
			if (isHlsSupported && hlsRef.current) {
				// Hls.js provides level details with a `live` flag on parsed playlist details
				try {
					const lvls = hlsRef.current.levels;
					detectedLive = !!lvls?.some((lvl) => lvl?.details?.live === true);
				} catch (e) {
					detectedLive = false;
				}
			} else if (data && typeof data.duration === "number") {
				// Native onLoad: duration may be Infinity or NaN for live streams
				detectedLive = !isFinite(data.duration);
			}
			setIsLive(detectedLive);

			/** --- Audio tracks --- */
			let discovered: AudioTrack[] = [];

			if (isHlsSupported && hlsRef.current) {
				// HLS.js exposes audio tracks after manifest is parsed
				discovered = hlsRef.current.audioTracks.map((track, index) => ({
					id: index, // HLS audioTrack setter uses the array index
					name: track.name || track.lang || `Audio Track ${index + 1}`,
					lang: track.lang
				}));
			} else if (!isHlsSupported && data && data.audioTracks && data.audioTracks.length > 0) {
				// Native video exposes audio tracks in the onLoad event
				discovered = data.audioTracks.map((track) => ({
					id: track.index,
					name: track.title || track.language || `Audio Track ${track.index + 1}`,
					lang: track.language
				}));
			}

			setAudioTracks(discovered);
			CNPLogger.info("Available audio tracks:", discovered);

			// Controller onload callback
			if (data) controlsRef.current?.onLoad(data);

			// Clear loading state defensively after load if idle
			controlsRef.current?.setControlState({ type: "idle", message: "" });

			// Seek to preserved time after media metadata is ready.
			applyPendingSeek();

			// A successful load means the switch finished; allow progress to update position again.
			sourceSwitchInFlightRef.current = false;
			blockPositionUpdatesRef.current = false;
		},
		[maxResolutionHeight, applyPendingSeek]
	);

	const onPlaybackStateChanged = useCallback(
		(data: OnPlaybackStateChangedData) => {
			CNPLogger.info("Playback state changed:", data);
			setPaused(!data.isPlaying);
			// Clear any control states when playback resumes
			// There is an wierd issue where it shows that video is playing but its not
			if (data.isPlaying && videoSources.length > 0 && controlsRef.current?.state.type !== "idle")
				controlsRef.current?.setControlState({ type: "idle", message: "" });
		},
		[videoSources]
	);

	/****************/
	/****************/
	/****************/
	/** HLS Event Handlers ( Mostly for web )
	 * ******************
	 */

	const onHLSLevelSwitched = useCallback((_: string, data: LevelSwitchedData) => {
		CNPLogger.info("Switched to quality:", data.level);
		// if (isMountedRef.current) {
		// 	setLevelId(data.level);
		// }
		// Disabling is to manual switch to allow auto level
	}, []);

	// Fired by HLS.js when the audio track actually switches — keep audioId in sync
	const onHLSAudioTrackSwitched = useCallback((_: string, data: AudioTrackSwitchedData) => {
		CNPLogger.info("Switched to audio track:", data.id);
		if (isMountedRef.current) {
			setAudioId(data.id);
		}
	}, []);

	const {
		hlsRef,
		isHlsSupported,
		hlsCreated,
		createHLS,
		setSource: hlsSetSource,
		stopLoad: hlsStopLoad,
		runDestroy: destroyHls
	} = useHlsProxy({
		hlsConfig,
		videoRef,
		onError,
		onManifestParsed: onLoadMetadata,
		onLevelSwitched: onHLSLevelSwitched,
		onAudioTrackSwitched: onHLSAudioTrackSwitched
	});

	const stopLoadSource = useCallback(() => {
		if (hlsCreated) hlsStopLoad();
		else videoRef.current?.setSource({ uri: undefined });
	}, [hlsCreated, hlsStopLoad, videoRef]);

	const cleanup = useCallback(() => {
		// Video Element cleanup
		clearPendingSeek();
		stopLoadSource();
		setSourceId(-1);
		setSubtitleId(-1);
		setLevelId(-1);
		setLevels([]);
		setAudioId(-1);
		setAudioTracks([]);
		setNativeVideoProps(undefined);
		setIsLive(false);

		// HLS Proxy cleanup
		destroyHls();

		// Video track cleanup (remove <track> elements, not TextTrack objects)
		if (Platform.OS === "web" && videoRef.current?.nativeHtmlVideoRef?.current) {
			const videoEl = videoRef.current.nativeHtmlVideoRef.current;
			const trackElements = videoEl.querySelectorAll("track");
			trackElements.forEach((t) => {
				if (t.parentNode) t.parentNode.removeChild(t);
			});
		}

		// Clear created sources and subtitles
		cleanupSources();
	}, [playerId, stopLoadSource, destroyHls, cleanupSources, clearPendingSeek]);

	/****************/
	/****************/
	/****************/
	/** Player Control Methods
	 * ******************
	 */

	// Sync native video props whenever source, subtitle, or audio track selection changes
	useEffect(() => {
		const videoSource = createdSourcesRef.current.get(sourceId as string);
		const subtitleSource = createdSubtitlesRef.current.get(subtitleId as string);
		setNativeVideoProps((prev) => ({
			...prev,
			...(hlsCreated
				? {
						source: {
							...prev?.source,
							uri: undefined, // Clear the native source URI to avoid overwriting HLS Blob
							headers: {}
						}
					}
				: {
						source: {
							...prev?.source,
							uri: videoSource?.source,
							headers: (videoSource?.options?.nativeSendHeadersOnSourceRequest && videoSource?.options?.headers) || {}
						}
					}), // Clear source props if HLS handles it
			selectedTextTrack: subtitleSource
				? {
						type: SelectedTrackType.INDEX,
						value: Array.from(createdSubtitlesRef.current.keys()).indexOf(subtitleSource.id)
					}
				: { type: SelectedTrackType.DISABLED },
			// Native audio track — only applied when HLS is not handling it
			selectedAudioTrack: !hlsCreated && audioId >= 0 ? { type: SelectedTrackType.INDEX, value: audioId } : undefined
		}));
	}, [hlsCreated, sourceId, subtitleId, audioId]);

	const setVideoSource = useCallback(
		async (sourceIndex: number) => {
			let startedSwitch = false;
			try {
				const video = videoSources[sourceIndex];
				if (!video) return CNPLogger.warn(`Video source at index ${sourceIndex} not found.`);
				// Return if already on the requested source
				if (video.id === sourceId) {
					CNPLogger.info(`Requested video source at  ${video.label} is already active.`);
					return;
				}

				// Add video source if not already created
				if (!createdSourcesRef.current.has(video.id)) await addVideoSource(video);
				const createdSource = createdSourcesRef.current.get(video.id);
				if (!createdSource) return CNPLogger.warn(`Created video source for id ${video.id} not found.`);

				// Capture current playback time (for preserve playback behavior)
				const currentPos = isValidTime(lastPositionRef.current) ? lastPositionRef.current : 0;
				CNPLogger.info("Current playback position before source switch:", currentPos);
				const requestedStartTime = preservePlaybackOnSourceChange ? currentPos : startPosition;
				const startTime = isValidTime(requestedStartTime) ? requestedStartTime : 0;
				pendingSeekRef.current = startTime;
				pendingSeekSourceRef.current = "source-change";
				pendingSeekAttemptsRef.current = 0;
				clearPendingSeekRetry();

				// Lock playback position updates while we attempt to switch sources.
				// If the attempted source is invalid and emits progress=0, we don't want
				// to overwrite the preserved time.
				blockPositionUpdatesRef.current = true;
				sourceSwitchInFlightRef.current = true;
				startedSwitch = true;

				// Stop current source playback if needed
				stopLoadSource();

				// If format is HLS and supported, use HlsProxy to set source
				if (isHlsSupported && video.format === "m3u8") {
					controlsRef.current?.setControlState({ type: "loading", message: t("PREPARING") });
					if (!hlsCreated) createHLS();
					hlsSetSource(createdSource.source, createdSource.options, startTime);
					CNPLogger.info("HLS Proxy source set:", { uri: createdSource.source, options: createdSource.options, startTime });
				} else {
					// Destroying the hls instance if it exists to ensure a clean state before setting the new source on the native player
					if (hlsCreated) {
						destroyHls();
						CNPLogger.info("Destroyed existing HLS instance to set new source on native player.");
					}

					if (!videoRef.current) return CNPLogger.warn("Video reference is not available.");

					// Set source on native video player
					videoRef.current.setSource({
						uri: createdSource.source,
						headers: (video.options?.nativeSendHeadersOnSourceRequest && video.options?.headers) || {},
						startPosition: startTime
					});
				}

				// Start playback if not lazy loading
				setSourceId(video.id);
			} catch (error) {
				// If we failed before a real switch attempt started, keep progress updates flowing.
				if (!startedSwitch) {
					blockPositionUpdatesRef.current = false;
					sourceSwitchInFlightRef.current = false;
					clearPendingSeek();
				} else {
					// If we already started switching and it failed, keep the lock until next successful load.
					sourceSwitchInFlightRef.current = false;
				}
				CNPLogger.warn(`Failed to set video source at index ${sourceIndex}:`, error);
				// Show error on controls
				if (isCustomPlayerError(error)) controlsRef.current?.setControlState({ type: "error", message: error.stateMessage() });
				else controlsRef.current?.setControlState({ type: "error", message: t("CHANGING_SOURCE_ERROR") });
			}
		},
		[
			sourceId,
			videoSources,
			hlsCreated,
			addVideoSource,
			stopLoadSource,
			hlsSetSource,
			destroyHls,
			createHLS,
			preservePlaybackOnSourceChange,
			startPosition,
			clearPendingSeek,
			clearPendingSeekRetry
		]
	);

	const setSubtitleSource = useCallback(
		async (subtitleIndex: number) => {
			try {
				const subtitle = subtitleSources[subtitleIndex];
				if (!subtitle) return CNPLogger.warn(`Subtitle source at index ${subtitleIndex} not found.`);
				// Return if already on the requested source
				if (subtitle.id === subtitleId) {
					CNPLogger.info(`Requested subtitle source at  ${subtitle.label} is already active.`);
					return;
				}

				// Add subtitle source if not already created
				if (!createdSubtitlesRef.current.has(subtitle.id)) {
					await addSubtitleSource(subtitle);
				}

				// Set subtitle source on HTML video element
				if (Platform.OS === "web" && videoRef.current?.nativeHtmlVideoRef?.current) {
					const tracks = videoRef.current.nativeHtmlVideoRef.current.textTracks;
					for (let i = 0; i < tracks.length; i++) {
						tracks[i].mode = tracks[i].id === subtitle.id ? "showing" : "disabled";
					}
				}

				// Set subtitle on native video player
				setSubtitleId(subtitle.id);
			} catch (e) {
				CNPLogger.warn(`Failed to set subtitle source at index ${subtitleIndex}:`, e);
			}
		},
		[subtitleId, subtitleSources, addSubtitleSource]
	);

	const setAudioTrack = useCallback(
		(trackIndex: number) => {
			const track = audioTracks[trackIndex];
			if (!track) return CNPLogger.warn(`Audio track at index ${trackIndex} not found.`);

			// Return early if the requested track is already active
			if (track.id === audioId) {
				CNPLogger.info(`Requested audio track "${track.name}" is already active.`);
				return;
			}

			if (isHlsSupported && hlsRef.current) {
				// HLS.js switches audio tracks via the audioTrack index property.
				// The AUDIO_TRACK_SWITCHED event will fire and update audioId.
				hlsRef.current.audioTrack = track.id;
				CNPLogger.info("HLS audio track set to index:", track.id);
			} else {
				// Native path: selectedAudioTrack is applied via nativeVideoProps effect above.
				setAudioId(track.id);
				CNPLogger.info("Native audio track set to index:", track.id);
			}
		},
		[audioId, audioTracks, isHlsSupported, hlsRef]
	);

	const setSubtitleOff = useCallback(() => {
		// Set subtitle source on HTML video element
		if (Platform.OS === "web" && videoRef.current?.nativeHtmlVideoRef?.current) {
			const tracks = videoRef.current.nativeHtmlVideoRef.current.textTracks;
			for (let i = 0; i < tracks.length; i++) {
				tracks[i].mode = "disabled";
			}
		}

		// Set subtitle on native video player
		setSubtitleId(-1);
	}, []);

	const setResolution = useCallback(
		(levelIndex: number) => {
			if (isHlsSupported && hlsRef.current) {
				(hlsRef.current as any).currentLevel = levels[levelIndex]?.id || -1;
			} else if (!isHlsSupported) {
				const level = levels[levelIndex];
				if (!level) return;

				setNativeVideoProps((prev) => ({
					...(prev || {}),
					selectedVideoTrack:
						levelIndex === -1
							? { type: SelectedVideoTrackType.AUTO }
							: {
									type: SelectedVideoTrackType.INDEX,
									value: level.id
								}
				}));
			}
		},
		[levels]
	);

	const setVolume = useCallback((volume: number) => {
		if (typeof volume === "number" && isFinite(volume)) {
			videoRef.current?.setVolume(volume);
			setVolumeState(volume);
		} else {
			CNPLogger.warn(`Attempted to set volume with an invalid value: ${volume}`);
		}
	}, []);

	const setMuted = useCallback((muted: boolean) => {
		videoRef.current?.setVolume(muted ? 0 : 1);
		setVolumeState(muted ? 0 : 1);
	}, []);

	const setPlaybackRate = useCallback((rate: number) => {
		if (Platform.OS === "web" && videoRef.current?.nativeHtmlVideoRef?.current && isFinite(rate))
			videoRef.current.nativeHtmlVideoRef.current.playbackRate = rate;
		else setNativeVideoProps((prev) => ({ ...(prev || {}), rate }));
		setRate(rate);
	}, []);

	const setCurrentTime = useCallback(
		(position: number) => {
			if (sourceId === -1) return;
			if (typeof position !== "number" || !isFinite(position)) {
				CNPLogger.warn(`Attempted to seek with an invalid position: ${position}`);
				return;
			}

			const nextPosition = Math.max(0, position);
			lastPositionRef.current = nextPosition;
			pendingSeekRef.current = nextPosition;
			pendingSeekSourceRef.current = "user";
			pendingSeekAttemptsRef.current = 0;
			clearPendingSeekRetry();

			if (videoRef.current) {
				applyPendingSeek();
			} else {
				CNPLogger.warn("Attempted to seek before the video reference was available.");
			}
		},
		[sourceId, applyPendingSeek, clearPendingSeekRetry]
	);

	const setFullscreen = useCallback((enable: boolean) => {
		requestFullscreen(enable);
	}, []);

	const setPause = useCallback((paused: boolean) => {
		setPaused(paused);
	}, []);

	// Memoized player state to avoid unnecessary calculations
	const playerState: PlayerState = useMemo(
		() => ({
			paused,
			rate,
			levelId,
			sourceId,
			subtitleId,
			isFullscreen,
			volume,
			audioId,
			isLive,
			// Calculate indexes
			levelIndex: levels.findIndex((l) => l.id === levelId),
			sourceIndex: videoSources.findIndex((v) => v.id === sourceId),
			subtitleIndex: subtitleSources.findIndex((s) => s.id === subtitleId),
			audioIndex: audioTracks.findIndex((a) => a.id === audioId)
		}),
		[paused, rate, levelId, sourceId, subtitleId, isFullscreen, volume, audioId, levels, videoSources, subtitleSources, audioTracks, isLive]
	);

	return {
		playerState,
		nativeVideoProps: {
			...(nativeVideoProps || {}),
			onError,
			onBuffer,
			onPlaybackStateChanged,
			onLoad: onLoadMetadata,
			onProgress: (e) => {
				if (!blockPositionUpdatesRef.current && typeof e.currentTime === "number" && isFinite(e.currentTime)) {
					lastPositionRef.current = e.currentTime;
				}

				if (pendingSeekRef.current !== undefined && isValidTime(pendingSeekRef.current)) {
					applyPendingSeek();
				}
				controlsRef.current?.onProgress(e);
			},
			onPlaybackRateChange: ({ playbackRate }) => {
				setRate(playbackRate);
			},
			onFullscreenPlayerWillPresent: onFullscreenEnter,
			onFullscreenPlayerWillDismiss: onFullscreenExit
		},
		playbackResources: {
			levels,
			rates: [0.5, 1.0, 1.5, 2.0],
			sources: videoSources,
			subtitles: subtitleSources,
			audioTracks
		},
		controls: {
			cleanup,
			setFullscreen,
			setSource: setVideoSource,
			setSubtitle: setSubtitleSource,
			setResolution,
			setVolume,
			setMuted,
			setPlaybackRate,
			setCurrentTime,
			setPause,
			setSubtitleOff,
			setAudioTrack
		}
	};
}
