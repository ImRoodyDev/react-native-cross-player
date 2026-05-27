import Hls, { HlsConfig, LoaderCallbacks, LoaderConfiguration, LoaderContext, PlaylistLoaderContext, FragmentLoaderContext } from "hls.js";
import { HlsProxyManager } from "./proxy-manager";
import { HlsProxyConfigInternal } from "../types/hls";
import { ProxyLogger } from "../utils/logger";

// HLS.js uses the same base loader class for all loader types (loader, pLoader, fLoader)
// pLoader and fLoader are optional overrides, not separate default classes
const BaseLoader = Hls.DefaultConfig?.loader || (class {} as any);

// Proxy-aware loader: reads runtime proxy settings from the injected manager
export class ProxyLoader extends BaseLoader {
	private proxyManager: HlsProxyManager;

	constructor({ __proxyManager, ...config }: HlsProxyConfigInternal) {
		super(config as unknown as HlsConfig);
		this.proxyManager = __proxyManager as HlsProxyManager;
	}

	load(context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>) {
		context.url = this.proxyManager.resolveURL(context.url);
		ProxyLogger.debug(`Loading URL: ${context.url}`);
		const originalOnSuccess = callbacks.onSuccess;
		callbacks.onSuccess = (response, stats, context, networkDetails) => {
			// You can modify the response here if needed
			response.url = context.url; // Ensure the URL reflects the proxied URL
			originalOnSuccess(response, stats, context, networkDetails);
		};
		return super.load(context, config, callbacks);
	}
}

export class ProxyPlaylistLoader extends BaseLoader {
	private proxyManager: HlsProxyManager;

	constructor({ __proxyManager, ...config }: HlsProxyConfigInternal) {
		super(config as unknown as HlsConfig);
		this.proxyManager = __proxyManager as HlsProxyManager;
	}

	load(context: PlaylistLoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<PlaylistLoaderContext>): void {
		context.url = this.proxyManager.resolveURL(context.url);
		ProxyLogger.debug(`Loading playlist URL: ${context.url}`);
		const originalOnSuccess = callbacks.onSuccess;
		callbacks.onSuccess = (response, stats, context, networkDetails) => {
			// You can modify the response here if needed
			response.url = context.url; // Ensure the URL reflects the proxied URL
			originalOnSuccess(response, stats, context, networkDetails);
		};
		return super.load(context, config, callbacks as unknown as LoaderCallbacks<LoaderContext>);
	}
}

export class ProxyFragmentLoader extends BaseLoader {
	private proxyManager: HlsProxyManager;
	constructor({ __proxyManager, ...config }: HlsProxyConfigInternal) {
		super(config as unknown as HlsConfig);
		this.proxyManager = __proxyManager as HlsProxyManager;
	}

	load(context: FragmentLoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<FragmentLoaderContext>): void {
		context.url = this.proxyManager.resolveURL(context.url);
		ProxyLogger.debug(`Loading fragment URL: ${context.url}`);
		return super.load(context, config, callbacks as unknown as LoaderCallbacks<LoaderContext>);
	}
}
