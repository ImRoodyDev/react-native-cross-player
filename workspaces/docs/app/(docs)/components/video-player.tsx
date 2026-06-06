import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { MediaPlayground } from '../../../components/MediaPlayground';
import { PropControls } from '../../../components/PropControls';
import { PropsTable, type PropRow } from '../../../components/PropsTable';
import { CodeBlock } from '../../../components/CodeBlock';

const IMPORT_CODE = `import { VideoPlayer } from 'react-native-cross-player';`;

const BASIC_EXAMPLE = `import React from 'react';
import { VideoPlayer } from 'react-native-cross-player';

export default function PlayerScreen() {
  return (
    <VideoPlayer
      videoTitle="Tears of Steel"
      playerConfig={{
        playerId: 'video-player-example',
        videoSources: [{
          id: 'tos',
          playerId: 'video-player-example',
          label: 'Tears of Steel',
          source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4',
          format: 'mp4',
        }],
        subtitleSources: [
          {
            id: 'english',
            playerId: 'video-player-example',
            source: '/media/tears-en.vtt',
            label: 'English',
            langISO: 'en',
            type: 'vtt',
          },
          {
            id: 'french',
            playerId: 'video-player-example',
            source: '/media/tears-fr.vtt',
            label: 'French',
            langISO: 'fr',
            type: 'vtt',
          },
        ],
        initialVideoSource: 0,
        initialSubtitleSource: 0,
      }}
      viewStyle={{ flex: 1, backgroundColor: '#000' }}
    />
  );
}`;

const THEME_EXAMPLE = `<VideoPlayer
  videoTitle="The Big Buck Bunny"
  playerConfig={playerConfig}
  theme={{
    minimumTrackTintColor: '#6366f1',
    maximumTrackTintColor: '#3f3f46',
    cacheTrackTintColor: '#71717a',
    bubbleBackgroundColor: '#6366f1',
  }}
/>`;

const PLAYLIST_EXAMPLE = `const playerId = 'playlist-player';

const playerConfig = {
  playerId,
  videoSources: [
    {
      id: 'hls-auto',
      playerId,
      label: 'Auto HLS',
      source: 'https://example.com/master.m3u8',
      format: 'm3u8',
    },
    {
      id: 'mp4-backup',
      playerId,
      label: 'MP4 backup',
      source: 'https://example.com/video-1080.mp4',
      format: 'mp4',
    },
  ],
  subtitleSources: [
    {
      id: 'en',
      playerId,
      source: 'https://example.com/captions/en.vtt',
      label: 'English',
      langISO: 'en',
      type: 'vtt',
    },
  ],
  initialVideoSource: 0,
  initialSubtitleSource: -1,
  autoStart: false,
  preservePlaybackOnSourceChange: true,
};`;

const PROXY_EXAMPLE = `const playerConfig = {
  playerId: 'proxy-video-player',
  proxyURL: 'https://api.example.com/proxy',
  proxyResolver: (targetURL, proxyURL, headers) => {
    const url = new URL(proxyURL);
    url.searchParams.set('target', targetURL);

    for (const [key, value] of Object.entries(headers)) {
      url.searchParams.append(\`header.\${key}\`, value);
    }

    return url.toString();
  },
  videoSources: [
    {
      id: 'main',
      playerId: 'proxy-video-player',
      label: 'Main stream',
      source: 'https://cdn.example.com/private/master.m3u8',
      format: 'm3u8',
      options: {
        useProxy: true,
        headers: { Authorization: 'Bearer token' },
      },
    },
    {
      id: 'regional',
      playerId: 'proxy-video-player',
      label: 'Regional stream',
      source: 'https://other-cdn.example.com/master.m3u8',
      format: 'm3u8',
      options: {
        useProxy: true,
        overrideProxyURL: 'https://eu-api.example.com/proxy',
      },
    },
  ],
  subtitleSources: [
    {
      id: 'en',
      playerId: 'proxy-video-player',
      source: 'https://cdn.example.com/private/en.srt',
      label: 'English',
      langISO: 'en',
      type: 'srt',
      options: { useProxy: true },
    },
  ],
  initialVideoSource: 0,
};`;

const PROPS: PropRow[] = [
	{ name: 'videoTitle', type: 'string', required: true, description: 'Title displayed in the controls header.' },
	{ name: 'nextLabel', type: 'string', description: 'Text shown beside the next-video button when onNextVideo is provided.' },
	{ name: 'playerConfig', type: 'PlayerControllerProps', required: true, description: 'Media sources, subtitles, proxy, and controller options.' },
	{ name: 'language', type: "'en' | 'fr' | string", default: "'en'", description: 'Localization language for built-in controls.' },
	{ name: 'viewStyle', type: 'StyleProp<ViewStyle>', description: 'Outer player container style.' },
	{ name: 'videoStyle', type: 'StyleProp<ViewStyle>', description: 'Style applied to the rendered video element.' },
	{ name: 'theme', type: 'SliderThemeType', description: 'Slider theme forwarded to react-native-awesome-slider.' },
	{ name: 'onClosePlayer', type: '() => void', description: 'Called when the close button in the header is pressed.' },
	{ name: 'onNextVideo', type: '() => void', description: 'Enables and handles the next-video control.' },
	{ name: 'onControlVisibilityChange', type: '(visible: boolean) => void', description: 'Fires when the built-in controls auto-show or auto-hide.' },
	{ name: 'onSourceChange', type: '(index, source) => void', description: 'Receives the selected source index and VideoSource after source changes.' },
	{ name: 'onSubtitleChange', type: '(index, subtitle) => void', description: 'Receives the selected subtitle index and SubtitleSource after subtitle changes.' },
	{ name: 'onPlaybackChange', type: '(isPlaying: boolean) => void', description: 'Fires when the paused/playing state changes.' },
	{ name: 'onProgress', type: '(seconds: number) => void', description: 'Receives current playback time.' },
	{ name: 'onEnd', type: '() => void', description: 'Called when the active media finishes.' },
];

const CONFIG_PROPS: PropRow[] = [
	{ name: 'playerId', type: 'string', required: true, description: 'Stable id used to scope generated blob files and source ownership.' },
	{ name: 'videoSources', type: 'VideoSource[]', required: true, description: 'Source list shown in the source menu and used by setSource.' },
	{ name: 'subtitleSources', type: 'SubtitleSource[]', default: '[]', description: 'Subtitle tracks shown in the captions menu. SRT tracks are converted to VTT.' },
	{ name: 'initialVideoSource', type: 'number', default: '-1', description: 'Index to load on mount. Use -1 to mount without auto-selecting a source.' },
	{ name: 'initialSubtitleSource', type: 'number', default: '-1', description: 'Index to enable on mount. Use -1 to keep captions off.' },
	{ name: 'initialAudioTrack', type: 'number', default: '-1', description: 'Audio track index applied after tracks are discovered from the media.' },
	{ name: 'proxyURL', type: 'string', description: 'Default proxy endpoint used when a source has options.useProxy enabled.' },
	{ name: 'proxyResolver', type: 'ProxyURLResolverCallback', description: 'Builds the final proxied URL from target URL, proxy URL, and headers.' },
	{ name: 'hlsConfig', type: 'Partial<HlsConfig>', description: 'hls.js options forwarded to the web HLS instance.' },
	{ name: 'maxResolutionHeight', type: 'number', default: 'Infinity', description: 'Filters quality options above a maximum height.' },
	{ name: 'autoStart', type: 'boolean', default: 'false', description: 'Starts playback after the initial source loads.' },
	{ name: 'startPosition', type: 'number', default: '0', description: 'Initial seek position in seconds.' },
	{ name: 'lazyLoadSources', type: 'boolean', default: 'true', description: 'Creates sources only when needed instead of preparing every source on mount.' },
	{ name: 'onLazyLoadSource', type: '(source) => Promise<partial source>', description: 'Lets you refresh signed URLs or headers before a source is created.' },
	{ name: 'preservePlaybackOnSourceChange', type: 'boolean', default: 'true', description: 'Keeps the current playback time when switching between sources.' },
];

function VideoPlayerSection() {
	const [captions, setCaptions] = useState(true);

	return (
		<View>
			<ComponentPreview code={BASIC_EXAMPLE} language="tsx" label="video-player.tsx" height={captions ? 720 : 660}>
				<View style={{ width: '100%', gap: 12 }}>
					<MediaPlayground captions={captions} />
				</View>
			</ComponentPreview>
			<PropControls controls={[{ type: 'boolean', label: 'showCaptionsExample', value: captions, onChange: setCaptions }]} />
		</View>
	);
}

export default function VideoPlayerPage() {
	return (
		<DocPage
			title="VideoPlayer"
			description="A high-level player component that wires the controller, native video props, media resources, and the built-in controls overlay."
			platforms={['ios', 'android', 'web', 'tv']}
			importCode={IMPORT_CODE}
			contentMaxWidth={1080}
			sections={[
				{ title: 'Basic usage', content: <VideoPlayerSection /> },
				{
					title: 'Multiple sources and captions',
					content: (
						<View className="gap-3">
							<BodyText>
								Add each playable file or stream to `videoSources`. The built-in source menu uses `label`, while the
								controller uses `id` to track the active source.
							</BodyText>
							<CodeBlock code={PLAYLIST_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Proxy URL setup',
					content: (
						<View className="gap-3">
							<BodyText>
								Use `playerConfig.proxyURL` as the default tunnel, opt individual sources into proxying with
								`options.useProxy`, and use `options.overrideProxyURL` only when a source or subtitle needs its own
								endpoint.
							</BodyText>
							<CodeBlock code={PROXY_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Theming',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								Pass a slider theme to match your app while keeping the default controls behavior.
							</Text>
							<CodeBlock code={THEME_EXAMPLE} language="tsx" />
						</View>
					),
				},
				{
					title: 'Props',
					content: (
						<View className="gap-3">
							<Callout type="info">VideoPlayer forwards media setup to usePlayerController through playerConfig.</Callout>
							<PropsTable props={PROPS} />
						</View>
					),
				},
				{
					title: 'playerConfig props',
					content: <PropsTable props={CONFIG_PROPS} />,
				},
			]}
		/>
	);
}
