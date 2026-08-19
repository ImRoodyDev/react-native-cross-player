import {ProxyURLResolverCallback} from "../types/hls";
import {SubtitleSource} from "../types/media";
import {detectSubtitleEncoding} from "../utils/detectors";
import {appendQueryParams} from "../utils/helpers";
import {CNPLogger} from "../utils/logger";

const CHARSET_EXP = /charset=([^;,\s]+)/i;

/*
 * Network helpers for fetching subtitle and playlist resources.
 * - `fetchSubtitleTrackRawData` attempts to fetch and decode subtitle text using
 *   server-declared charset or simple heuristics.
 */
export async function fetchSubtitleTrackRawData(track: SubtitleSource, proxyResolver?: ProxyURLResolverCallback): Promise<string | null> {
	// if source is an blob skip using proxy
	const isBlob = track.source.startsWith("blob:");
	const opts = track.options;
	const useProxy = !!opts?.useProxy && !isBlob;
	const resolved =
		useProxy && proxyResolver
			? proxyResolver(track.source, opts?.overrideProxyURL ?? "", opts?.headers || {})
			: track.source;
	// Proxy on: origin headers are encoded into the resolved URL, so the request to the
	// proxy carries only the proxy-auth headers (+ ?token). Proxy off: the request goes to
	// the origin, so it carries the origin headers.
	const fetchUrl = useProxy ? appendQueryParams(resolved, opts?.proxyQuery) : resolved;
	const fetchInit: RequestInit = {
		headers: useProxy ? opts?.proxyHeaders || {} : opts?.headers || {}
	};

	const response = await fetch(fetchUrl, fetchInit);
	if (!response.ok) throw new Error(`Failed to fetch subtitle from ${fetchUrl}`);

	let charset = "utf-8";
	const contentType = response.headers.get("content-type");

	if (contentType) {
		const charsetMatch = contentType.match(CHARSET_EXP);
		if (charsetMatch && charsetMatch[1]) {
			charset = charsetMatch[1].toLowerCase().trim();
		}
	}

	// Always fetch as ArrayBuffer for consistent handling
	const arrayBuffer = await response.arrayBuffer();

	try {
		const decoder = new TextDecoder(charset);
		return decoder.decode(arrayBuffer);
	} catch (decoderError) {
		// Fallback: try UTF-8
		try {
			const utf8Decoded = new TextDecoder("utf-8").decode(arrayBuffer);
			const detectedEncoding = detectSubtitleEncoding(utf8Decoded);

			if (detectedEncoding !== "utf-8") {
				const fallbackDecoder = new TextDecoder(detectedEncoding);
				return fallbackDecoder.decode(arrayBuffer);
			}

			return utf8Decoded;
		} catch (fallbackError) {
			CNPLogger.error(`Failed to decode subtitle with any encoding: ${fallbackError}`);
			return null;
		}
	}
}

/**
 * Fetch a URL with optional proxy support.
 * - When `useProxy` is true the provided `proxyResolver` is used to build the
 *   proxied URL (the resolver is responsible for shaping the proxy path).
 */
export async function fetchSource(
	source: string,
	options?: {
		useProxy: boolean;
		proxyURL: string;
		proxyResolver?: ProxyURLResolverCallback;
		/** The origin's headers (Referer/User-Agent). Passed to the resolver and sent as
		 *  real request headers (native can set them, unlike a browser). */
		originHeaders?: Record<string, string>;
		/** Auth to the proxy itself — real request headers. */
		proxyHeaders?: Record<string, string>;
		/** Auth to the proxy itself — query params appended to the proxied URL. */
		proxyQuery?: Record<string, string>;
	}
): Promise<Response> {
	try {
		// if source is an blob skip using proxy
		const isBlob = source.startsWith("blob:");
		const useProxy = !!options?.useProxy && !isBlob;
		const resolved =
			useProxy && options?.proxyResolver
				? options.proxyResolver(source, options.proxyURL, options?.originHeaders || {})
				: source;
		const fetchUrl = useProxy ? appendQueryParams(resolved, options?.proxyQuery) : resolved;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const fetchOptions: RequestInit = {
			signal: controller.signal,
			// Proxy on: the request goes to the PROXY and the origin headers are already in the
			// resolved URL, so carry only the proxy-auth headers. Proxy off: the request goes to
			// the ORIGIN, so carry the origin headers (native can set them, unlike a browser).
			headers: useProxy ? options?.proxyHeaders || {} : options?.originHeaders || {}
		};

		// finally: a rejected fetch used to skip clearTimeout, leaving the abort timer (and its
		// closure) alive for the full 10s on every failed request.
		let response: Response;
		try {
			response = await fetch(fetchUrl, fetchOptions);
		} finally {
			clearTimeout(timeoutId);
		}

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		return response;
	} catch (error) {
		throw new Error(`Failed to fetch ${source}: ${error instanceof Error ? error.message : String(error)}`);
	}
}
