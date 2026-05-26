import { SubtitleSource, VideoSource } from "./media";
import { ReactVideoProps } from "react-native-video";

export type QualityLevel = {
	id: number;
	height: number;
	width: number;
	bitrate: number;
	name: string;
};

/*
 * Represents a single audio track discovered from the media at load time.
 * - `id` maps to the HLS audioTrack index or the native video track index.
 * - `name` is used as the display label in the UI.
 */
export type AudioTrack = {
	id: number;     // Index in the HLS audioTracks array / native track index
	name: string;   // Display label (e.g. "English", "Español")
	lang?: string;  // ISO 639 language code, if available
};

export type PlayerState = {
	paused: boolean;
	rate: number;
	levelId: number;
	levelIndex: number;
	sourceId: string | number;
	sourceIndex: number;
	subtitleId: string | number;
	subtitleIndex: number;
	audioId: number;        // Currently active audio track id (-1 = none / default)
	audioIndex: number;     // Index in the audioTracks array (-1 = not found)
	isFullscreen: boolean;
	volume: number;
    /**
     * Indicates whether the currently loaded media is a live stream.
     * - `true` for live HLS or streams with no finite duration
     * - `false` for VOD/content with a finite duration
     */
    isLive: boolean;
};

export type PlaybackResources = {
	levels: QualityLevel[];
	rates: number[];
	sources: VideoSource[];
	subtitles: SubtitleSource[];
	audioTracks: AudioTrack[];  // Discovered audio tracks (populated after media loads)
};

export type VideoControls = {
	cleanup: () => void;
	setSource: (sourceIndex: number) => Promise<void>;
	setSubtitle: (subtitleIndex: number) => Promise<void>;
	setResolution: (levelIndex: number) => void;
	setFullscreen: (enable: boolean) => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setCurrentTime: (position: number) => void;
	setPause: (paused: boolean) => void;
	setSubtitleOff: () => void;
	setAudioTrack: (trackIndex: number) => void;  // Select audio track by index in audioTracks array
};

export type PlayerControllerState = {
	playerState: PlayerState;
	nativeVideoProps: ReactVideoProps;
	playbackResources: PlaybackResources;
	controls: VideoControls;
};
