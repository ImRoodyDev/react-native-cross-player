import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../../components/DocPage';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { PropControls } from '../../../components/PropControls';
import { PropsTable, type PropRow } from '../../../components/PropsTable';
import { CodeBlock } from '../../../components/CodeBlock';

const IMPORT_CODE = `import { usePlayerController } from 'react-native-cross-player';`;

const HOOK_EXAMPLE = `import React from 'react';
import Video from 'react-native-video';
import { usePlayerController } from 'react-native-cross-player';

export default function CustomPlayer() {
  const controller = usePlayerController({
    videoSources: [
      { uri: 'https://example.com/720.m3u8', title: '720p' },
      { uri: 'https://example.com/1080.m3u8', title: '1080p' },
    ],
    subtitleSources: [
      { uri: 'https://example.com/en.vtt', title: 'English', language: 'en' },
    ],
    initialVideoSource: 0,
  });

  return (
    <Video
      {...controller.nativeVideoProps}
      paused={controller.playerState.paused}
      resizeMode="contain"
    />
  );
}`;

const CONTROLS_EXAMPLE = `controller.controls.setPause(false);
controller.controls.setCurrentTime(30);
controller.controls.setSource(1);
controller.controls.setSubtitle(0);
controller.controls.setResolution(2);
controller.controls.setPlaybackRate(1.5);
controller.controls.setAudioTrack(0);`;

const PROPS: PropRow[] = [
	{ name: 'videoSources', type: 'VideoSource[]', required: true, description: 'Playable media sources.' },
	{ name: 'subtitleSources', type: 'SubtitleSource[]', description: 'VTT or native subtitle tracks.' },
	{ name: 'initialVideoSource', type: 'number', default: '0', description: 'Initial source index.' },
	{ name: 'initialSubtitleSource', type: 'number', description: 'Initial subtitle index.' },
	{ name: 'maxResolutionHeight', type: 'number', description: 'Optional max height used when filtering quality levels.' },
	{ name: 'proxyTunnelURL', type: 'string', description: 'Optional proxy tunnel endpoint for HLS requests.' },
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
					title: 'Imperative controls',
					content: (
						<View className="gap-3">
							<Callout type="info">The hook returns controls, resources, nativeVideoProps, and playerState.</Callout>
							<CodeBlock code={CONTROLS_EXAMPLE} language="ts" />
						</View>
					),
				},
				{ title: 'Options', content: <PropsTable props={PROPS} /> },
			]}
		/>
	);
}
