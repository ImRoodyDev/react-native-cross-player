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

const HLS_EXAMPLE = `const hls = new HlsProxy({
  proxyTunnelURL: 'https://proxy.example.com/hls',
  proxyTunnelHeaders: { Authorization: 'Bearer token' },
  hlsConfig: {
    lowLatencyMode: true,
  },
});

hls.setSource('https://example.com/master.m3u8', {
  useProxy: true,
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
	{ name: 'HlsProxyConfig', type: 'type', description: 'Configuration for proxy tunnel URL, headers, resolver, and hls.js options.' },
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
			]}
		/>
	);
}
