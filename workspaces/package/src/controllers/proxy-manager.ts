import { IHlsProxyManager, ProxyURLResolverCallback } from "../types/hls";
import { appendQueryParams } from "../utils/helpers";
import { CNPLogger } from "../utils/logger";

/**
 * Runtime proxy state for the web (hls.js) player. Three distinct channels, one per
 * `SourceRequestOptions` field, so nothing is ambiguous:
 *
 * | option          | manager field   | where it goes                                   |
 * |-----------------|-----------------|-------------------------------------------------|
 * | `headers`       | `originHeaders` | the resolver → encoded into the proxied URL     |
 * | `proxyHeaders`  | `proxyHeaders`  | real request headers on every proxied request   |
 * | `proxyQuery`    | `proxyQuery`    | query params appended to every proxied URL      |
 *
 * Why `headers` goes through the URL and not as real headers: browsers forbid setting
 * `Referer`/`User-Agent`/`Origin` on XHR/fetch, so origin headers can only reach the
 * target by being encoded into the proxied URL (the resolver does that). `proxyHeaders`
 * (a token/api-key) is a normal custom header the browser *does* allow, so it rides as a
 * real request header — but only when proxying is on, so it never leaks to a direct origin.
 */
export class HlsProxyManager implements IHlsProxyManager {
	private useProxy = false;
	private proxyUrl: string | null = null;
	private resolver: ProxyURLResolverCallback | null = null;

	// One-shot guard so a misconfigured proxy warns once per config, not once per fragment.
	private warnedMissingProxy = false;

	// The ORIGIN's required headers (Referer/User-Agent/…). Handed to the resolver so it
	// can encode them into the proxied URL.
	private originHeaders: Record<string, string> = {};

	// Auth to the PROXY itself (token/api-key), independent of the origin headers.
	private proxyHeaders: Record<string, string> = {};
	private proxyQuery: Record<string, string> = {};

	isProxyEnabled(): boolean {
		return this.useProxy;
	}

	enableProxyLoader(enabled: boolean): void {
		this.useProxy = enabled;
		this.warnedMissingProxy = false;
	}

	setProxyURL(url: string): void {
		this.proxyUrl = url;
		this.warnedMissingProxy = false;
	}

	setProxyURLResolver(resolver: ProxyURLResolverCallback): void {
		this.resolver = resolver;
		this.warnedMissingProxy = false;
	}

	/** True only when proxying was requested AND is fully configured (URL + resolver). */
	private isEffectivelyProxying(): boolean {
		return this.useProxy && !!this.proxyUrl && !!this.resolver;
	}

	/** Origin headers the target needs — encoded into the proxied URL by the resolver. */
	setOriginHeaders(headers: Record<string, string>): void {
		this.originHeaders = headers || {};
	}

	/** Auth headers sent to the proxy as real request headers. */
	setProxyHeaders(headers: Record<string, string>): void {
		this.proxyHeaders = headers || {};
	}

	/** Auth query params appended to every proxied URL. */
	setProxyQuery(query: Record<string, string>): void {
		this.proxyQuery = query || {};
	}

	getProxyURL(): string | null {
		return this.proxyUrl;
	}

	/**
	 * The real request headers to attach to an hls.js request, read live (per request) so a
	 * source change takes effect immediately. Three cases:
	 *
	 * - Actually proxying → the proxy-auth headers (token/api-key). Origin headers ride in the
	 *   URL via the resolver, not here.
	 * - Proxy requested but not configured (direct fallback) → the ORIGIN headers, so the target
	 *   still receives the source's headers. The proxy-auth token is never sent to a direct
	 *   origin. (On web the browser drops forbidden names like Referer/User-Agent — unavoidable.)
	 * - Not proxying at all → nothing, so the token never leaks to a direct origin.
	 */
	getProxyHeaders(): Record<string, string> {
		if (this.isEffectivelyProxying()) return this.proxyHeaders;
		if (this.useProxy) return this.originHeaders;
		return {};
	}

	resolveURL(url: string) {
		if (!this.useProxy) return url;

		// Proxying was requested but isn't actually configured (no proxy URL and/or no resolver).
		// Rather than throwing — which hls.js swallows as a non-fatal internalException, silently
		// breaking the load — fall back to fetching the URL directly.
		if (!this.proxyUrl || !this.resolver) {
			if (!this.warnedMissingProxy) {
				this.warnedMissingProxy = true;
				CNPLogger.warn(
					`HlsProxyManager: proxy requested but ${!this.proxyUrl ? "proxy URL" : "resolver"} is not set — loading source directly and sending the source headers instead.`
				);
			}
			return url;
		}

		try {
			// originHeaders read live, so a new source's headers apply immediately.
			return appendQueryParams(this.resolver(url, this.proxyUrl, this.originHeaders), this.proxyQuery);
		} catch {
			CNPLogger.debug("HlsProxyManager: resolver error, falling back to original URL");
			return url;
		}
	}
}
