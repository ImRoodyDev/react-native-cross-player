import { IHlsProxyManager, ProxyURLResolverCallback } from "../types/hls";
import { CNPLogger } from "../utils/logger";

export class HlsProxyManager implements IHlsProxyManager {
	private useProxy = false;
	private proxyUrl: string | null = null;
	private proxyHeaders: Record<string, string> = {};
	private resolver: ProxyURLResolverCallback | null = null;

	// Legacy/compatibility methods
	isProxyEnabled(): boolean {
		return this.useProxy;
	}

	enableProxyLoader(enabled: boolean): void {
		this.useProxy = enabled;
	}

	setProxyTunnelURL(url: string): void {
		this.proxyUrl = url;
	}

	setProxyTunnelHeaders(headers: Record<string, string>): void {
		this.proxyHeaders = headers;
	}

	setProxyTunnelURLResolver(resolver: ProxyURLResolverCallback): void {
		this.resolver = resolver;
	}

	getProxyTunnelURL(): string | null {
		return this.proxyUrl;
	}

	getProxyTunnelHeaders(): Record<string, string> {
		return this.proxyHeaders;
	}

	resolveURL(url: string) {
		if (!this.useProxy) return url;

		if (!this.proxyUrl) throw new Error("Proxy URL is not set");
		else if (!this.resolver) throw new Error("Proxy URL resolver is not set");

		try {
			return this.resolver(url, this.proxyUrl, this.proxyHeaders);
		} catch {
			CNPLogger.debug("HlsProxyManager: resolver error, falling back to original URL");
			return url;
		}
	}
}
