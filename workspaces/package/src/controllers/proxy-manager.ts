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
	}

	setProxyURL(url: string): void {
		this.proxyUrl = url;
	}

	setProxyURLResolver(resolver: ProxyURLResolverCallback): void {
		this.resolver = resolver;
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
	 * The auth headers to attach to a proxied request. Empty when proxying is off, so the
	 * token is never sent to a direct origin. Read live (per request) so a source change
	 * that passes new `proxyHeaders` takes effect on the next request.
	 */
	getProxyHeaders(): Record<string, string> {
		return this.useProxy ? this.proxyHeaders : {};
	}

	resolveURL(url: string) {
		if (!this.useProxy) return url;

		if (!this.proxyUrl) throw new Error("Proxy URL is not set");
		else if (!this.resolver) throw new Error("Proxy URL resolver is not set");

		try {
			// originHeaders read live, so a new source's headers apply immediately.
			return appendQueryParams(this.resolver(url, this.proxyUrl, this.originHeaders), this.proxyQuery);
		} catch {
			CNPLogger.debug("HlsProxyManager: resolver error, falling back to original URL");
			return url;
		}
	}
}
