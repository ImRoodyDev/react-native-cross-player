import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../../components/DocPage';
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
        videoSources: [{ uri: '/media/tos.mp4', title: 'Sample MP4' }],
        subtitleSources: [
          { uri: '/media/tears-en.vtt', title: 'English', language: 'en' },
          { uri: '/media/tears-fr.vtt', title: 'French', language: 'fr' },
        ],
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

const PROPS: PropRow[] = [
	{ name: 'videoTitle', type: 'string', required: true, description: 'Title displayed in the controls header.' },
	{ name: 'playerConfig', type: 'PlayerControllerProps', required: true, description: 'Media sources, subtitles, proxy, and controller options.' },
	{ name: 'language', type: "'en' | 'fr' | string", default: "'en'", description: 'Localization language for built-in controls.' },
	{ name: 'viewStyle', type: 'StyleProp<ViewStyle>', description: 'Outer player container style.' },
	{ name: 'videoStyle', type: 'StyleProp<ViewStyle>', description: 'Style applied to the rendered video element.' },
	{ name: 'theme', type: 'SliderThemeType', description: 'Slider theme forwarded to react-native-awesome-slider.' },
	{ name: 'onProgress', type: '(seconds: number) => void', description: 'Receives current playback time.' },
	{ name: 'onEnd', type: '() => void', description: 'Called when the active media finishes.' },
];

function VideoPlayerSection() {
	const [captions, setCaptions] = useState(true);

	return (
		<View>
			<ComponentPreview code={BASIC_EXAMPLE} language="tsx" label="video-player.tsx" height={captions ? 520 : 470}>
				<View style={{ width: '100%', gap: 12 }}>
					{captions ? <MediaPlayground /> : <Text className="text-zinc-400 text-center">Captions hidden in this preview state.</Text>}
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
			sections={[
				{ title: 'Basic usage', content: <VideoPlayerSection /> },
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
			]}
		/>
	);
}
