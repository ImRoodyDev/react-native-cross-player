import React from 'react';
import { Text, View } from 'react-native';
import { DocPage } from '../../../components/DocPage';
import { ComponentPreview } from '../../../components/ComponentPreview';
import { MediaPlayground } from '../../../components/MediaPlayground';
import { CodeBlock } from '../../../components/CodeBlock';

const PLAYGROUND_CODE = `const playerConfig = {
  playerId: 'docs-player',
  videoSources: [
    {
      id: 'tos',
      playerId: 'docs-player',
      label: 'Tears of Steel',
      source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4',
      format: 'mp4',
    },
  ],
  subtitleSources: [
    {
      id: 'english',
      playerId: 'docs-player',
      source: '/media/tears-en.vtt',
      label: 'English',
      langISO: 'en',
      type: 'vtt',
    },
    {
      id: 'french',
      playerId: 'docs-player',
      source: '/media/tears-fr.vtt',
      label: 'French',
      langISO: 'fr',
      type: 'vtt',
    },
  ],
  initialVideoSource: 0,
  initialSubtitleSource: 0,
};`;

export default function MediaPlaygroundPage() {
	return (
		<DocPage
			title="Media Playground"
			description="Use the VideoPlayer controls, switch bundled VTT captions, and paste remote video URLs to check browser playback."
			platforms={['web']}
			contentMaxWidth={1080}
			sections={[
				{
					title: 'Interactive preview',
					content: (
						<ComponentPreview code={PLAYGROUND_CODE} language="ts" label="playerConfig.ts" height={720}>
							<MediaPlayground />
						</ComponentPreview>
					),
				},
				{
					title: 'Media assets',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								The MP4 sample streams from S3. The VTT files stay in the docs public media folder so GitHub Pages can
								serve captions with the site.
							</Text>
							<CodeBlock code={PLAYGROUND_CODE} language="ts" />
						</View>
					),
				},
			]}
		/>
	);
}
