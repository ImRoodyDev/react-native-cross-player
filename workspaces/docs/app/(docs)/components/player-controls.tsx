import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Callout, DocPage } from '../../../components/DocPage';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { PropControls } from '../../../components/PropControls';
import { PropsTable, type PropRow } from '../../../components/PropsTable';
import { CodeBlock } from '../../../components/CodeBlock';

const IMPORT_CODE = `import { PlayerControls } from 'react-native-cross-player';`;

const CONTROLS_EXAMPLE = `import React from 'react';
import { PlayerControls, usePlayerController } from 'react-native-cross-player';

export default function CustomShell() {
  const controller = usePlayerController({
    videoSources: [{ uri: 'https://example.com/video.m3u8' }],
  });

  return (
    <PlayerControls
      videoTitle="Custom shell"
      controls={controller.controls}
      resources={controller.playbackResources}
      playerState={controller.playerState}
      onNextVideo={() => console.log('next')}
    />
  );
}`;

const EVENTS_EXAMPLE = `<PlayerControls
  videoTitle="Episode 4"
  nextLabel="Next episode"
  controls={controls}
  resources={playbackResources}
  playerState={playerState}
  onControlsVisibilityChange={(visible) => setChromeVisible(visible)}
  onClosePlayer={() => navigation.goBack()}
  onNextVideo={() => playlist.next()}
/>`;

const PROPS: PropRow[] = [
	{ name: 'videoTitle', type: 'string', required: true, description: 'Title rendered in the controls header.' },
	{ name: 'controls', type: 'VideoControls', required: true, description: 'Controller methods for source, subtitle, rate, volume, and playback.' },
	{ name: 'resources', type: 'PlaybackResources', required: true, description: 'Available sources, subtitles, audio tracks, qualities, and rates.' },
	{ name: 'playerState', type: 'PlayerState', required: true, description: 'Current playback state used to render active buttons and menus.' },
	{ name: 'nextLabel', type: 'string', description: 'Optional label for a next-video action.' },
	{ name: 'onControlsVisibilityChange', type: '(visible: boolean) => void', description: 'Called when the controls overlay appears or hides.' },
	{ name: 'onClosePlayer', type: '() => void', description: 'Called from the close action.' },
	{ name: 'onNextVideo', type: '() => void', description: 'Called from the next action.' },
];

function ControlsPreview() {
	const [paused, setPaused] = useState(true);
	const [rate, setRate] = useState('1x');

	return (
		<View>
			<ComponentPreview code={CONTROLS_EXAMPLE} language="tsx" label="player-controls.tsx" height={260}>
				<View style={styles.mockPlayer}>
					<View style={styles.mockTop}>
						<Text style={styles.mockTitle}>Tears of Steel</Text>
						<Text style={styles.mockMeta}>1080p - {rate}</Text>
					</View>
					<View style={styles.mockCenter}>
						<Pressable onPress={() => setPaused((v) => !v)} style={styles.playButton}>
							<Text style={styles.playButtonText}>{paused ? 'Play' : 'Pause'}</Text>
						</Pressable>
					</View>
					<View style={styles.mockBottom}>
						<View style={styles.progressTrack}>
							<View style={styles.progressFill} />
						</View>
						<Text style={styles.timeText}>03:18 / 12:00</Text>
					</View>
				</View>
			</ComponentPreview>
			<PropControls
				controls={[{ type: 'select', label: 'rate', value: rate, options: ['0.5x', '1x', '1.5x', '2x'], onChange: setRate }]}
			/>
		</View>
	);
}

export default function PlayerControlsPage() {
	return (
		<DocPage
			title="PlayerControls"
			description="The built-in controls overlay can be used by VideoPlayer or mounted manually with controller state."
			platforms={['ios', 'android', 'web', 'tv']}
			importCode={IMPORT_CODE}
			sections={[
				{ title: 'Preview and code', content: <ControlsPreview /> },
				{
					title: 'Callbacks',
					content: (
						<View className="gap-3">
							<Callout type="tip">Use visibility callbacks to hide your surrounding app chrome while controls are visible.</Callout>
							<CodeBlock code={EVENTS_EXAMPLE} language="tsx" />
						</View>
					),
				},
				{ title: 'Props', content: <PropsTable props={PROPS} /> },
			]}
		/>
	);
}

const styles = StyleSheet.create({
	mockPlayer: {
		width: '100%',
		maxWidth: 620,
		aspectRatio: 16 / 9,
		borderRadius: 14,
		backgroundColor: '#050507',
		borderWidth: 1,
		borderColor: '#27272a',
		justifyContent: 'space-between',
		padding: 18,
	},
	mockTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	mockTitle: {
		color: '#ffffff',
		fontSize: 15,
		fontWeight: '700',
	},
	mockMeta: {
		color: '#71717a',
		fontSize: 12,
	},
	mockCenter: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	playButton: {
		borderRadius: 999,
		backgroundColor: '#6366f1',
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	playButtonText: {
		color: '#ffffff',
		fontWeight: '800',
	},
	mockBottom: {
		gap: 10,
	},
	progressTrack: {
		height: 5,
		borderRadius: 4,
		backgroundColor: '#27272a',
		overflow: 'hidden',
	},
	progressFill: {
		width: '34%',
		height: '100%',
		backgroundColor: '#6366f1',
	},
	timeText: {
		color: '#a1a1aa',
		fontSize: 12,
	},
});
