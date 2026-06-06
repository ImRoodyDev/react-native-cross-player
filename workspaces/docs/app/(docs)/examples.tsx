import React from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../components/DocPage';
import { CodeBlock } from '../../components/CodeBlock';

const MP4_WITH_SUBTITLES = `import { VideoPlayer } from 'react-native-cross-player';

const playerId = 'mp4-example';

export function Mp4WithSubtitles() {
  return (
    <VideoPlayer
      videoTitle="MP4 with captions"
      playerConfig={{
        playerId,
        videoSources: [
          {
            id: 'main',
            playerId,
            label: '1080p',
            source: 'https://cdn.example.com/video.mp4',
            format: 'mp4',
          },
        ],
        subtitleSources: [
          {
            id: 'en',
            playerId,
            source: 'https://cdn.example.com/subtitles/en.vtt',
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

const HLS_PROXY = `import { VideoPlayer, type ProxyURLResolverCallback } from 'react-native-cross-player';

const resolveProxyUrl: ProxyURLResolverCallback = (targetURL, proxyURL, headers) => {
  const url = new URL(proxyURL);
  url.searchParams.set('target', targetURL);

  for (const [key, value] of Object.entries(headers)) {
    url.searchParams.append(\`header.\${key}\`, value);
  }

  return url.toString();
};

const playerId = 'hls-proxy-example';

export function HlsBehindProxy() {
  return (
    <VideoPlayer
      videoTitle="Protected HLS"
      playerConfig={{
        playerId,
        proxyURL: 'https://api.example.com/media-proxy',
        proxyResolver: resolveProxyUrl,
        videoSources: [
          {
            id: 'hls',
            playerId,
            label: 'Auto quality',
            source: 'https://cdn.example.com/protected/master.m3u8',
            format: 'm3u8',
            options: {
              useProxy: true,
              headers: { Authorization: 'Bearer token' },
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

const PER_SOURCE_PROXY = `const playerConfig = {
  playerId: 'multi-proxy-example',
  proxyURL: 'https://api.example.com/default-proxy',
  proxyResolver: resolveProxyUrl,
  videoSources: [
    {
      id: 'default-region',
      playerId: 'multi-proxy-example',
      label: 'Default region',
      source: 'https://cdn.example.com/master.m3u8',
      format: 'm3u8',
      options: { useProxy: true },
    },
    {
      id: 'eu-region',
      playerId: 'multi-proxy-example',
      label: 'EU region',
      source: 'https://eu-cdn.example.com/master.m3u8',
      format: 'm3u8',
      options: {
        useProxy: true,
        overrideProxyURL: 'https://eu-api.example.com/proxy',
      },
    },
  ],
  subtitleSources: [],
  initialVideoSource: 0,
};`;

const LAZY_SIGNED_URLS = `const playerConfig = {
  playerId: 'lazy-signed-example',
  lazyLoadSources: true,
  proxyURL: 'https://api.example.com/media-proxy',
  proxyResolver: resolveProxyUrl,
  onLazyLoadSource: async (source) => {
    const signed = await fetch(\`/api/media/sign?id=\${source.id}\`).then((r) => r.json());

    return {
      source: signed.url,
      options: {
        useProxy: true,
        headers: { Authorization: signed.accessToken },
      },
    };
  },
  videoSources: [
    {
      id: 'episode-1',
      playerId: 'lazy-signed-example',
      label: 'Episode 1',
      source: '',
      format: 'm3u8',
    },
  ],
  subtitleSources: [],
  initialVideoSource: 0,
};`;

const REF_CONTROLS = `import { VideoPlayer, type VideoPlayerRef } from 'react-native-cross-player';

const ref = React.useRef<VideoPlayerRef>(null);

<VideoPlayer
  ref={ref}
  videoTitle="Playlist episode"
  playerConfig={playerConfig}
  onEnd={() => ref.current?.setVideoSource(1)}
/>;

// External buttons
ref.current?.play();
ref.current?.pause();
ref.current?.seek(90);
ref.current?.setSubtitle(0);`;

export default function ExamplesPage() {
	return (
		<DocPage
			title="Examples"
			description="Copyable setup patterns for common player integrations, from plain MP4 playback to proxied HLS and signed URLs."
			contentMaxWidth={980}
			sections={[
				{
					title: 'MP4 with subtitles',
					content: <CodeBlock code={MP4_WITH_SUBTITLES} language="tsx" />,
				},
				{
					title: 'HLS through a proxy URL',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								`proxyURL` is the default endpoint. The resolver decides how the final URL is built for your backend.
							</Text>
							<CodeBlock code={HLS_PROXY} language="tsx" />
						</View>
					),
				},
				{
					title: 'Override proxy per source',
					content: (
						<View className="gap-3">
							<CodeBlock code={PER_SOURCE_PROXY} language="ts" />
							<Callout type="info">Use `overrideProxyURL` sparingly; most apps should set one `playerConfig.proxyURL`.</Callout>
						</View>
					),
				},
				{
					title: 'Lazy signed URLs',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								Refresh a source only when the user selects it, which keeps short-lived tokens from expiring before play.
							</Text>
							<CodeBlock code={LAZY_SIGNED_URLS} language="ts" />
						</View>
					),
				},
				{
					title: 'Drive playback with a ref',
					content: <CodeBlock code={REF_CONTROLS} language="tsx" />,
				},
			]}
		/>
	);
}
