import { SourceTypes, SubtitleTypes, TextEncoding } from "../types/media";

// For performance issue save regexps compiled
const SRT_PATTERN = /^\d+\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/m;
const VTT_PATTERN = /^WEBVTT/m;
const BOM_UTF8 = "\uFEFF";
const ISO88591_PATTERN = /[À-ÿ]/;
const WINDOWS1256_PATTERN = /[ء-ي]/;

/*
 * Detector utilities
 * - Small heuristics to guess subtitle encoding and type.
 * - Keep these lightweight: they are fallbacks when servers omit charset/type.
 */

/**
 * Guess subtitle text encoding from content.
 * - Looks for BOM and language-specific character ranges.
 */
export function detectSubtitleEncoding(content: string): TextEncoding {
	// Simple heuristic: Check for common byte order marks (BOM) or character patterns
	if (content.startsWith(BOM_UTF8)) {
		return "utf-8";
	}
	// Check for characters common in ISO-8859-1 but not in UTF-8
	if (ISO88591_PATTERN.test(content)) {
		return "iso-8859-1";
	}

	// Check for characters common in Windows-1256 (Arabic)
	if (WINDOWS1256_PATTERN.test(content)) {
		return "windows-1256";
	}
	return "utf-8"; // Default to UTF-8 if unsure
}

/**
 * Detect whether content is an SRT or WebVTT file.
 * - Returns `"srt"`, `"vtt"` or `null` if unknown.
 */
export function detectSubtitleType(content: string): SubtitleTypes | null {
	const trimmed = content.trim();

	// Check VTT first (more specific)
	if (VTT_PATTERN.test(trimmed)) {
		return "vtt";
	}

	// Check SRT pattern
	if (SRT_PATTERN.test(trimmed)) {
		return "srt";
	}

	return null;
}

/**
 * Detect whether a source string is a `blob:`, native `file://` path or a URL.
 */
export function detectSourceType(source: string): SourceTypes {
	if (source.startsWith("blob:")) {
		return SourceTypes.BLOB;
	} else if (source.startsWith("file://")) {
		return SourceTypes.NATIVE_PATH;
	} else {
		return SourceTypes.URL;
	}
}
