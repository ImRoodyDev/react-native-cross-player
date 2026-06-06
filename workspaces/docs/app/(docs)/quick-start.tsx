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
        playerId: 'quick-start-player',
        videoSources: [
          {
            id: 'tos',
            playerId: 'quick-start-player',
            label: 'Tears of Steel',
            source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4',
            format: 'mp4',
          },
        ],
        subtitleSources: [
          {
            id: 'english',
            playerId: 'quick-start-player',
            source: '/media/tears-en.vtt',
            label: 'English',
            langISO: 'en',
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

const PROXY_PLAYER = `import { VideoPlayer, type ProxyURLResolverCallback } from 'react-native-cross-player';

const proxyResolver: ProxyURLResolverCallback = (targetURL, proxyURL, headers) => {
  const url = new URL(proxyURL);
  url.searchParams.set('url', targetURL);

  for (const [name, value] of Object.entries(headers)) {
    url.searchParams.append(\`header.\${name}\`, value);
  }

  return url.toString();
};

const playerId = 'proxy-player';

export function ProxiedPlayer() {
  return (
    <VideoPlayer
      videoTitle="Private HLS"
      playerConfig={{
        playerId,
        proxyURL: 'https://api.example.com/media-proxy',
        proxyResolver,
        videoSources: [
          {
            id: 'private-hls',
            playerId,
            label: 'Private HLS',
            source: 'https://cdn.example.com/protected/master.m3u8',
            format: 'm3u8',
            options: {
              useProxy: true,
              headers: { Authorization: 'Bearer user-token' },
            },
          },
        ],
        subtitleSources: [],
        initialVideoSource: 0,
      }}
      viewStyle={{ flex: 1, backgroundColor: '#000' }}
    />
  );
}`;

export default function QuickStartPage() {
	return (
		<DocPage
			title="Quick Start"
			description="Start with the bundled player UI, then add callbacks or a ref when another screen needs to drive playback."
			contentMaxWidth={1080}
			sections={[
				{
					title: 'Preview the media flow',
					content: (
						<ComponentPreview code={BASIC_PLAYER} language="tsx" label="PlayerScreen.tsx" height={700}>
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
				{
					title: 'Proxy a protected source',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								Set `playerConfig.proxyURL` once, then opt each source or subtitle into proxying with `options.useProxy`.
							</Text>
							<CodeBlock code={PROXY_PLAYER} language="tsx" />
							<Callout type="info">Use `options.overrideProxyURL` on a source when one item needs a different proxy endpoint.</Callout>
						</View>
					),
				},
			]}
		/>
	);
}
