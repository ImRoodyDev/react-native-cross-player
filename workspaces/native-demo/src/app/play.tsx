import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { CNPLogger, ProxyLogger, VideoPlayer, VideoPlayerRef, VideoSource } from 'react-native-cross-player';

// Verbose logs for debugging in the demo.
console.log('Screen dimensions:', Dimensions.get('window'));
CNPLogger.enableDebugging(true);
ProxyLogger.enableDebugging(false);

const SAMPLE_PLAYER_ID = 'demo-player';
const initialDummySources: VideoSource[] = [
	{
		source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/toss.mp4',
		playerId: SAMPLE_PLAYER_ID,
		label: 'English Source 1',
		id: 'en-bunny tears-of-steel-main',
		format: 'mp4',
	},
	{
		source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4',
		playerId: SAMPLE_PLAYER_ID,
		label: 'English Source 2',
		id: 'en-mirror tears-of-steel-alt',
		format: 'mp4',
	},
];

// Reproduces the ztor movies/play screen that OOM-crashes on device.
export default function Play() {
	const router = useRouter();
	const playerRef = useRef<VideoPlayerRef>(null);
	const [sourceIndex, setSourceIndex] = useState(0);
	const [sources] = useState<VideoSource[]>(initialDummySources);

	return (
		<View style={{ flex: 1, backgroundColor: 'black' }}>
			<VideoPlayer
				ref={playerRef}
				videoTitle="Sample Video"
				language="en"
				playerConfig={{
					playerId: SAMPLE_PLAYER_ID,
					lazyLoadSources: true,
					autoStart: true,
					initialVideoSource: sourceIndex,
					initialSubtitleSource: 0,
					videoSources: sources,
					subtitleSources: [
						{
							id: 'en-1',
							playerId: SAMPLE_PLAYER_ID,
							source:
								'https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/alpha-1/workspaces/docs/public/media/tears-en.vtt',
							langISO: 'en',
							label: 'English Subtitle',
							type: 'vtt',
						},
						{
							id: 'fr-1',
							playerId: SAMPLE_PLAYER_ID,
							source:
								'https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/alpha-1/workspaces/docs/public/media/tears-fr.vtt',
							langISO: 'fr',
							label: 'French Subtitle',
							type: 'vtt',
						},
						{
							id: 'fr-2',
							playerId: SAMPLE_PLAYER_ID,
							source:
								'https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/alpha-1/workspaces/docs/public/media/tears-fr.vtt',
							langISO: 'fr',
							label: 'French Subtitle',
							type: 'vtt',
						},
						{
							id: 'fr-3',
							playerId: SAMPLE_PLAYER_ID,
							source:
								'https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/alpha-1/workspaces/docs/public/media/tears-fr.vtt',
							langISO: 'fr',
							label: 'French Subtitle',
							type: 'vtt',
						},
						{
							id: 'fr-4',
							playerId: SAMPLE_PLAYER_ID,
							source:
								'https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/alpha-1/workspaces/docs/public/media/tears-fr.vtt',
							langISO: 'fr',
							label: 'French Subtitle',
							type: 'vtt',
						},
						{
							id: 'fr-5',
							playerId: SAMPLE_PLAYER_ID,
							source:
								'https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/alpha-1/workspaces/docs/public/media/tears-fr.vtt',
							langISO: 'fr',
							label: 'French Subtitle',
							type: 'vtt',
						},
					],
					hlsConfig: {
						debug: false,
						enableWorker: true,
						lowLatencyMode: true,
						backBufferLength: 90,
						autoStartLoad: true,
					},
				}}
				viewStyle={{ width: '100%', height: '100%' }}
				videoStyle={{ width: '100%', height: '100%' }}
				onClosePlayer={() => {
					router.navigate('/'); // Replace with the actual route for the next video
				}}
				onSourceChange={(index) => setSourceIndex(index)}
				onNextVideo={() => {}}
			/>
		</View>
	);
}
