import React from 'react';
import { View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { PropsTable, type PropRow } from '../../../components/PropsTable';

const IMPORT_CODE = `import {
  HlsProxy,
  HlsProxyManager,
  ProxyLoader,
  ProxyPlaylistLoader,
  ProxyFragmentLoader,
  type HlsProxyConfig,
  type ProxyURLResolverCallback,
} from 'react-native-cross-player';`;

const RESOLVER_EXAMPLE = `const resolveProxyUrl: ProxyURLResolverCallback = (targetURL, proxyURL, headers) => {
  const url = new URL(proxyURL);
  url.searchParams.set('target', targetURL);

  for (const [key, value] of Object.entries(headers)) {
    url.searchParams.append(\`header.\${key}\`, value);
  }

  return url.toString();
};`;

const PLAYER_PROXY_EXAMPLE = `const playerConfig = {
  playerId: 'proxy-reference-player',
  proxyURL: 'https://api.example.com/proxy',
  proxyResolver: resolveProxyUrl,
  videoSources: [
    {
      id: 'hls',
      playerId: 'proxy-reference-player',
      label: 'Protected HLS',
      source: 'https://cdn.example.com/private/master.m3u8',
      format: 'm3u8',
      options: {
        useProxy: true,
        headers: { Authorization: 'Bearer token' },
      },
    },
  ],
  subtitleSources: [
    {
      id: 'en',
      playerId: 'proxy-reference-player',
      source: 'https://cdn.example.com/private/en.vtt',
      label: 'English',
      langISO: 'en',
      type: 'vtt',
      options: { useProxy: true },
    },
  ],
  initialVideoSource: 0,
};`;

const HLS_EXAMPLE = `const hls = new HlsProxy({
  useProxyLoader: true,
  hlsConfig: {
    lowLatencyMode: true,
  },
});

hls.setProxyTunnelURLResolver(resolveProxyUrl);

hls.setSource('https://example.com/master.m3u8', {
  useProxy: true,
  overrideProxyURL: 'https://proxy.example.com/hls',
  headers: { Authorization: 'Bearer token' },
});

hls.runDestroy();`;

const HELPERS: PropRow[] = [
	{ name: 'HlsProxy', type: 'class', description: 'Extends hls.js with proxy-aware source loading and runtime proxy tunnel settings.' },
	{ name: 'HlsProxyManager', type: 'class', description: 'Stores proxy URL, headers, and resolver behavior for HLS loaders.' },
	{ name: 'ProxyLoader', type: 'class', description: 'Base proxy-aware hls.js loader.' },
	{ name: 'ProxyPlaylistLoader', type: 'class', description: 'Proxy-aware loader for playlist requests.' },
	{ name: 'ProxyFragmentLoader', type: 'class', description: 'Proxy-aware loader for segment/fragment requests.' },
	{ name: 'ProxyURLResolverCallback', type: '(targetURL, proxyURL, headers) => string', description: 'Callback shape used to build the final proxied URL.' },
	{ name: 'HlsProxyConfig', type: 'type', description: 'Configuration for enabling proxy loaders and forwarding hls.js options.' },
];

const SOURCE_OPTIONS: PropRow[] = [
	{ name: 'useProxy', type: 'boolean', required: true, description: 'Enables proxy resolution for a source or subtitle.' },
	{ name: 'overrideProxyURL', type: 'string', description: 'Proxy endpoint for this item. If omitted, playerConfig.proxyURL is copied in.' },
	{ name: 'headers', type: 'Record<string,string>', description: 'Headers passed to the resolver and optionally to native source requests.' },
	{ name: 'nativeSendHeadersOnSourceRequest', type: 'boolean', default: 'false', description: 'Sends headers through react-native-video native source requests.' },
];

const HLS_CONFIG: PropRow[] = [
	{ name: 'useProxyLoader', type: 'boolean', default: 'false', description: 'Enables the proxy-aware hls.js loaders.' },
	{ name: 'hlsConfig', type: 'Partial<HlsConfig>', description: 'hls.js options, excluding custom loader fields managed by the package.' },
];

export default function ProxyHelpersPage() {
	return (
		<DocPage
			title="Proxy Helpers"
			description="The proxy exports support advanced HLS setups where playlists, subtitles, or media fragments must be routed through your own backend."
			platforms={['web']}
			importCode={IMPORT_CODE}
			sections={[
				{
					title: 'Available helpers',
					content: <PropsTable props={HELPERS} />,
				},
				{
					title: 'Proxy resolver',
					content: (
						<View className="gap-3">
							<BodyText>
								A resolver lets your app decide exactly how source URLs and request headers are encoded into your proxy
								endpoint.
							</BodyText>
							<CodeBlock code={RESOLVER_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Use proxyURL in the player',
					content: (
						<View className="gap-3">
							<BodyText>
								For normal app usage, set `playerConfig.proxyURL`, pass `proxyResolver`, and mark only the protected
								sources with `options.useProxy`.
							</BodyText>
							<CodeBlock code={PLAYER_PROXY_EXAMPLE} language="ts" />
						</View>
					),
				},
				{
					title: 'Direct HLS usage',
					content: (
						<View className="gap-3">
							<BodyText>
								Most apps can use proxy options through `VideoPlayer` or `usePlayerController`. Use `HlsProxy` directly
								when building a lower-level web player integration.
							</BodyText>
							<CodeBlock code={HLS_EXAMPLE} language="ts" />
							<Callout type="tip">For native platforms, prefer controller/player config and let the package choose the right source path.</Callout>
						</View>
					),
				},
				{
					title: 'Source request options',
					content: <PropsTable props={SOURCE_OPTIONS} />,
				},
				{
					title: 'HlsProxy config',
					content: <PropsTable props={HLS_CONFIG} />,
				},
			]}
		/>
	);
}
