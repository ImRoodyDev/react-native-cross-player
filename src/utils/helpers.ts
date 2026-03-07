const IS_ABSOLUTE_URL_EXP = /^(https?:\/\/|ftps?:\/\/|mailto:|file:|data:|\/\/)/i;
const REMOVE_TRAILING_SLASHES_EXP = /\/+$/;
const REMOVE_LEADING_SLASHES_EXP = /^\/+/;

/*
 * Small URL and hashing helpers used by blob and playlist utilities.
 * - `joinURL` gracefully joins base + relative allowing absolute-relative inputs.
 * - `hashURL` produces a stable numeric hash string for filenames (not crypto).
 */
export function joinURL(base: string, relative: string): string {
	// Handle cases where base or path might be empty or null
	if (!base && !relative) {
		return "";
	}
	if (!base) {
		return relative;
	}
	if (!relative) {
		return base;
	}

	// If path is an absolute URL, return it directly
	if (isAbsoluteURL(relative)) {
		return relative;
	}

	// Normalize base: remove trailing slashes
	const normalizedBase = base.replace(REMOVE_TRAILING_SLASHES_EXP, "");

	// Normalize path: remove leading slashes
	const normalizedPath = relative.replace(REMOVE_LEADING_SLASHES_EXP, "");

	// Handle absolute paths in 'path' after normalization
	if (relative.startsWith("/") && normalizedPath === "") {
		return normalizedBase + "/"; // If path was just slashes, append one
	}

	return `${normalizedBase}/${normalizedPath}`;
}

/**
 * Create a small non-cryptographic hash of a URL, used to generate unique filenames.
 */
export function hashURL(url: string) {
	let hash = url.split("").reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
	return Math.abs(hash).toString();
}

/**
 * Determine if a given string is an absolute URL (http(s), protocol-less //, data, file, etc.)
 */
export function isAbsoluteURL(u: string): boolean {
	return IS_ABSOLUTE_URL_EXP.test(u);
}

/**
 * Format time in seconds to HH:MM:SS or MM:SS format.
 * @param totalSeconds The total time in seconds.
 * @return Formatted time string.
 */
export function formatTime(totalSeconds = 0): string {
	if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);

	const pad = (num: number): string => String(num).padStart(2, "0");

	if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	return `${pad(minutes)}:${pad(seconds)}`;
}

/** Sanitize error or log message by removing escaped quotes, extra spaces, and trimming */
export const sanitizeMessage = (value: string): string => value.replace(/\\"/g, '"').replace(/"/g, '').replace(/\s+/g, ' ').trim();
