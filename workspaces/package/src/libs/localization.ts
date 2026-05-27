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
	},
	nl: {
		PLAY: "Afspelen",
		PAUSE: "Pauze",
		PLAYBACK_RATE: "Afspelsnelheid",
		FULLSCREEN: "Volledig scherm",
		EXIT_FULLSCREEN: "Volledig scherm verlaten",
		VIDEO_SETTINGS: "Videoinstellingen",
		VIDEO_QUALITY: "Videokwaliteit",
		VIDEO_CAPTION: "Ondertiteling",
		VIDEO_SOURCES: "Videobronnen",
		SUBTITLES_OFF: "Ondertitels uit",
		AUDIO_TRACKS: "Audiotracks",
		NEXT: "Volgende",
		PREVIOUS: "Vorige",
		NEXT_VIDEO: "Volgende video",

		PREPARING: "Video voorbereiden...",
		PREPARING_ERROR: "Fout bij het voorbereiden van de video.",
		NETWORK_ERROR: "Netwerkfout. Controleer uw verbinding.",
		DECODE_ERROR: "Fout bij het decoderen van de video.",
		ERROR: "Er is een fout opgetreden. Probeer het later opnieuw.",
		LOADING: "Video laden...",
		CHANGING_SOURCE: "Bron van de video wijzigen...",
		CHANGING_SOURCE_ERROR: "Fout bij het wijzigen van de videobron.",
		OK: "OK",
		RETRY: "Opnieuw proberen"
	},
	es: {
		PLAY: "Reproducir",
		PAUSE: "Pausa",
		PLAYBACK_RATE: "Velocidad de reproducción",
		FULLSCREEN: "Pantalla completa",
		EXIT_FULLSCREEN: "Salir de pantalla completa",
		VIDEO_SETTINGS: "Configuración de video",
		VIDEO_QUALITY: "Calidad de video",
		VIDEO_CAPTION: "Idioma de subtítulos",
		VIDEO_SOURCES: "Fuentes de video",
		SUBTITLES_OFF: "Subtítulos desactivados",
		AUDIO_TRACKS: "Pistas de audio",
		NEXT: "Siguiente",
		PREVIOUS: "Anterior",
		NEXT_VIDEO: "Siguiente video",

		PREPARING: "Preparando video...",
		PREPARING_ERROR: "Error al preparar el video.",
		NETWORK_ERROR: "Error de red. Por favor, comprueba tu conexión.",
		DECODE_ERROR: "Error de decodificación de video.",
		ERROR: "Ocurrió un error. Inténtalo de nuevo más tarde.",
		LOADING: "Cargando video...",
		CHANGING_SOURCE: "Cambiando la fuente del video...",
		CHANGING_SOURCE_ERROR: "Error al cambiar la fuente del video.",
		OK: "OK",
		RETRY: "Reintentar"
	},
	fr: {
		PLAY: "Lire",
		PAUSE: "Pause",
		PLAYBACK_RATE: "Vitesse de lecture",
		FULLSCREEN: "Plein écran",
		EXIT_FULLSCREEN: "Quitter le plein écran",
		VIDEO_SETTINGS: "Paramètres vidéo",
		VIDEO_QUALITY: "Qualité vidéo",
		VIDEO_CAPTION: "Langue des sous-titres",
		VIDEO_SOURCES: "Sources vidéo",
		SUBTITLES_OFF: "Sous-titres désactivés",
		AUDIO_TRACKS: "Pistes audio",
		NEXT: "Suivant",
		PREVIOUS: "Précédent",
		NEXT_VIDEO: "Vidéo suivante",

		PREPARING: "Préparation de la vidéo...",
		PREPARING_ERROR: "Erreur lors de la préparation de la vidéo.",
		NETWORK_ERROR: "Erreur réseau. Veuillez vérifier votre connexion.",
		DECODE_ERROR: "Erreur de décodage vidéo.",
		ERROR: "Une erreur est survenue. Veuillez réessayer plus tard.",
		LOADING: "Chargement de la vidéo...",
		CHANGING_SOURCE: "Changement de source vidéo...",
		CHANGING_SOURCE_ERROR: "Erreur lors du changement de source vidéo.",
		OK: "OK",
		RETRY: "Réessayer"
	},
	ch: {
		PLAY: "播放",
		PAUSE: "暂停",
		PLAYBACK_RATE: "播放速度",
		FULLSCREEN: "全屏",
		EXIT_FULLSCREEN: "退出全屏",
		VIDEO_SETTINGS: "视频设置",
		VIDEO_QUALITY: "视频质量",
		VIDEO_CAPTION: "字幕语言",
		VIDEO_SOURCES: "视频来源",
		SUBTITLES_OFF: "关闭字幕",
		AUDIO_TRACKS: "音轨",
		NEXT: "下一个",
		PREVIOUS: "上一个",
		NEXT_VIDEO: "下一个视频",

		PREPARING: "正在准备视频...",
		PREPARING_ERROR: "准备视频时出错。",
		NETWORK_ERROR: "网络错误。请检查您的连接。",
		DECODE_ERROR: "视频解码错误。",
		ERROR: "发生错误。请稍后再试。",
		LOADING: "正在加载视频...",
		CHANGING_SOURCE: "正在切换视频源...",
		CHANGING_SOURCE_ERROR: "切换视频源时出错。",
		OK: "确定",
		RETRY: "重试"
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
