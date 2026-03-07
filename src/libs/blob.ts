import { Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import { CNPLogger } from "../utils/logger";
import { hashURL } from "../utils/helpers";

// Folder name for storing cached blob files on native platforms
const DIR_FOLDER = "CNP_Cache";
// Map of groupId -> array of blob URLs (web) created for that group
const BLOB_URL_MAP = new Map<string, string[]>();

/**
 * Read a local file's text content. Accepts file:// URIs or plain absolute paths.
 * Returns the file contents as UTF-8 string.
 */
export async function readLocalFileContent(pathOrUri: string): Promise<string> {
	// Normalize file URI to plain path
	const filePath = pathOrUri.startsWith("file://") ? pathOrUri.replace("file://", "") : pathOrUri;
	try {
		const content = await ReactNativeBlobUtil.fs.readFile(filePath, "utf8");
		CNPLogger.info(`Read local file content from ${filePath}`);
		return content;
	} catch (error) {
		CNPLogger.error(`Failed to read local file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}

/**
 * Create a playlist blob or native file and return a URL/URI.
 * - Web: returns a `blob:` object URL.
 * - Native: writes file to cache and returns a path (prefixed with `file://` on Android).
 */
export async function createM3U8File(content: string, fileName: string, group?: string): Promise<string> {
	if (!content || content.trim().length === 0) {
		throw new Error("Playlist content cannot be empty");
	}

	if (!fileName || !fileName.endsWith(".m3u8")) {
		throw new Error("Playlist filename must end with .m3u8");
	}

	if (Platform.OS === "web") {
		const blob = new Blob([content], { type: "application/vnd.apple.mpegurl" });
		CNPLogger.info(`Created playlist blob URL for ${fileName}`);
		const url = URL.createObjectURL(blob);
		cacheBlobURL(group, url);
		return url;
	} else {
		const { dirs } = ReactNativeBlobUtil.fs;
		const filePath = formatNativePATH(dirs.CacheDir, fileName, group);
		try {
			await ensureDirectoryExists(filePath);
			await ReactNativeBlobUtil.fs.writeFile(filePath, content, "utf8");
			CNPLogger.info(`Created playlist file at ${filePath}`);
			return Platform.OS === "android" ? `file://${filePath}` : filePath;
		} catch (error) {
			CNPLogger.error(`Failed to create playlist file at ${filePath}: ${error}`);
			throw new Error(`Failed to create playlist file: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}

/**
 * Create a VTT subtitle file/blob from already-fetched VTT content.
 * - `vttData` must already be in WebVTT format (caller is responsible for conversion)
 * - `fileName` optional (should end with .vtt)
 */
export async function createVTTFile(vttData: string, fileName?: string, group?: string, source?: string): Promise<string> {
	if (!vttData || vttData.trim().length === 0) {
		throw new Error("VTT content cannot be empty");
	}

	if (fileName && !fileName.endsWith(".vtt")) {
		throw new Error("Subtitle filename must end with .vtt");
	}

	if (Platform.OS === "web") {
		// High-performance Web Blob creation
		const blob = new Blob([vttData], { type: "text/vtt;charset=utf-8" });
		CNPLogger.info(`Created VTT blob URL`);
		const url = URL.createObjectURL(blob);
		cacheBlobURL(group, url);
		return url;
	} else {
		// Native Performance: Use Blob-Util for direct file writing
		const { dirs } = ReactNativeBlobUtil.fs;

		//  First subtitle
		// { label: "English", source: "https://site1.com/en.vtt" }
		//  Second subtitle
		// { label: "English", source: "https://site2.com/en-fixed.vtt" }
		//  Both create "English.vtt" - second overwrites first!
		// To avoid filename collisions we append a hash derived from `source` when available
		const baseName = (fileName && fileName.endsWith(".vtt") ? fileName.slice(0, -4) : fileName) || "subtitle";
		const suffix = source ? `_${hashURL(source)}` : "";
		const finalName = `${baseName}${suffix}.vtt`;
		const filePath = formatNativePATH(dirs.CacheDir, finalName, group);

		try {
			await ensureDirectoryExists(filePath);
			await ReactNativeBlobUtil.fs.writeFile(filePath, vttData, "utf8");
			CNPLogger.info(`Created VTT blob file at ${filePath}`);
			// On Android, some players need the 'file://' prefix
			return Platform.OS === "android" ? `file://${filePath}` : filePath;
		} catch (error) {
			throw new Error(`Failed to create VTT blob file: ${error}`);
		}
	}
}

/*
 * Remove a previously created blob object URL (web) or delete a cached file (native).
 * - If `pathlocation` is provided the single resource is removed; otherwise the cache
 *   directory is cleared (native only).
 */
export function clearBlobFiles(pathlocation: string | undefined): void {
	if (pathlocation) {
		if (Platform.OS === "web") {
			URL.revokeObjectURL(pathlocation);
			// Remove from any group lists that contain this url
			BLOB_URL_MAP.forEach((arr, key) => {
				const filtered = arr.filter((u) => u !== pathlocation);
				if (filtered.length === 0) BLOB_URL_MAP.delete(key);
				else BLOB_URL_MAP.set(key, filtered);
			});
			CNPLogger.info(`Revoked object URL at ${pathlocation}`);
		} else {
			const filePath = pathlocation.replace("file://", "");
			ReactNativeBlobUtil.fs.unlink(filePath).catch(() => {
				CNPLogger.warn(`Failed to clear blob file at ${filePath}`);
			});
		}
	} else {
		if (Platform.OS !== "web") {
			const { dirs } = ReactNativeBlobUtil.fs;
			const cachePath = `${dirs.CacheDir}/${DIR_FOLDER}`;

			// Recursively clear the entire CNP_Cache directory
			ReactNativeBlobUtil.fs.unlink(cachePath).catch(() => {
				CNPLogger.warn(`Failed to clear cache directory at ${cachePath}`);
			});
		}
	}
}

export function clearBlobGroup(group: string): void {
	const groupKey = group || "default";
	if (Platform.OS === "web") {
		const urls = BLOB_URL_MAP.get(groupKey) || [];
		urls.forEach((u) => {
			try {
				URL.revokeObjectURL(u);
			} catch (e) {
				/* ignore */
			}
		});
		BLOB_URL_MAP.delete(groupKey);
		CNPLogger.info(`Cleared blob group ${groupKey} with ${urls.length} urls`);
	} else {
		const { dirs } = ReactNativeBlobUtil.fs;
		const groupPath = formatNativePATH(dirs.CacheDir, "", group);
		ReactNativeBlobUtil.fs.unlink(groupPath).catch(() => {
			CNPLogger.warn(`Failed to clear blob group at ${groupPath}`);
		});
		// Also remove any tracked web urls for this group if present
		BLOB_URL_MAP.delete(groupKey);
	}
}

export function revokeAllBlobURLs(): void {
	if (Platform.OS === "web") {
		let total = 0;
		BLOB_URL_MAP.forEach((arr) => {
			arr.forEach((url) => {
				try {
					URL.revokeObjectURL(url);
				} catch (e) {
					/* ignore */
				}
			});
			total += arr.length;
		});
		BLOB_URL_MAP.clear();
		CNPLogger.info(`Revoked ${total} blob URLs`);
	}
}

/*  Ensure that the directory for the given file path exists (creates it if needed). */
async function ensureDirectoryExists(filePath: string): Promise<void> {
	const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
	const exists = await ReactNativeBlobUtil.fs.exists(dirPath);
	if (!exists) {
		await ReactNativeBlobUtil.fs.mkdir(dirPath);
	}
}

/*  Build a file path inside the platform cache for a given group and filename. */
function formatNativePATH(dir: string, filename: string, group?: string): string {
	if (group) {
		return `${dir}/${DIR_FOLDER}/${group}/${filename}`;
	} else {
		return `${dir}/${DIR_FOLDER}/default/${filename}`;
	}
}

/*  Cache a blob URL under a given group (web only). */
function cacheBlobURL(group: string | undefined, url: string): void {
	const groupKey = group || "default";
	const list = BLOB_URL_MAP.get(groupKey) || [];
	list.push(url);
	BLOB_URL_MAP.set(groupKey, list);
}
