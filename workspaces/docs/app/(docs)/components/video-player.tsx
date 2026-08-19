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
  proxyConfig: {
    url: 'https://api.example.com/proxy',
    resolver: (targetURL, proxyURL, originHeaders) => {
      const url = new URL(proxyURL);
      url.searchParams.set('target', targetURL);

      for (const [key, value] of Object.entries(originHeaders)) {
        url.searchParams.append(\`header.\${key}\`, value);
      }

      return url.toString();
    },
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

const ERROR_HANDLING_EXAMPLE = `import { VideoPlayer, type PlayerError, type VideoPlayerRef } from 'react-native-cross-player';

const playerRef = useRef<VideoPlayerRef>(null);
const failed = useRef(new Set<number>());

const handleError = useCallback((error: PlayerError) => {
  // Recoverable hls.js errors are retried internally — don't abandon the source.
  if (!error.fatal) return;

  failed.current.add(error.sourceIndex);

  // Move to the first source that has not already failed.
  for (let step = 1; step <= sources.length; step++) {
    const next = (error.sourceIndex + step) % sources.length;
    if (failed.current.has(next)) continue;
    void playerRef.current?.setVideoSource(next);
    return;
  }
}, [sources.length]);

<VideoPlayer ref={playerRef} onError={handleError} {...rest} />;`;

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
	{
		name: 'onError',
		type: '(error: PlayerError) => void',
		description:
			'Reports a source failure while preparing, while switching, or during playback. The player still shows its own error state. Act on error.fatal only — non-fatal hls.js errors are retried internally.',
	},
];

const PLAYER_ERROR_PROPS: PropRow[] = [
	{
		name: 'phase',
		type: "'initialize' | 'source-change' | 'playback'",
		required: true,
		description: 'Stage reached when the source failed. The first two mean it never played at all.',
	},
	{
		name: 'sourceIndex',
		type: 'number',
		required: true,
		description: 'Index into videoSources, or -1 when the failure happened before a source was selected.',
	},
	{ name: 'sourceId', type: 'string | number', description: 'Id of the failing source, when one was selected.' },
	{
		name: 'fatal',
		type: 'boolean',
		required: true,
		description:
			'True when the source is unusable. Non-fatal hls.js errors are recoverable and retried internally, so switching away on those abandons a healthy source.',
	},
	{ name: 'message', type: 'string', required: true, description: 'Human-readable summary, localized where the player had a message for it.' },
	{ name: 'cause', type: 'unknown', description: 'Underlying error or native/hls.js event payload, for logging.' },
];

const CONFIG_PROPS: PropRow[] = [
	{ name: 'playerId', type: 'string', required: true, description: 'Stable id used to scope generated blob files and source ownership.' },
	{ name: 'videoSources', type: 'VideoSource[]', required: true, description: 'Source list shown in the source menu and used by setSource.' },
	{ name: 'subtitleSources', type: 'SubtitleSource[]', default: '[]', description: 'Subtitle tracks shown in the captions menu. SRT tracks are converted to VTT.' },
	{ name: 'initialVideoSource', type: 'number', default: '-1', description: 'Index to load on mount. Use -1 to mount without auto-selecting a source.' },
	{ name: 'initialSubtitleSource', type: 'number', default: '-1', description: 'Index to enable on mount. Use -1 to keep captions off.' },
	{ name: 'initialAudioTrack', type: 'number', default: '-1', description: 'Audio track index applied after tracks are discovered from the media.' },
	{ name: 'proxyConfig', type: '{ url?, resolver?, headers?, query? }', description: 'Player-level proxy settings used when a source has options.useProxy: proxy base url, resolver, and optional proxy auth headers/query.' },
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
								Use `playerConfig.proxyConfig.url` as the default tunnel, opt individual sources into proxying with
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
				{
					title: 'Handling source failures',
					content: (
						<View className="gap-3">
							<BodyText>
								`onError` fires whenever a source fails — while preparing the first one, while switching to another, or
								during playback. A host that holds several alternative links for the same media can switch on the spot
								instead of waiting for a &quot;no playback yet&quot; timeout to expire.
							</BodyText>
							<Callout type="warning">
								Only switch away when `fatal` is true. Non-fatal hls.js errors are recoverable and retried internally, so
								treating them as failures abandons a source that is still fine.
							</Callout>
							<CodeBlock code={ERROR_HANDLING_EXAMPLE} language="tsx" />
							<BodyText>
								`phase` tells you how far the source got. `initialize` and `source-change` mean it never played at all —
								a rejected manifest, for instance — so those are safe to fail fast on.
							</BodyText>
							<PropsTable props={PLAYER_ERROR_PROPS} />
						</View>
					),
				},
			]}
		/>
	);
}
