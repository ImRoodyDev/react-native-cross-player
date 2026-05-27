import React from 'react';
import { Text, View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { PropsTable, type PropRow } from '../../../components/PropsTable';

const IMPORT_CODE = `import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Video from 'react-native-video';
import { usePlayerController, PlayerControls } from 'react-native-cross-player';`;

const CUSTOM_PLAYER = `import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Video from 'react-native-video';
import { usePlayerController, PlayerControls } from 'react-native-cross-player';

const playerId = 'custom-player';

export function CustomPlayer() {
  const videoRef = React.useRef(null);
  const controlsRef = React.useRef(null);
  const playerViewRef = React.useRef(null);

  const controller = usePlayerController({
    playerId,
    videoRef,
    controlsRef,
    playerViewRef,
    videoSources: [{
      id: 'tos',
      playerId,
      label: 'Tears of Steel',
      source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4',
      format: 'mp4',
    }],
    subtitleSources: [{
      id: 'english',
      playerId,
      source: '/media/tears-en.vtt',
      label: 'English',
      langISO: 'en',
      type: 'vtt',
    }],
    initialVideoSource: 0,
    initialSubtitleSource: 0,
  });

  return (
    <View ref={playerViewRef} style={{ flex: 1, backgroundColor: 'black' }}>
      <Video
        ref={videoRef}
        {...controller.nativeVideoProps}
        controls={false}
        paused={controller.playerState.paused}
        resizeMode="contain"
        style={{ flex: 1 }}
      />

      <Pressable onPress={() => controller.controls.setPause(!controller.playerState.paused)}>
        <Text>{controller.playerState.paused ? 'Play' : 'Pause'}</Text>
      </Pressable>

      <PlayerControls
        ref={controlsRef}
        videoTitle="Tears of Steel"
        controls={controller.controls}
        resources={controller.playbackResources}
        playerState={controller.playerState}
      />
    </View>
  );
}`;

const KEYBOARD_EXAMPLE = `useWebKeyboard({
  Space: () => controller.controls.setPause(!controller.playerState.paused),
  ArrowRight: () => controller.controls.setCurrentTime(currentTime + 10),
  ArrowLeft: () => controller.controls.setCurrentTime(Math.max(0, currentTime - 10)),
});`;

const CHECKLIST: PropRow[] = [
	{ name: 'videoRef', type: 'React.RefObject<VideoRef>', description: 'Pass to react-native-video and usePlayerController.' },
	{ name: 'controlsRef', type: 'React.RefObject<PlayerControlsRef>', description: 'Lets the controller update loading, error, and progress state.' },
	{ name: 'playerViewRef', type: 'React.RefObject<View>', description: 'Used for fullscreen and player container measurements.' },
	{ name: 'nativeVideoProps', type: 'ReactVideoProps', description: 'Spread onto your own Video component.' },
	{ name: 'controls', type: 'VideoControls', description: 'Drive play, pause, seek, subtitles, quality, audio, rate, volume, and fullscreen.' },
	{ name: 'playbackResources', type: 'PlaybackResources', description: 'Use for menus, labels, and track lists.' },
];

export default function BuildYourOwnPlayerPage() {
	return (
		<DocPage
			title="Build Your Own Player"
			description="Use the package controller when you want custom layout and controls while keeping the HLS, subtitle, source switching, and proxy logic."
			platforms={['ios', 'android', 'web', 'tv']}
			importCode={IMPORT_CODE}
			sections={[
				{
					title: 'Controller composition',
					content: (
						<View className="gap-3">
							<BodyText>
								`VideoPlayer` is the ready-made shell. For a custom shell, mount your own `react-native-video`
								element, spread `nativeVideoProps`, then render your own controls or the exported `PlayerControls`.
							</BodyText>
							<ComponentPreview code={CUSTOM_PLAYER} language="tsx" label="CustomPlayer.tsx" height={250}>
								<View className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 gap-3">
									<Text className="text-white font-semibold text-base">Custom shell shape</Text>
									<Text className="text-zinc-500 text-sm leading-6">Video element: your layout</Text>
									<Text className="text-zinc-500 text-sm leading-6">Controller: package playback logic</Text>
									<Text className="text-zinc-500 text-sm leading-6">Controls: custom buttons or PlayerControls</Text>
								</View>
							</ComponentPreview>
							<Callout type="tip">Keep native browser/video controls off and drive playback through `controller.controls`.</Callout>
						</View>
					),
				},
				{
					title: 'Required pieces',
					content: <PropsTable props={CHECKLIST} />,
				},
				{
					title: 'Keyboard shortcuts',
					content: (
						<View className="gap-3">
							<BodyText>
								`useWebKeyboard` is exported for web shortcuts in custom players. Use it beside your controller state.
							</BodyText>
							<CodeBlock code={KEYBOARD_EXAMPLE} language="tsx" />
						</View>
					),
				},
			]}
		/>
	);
}
