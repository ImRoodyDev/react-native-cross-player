import React from 'react';
import { View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { PropsTable, type PropRow } from '../../../components/PropsTable';

const IMPORT_CODE = `import {
  CSS_PATH,
  CustomPlayerError,
  isCustomPlayerError,
  detectSourceType,
  detectSubtitleEncoding,
  detectSubtitleType,
  useWebKeyboard,
  CNPLogger,
  ProxyLogger,
  SourceTypes,
  type VideoSource,
  type SubtitleSource,
  type M3U8BlobOptions,
  type SourceRequestOptions,
} from 'react-native-cross-player';`;

const TYPES_EXAMPLE = `const playerId = 'typed-player';

const videoSource: VideoSource = {
  id: 'main',
  playerId,
  label: 'Main MP4',
  source: 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4',
  format: 'mp4',
  options: { useProxy: false },
};

const subtitleSource: SubtitleSource = {
  id: 'english',
  playerId,
  source: '/media/tears-en.vtt',
  label: 'English',
  langISO: 'en',
  type: 'vtt',
};`;

const PROXY_OPTIONS_EXAMPLE = `const sourceWithProxy: VideoSource = {
  id: 'private',
  playerId: 'typed-player',
  label: 'Private stream',
  source: 'https://cdn.example.com/private/master.m3u8',
  format: 'm3u8',
  options: {
    useProxy: true,
    overrideProxyURL: 'https://api.example.com/proxy',
    headers: {
      Authorization: 'Bearer token',
    },
    nativeSendHeadersOnSourceRequest: false,
  },
};`;

const DETECTORS_EXAMPLE = `const sourceType = detectSourceType('https://example.com/video.m3u8');
const subtitleType = detectSubtitleType('WEBVTT\\n\\n00:00:01.000 --> 00:00:02.000\\nHello');
const encoding = detectSubtitleEncoding(rawSubtitleText);

if (sourceType === SourceTypes.URL) {
  CNPLogger.info('Remote source detected');
}`;

const ERROR_EXAMPLE = `try {
  await controller.controls.setSource(2);
} catch (error) {
  if (isCustomPlayerError(error)) {
    console.log(error.stateMessage());
  }
}`;

const KEYBOARD_EXAMPLE = `useWebKeyboard(
  {
    Space: () => controller.controls.setPause(!controller.playerState.paused),
    KeyM: () => controller.controls.setMuted(controller.playerState.volume > 0),
  },
  { preventDefault: true },
);`;

const PUBLIC_TYPES: PropRow[] = [
	{ name: 'VideoSource', type: 'type', description: 'Playable source with id, playerId, label, source, format, and request options.' },
	{ name: 'SubtitleSource', type: 'type', description: 'Subtitle source with id, playerId, source, language, label, and SRT/VTT type.' },
	{ name: 'SourceRequestOptions', type: 'type', description: 'Proxy, headers, and native request behavior for source fetching.' },
	{ name: 'M3U8BlobOptions', type: 'type', description: 'Input shape for building HLS master playlist text.' },
	{ name: 'SourceTypes', type: 'enum', description: 'Detected source categories: blob, url, or native path.' },
	{ name: 'CSS_PATH', type: 'const', description: 'String path for the package CSS export.' },
];

const SOURCE_REQUEST_OPTIONS: PropRow[] = [
	{ name: 'useProxy', type: 'boolean', required: true, description: 'Whether this source or subtitle should be resolved through the proxy resolver.' },
	{ name: 'overrideProxyURL', type: 'string', description: 'Per-item proxy endpoint. Falls back to playerConfig.proxyURL when omitted.' },
	{ name: 'headers', type: 'Record<string,string>', description: 'Headers passed to the resolver and used for proxied fetches.' },
	{ name: 'nativeSendHeadersOnSourceRequest', type: 'boolean', default: 'false', description: 'For native platforms, sends headers directly on the react-native-video source request.' },
];

const UTILITIES: PropRow[] = [
	{ name: 'detectSourceType', type: '(source) => SourceTypes', description: 'Detects whether a source is a URL, blob URL, or native path.' },
	{ name: 'detectSubtitleType', type: '(content) => SubtitleTypes | null', description: 'Detects SRT or WebVTT subtitle text.' },
	{ name: 'detectSubtitleEncoding', type: '(content) => TextEncoding', description: 'Guesses subtitle encoding from raw text.' },
	{ name: 'CustomPlayerError', type: 'class', description: 'Structured player error with a payload and display-ready state message.' },
	{ name: 'isCustomPlayerError', type: '(error) => boolean', description: 'Type guard for CustomPlayerError.' },
	{ name: 'useWebKeyboard', type: 'hook', description: 'Registers web-only keyboard shortcuts for custom player shells.' },
	{ name: 'CNPLogger', type: 'logger', description: 'Package logger for player diagnostics.' },
	{ name: 'ProxyLogger', type: 'logger', description: 'Logger used by proxy/HLS helpers.' },
];

export default function TypesUtilitiesPage() {
	return (
		<DocPage
			title="Types and Utilities"
			description="These exports keep custom player integrations typed and give advanced apps access to detection, errors, keyboard shortcuts, and logging."
			platforms={['ios', 'android', 'web', 'tv']}
			importCode={IMPORT_CODE}
			sections={[
				{
					title: 'Public types',
					content: <PropsTable props={PUBLIC_TYPES} />,
				},
				{
					title: 'Source shapes',
					content: (
						<View className="gap-3">
							<BodyText>Use these shapes in `VideoPlayer`, `usePlayerController`, and media helper calls.</BodyText>
							<CodeBlock code={TYPES_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'SourceRequestOptions fields',
					content: (
						<View className="gap-3">
							<PropsTable props={SOURCE_REQUEST_OPTIONS} />
							<CodeBlock code={PROXY_OPTIONS_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Utilities',
					content: <PropsTable props={UTILITIES} />,
				},
				{
					title: 'Detectors and errors',
					content: (
						<View className="gap-3">
							<CodeBlock code={DETECTORS_EXAMPLE} language="ts" />
							<CodeBlock code={ERROR_EXAMPLE} language="ts" />
							<Callout type="info">These helpers are useful in upload/import flows before handing sources to the controller.</Callout>
						</View>
					),
				},
				{
					title: 'Keyboard shortcuts',
					content: <CodeBlock code={KEYBOARD_EXAMPLE} language="tsx" />,
				},
			]}
		/>
	);
}
