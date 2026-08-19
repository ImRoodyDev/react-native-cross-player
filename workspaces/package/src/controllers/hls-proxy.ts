import Hls, { HlsConfig } from "hls.js";
import { HlsProxyConfig, IHlsProxyManager, ProxyURLResolverCallback, HlsProxyConfigInternal } from "../types/hls";
import { ProxyFragmentLoader, ProxyLoader, ProxyPlaylistLoader } from "./proxy-loader";
import { HlsProxyManager } from "./proxy-manager";
import { CNPLogger } from "../utils/logger";
import { SourceRequestOptions } from "../types/media";

export class HlsProxy extends Hls implements Omit<IHlsProxyManager, "resolveURL"> {
	private proxyManager: HlsProxyManager;

	constructor(config: HlsProxyConfig = {}) {
		const { useProxyLoader, hlsConfig } = config;

		// create a manager that will be injected into loader instances via loader config
		const manager = new HlsProxyManager();

		// Preserve any caller-provided xhrSetup, then layer proxy-auth headers on top.
		const userXhrSetup = hlsConfig?.xhrSetup;

		// attach manager under a private key that our loaders will read
		const injectedConfig: HlsProxyConfigInternal = {
			...hlsConfig,
			__proxyManager: manager,
			loader: ProxyLoader,
			pLoader: ProxyLoader,
			fLoader: ProxyFragmentLoader,
			// Attach the proxy-auth headers to every hls.js request. Read live per request
			// (getProxyHeaders returns {} when proxying is off), so a source change with new
			// proxyHeaders is picked up immediately and a direct-play origin never gets them.
			xhrSetup: (xhr: XMLHttpRequest, url: string) => {
				const authHeaders = manager.getProxyHeaders();
				for (const [key, value] of Object.entries(authHeaders)) {
					try {
						xhr.setRequestHeader(key, value);
					} catch {
						/* header not settable in this environment — ignore */
					}
				}
				if (typeof userXhrSetup === "function") userXhrSetup(xhr, url);
			}
		};

		// Dependency injection time!
		super(injectedConfig as any satisfies HlsConfig);
		this.proxyManager = manager;

		// Config loggers & Managers
		this.enableProxyLoader(!!useProxyLoader);
	}

	getProxyManager(): Readonly<HlsProxyManager> {
		return this.proxyManager;
	}

	enableProxyLoader(enabled: boolean): void {
		this.proxyManager.enableProxyLoader(enabled);
	}

	setProxyURL(url: string): void {
		this.proxyManager.setProxyURL(url);
	}

	setOriginHeaders(headers: Record<string, string>): void {
		this.proxyManager.setOriginHeaders(headers);
	}

	setProxyHeaders(headers: Record<string, string>): void {
		this.proxyManager.setProxyHeaders(headers);
	}

	setProxyQuery(query: Record<string, string>): void {
		this.proxyManager.setProxyQuery(query);
	}

	setProxyURLResolver(resolver: ProxyURLResolverCallback): void {
		this.proxyManager.setProxyURLResolver(resolver);
	}

	getProxyURL(): string | null {
		return this.proxyManager.getProxyURL();
	}

	getProxyHeaders(): Record<string, string> {
		return this.proxyManager.getProxyHeaders();
	}

	// Convenience API to control proxy at runtime
	isProxyEnabled() {
		return this.proxyManager.isProxyEnabled();
	}

	setSource(url: string, options?: SourceRequestOptions, startTime?: number) {
		CNPLogger.info("[HlsProxy] Setting source with proxy options:", { url, options, startTime });
		this.enableProxyLoader(!!options?.useProxy);
		if (options?.overrideProxyURL) this.setProxyURL(options.overrideProxyURL);
		// Origin headers (Referer/UA/…) → resolver → encoded into the proxied URL.
		this.setOriginHeaders(options?.headers || {});
		// Proxy-auth credentials (token/api-key), independent of the origin headers.
		this.setProxyHeaders(options?.proxyHeaders || {}); // real request headers
		this.setProxyQuery(options?.proxyQuery || {}); // query params
		this.loadSource(url);
		// If a startTime is provided forward it to startLoad so HLS begins at that position.
		// Guard non-finite values to avoid invalid currentTime writes in HTMLMediaElement.
		const safeStartTime = typeof startTime === "number" && Number.isFinite(startTime) && !Number.isNaN(startTime) && startTime >= 0 ? startTime : -1;
		this.startLoad(safeStartTime);
	}

	runDestroy() {
		this.stopLoad();
		this.detachMedia();
		this.destroy();
	}
}

export default HlsProxy;
