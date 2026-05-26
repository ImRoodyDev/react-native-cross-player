import React from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../components/DocPage';
import { CodeBlock } from '../../components/CodeBlock';
import { PropsTable, type PropRow } from '../../components/PropsTable';

const EXPORTS = `import {
  VideoPlayer,
  PlayerControls,
  usePlayerController,
  HlsProxy,
  type VideoPlayerRef,
  type VideoSource,
  type SubtitleSource,
  type PlayerState,
  type PlaybackResources,
} from 'react-native-cross-player';`;

const REF_API = `const playerRef = React.useRef<VideoPlayerRef>(null);

playerRef.current?.play();
playerRef.current?.pause();
playerRef.current?.seek(120);
playerRef.current?.setSubtitle(0);
playerRef.current?.setVideoSource(1);

const currentTime = await playerRef.current?.getCurrentTime();`;

const PROPS: PropRow[] = [
	{ name: 'VideoPlayer', type: 'Component', description: 'High-level player wrapper with built-in controls.' },
	{ name: 'PlayerControls', type: 'Component', description: 'Reusable controls overlay driven by controller state.' },
	{ name: 'usePlayerController', type: 'Hook', description: 'Playback state, native video props, resources, and controls.' },
	{ name: 'HlsProxy', type: 'Class', description: 'HLS helper for proxy-aware loaders and source switching.' },
	{ name: 'VideoSource', type: 'Type', description: 'Video source resource shape.' },
	{ name: 'SubtitleSource', type: 'Type', description: 'Subtitle resource shape.' },
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
							<Callout type="tip">The ref API is best for orchestration. Use callbacks for analytics and UI sync.</Callout>
						</View>
					),
				},
				{
					title: 'Surface area',
					content: <PropsTable props={PROPS} />,
				},
			]}
		/>
	);
}
