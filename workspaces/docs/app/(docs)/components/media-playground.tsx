import React from 'react';
import { Text, View } from 'react-native';
import { DocPage } from '../../../components/DocPage';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { MediaPlayground } from '../../../components/MediaPlayground';
import { CodeBlock } from '../../../components/CodeBlock';

const PLAYGROUND_CODE = `const playerConfig = {
  videoSources: [
    { uri: '/media/tos.mp4', title: 'Bundled MP4' },
    { uri: 'https://example.com/stream.m3u8', title: 'Remote HLS' },
  ],
  subtitleSources: [
    { uri: '/media/tears-en.vtt', title: 'English', language: 'en' },
    { uri: '/media/tears-fr.vtt', title: 'French', language: 'fr' },
  ],
};`;

export default function MediaPlaygroundPage() {
	return (
		<DocPage
			title="Media Playground"
			description="Use the media files from public/media, switch VTT captions, and paste remote video URLs to check browser playback."
			platforms={['web']}
			sections={[
				{
					title: 'Interactive preview',
					content: (
						<ComponentPreview code={PLAYGROUND_CODE} language="ts" label="playerConfig.ts" height={520}>
							<MediaPlayground />
						</ComponentPreview>
					),
				},
				{
					title: 'Media assets',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								The docs export copies `tos.mp4`, `tears-en.vtt`, and `tears-fr.vtt` into the static public folder so
								GitHub Pages can serve them with the site.
							</Text>
							<CodeBlock code={PLAYGROUND_CODE} language="ts" />
						</View>
					),
				},
			]}
		/>
	);
}
