import React from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../components/DocPage';
import { CodeBlock } from '../../components/CodeBlock';
import { ComponentPreview } from '../../components/ComponentPreview';
import { MediaPlayground } from '../../components/MediaPlayground';

const BASIC_PLAYER = `import React from 'react';
import { VideoPlayer } from 'react-native-cross-player';

export default function PlayerScreen() {
  return (
    <VideoPlayer
      videoTitle="Tears of Steel"
      playerConfig={{
        videoSources: [
          { uri: 'https://example.com/video.m3u8', title: 'HLS' },
          { uri: 'https://example.com/video.mp4', title: 'MP4' },
        ],
        subtitleSources: [
          { uri: 'https://example.com/en.vtt', title: 'English', language: 'en' },
        ],
      }}
      viewStyle={{ flex: 1, backgroundColor: '#000' }}
    />
  );
}`;

const CALLBACKS = `<VideoPlayer
  videoTitle="Episode 1"
  playerConfig={playerConfig}
  onSourceChange={(index, source) => console.log('source', index, source)}
  onSubtitleChange={(index, subtitle) => console.log('subtitle', index, subtitle)}
  onPlaybackChange={(isPlaying) => console.log('playing', isPlaying)}
  onProgress={(currentTime) => console.log(currentTime)}
  onEnd={() => console.log('ended')}
/>;
`;

export default function QuickStartPage() {
	return (
		<DocPage
			title="Quick Start"
			description="Start with the bundled player UI, then add callbacks or a ref when another screen needs to drive playback."
			sections={[
				{
					title: 'Preview the media flow',
					content: (
						<ComponentPreview code={BASIC_PLAYER} language="tsx" label="PlayerScreen.tsx" height={480}>
							<MediaPlayground />
						</ComponentPreview>
					),
				},
				{
					title: 'Wire playback events',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								The high-level component exposes callbacks for source, subtitles, playback state, progress, and end
								events.
							</Text>
							<CodeBlock code={CALLBACKS} language="tsx" />
							<Callout type="tip">Use these callbacks to sync playlists, analytics, watched progress, and subtitles UI.</Callout>
						</View>
					),
				},
			]}
		/>
	);
}
