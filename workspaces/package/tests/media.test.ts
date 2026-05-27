jest.mock("../src/libs/network");
jest.mock("../src/utils/detectors");

import { createM3U8Source, createMasterM3U8Raw } from "../src/libs/media";
import { fetchSource } from "../src/libs/network";
import { detectSourceType } from "../src/utils/detectors";
import { M3U8AudioTrack, M3U8BlobOptions, SourceTypes, VideoSource } from "../src/types/media";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CNPLogger } from "../src/utils/logger";
import { Platform } from "react-native";

// Silence logger for tests
CNPLogger.enableDebugging(true);

const mockedFetchSource = fetchSource as jest.MockedFunction<typeof fetchSource>;
// We'll use the real `createM3U8File` implementation (jest config provides blob util mocks)
const mockedDetectSourceType = detectSourceType as jest.MockedFunction<typeof detectSourceType>;

describe("createM3U8File", () => {
	beforeAll(async () => {
		Platform.OS = "android"; // Force native platform behavior for tests
	});

	beforeEach(() => {
		jest.resetAllMocks();
		mockedDetectSourceType.mockReturnValue(SourceTypes.URL);
	});

	test("rewrites media playlist URIs to absolute and creates playlist file", async () => {
		const video: VideoSource = {
			playerId: "player_vid1",
			id: "vid1",
			label: "Video 1",
			format: "m3u8",
			source: "https://example.com/dir/dir2/media.m3u8",
			options: {} as any
		};

		mockedFetchSource.mockImplementation(async (url: string) => {
			const mediaText = await readFile(join(__dirname, "inputs", "media_relative.m3u8"), "utf8");
			if (url === video.source) return { ok: true, text: async () => mediaText } as any;
			throw new Error("unexpected url");
		});

		const result = await createM3U8Source(video, (u) => u);

		// The result should be a native file URI on Android
		expect(result).toEqual(expect.stringContaining("vid1.m3u8"));

		const filePath = result.startsWith("file://") ? result.replace("file://", "") : result;
		const produced = await readFile(filePath, "utf8");
		expect(produced).toContain("https://example.com/dir/dir2/segment1.ts");
	});

	test("processes master playlist and replaces variant URIs with created files", async () => {
		const video = {
			id: "master_with_playlist",
			playerId: "player_master",
			label: "Master Playlist",
			format: "m3u8",
			source: "https://example.com/master.m3u8",
			options: {}
		} as VideoSource;

		// Fetch mock to return appropriate playlist contents
		mockedFetchSource.mockImplementation(async (url: string) => {
			const masterText = await readFile(join(__dirname, "inputs", "master_relative.m3u8"), "utf8");
			const variant1Text = await readFile(join(__dirname, "inputs", "variant1.m3u8"), "utf8");
			const variant2Text = await readFile(join(__dirname, "inputs", "variant2.m3u8"), "utf8");
			const variant3Text = await readFile(join(__dirname, "inputs", "variant3.m3u8"), "utf8");

			if (url === video.source) return { ok: true, text: async () => masterText } as any;
			if (url === new URL("variant1.m3u8", video.source).toString()) return { ok: true, text: async () => variant1Text } as any;
			if (url === new URL("variant2.m3u8", video.source).toString()) return { ok: true, text: async () => variant2Text } as any;
			if (url === new URL("variant3.m3u8", video.source).toString()) return { ok: true, text: async () => variant3Text } as any;
			throw new Error(`unexpected fetch ${url}`);
		});

		const resultSource = await createM3U8Source(video, (url) => url);
		expect(resultSource).toEqual(expect.stringContaining("master_with_playlist.m3u8"));

		const masterPath = resultSource.startsWith("file://") ? resultSource.replace("file://", "") : resultSource;
		const masterContent = await readFile(masterPath, "utf8");
		// Master playlist should reference the created variant files
		expect(masterContent).toContain("master_with_playlist_variant_0.m3u8");
		expect(masterContent).toContain("master_with_playlist_variant_1.m3u8");
		expect(masterContent).toContain("master_with_playlist_variant_2.m3u8");
	});

	test("applies proxy to URIs when forceProxy is enabled", async () => {
		// Video source with forceProxy option
		const video = {
			id: "proxy1",
			playerId: "player_proxy1",
			label: "Proxy Video",
			format: "m3u8",
			source: "https://example.com/media.m3u8",
			options: {
				useProxy: true,
				overrideProxyURL: "http://proxy.example.com/",
				headers: { "X-Test": "value" } as any
			}
		} as VideoSource;
		const proxyResolver = (url: string, proxyURL: string, _headers: any) => `${proxyURL}${encodeURIComponent(url)}`;

		// Fetch mock to return appropriate playlist contents
		mockedFetchSource.mockImplementation(async (url: string) => {
			const mediaText = await readFile(join(__dirname, "inputs", "media_relative.m3u8"), "utf8");
			if (url === video.source) {
				return { ok: true, text: async () => mediaText } as any;
			}
			throw new Error("unexpected url");
		});

		const result = await createM3U8Source(video, proxyResolver);
		expect(result).toEqual(expect.stringContaining("proxy1.m3u8"));

		const filePath = result.startsWith("file://") ? result.replace("file://", "") : result;
		const produced = await readFile(filePath, "utf8");
		expect(produced).toContain("http://proxy.example.com/https%3A%2F%2Fexample.com%2Fsegment1.ts");
	});

	test("handles absolute URIs correctly", async () => {
		const video = {
			id: "abs1",
			playerId: "player_abs1",
			label: "Absolute Video",
			format: "m3u8",
			source: "https://example.com/media.m3u8",
			options: {}
		} as VideoSource;

		mockedFetchSource.mockImplementation(async (url: string) => {
			const mediaText = await readFile(join(__dirname, "inputs", "media_absolute.m3u8"), "utf8");
			if (url === video.source) {
				return { ok: true, text: async () => mediaText } as any;
			}
			throw new Error("unexpected url");
		});

		const result = await createM3U8Source(video, (u) => u);
		expect(result).toEqual(expect.stringContaining("abs1.m3u8"));

		const filePath = result.startsWith("file://") ? result.replace("file://", "") : result;
		const produced = await readFile(filePath, "utf8");
		expect(produced).toContain("https://example.com/segment1.ts");
	});

	test("processes master playlist with audio tracks and rewrites audio URIs", async () => {
		const video = {
			id: "master_audio",
			playerId: "player_master_audio",
			label: "Master With Audio",
			format: "m3u8",
			source: "https://example.com/master.m3u8",
			options: {}
		} as VideoSource;

		mockedFetchSource.mockImplementation(async (url: string) => {
			const masterText = await readFile(join(__dirname, "inputs", "master_with_audio.m3u8"), "utf8");
			const variant1Text = await readFile(join(__dirname, "inputs", "variant1.m3u8"), "utf8");
			const variant2Text = await readFile(join(__dirname, "inputs", "variant2.m3u8"), "utf8");
			const audioEnText = await readFile(join(__dirname, "inputs", "audio_en.m3u8"), "utf8");
			const audioEsText = await readFile(join(__dirname, "inputs", "audio_es.m3u8"), "utf8");

			if (url === video.source) return { ok: true, text: async () => masterText } as any;
			if (url === new URL("variant1.m3u8", video.source).toString()) return { ok: true, text: async () => variant1Text } as any;
			if (url === new URL("variant2.m3u8", video.source).toString()) return { ok: true, text: async () => variant2Text } as any;
			if (url === new URL("audio_en.m3u8", video.source).toString()) return { ok: true, text: async () => audioEnText } as any;
			if (url === new URL("audio_es.m3u8", video.source).toString()) return { ok: true, text: async () => audioEsText } as any;
			throw new Error(`unexpected fetch ${url}`);
		});

		const resultSource = await createM3U8Source(video, (url) => url);
		expect(resultSource).toEqual(expect.stringContaining("master_audio.m3u8"));

		// Read the final master playlist
		const masterPath = resultSource.startsWith("file://") ? resultSource.replace("file://", "") : resultSource;
		const masterContent = await readFile(masterPath, "utf8");

		// Should contain rewritten variant files
		expect(masterContent).toContain("master_audio_variant_0.m3u8");
		expect(masterContent).toContain("master_audio_variant_1.m3u8");

		// Should contain rewritten audio track files
		expect(masterContent).toContain("master_audio_audio_0.m3u8");
		expect(masterContent).toContain("master_audio_audio_1.m3u8");

		// Audio track files should have resolved segment URIs
		const audioFile0 = masterContent.match(/URI="([^"]*master_audio_audio_0\.m3u8[^"]*)"/)?.[1];
		expect(audioFile0).toBeTruthy();
		const audioPath = audioFile0!.startsWith("file://") ? audioFile0!.replace("file://", "") : audioFile0!;
		const audioContent = await readFile(audioPath, "utf8");
		expect(audioContent).toContain("https://example.com/audio_en_seg1.aac");
		expect(audioContent).toContain("https://example.com/audio_en_seg2.aac");
	});

	test("applies proxy to audio track URIs when useProxy is enabled", async () => {
		const video = {
			id: "proxy_audio",
			playerId: "player_proxy_audio",
			label: "Proxy Audio",
			format: "m3u8",
			source: "https://example.com/master.m3u8",
			options: {
				useProxy: true,
				overrideProxyURL: "http://proxy.example.com/",
				headers: { "X-Test": "value" } as any
			}
		} as VideoSource;
		const proxyResolver = (url: string, proxyURL: string, _headers: any) => `${proxyURL}${encodeURIComponent(url)}`;

		mockedFetchSource.mockImplementation(async (url: string) => {
			const masterText = await readFile(join(__dirname, "inputs", "master_with_audio.m3u8"), "utf8");
			const variant1Text = await readFile(join(__dirname, "inputs", "variant1.m3u8"), "utf8");
			const variant2Text = await readFile(join(__dirname, "inputs", "variant2.m3u8"), "utf8");
			const audioEnText = await readFile(join(__dirname, "inputs", "audio_en.m3u8"), "utf8");
			const audioEsText = await readFile(join(__dirname, "inputs", "audio_es.m3u8"), "utf8");

			if (url === video.source) return { ok: true, text: async () => masterText } as any;
			if (url === new URL("variant1.m3u8", video.source).toString()) return { ok: true, text: async () => variant1Text } as any;
			if (url === new URL("variant2.m3u8", video.source).toString()) return { ok: true, text: async () => variant2Text } as any;
			if (url === new URL("audio_en.m3u8", video.source).toString()) return { ok: true, text: async () => audioEnText } as any;
			if (url === new URL("audio_es.m3u8", video.source).toString()) return { ok: true, text: async () => audioEsText } as any;
			throw new Error(`unexpected fetch ${url}`);
		});

		const result = await createM3U8Source(video, proxyResolver);
		const masterPath = result.startsWith("file://") ? result.replace("file://", "") : result;
		const masterContent = await readFile(masterPath, "utf8");

		// Audio track files should have proxied segment URIs
		const audioFile0 = masterContent.match(/URI="([^"]*proxy_audio_audio_0\.m3u8[^"]*)"/)?.[1];
		expect(audioFile0).toBeTruthy();
		const audioPath = audioFile0!.startsWith("file://") ? audioFile0!.replace("file://", "") : audioFile0!;
		const audioContent = await readFile(audioPath, "utf8");
		expect(audioContent).toContain("http://proxy.example.com/https%3A%2F%2Fexample.com%2Faudio_en_seg1.aac");
	});
});

describe("createMasterM3U8Raw", () => {
	test("generates master playlist with audio tracks", () => {
		const options: M3U8BlobOptions = {
			playlists: [
				{ source: "variant1.m3u8", bandwidth: 800000, resolution: "360p" },
				{ source: "variant2.m3u8", bandwidth: 3000000, resolution: "720p" }
			],
			subtitles: [],
			audioTracks: [
				{ source: "audio_en.m3u8", langISO: "en", label: "English", default: true },
				{ source: "audio_es.m3u8", langISO: "es", label: "Spanish", default: false }
			],
			embedAudioTracks: true
		};

		const result = createMasterM3U8Raw(options);

		// Should contain audio EXT-X-MEDIA entries
		expect(result).toContain("#EXT-X-MEDIA:TYPE=AUDIO");
		expect(result).toContain('NAME="English"');
		expect(result).toContain('LANGUAGE="en"');
		expect(result).toContain("DEFAULT=YES");
		expect(result).toContain('URI="audio_en.m3u8"');
		expect(result).toContain('NAME="Spanish"');
		expect(result).toContain('LANGUAGE="es"');
		expect(result).toContain("DEFAULT=NO");
		expect(result).toContain('URI="audio_es.m3u8"');

		// Stream-inf should reference the audio group
		expect(result).toContain('AUDIO="audio"');
	});

	test("generates master playlist without audio when embedAudioTracks is false", () => {
		const options: M3U8BlobOptions = {
			playlists: [{ source: "variant1.m3u8", bandwidth: 800000 }],
			subtitles: [],
			audioTracks: [{ source: "audio_en.m3u8", langISO: "en", label: "English", default: true }],
			embedAudioTracks: false
		};

		const result = createMasterM3U8Raw(options);

		// Should NOT contain audio entries
		expect(result).not.toContain("TYPE=AUDIO");
		expect(result).not.toContain('AUDIO="audio"');
	});

	test("generates master playlist with both subtitles and audio tracks", () => {
		const options: M3U8BlobOptions = {
			playlists: [{ source: "variant1.m3u8", bandwidth: 800000, codecs: "avc1.42e00a" }],
			subtitles: [{ source: "subs_en.vtt", langISO: "en", label: "English", default: true, type: "vtt" }],
			audioTracks: [{ source: "audio_en.m3u8", langISO: "en", label: "English", default: true, groupId: "main-audio" }],
			embedSubtitles: true,
			embedAudioTracks: true
		};

		const result = createMasterM3U8Raw(options);

		// Should have both subtitle and audio EXT-X-MEDIA entries
		expect(result).toContain("TYPE=SUBTITLES");
		expect(result).toContain("TYPE=AUDIO");
		expect(result).toContain('GROUP-ID="main-audio"');

		// Stream-inf should reference both groups
		expect(result).toContain('SUBTITLES="subs"');
		expect(result).toContain('AUDIO="audio"');
		expect(result).toContain('CODECS="avc1.42e00a"');
	});

	test("includes CHANNELS attribute when provided on audio track", () => {
		const options: M3U8BlobOptions = {
			playlists: [{ source: "variant1.m3u8", bandwidth: 800000 }],
			subtitles: [],
			audioTracks: [{ source: "audio_51.m3u8", langISO: "en", label: "Surround", default: true, channels: "6" }],
			embedAudioTracks: true
		};

		const result = createMasterM3U8Raw(options);
		expect(result).toContain('CHANNELS="6"');
	});
});
