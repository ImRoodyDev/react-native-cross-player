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
