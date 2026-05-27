import React from 'react';
import { View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { PropsTable, type PropRow } from '../../../components/PropsTable';

const IMPORT_CODE = `import {
  createM3U8Source,
  createMasterM3U8Raw,
  createVTTSource,
  convertSRTtoVTT,
  createM3U8File,
  createVTTFile,
  clearBlobFiles,
  clearBlobGroup,
  revokeAllBlobURLs,
  type VideoSource,
  type SubtitleSource,
} from 'react-native-cross-player';`;

const MEDIA_EXAMPLE = `const playerId = 'lesson-player';

const source: VideoSource = {
  id: 'hls-main',
  playerId,
  label: 'Main HLS',
  source: 'https://example.com/master.m3u8',
  format: 'm3u8',
  options: { useProxy: true },
};

const rewrittenSource = await createM3U8Source(source, (url, proxyURL, headers) => {
  const encoded = encodeURIComponent(url);
  return \`\${proxyURL}?url=\${encoded}\`;
});`;

const SUBTITLE_EXAMPLE = `const subtitle: SubtitleSource = {
  id: 'english',
  playerId: 'lesson-player',
  source: 'https://example.com/en.srt',
  label: 'English',
  langISO: 'en',
  type: 'srt',
};

const vttBlobUrl = await createVTTSource(subtitle);

const vttText = convertSRTtoVTT(\`
1
00:00:01,000 --> 00:00:03,000
Hello from a custom player.
\`);`;

const BLOB_EXAMPLE = `const m3u8Url = await createM3U8File(rawPlaylist, 'episode.m3u8', 'episode-1');
const vttUrl = await createVTTFile(rawVtt, 'english.vtt', 'episode-1');

clearBlobFiles(m3u8Url);
clearBlobGroup('episode-1');
revokeAllBlobURLs();`;

const HELPERS: PropRow[] = [
	{ name: 'createM3U8Source', type: '(VideoSource, proxyResolver?) => Promise<string>', description: 'Builds a playable HLS source, optionally rewriting URLs through a proxy resolver.' },
	{ name: 'createMasterM3U8Raw', type: '(M3U8BlobOptions) => string', description: 'Creates a master playlist string from variant, subtitle, and audio track metadata.' },
	{ name: 'createVTTSource', type: '(SubtitleSource, proxyResolver?) => Promise<string>', description: 'Fetches subtitle content, detects SRT/VTT, converts when needed, and returns a VTT blob URL.' },
	{ name: 'convertSRTtoVTT', type: '(srtData, style?) => string', description: 'Converts SRT text to WebVTT text for browser/native text tracks.' },
	{ name: 'createM3U8File', type: '(content, fileName, group?) => Promise<string>', description: 'Creates a playlist blob URL and optionally tracks it in a cleanup group.' },
	{ name: 'createVTTFile', type: '(vttData, fileName?, group?, source?) => Promise<string>', description: 'Creates a VTT blob URL and optionally tracks it in a cleanup group.' },
	{ name: 'clearBlobFiles', type: '(pathlocation) => void', description: 'Revokes a single blob URL.' },
	{ name: 'clearBlobGroup', type: '(group) => void', description: 'Revokes all blob URLs registered to a group.' },
	{ name: 'revokeAllBlobURLs', type: '() => void', description: 'Revokes every blob URL registered by the package helpers.' },
];

export default function MediaHelpersPage() {
	return (
		<DocPage
			title="Media Helpers"
			description="The media helpers exported from the package let advanced consumers prepare HLS playlists, subtitles, and blob URLs for custom player shells."
			platforms={['ios', 'android', 'web', 'tv']}
			importCode={IMPORT_CODE}
			sections={[
				{
					title: 'Available helpers',
					content: <PropsTable props={HELPERS} />,
				},
				{
					title: 'HLS source preparation',
					content: (
						<View className="gap-3">
							<BodyText>
								Use `createM3U8Source` when your custom player needs the same playlist rewriting and proxy support used by
								the built-in controller.
							</BodyText>
							<CodeBlock code={MEDIA_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Subtitle preparation',
					content: (
						<View className="gap-3">
							<BodyText>`createVTTSource` is useful when you accept SRT or VTT input but want one VTT output for playback.</BodyText>
							<CodeBlock code={SUBTITLE_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Blob cleanup',
					content: (
						<View className="gap-3">
							<Callout type="warning">Clean up generated blob URLs when a custom player unmounts or switches libraries.</Callout>
							<CodeBlock code={BLOB_EXAMPLE} language="ts" />
						</View>
					),
				},
			]}
		/>
	);
}
