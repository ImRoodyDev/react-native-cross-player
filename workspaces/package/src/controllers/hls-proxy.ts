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

		// attach manager under a private key that our loaders will read
		const injectedConfig: HlsProxyConfigInternal = {
			...hlsConfig,
			__proxyManager: manager,
			loader: ProxyLoader,
			pLoader: ProxyLoader,
			fLoader: ProxyFragmentLoader
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

	setProxyTunnelURL(url: string): void {
		this.proxyManager.setProxyTunnelURL(url);
	}

	setProxyTunnelHeaders(headers: Record<string, string>): void {
		this.proxyManager.setProxyTunnelHeaders(headers);
	}

	setProxyTunnelURLResolver(resolver: ProxyURLResolverCallback): void {
		this.proxyManager.setProxyTunnelURLResolver(resolver);
	}

	getProxyTunnelURL(): string | null {
		return this.proxyManager.getProxyTunnelURL();
	}

	getProxyTunnelHeaders(): Record<string, string> {
		return this.proxyManager.getProxyTunnelHeaders();
	}

	// Convenience API to control proxy at runtime
	isProxyEnabled() {
		return this.proxyManager.isProxyEnabled();
	}

	setSource(url: string, options?: SourceRequestOptions, startTime?: number) {
		CNPLogger.info("[HlsProxy] Setting source with proxy options:", { url, options, startTime });
		this.enableProxyLoader(!!options?.useProxy);
		if (options?.overrideProxyURL) this.setProxyTunnelURL(options.overrideProxyURL);
		this.setProxyTunnelHeaders(options?.headers || {});
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
