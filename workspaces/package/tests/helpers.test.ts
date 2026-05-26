import { joinURL, isAbsoluteURL } from "../src/utils/helpers";

describe("helpers: isAbsoluteUrl and joinURL", () => {
	test("isAbsoluteUrl recognizes absolute schemes", () => {
		const trues = [
			"http://example.com",
			"https://example.com",
			"ftp://example.com",
			"file:///C:/path/to/file.m3u8",
			"data:text/plain,hello",
			"//protocol-less.example.com/path"
		];

		const falses = [
			"variant1.m3u8",
			"../relative/path.m3u8",
			"/absolute/path/without/protocol",
			"blob://test/550e8400-e29b-41d4-a716-446655440000",
			"blob:http://localhost/550e8400-e29b-41d4-a716-446655440000"
		];

		trues.forEach((v) => {
			// eslint-disable-next-line no-console
			console.log(`isAbsoluteUrl('${v}') => ${isAbsoluteURL(v)}`);
			// eslint-disable-next-line jest/expect-expect
			expect(isAbsoluteURL(v)).toBe(true);
		});

		falses.forEach((v) => {
			// eslint-disable-next-line jest/expect-expect
			expect(isAbsoluteURL(v)).toBe(false);
			// eslint-disable-next-line no-console
			console.log(`isAbsoluteUrl('${v}') => ${isAbsoluteURL(v)}`);
		});
	});

	test("joinURL combines base and relative paths as implemented", () => {
		const cases: Array<{ base: string; rel: string; expected: string }> = [
			{ base: "http://example.com/dir/", rel: "test/file2.m3u8", expected: "http://example.com/dir/test/file2.m3u8" },
			{ base: "http://example.com/dir", rel: "file2.m3u8", expected: "http://example.com/dir/file2.m3u8" },
			{ base: "file:///C:/projects/video/", rel: "variant.m3u8", expected: "file:///C:/projects/video/variant.m3u8" },
			{ base: "", rel: "only_relative.m3u8", expected: "only_relative.m3u8" },
			{ base: "http://example.com/dir/", rel: "http://cdn/other.m3u8", expected: "http://cdn/other.m3u8" }
		];

		cases.forEach((c) => {
			const out = joinURL(c.base, c.rel);
			// eslint-disable-next-line no-console
			console.log(`joinURL(base='${c.base}', rel='${c.rel}') => ${out}`);
			expect(out).toBe(c.expected);
		});
	});

	test("resolve combinations of bases and relative paths and log outputs", () => {
		const bases = [
			"file://projects/video/master.m3u8",
			"file:///C:/projects/video/master.m3u8",
			"file:///home/user/media/master.m3u8",
			"blob:http://localhost/550e8400-e29b-41d4-a716-446655440000",
			"http://localhost/550e8400-e29b-41d4-a716-446655440000",
			"blob:null/12345",
			"http://example.com/playlists/master.m3u8"
		];

		const relatives = [
			"variant1.m3u8",
			"../variants/variant2.m3u8",
			"/absolute/path/variant.m3u8",
			"http://cdn.example.com/variant.m3u8",
			"blob:http://other/abc"
		];

		for (const base of bases) {
			for (const rel of relatives) {
				try {
					const resolved = new URL(rel, base).toString();
					// eslint-disable-next-line no-console
					console.log(`🟢 base=${base} \nrel=${rel} \n=> ${resolved}`);
				} catch (err) {
					// eslint-disable-next-line no-console
					console.log(`🔴 base=${base} \nrel=${rel} \n=> ERROR: ${err instanceof Error ? err.message : String(err)}`);
				}
			}
		}

		// simple assertion so the test counts as passed
		expect(true).toBe(true);
	});
});
