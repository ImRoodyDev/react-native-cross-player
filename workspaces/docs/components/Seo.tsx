import React from 'react';
import Head from 'expo-router/head';
import { usePathname } from 'expo-router';

/**
 * Absolute, canonical origin the docs are served from on GitHub Pages.
 * Used for canonical links and Open Graph / Twitter absolute URLs (crawlers
 * require absolute URLs for images and og:url).
 */
export const SITE_URL = 'https://imroodydev.github.io/react-native-cross-player';
export const SITE_NAME = 'React Native Cross Player';
export const OG_IMAGE = `${SITE_URL}/img/ctn-square.png`;

const DEFAULT_DESCRIPTION =
	'React Native + Web video player wrapper with HLS streaming, VTT subtitles, proxy support, and a controller API for building custom playback UIs.';

type Meta = { title: string; description: string };

/**
 * Per-route SEO metadata, keyed by the router pathname (base-url stripped,
 * as returned by usePathname). Keep in sync with data/navigation.ts.
 */
export const ROUTE_META: Record<string, Meta> = {
	'/': {
		title: 'React Native Cross Player — Video Player for React Native & Web',
		description: DEFAULT_DESCRIPTION,
	},
	'/installation': {
		title: 'Installation | React Native Cross Player',
		description:
			'Install react-native-cross-player and its peer dependencies for Expo, React Native CLI, and web across iOS, Android, and browsers.',
	},
	'/quick-start': {
		title: 'Quick Start | React Native Cross Player',
		description:
			'Get a VideoPlayer running in minutes — configure video sources, subtitles, and playback in React Native and on the web.',
	},
	'/examples': {
		title: 'Examples | React Native Cross Player',
		description:
			'Live examples of the react-native-cross-player VideoPlayer: HLS streams, VTT subtitles, custom sources, and the media playground.',
	},
	'/components': {
		title: 'Components | React Native Cross Player',
		description:
			'Overview of react-native-cross-player components: VideoPlayer, PlayerControls, and the usePlayerController hook.',
	},
	'/components/video-player': {
		title: 'VideoPlayer | React Native Cross Player',
		description:
			'VideoPlayer component API — a high-level cross-platform player with built-in controls, subtitles, quality, source, and fullscreen.',
	},
	'/components/player-controls': {
		title: 'PlayerControls | React Native Cross Player',
		description:
			'PlayerControls — a reusable controls overlay driven by player state for building custom video player UIs.',
	},
	'/components/use-player-controller': {
		title: 'usePlayerController | React Native Cross Player',
		description:
			'usePlayerController hook — imperative playback control and player state for custom React Native and web video UIs.',
	},
	'/components/media-playground': {
		title: 'Media Playground | React Native Cross Player',
		description:
			'Interactive media playground for react-native-cross-player: test remote MP4/HLS sources and VTT subtitles in the browser.',
	},
	'/guides/build-your-own-player': {
		title: 'Build Your Own Player | React Native Cross Player',
		description:
			'Guide: build a custom video player UI with usePlayerController while keeping the hard playback logic in one place.',
	},
	'/guides/performance': {
		title: 'Performance | React Native Cross Player',
		description:
			'Performance guide for react-native-cross-player — optimize rendering, buffering, and playback across platforms.',
	},
	'/api': {
		title: 'API Overview | React Native Cross Player',
		description:
			'API overview for react-native-cross-player — components, hooks, media helpers, proxy helpers, types, and utilities.',
	},
	'/reference/media-helpers': {
		title: 'Media Helpers | React Native Cross Player',
		description: 'Media helper functions for building video and subtitle sources in react-native-cross-player.',
	},
	'/reference/proxy-helpers': {
		title: 'Proxy Helpers | React Native Cross Player',
		description:
			'Proxy helper utilities for routing media and HLS requests through a proxy in react-native-cross-player.',
	},
	'/reference/types-utilities': {
		title: 'Types & Utilities | React Native Cross Player',
		description: 'TypeScript types and utilities exported by react-native-cross-player for typed player configuration.',
	},
};

function normalizePath(pathname: string | null | undefined): string {
	if (!pathname) return '/';
	const trimmed = pathname.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
}

export type SeoProps = {
	/** Override the resolved title. */
	title?: string;
	/** Override the resolved description. */
	description?: string;
	/** Override the route used to resolve metadata (defaults to the current pathname). */
	path?: string;
};

/**
 * Emits per-page SEO tags (title, description, canonical, Open Graph, Twitter).
 * Resolves metadata from ROUTE_META using the current route, with optional
 * per-instance overrides. Rendered via expo-router/head so it is baked into the
 * static HTML export that crawlers read.
 */
export function Seo({ title, description, path }: SeoProps) {
	const pathname = usePathname();
	const key = normalizePath(path ?? pathname);
	const meta = ROUTE_META[key];

	const finalTitle = title ?? meta?.title ?? SITE_NAME;
	const finalDescription = description ?? meta?.description ?? DEFAULT_DESCRIPTION;
	const canonical = `${SITE_URL}${key === '/' ? '/' : key}`;

	return (
		<Head>
			<title>{finalTitle}</title>
			<meta name="description" content={finalDescription} />
			<link rel="canonical" href={canonical} />

			<meta property="og:type" content="website" />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:title" content={finalTitle} />
			<meta property="og:description" content={finalDescription} />
			<meta property="og:url" content={canonical} />
			<meta property="og:image" content={OG_IMAGE} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={finalTitle} />
			<meta name="twitter:description" content={finalDescription} />
			<meta name="twitter:image" content={OG_IMAGE} />
		</Head>
	);
}
