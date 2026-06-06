import React from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../components/DocPage';
import { CodeBlock } from '../../components/CodeBlock';
import { PropsTable, type PropRow } from '../../components/PropsTable';

const EXPORTS = `import {
  VideoPlayer,
  PlayerControls,
  usePlayerController,
  useWebKeyboard,
  HlsProxy,
  HlsProxyManager,
  ProxyLoader,
  ProxyPlaylistLoader,
  ProxyFragmentLoader,
  createM3U8Source,
  createMasterM3U8Raw,
  createVTTSource,
  convertSRTtoVTT,
  createM3U8File,
  createVTTFile,
  clearBlobFiles,
  clearBlobGroup,
  revokeAllBlobURLs,
  CustomPlayerError,
  isCustomPlayerError,
  detectSourceType,
  detectSubtitleEncoding,
  detectSubtitleType,
  CNPLogger,
  ProxyLogger,
  CSS_PATH,
  type VideoPlayerRef,
  type PlayerControlsRef,
  type ControlsProps,
  type VideoSource,
  type SubtitleSource,
  type PlayerControllerProps,
  type SourceRequestOptions,
  type HlsProxyConfig,
  type ProxyURLResolverCallback,
} from 'react-native-cross-player';`;

const REF_API = `const playerRef = React.useRef<VideoPlayerRef>(null);

playerRef.current?.play();
playerRef.current?.pause();
playerRef.current?.seek(120);
playerRef.current?.setSubtitle(0);
playerRef.current?.setVideoSource(1);

const currentTime = await playerRef.current?.getCurrentTime();`;

const SOURCE_OPTIONS = `const source = {
  id: 'private-hls',
  playerId: 'api-player',
  label: 'Private HLS',
  source: 'https://cdn.example.com/master.m3u8',
  format: 'm3u8',
  options: {
    useProxy: true,
    overrideProxyURL: 'https://api.example.com/proxy',
    headers: {
      Authorization: 'Bearer token',
      'X-Media-Region': 'eu',
    },
    nativeSendHeadersOnSourceRequest: true,
  },
};`;

const PROPS: PropRow[] = [
	{ name: 'VideoPlayer', type: 'Component', description: 'High-level player wrapper with built-in controls.' },
	{ name: 'PlayerControls', type: 'Component', description: 'Reusable controls overlay driven by controller state.' },
	{ name: 'usePlayerController', type: 'Hook', description: 'Playback state, native video props, resources, and controls.' },
	{ name: 'useWebKeyboard', type: 'Hook', description: 'Web keyboard shortcut helper for custom controls.' },
	{ name: 'HlsProxy', type: 'Class', description: 'HLS helper for proxy-aware loaders and source switching.' },
	{ name: 'HlsProxyManager', type: 'Class', description: 'Small proxy URL resolver used by proxy-aware HLS loaders.' },
	{ name: 'Media helpers', type: 'Functions', description: 'M3U8, VTT, SRT conversion, and blob URL helpers.' },
	{ name: 'Detectors', type: 'Functions', description: 'Source, subtitle type, and subtitle encoding detection helpers.' },
	{ name: 'CustomPlayerError', type: 'Class', description: 'Structured player error with typed payload and user-facing state message.' },
	{ name: 'VideoSource', type: 'Type', description: 'Video source resource shape.' },
	{ name: 'SubtitleSource', type: 'Type', description: 'Subtitle resource shape.' },
	{ name: 'CSS_PATH', type: 'const', description: 'Published CSS import path for consumers that need a runtime string.' },
];

const VIDEO_PLAYER_PROPS: PropRow[] = [
	{ name: 'videoTitle', type: 'string', required: true, description: 'Title rendered in the built-in control header.' },
	{ name: 'nextLabel', type: 'string', description: 'Label for the next-video button when onNextVideo is set.' },
	{ name: 'playerConfig', type: 'PlayerControllerProps', required: true, description: 'Controller config minus refs; VideoPlayer creates the refs internally.' },
	{ name: 'language', type: "'en' | 'fr' | string", default: "'en'", description: 'Language used by built-in control labels.' },
	{ name: 'viewStyle', type: 'StyleProp<ViewStyle>', description: 'Style for the outer player container.' },
	{ name: 'videoStyle', type: 'StyleProp<ViewStyle>', description: 'Style for the react-native-video element.' },
	{ name: 'theme', type: 'SliderThemeType', description: 'Slider colors and styling passed to react-native-awesome-slider.' },
	{ name: 'onClosePlayer', type: '() => void', description: 'Fires when the close button is pressed.' },
	{ name: 'onNextVideo', type: '() => void', description: 'Shows and handles the next-video action.' },
	{ name: 'onControlVisibilityChange', type: '(visible) => void', description: 'Reports whether the controls overlay is visible.' },
	{ name: 'onSourceChange', type: '(index, source) => void', description: 'Reports selected source index and VideoSource.' },
	{ name: 'onSubtitleChange', type: '(index, subtitle) => void', description: 'Reports selected subtitle index and SubtitleSource.' },
	{ name: 'onPlaybackChange', type: '(isPlaying) => void', description: 'Reports play/pause state changes.' },
	{ name: 'onProgress', type: '(seconds) => void', description: 'Reports current playback time in seconds.' },
	{ name: 'onEnd', type: '() => void', description: 'Fires when the active media ends.' },
];

const CONTROLLER_PROPS: PropRow[] = [
	{ name: 'playerViewRef', type: 'RefObject<View>', description: 'Required only when using usePlayerController directly.' },
	{ name: 'videoRef', type: 'RefObject<VideoRef>', description: 'Required only when using usePlayerController directly.' },
	{ name: 'controlsRef', type: 'RefObject<PlayerControlsRef>', description: 'Required only when using usePlayerController directly.' },
	{ name: 'playerId', type: 'string', required: true, description: 'Scopes generated files, cleanup, and source ownership.' },
	{ name: 'videoSources', type: 'VideoSource[]', required: true, description: 'List of playable sources.' },
	{ name: 'subtitleSources', type: 'SubtitleSource[]', default: '[]', description: 'Caption tracks. SRT is converted to VTT.' },
	{ name: 'initialVideoSource', type: 'number', default: '-1', description: 'Initial source index.' },
	{ name: 'initialSubtitleSource', type: 'number', default: '-1', description: 'Initial subtitle index.' },
	{ name: 'initialAudioTrack', type: 'number', default: '-1', description: 'Initial audio track index after discovery.' },
	{ name: 'proxyURL', type: 'string', description: 'Default proxy endpoint used by proxied sources and subtitles.' },
	{ name: 'proxyResolver', type: 'ProxyURLResolverCallback', description: 'Turns target URL, proxy URL, and headers into a fetchable proxy URL.' },
	{ name: 'hlsConfig', type: 'Partial<HlsConfig>', description: 'hls.js options for web HLS playback.' },
	{ name: 'maxResolutionHeight', type: 'number', default: 'Infinity', description: 'Filters quality levels above this height.' },
	{ name: 'autoStart', type: 'boolean', default: 'false', description: 'Starts playback after loading.' },
	{ name: 'startPosition', type: 'number', default: '0', description: 'Start position in seconds.' },
	{ name: 'lazyLoadSources', type: 'boolean', default: 'true', description: 'Defers source generation until selected.' },
	{ name: 'onLazyLoadSource', type: '(source) => Promise<partial source>', description: 'Refreshes source URL, format, or options before use.' },
	{ name: 'preservePlaybackOnSourceChange', type: 'boolean', default: 'true', description: 'Keeps playback position when switching sources.' },
];

const SOURCE_PROPS: PropRow[] = [
	{ name: 'id', type: 'string', required: true, description: 'Unique id for this source within a player.' },
	{ name: 'playerId', type: 'string', required: true, description: 'Must match the owning playerConfig.playerId.' },
	{ name: 'label', type: 'string', required: true, description: 'Human-readable label shown in source menus.' },
	{ name: 'source', type: 'string', required: true, description: 'Remote URL, blob URL, or native path.' },
	{ name: 'format', type: 'VideoFormats', required: true, description: 'Format hint such as m3u8, mp4, webm, mp3, or a custom string.' },
	{ name: 'options.useProxy', type: 'boolean', default: 'false', description: 'Routes this source through the configured proxy resolver.' },
	{ name: 'options.overrideProxyURL', type: 'string', description: 'Per-source proxy endpoint. Falls back to playerConfig.proxyURL.' },
	{ name: 'options.headers', type: 'Record<string,string>', description: 'Headers passed to proxy resolver and optional native source requests.' },
	{ name: 'options.nativeSendHeadersOnSourceRequest', type: 'boolean', default: 'false', description: 'Sends options.headers directly through react-native-video native source requests.' },
];

const SUBTITLE_PROPS: PropRow[] = [
	{ name: 'id', type: 'string', required: true, description: 'Unique id for this subtitle within a player.' },
	{ name: 'playerId', type: 'string', required: true, description: 'Must match the owning playerConfig.playerId.' },
	{ name: 'source', type: 'string', required: true, description: 'Remote URL, blob URL, or native path for SRT/VTT text.' },
	{ name: 'langISO', type: 'string', required: true, description: 'Language code used for track metadata.' },
	{ name: 'label', type: 'string', description: 'Display label. Falls back to langISO where possible.' },
	{ name: 'type', type: "'srt' | 'vtt'", required: true, description: 'Subtitle format. SRT is converted to VTT.' },
	{ name: 'default', type: 'boolean', description: 'Used when generating master playlist subtitle metadata.' },
	{ name: 'options', type: 'SourceRequestOptions', description: 'Same proxy and header options supported by VideoSource.' },
];

const REF_METHODS: PropRow[] = [
	{ name: 'play', type: '() => void', description: 'Unpauses playback through controller state.' },
	{ name: 'pause', type: '() => void', description: 'Pauses playback through controller state.' },
	{ name: 'seek', type: '(time: number) => void', description: 'Seeks to an absolute time in seconds.' },
	{ name: 'setSubtitle', type: '(index: number) => Promise<void>', description: 'Enables a subtitle by subtitleSources index.' },
	{ name: 'setVideoSource', type: '(index: number) => Promise<void>', description: 'Switches to a videoSources index.' },
	{ name: 'getCurrentTime', type: '() => Promise<number>', description: 'Returns current playback time in seconds.' },
	{ name: 'getCurrentVideoIndex', type: '() => number', description: 'Returns active video source index.' },
	{ name: 'getCurrentSubtitleIndex', type: '() => number', description: 'Returns active subtitle source index.' },
	{ name: 'setState', type: '(state: State) => void', description: 'Sets the built-in controls status state.' },
];

export default function ApiPage() {
	return (
		<DocPage
			title="API Overview"
			description="The package exposes a ready-made player, lower-level controls, controller hooks, HLS helpers, and typed media resources."
			sections={[
				{
					title: 'Exports',
					content: <CodeBlock code={EXPORTS} language="ts" />,
				},
				{
					title: 'Imperative ref',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								Use the player ref when an external playlist, remote action, or screen button needs to drive playback.
							</Text>
							<CodeBlock code={REF_API} language="tsx" />
							<PropsTable props={REF_METHODS} />
							<Callout type="tip">The ref API is best for orchestration. Use callbacks for analytics and UI sync.</Callout>
						</View>
					),
				},
				{
					title: 'Surface area',
					content: <PropsTable props={PROPS} />,
				},
				{
					title: 'VideoPlayer props',
					content: <PropsTable props={VIDEO_PLAYER_PROPS} />,
				},
				{
					title: 'PlayerController props',
					content: <PropsTable props={CONTROLLER_PROPS} />,
				},
				{
					title: 'VideoSource fields',
					content: (
						<View className="gap-3">
							<PropsTable props={SOURCE_PROPS} />
							<CodeBlock code={SOURCE_OPTIONS} language="ts" />
						</View>
					),
				},
				{
					title: 'SubtitleSource fields',
					content: <PropsTable props={SUBTITLE_PROPS} />,
				},
			]}
		/>
	);
}
