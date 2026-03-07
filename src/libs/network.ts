import {ProxyURLResolverCallback} from "../types/hls";
import {SubtitleSource} from "../types/media";
import {detectSubtitleEncoding} from "../utils/detectors";
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
	const fetchUrl =
		track.options?.useProxy && !isBlob && proxyResolver
			? proxyResolver(track.source, track.options?.overrideProxyURL ?? "", track.options?.headers || {})
			: track.source;

	const response = await fetch(fetchUrl);
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
		proxyHeaders?: Record<string, string>;
	}
): Promise<Response> {
	try {
		// if source is an blob skip using proxy
		const isBlob = source.startsWith("blob:");
		const fetchUrl =
			options?.useProxy && !isBlob && options.proxyResolver
				? options.proxyResolver(source, options.proxyURL, options?.proxyHeaders || {})
				: source;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const fetchOptions: RequestInit = {
			signal: controller.signal,
			headers: options?.useProxy && !isBlob ? options.proxyHeaders : {}
		};

		const response = await fetch(fetchUrl, fetchOptions);
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		return response;
	} catch (error) {
		throw new Error(`Failed to fetch ${source}: ${error instanceof Error ? error.message : String(error)}`);
	}
}
