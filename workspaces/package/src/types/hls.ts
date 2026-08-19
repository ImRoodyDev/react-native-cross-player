/*
 * HLS proxy-related types
 * - These types describe the small surface used to inject a proxy loader into
 *   `hls.js` and to resolve proxied URLs.
 * - `IHlsProxyManager` is a minimal runtime API that the proxy system exposes
 *   so other modules can enable/disable proxying and resolve proxied URLs.
 */
import { FragmentLoaderContext, HlsConfig, Loader, LoaderContext, PlaylistLoaderContext } from "hls.js";

/** Builds the final proxied URL. `originHeaders` are the target's required headers
 *  (Referer/User-Agent/…), to be encoded into the URL by the resolver. */
export type ProxyURLResolverCallback = (targetURL: string, proxyURL: string, originHeaders: Record<string, string>) => string;

/**
 * Player-level proxy settings, applied to every proxied source. Bundles what used to be
 * the separate `proxyURL`/`proxyResolver` props plus optional auth. A source's own
 * `SourceRequestOptions` still wins per source (its `overrideProxyURL`, `proxyHeaders`,
 * `proxyQuery` override these defaults).
 */
export type ProxyConfig = {
	/** Proxy base URL. Copied into a source's `overrideProxyURL` when it has none. */
	url?: string;
	/** Builds the proxied URL from a target + the origin headers. */
	resolver?: ProxyURLResolverCallback;
	/** Auth to the proxy (token/api-key) — sent as real request headers on every proxied request. */
	headers?: Record<string, string>;
	/** Auth to the proxy (token/api-key) — appended as query params to every proxied URL. */
	query?: Record<string, string>;
};

export interface IHlsProxyManager {
	isProxyEnabled(): boolean;
	enableProxyLoader(enabled: boolean): void;
	setProxyURL(url: string): void;
	setProxyURLResolver(resolver: ProxyURLResolverCallback): void;
	/** Origin headers (Referer/User-Agent/…) — encoded into the proxied URL by the resolver. */
	setOriginHeaders(headers: Record<string, string>): void;
	/** Auth headers sent to the proxy as real request headers. */
	setProxyHeaders(headers: Record<string, string>): void;
	/** Auth query params appended to every proxied URL. */
	setProxyQuery(query: Record<string, string>): void;

	resolveURL(url: string): string;
	getProxyURL(): string | null;
	/** Auth headers for the current proxied request (empty when proxying is off). */
	getProxyHeaders(): Record<string, string>;
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
