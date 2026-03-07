/*
 * HLS proxy-related types
 * - These types describe the small surface used to inject a proxy loader into
 *   `hls.js` and to resolve proxied URLs.
 * - `IHlsProxyManager` is a minimal runtime API that the proxy system exposes
 *   so other modules can enable/disable proxying and resolve proxied URLs.
 */
import { FragmentLoaderContext, HlsConfig, Loader, LoaderContext, PlaylistLoaderContext } from "hls.js";

export type ProxyURLResolverCallback = (targetURL: string, proxyURL: string, headers: Record<string, string>) => string;

export interface IHlsProxyManager {
	isProxyEnabled(): boolean;
	enableProxyLoader(enabled: boolean): void;
	setProxyTunnelURL(url: string): void;
	setProxyTunnelHeaders(headers: Record<string, string>): void;
	setProxyTunnelURLResolver(resolver: ProxyURLResolverCallback): void;

	resolveURL(url: string): string;
	getProxyTunnelURL(): string | null;
	getProxyTunnelHeaders(): Record<string, string>;
}

/*
 * External-facing proxy config used when creating an `hls.js` instance:
 * - `useProxyLoader` toggles whether the custom loader is attached.
 * - `hlsConfig` passes through remaining config options.
 */
export type HlsProxyConfig = {
	useProxyLoader?: boolean;
	hlsConfig?: Partial<Omit<HlsConfig, "loader" | "pLoader" | "fLoader">>;
};

/*
 * Internal config shape used when creating the actual loader constructors.
 * - Contains a reference to the proxy manager and typed loader constructors.
 */
export type HlsProxyConfigInternal = {
	__proxyManager: IHlsProxyManager;
	loader: new (confg: HlsProxyConfigInternal) => Loader<LoaderContext>;
	pLoader: new (confg: HlsProxyConfigInternal) => Loader<PlaylistLoaderContext> | any;
	fLoader: new (confg: HlsProxyConfigInternal) => Loader<FragmentLoaderContext> | any;
} & Partial<Omit<HlsConfig, "loader" | "pLoader" | "fLoader">>;
