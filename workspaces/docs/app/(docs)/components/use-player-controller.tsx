import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { PropControls } from '../../../components/PropControls';
import { PropsTable, type PropRow } from '../../../components/PropsTable';
import { CodeBlock } from '../../../components/CodeBlock';

const IMPORT_CODE = `import { usePlayerController } from 'react-native-cross-player';`;

const HOOK_EXAMPLE = `import React from 'react';
import { View } from 'react-native';
import Video, { type VideoRef } from 'react-native-video';
import {
  PlayerControls,
  usePlayerController,
  type PlayerControlsRef,
} from 'react-native-cross-player';

export default function CustomPlayer() {
  const playerViewRef = React.useRef<View>(null);
  const videoRef = React.useRef<VideoRef>(null);
  const controlsRef = React.useRef<PlayerControlsRef>(null);

  const controller = usePlayerController({
    playerViewRef,
    videoRef,
    controlsRef,
    playerId: 'custom-player',
    videoSources: [
      {
        id: 'hls-720',
        playerId: 'custom-player',
        label: '720p',
        source: 'https://example.com/720.m3u8',
        format: 'm3u8',
      },
      {
        id: 'hls-1080',
        playerId: 'custom-player',
        label: '1080p',
        source: 'https://example.com/1080.m3u8',
        format: 'm3u8',
      },
    ],
    subtitleSources: [
      {
        id: 'english',
        playerId: 'custom-player',
        source: 'https://example.com/en.vtt',
        label: 'English',
        langISO: 'en',
        type: 'vtt',
      },
    ],
      initialVideoSource: 0,
  });

  return (
    <View ref={playerViewRef} style={{ flex: 1, backgroundColor: '#000' }}>
      <Video
        ref={videoRef}
        {...controller.nativeVideoProps}
        paused={controller.playerState.paused}
        resizeMode="contain"
        style={{ width: '100%', height: '100%' }}
      />
      <PlayerControls
        ref={controlsRef}
        videoTitle="Custom player"
        controls={controller.controls}
        resources={controller.playbackResources}
        playerState={controller.playerState}
      />
    </View>
  );
}`;

const PROXY_HOOK_EXAMPLE = `const controller = usePlayerController({
  playerViewRef,
  videoRef,
  controlsRef,
  playerId: 'custom-proxy-player',
  proxyURL: 'https://api.example.com/media-proxy',
  proxyResolver: (targetURL, proxyURL, headers) => {
    const url = new URL(proxyURL);
    url.searchParams.set('target', targetURL);
    Object.entries(headers).forEach(([key, value]) => {
      url.searchParams.append(\`header.\${key}\`, value);
    });
    return url.toString();
  },
  videoSources: [
    {
      id: 'signed-stream',
      playerId: 'custom-proxy-player',
      label: 'Signed stream',
      source: 'https://cdn.example.com/signed/master.m3u8',
      format: 'm3u8',
      options: {
        useProxy: true,
        headers: { Authorization: 'Bearer token' },
      },
    },
  ],
  subtitleSources: [],
  initialVideoSource: 0,
});`;

const LAZY_EXAMPLE = `const controller = usePlayerController({
  playerViewRef,
  videoRef,
  controlsRef,
  playerId: 'signed-url-player',
  lazyLoadSources: true,
  onLazyLoadSource: async (source) => {
    const signed = await fetch(\`/api/sign-media?id=\${source.id}\`).then((r) => r.json());

    return {
      source: signed.url,
      options: {
        useProxy: true,
        headers: { Authorization: signed.token },
      },
    };
  },
  videoSources,
  subtitleSources,
});`;

const CONTROLS_EXAMPLE = `controller.controls.setPause(false);
controller.controls.setCurrentTime(30);
controller.controls.setSource(1);
controller.controls.setSubtitle(0);
controller.controls.setResolution(2);
controller.controls.setPlaybackRate(1.5);
controller.controls.setAudioTrack(0);`;

const PROPS: PropRow[] = [
	{ name: 'playerViewRef', type: 'RefObject<View>', required: true, description: 'Container ref used for fullscreen and player measurements.' },
	{ name: 'videoRef', type: 'RefObject<VideoRef>', required: true, description: 'Ref for the underlying react-native-video instance.' },
	{ name: 'controlsRef', type: 'RefObject<PlayerControlsRef>', required: true, description: 'Ref used to send loading, idle, and error state to PlayerControls.' },
	{ name: 'playerId', type: 'string', required: true, description: 'Stable player id used to scope generated blobs and source cleanup.' },
	{ name: 'videoSources', type: 'VideoSource[]', required: true, description: 'Playable media sources.' },
	{ name: 'subtitleSources', type: 'SubtitleSource[]', default: '[]', description: 'VTT or SRT subtitle tracks. SRT is converted to VTT before playback.' },
	{ name: 'initialVideoSource', type: 'number', default: '-1', description: 'Initial source index. Use -1 to wait for a manual setSource call.' },
	{ name: 'initialSubtitleSource', type: 'number', default: '-1', description: 'Initial subtitle index. Use -1 to keep subtitles disabled.' },
	{ name: 'initialAudioTrack', type: 'number', default: '-1', description: 'Audio track index applied after the media exposes audio tracks.' },
	{ name: 'maxResolutionHeight', type: 'number', default: 'Infinity', description: 'Optional max height used when filtering quality levels.' },
	{ name: 'proxyURL', type: 'string', description: 'Default proxy tunnel endpoint for sources with options.useProxy.' },
	{ name: 'proxyResolver', type: 'ProxyURLResolverCallback', description: 'Builds the final proxy URL from target URL, proxy URL, and headers.' },
	{ name: 'hlsConfig', type: 'Partial<HlsConfig>', description: 'hls.js config for web HLS playback.' },
	{ name: 'autoStart', type: 'boolean', default: 'false', description: 'Starts playback automatically after the active source loads.' },
	{ name: 'startPosition', type: 'number', default: '0', description: 'Initial playback position in seconds.' },
	{ name: 'lazyLoadSources', type: 'boolean', default: 'true', description: 'Defers source creation until a source or subtitle is selected.' },
	{ name: 'onLazyLoadSource', type: '(source) => Promise<partial source>', description: 'Refreshes URLs, headers, or options before a source is created.' },
	{ name: 'preservePlaybackOnSourceChange', type: 'boolean', default: 'true', description: 'Keeps current playback time while switching source indexes.' },
];

const RETURNED_STATE: PropRow[] = [
	{ name: 'nativeVideoProps', type: 'ReactVideoProps', description: 'Event handlers, source props, selected text track, and selected audio track for Video.' },
	{ name: 'playerState.paused', type: 'boolean', description: 'Whether playback is paused.' },
	{ name: 'playerState.sourceIndex', type: 'number', description: 'Current source index in videoSources, or -1 when none is selected.' },
	{ name: 'playerState.subtitleIndex', type: 'number', description: 'Current subtitle index in subtitleSources, or -1 when captions are off.' },
	{ name: 'playerState.levelIndex', type: 'number', description: 'Current quality index in playbackResources.levels.' },
	{ name: 'playerState.audioIndex', type: 'number', description: 'Current audio track index in playbackResources.audioTracks.' },
	{ name: 'playerState.isLive', type: 'boolean', description: 'True for live HLS or streams without a finite duration.' },
	{ name: 'playbackResources', type: 'PlaybackResources', description: 'Quality levels, rates, video sources, subtitle sources, and discovered audio tracks.' },
	{ name: 'controls', type: 'VideoControls', description: 'Methods for playback, seeking, source switching, subtitles, audio, quality, fullscreen, and cleanup.' },
];

function ControllerPreview() {
	const [source, setSource] = useState('1080p');
	const [subtitle, setSubtitle] = useState('English');

	return (
		<View>
			<ComponentPreview code={HOOK_EXAMPLE} language="tsx" label="custom-player.tsx" height={230}>
				<View className="items-center gap-4">
					<View className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5">
						<Text className="text-white font-semibold text-base mb-2">Custom controller state</Text>
						<Text className="text-zinc-500 text-sm leading-6">source: {source}</Text>
						<Text className="text-zinc-500 text-sm leading-6">subtitle: {subtitle}</Text>
						<Text className="text-zinc-500 text-sm leading-6">paused: false</Text>
						<Text className="text-zinc-500 text-sm leading-6">isLive: false</Text>
					</View>
				</View>
			</ComponentPreview>
			<PropControls
				controls={[
					{ type: 'select', label: 'source', value: source, options: ['720p', '1080p', 'HLS auto'], onChange: setSource },
					{ type: 'select', label: 'subtitle', value: subtitle, options: ['English', 'French', 'Off'], onChange: setSubtitle },
				]}
			/>
		</View>
	);
}

export default function UsePlayerControllerPage() {
	return (
		<DocPage
			title="usePlayerController"
			description="A lower-level hook for teams that want custom controls while keeping media loading, HLS, subtitles, and source switching logic."
			platforms={['ios', 'android', 'web', 'tv']}
			importCode={IMPORT_CODE}
			sections={[
				{ title: 'Custom player shell', content: <ControllerPreview /> },
				{
					title: 'Proxy URL with the hook',
					content: (
						<View className="gap-3">
							<BodyText>
								The hook uses the same proxy fields as `VideoPlayer`: `proxyURL` is the default endpoint, `proxyResolver`
								shapes the request, and each source opts in with `options.useProxy`.
							</BodyText>
							<CodeBlock code={PROXY_HOOK_EXAMPLE} language="tsx" />
						</View>
					),
				},
				{
					title: 'Lazy signed URLs',
					content: (
						<View className="gap-3">
							<BodyText>
								Use `onLazyLoadSource` when URLs or tokens expire quickly. The returned source fields are merged before
								the controller creates the playable resource.
							</BodyText>
							<CodeBlock code={LAZY_EXAMPLE} language="tsx" />
						</View>
					),
				},
				{
					title: 'Imperative controls',
					content: (
						<View className="gap-3">
							<Callout type="info">The hook returns controls, resources, nativeVideoProps, and playerState.</Callout>
							<CodeBlock code={CONTROLS_EXAMPLE} language="ts" />
						</View>
					),
				},
				{ title: 'Options', content: <PropsTable props={PROPS} /> },
				{ title: 'Returned values', content: <PropsTable props={RETURNED_STATE} /> },
			]}
		/>
	);
}
