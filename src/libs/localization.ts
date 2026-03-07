let currentLanguage: Languages = "en";

export const Localization = {
	en: {
		PLAY: "Play",
		PAUSE: "Pause",
		PLAYBACK_RATE: "Playback Rate",
		FULLSCREEN: "Fullscreen",
		EXIT_FULLSCREEN: "Exit Fullscreen",
		VIDEO_SETTINGS: "Video Settings",
		VIDEO_QUALITY: "Video Quality",
		VIDEO_CAPTION: "Captions Language",
		VIDEO_SOURCES: "Video Sources",
		SUBTITLES_OFF: "Subtitles Off",
		AUDIO_TRACKS: "Audio Tracks",
		NEXT: "Next",
		PREVIOUS: "Previous",
		NEXT_VIDEO: "Next Video",

		// Error and status messages
		PREPARING: "Preparing video...",
		PREPARING_ERROR: "Error preparing video.",
		NETWORK_ERROR: "Network error. Please check your connection.",
		DECODE_ERROR: "Video decoding error.",
		ERROR: "An error occurred. Please try again later.",
		LOADING: "Loading video...",
		CHANGING_SOURCE: "Changing video source...",
		CHANGING_SOURCE_ERROR: "Error changing video source.",
		OK: "OK",
		RETRY: "Retry"
	}
} as const;

export type Languages = keyof typeof Localization;
export type LocalizationKeys = keyof (typeof Localization)["en"];

function getLanguage() {
	return currentLanguage as Languages;
}

export function setLanguage(language: Languages) {
	currentLanguage = language;
}

export function t(key: LocalizationKeys) {
	return (Localization[getLanguage()][key] ?? Localization["en"][key]) || key;
}
