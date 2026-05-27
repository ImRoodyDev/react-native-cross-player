import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navbar } from '../components/Navbar';
import { PlatformBadges } from '../components/PlatformBadges';
import { ComponentPreview } from '../components/ComponentPreview';
import { MediaPlayground } from '../components/MediaPlayground';
import { publicAsset } from '../utils/publicAsset';

const STATS = [
	{ value: 'HLS', label: 'Streams' },
	{ value: 'VTT', label: 'Subtitles' },
	{ value: '4', label: 'Platforms' },
	{ value: 'TS', label: 'Typed API' },
];

const FEATURES = [
	{
		title: 'Player UI',
		description: 'VideoPlayer ships with a complete controls overlay for playback, subtitles, quality, source, rate, and fullscreen.',
		accent: '#ff3d7f',
	},
	{
		title: 'Controller API',
		description: 'Use usePlayerController when you want custom UI while keeping the hard playback logic in one place.',
		accent: '#06b6d4',
	},
	{
		title: 'Media playground',
		description: 'Docs include bundled MP4 and VTT examples plus a URL tester for remote media.',
		accent: '#f59e0b',
	},
];

const COMPONENT_CARDS = [
	{
		name: 'VideoPlayer',
		description: 'High-level player with built-in controls and callbacks.',
		href: '/components/video-player',
		color: '#ff3d7f',
	},
	{
		name: 'PlayerControls',
		description: 'Reusable overlay driven by player state and resources.',
		href: '/components/player-controls',
		color: '#06b6d4',
	},
	{
		name: 'usePlayerController',
		description: 'Hook for custom player surfaces and imperative controls.',
		href: '/components/use-player-controller',
		color: '#f59e0b',
	},
];

const SAMPLE_CODE = `import { VideoPlayer } from 'react-native-cross-player';

<VideoPlayer
  videoTitle="Tears of Steel"
  playerConfig={{
    videoSources: [{ uri: '/media/tos.mp4', title: 'Sample MP4' }],
    subtitleSources: [{ uri: '/media/tears-en.vtt', title: 'English' }],
  }}
/>;
`;

export default function HomeScreen() {
	const { width } = useWindowDimensions();
	const router = useRouter();
	const isWide = width >= 768;
	const isXWide = width >= 1100;
	const gridWidth = Math.min(width - (isWide ? 96 : 48), 1100);
	const cardWidth = isXWide ? Math.floor((gridWidth - 32) / 3) : isWide ? Math.floor((gridWidth - 16) / 2) : width - 48;
	const featureWidth = isXWide ? 320 : isWide ? Math.min((width - 96) / 2, 380) : width - 48;

	return (
		<SafeAreaView style={styles.root} edges={['top']}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={Platform.OS === 'web'}
				stickyHeaderIndices={[0]}
			>
				<View style={styles.navbarSticky}>
					<Navbar />
				</View>

				<View
					style={[
						styles.hero,
						{ paddingTop: isWide ? 96 : 60, paddingBottom: isWide ? 80 : 56 },
						Platform.OS === 'web'
							? ({
									backgroundImage:
										`linear-gradient(180deg, rgba(9,9,11,0.16) 0%, rgba(9,9,11,0.36) 52%, #09090b 100%), url("${publicAsset('img/background.png')}")`,
									backgroundPosition: 'center top',
									backgroundRepeat: 'no-repeat',
									backgroundSize: 'cover',
								} as any)
							: null,
					]}
				>
					<View style={styles.badge}>
						<View style={styles.badgeDot} />
						<Text style={styles.badgeText}>React Native + Web + HLS</Text>
					</View>

					<View style={[styles.heroIconWrap, { width: isWide ? 132 : 96, height: isWide ? 132 : 96 }]}>
						<Image source={{ uri: publicAsset('img/ctn-icon.png') }} style={styles.heroIconImage} resizeMode="contain" />
					</View>

					<Text
						numberOfLines={2}
						adjustsFontSizeToFit
						style={[styles.headline, { fontSize: isWide ? 68 : 38, lineHeight: isWide ? 80 : 48 }]}
					>
						React Native Cross Player
					</Text>

					<Text style={[styles.subhead, { maxWidth: isWide ? 620 : 340, fontSize: isWide ? 18 : 15 }]}>
						React Native and web video player wrapper with HLS, subtitles, proxy support, and a controller API for
						custom playback experiences.
					</Text>

					<View style={styles.badgesRow}>
						<PlatformBadges />
					</View>

					<View style={styles.installWrap}>
						<InstallSnippet />
					</View>

					<View style={styles.ctaRow}>
						<Pressable onPress={() => router.push('/components/video-player' as any)} style={({ pressed }) => [styles.ctaPrimary, pressed && styles.ctaPressed]}>
							<Text style={styles.ctaPrimaryText}>Read Docs</Text>
						</Pressable>
						<Pressable onPress={() => router.push('/components/media-playground' as any)} style={({ pressed }) => [styles.ctaSecondary, pressed && { opacity: 0.7 }]}>
							<Text style={styles.ctaSecondaryText}>Try Media</Text>
						</Pressable>
					</View>
				</View>

				<View style={styles.statsStrip}>
					{STATS.map((s, i) => (
						<React.Fragment key={s.label}>
							{i > 0 && <View style={styles.statsDivider} />}
							<View style={styles.statItem}>
								<Text style={styles.statValue}>{s.value}</Text>
								<Text style={styles.statLabel}>{s.label}</Text>
							</View>
						</React.Fragment>
					))}
				</View>

				<View style={[styles.section, { paddingHorizontal: isWide ? 48 : 24 }]}>
					<View style={[styles.grid, { gap: 14 }]}>
						{FEATURES.map((feature) => (
							<FeatureCard key={feature.title} {...feature} width={featureWidth} />
						))}
					</View>
				</View>

				<View style={[styles.section, { paddingHorizontal: isWide ? 48 : 24 }]}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Preview and code</Text>
						<Text style={styles.sectionSub}>The docs examples use the same Preview / Code switch throughout.</Text>
					</View>
					<View style={styles.previewWrap}>
						<ComponentPreview code={SAMPLE_CODE} language="tsx" label="VideoPlayerExample.tsx" height={520}>
							<MediaPlayground />
						</ComponentPreview>
					</View>
				</View>

				<View style={[styles.section, { paddingHorizontal: isWide ? 48 : 24 }]}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Components</Text>
						<Text style={styles.sectionSub}>Explore the player surface, controls overlay, and controller hook.</Text>
					</View>
					<View style={styles.componentsGrid}>
						{COMPONENT_CARDS.map((card) => (
							<ComponentCard key={card.name} {...card} cardWidth={cardWidth} onPress={() => router.push(card.href as any)} />
						))}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function InstallSnippet() {
	const [copied, setCopied] = useState(false);
	const cmd = 'npm install react-native-cross-player';

	const handleCopy = async () => {
		if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
			await navigator.clipboard.writeText(cmd);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<View style={styles.installBox}>
			<Text style={styles.installPrompt}>$</Text>
			<Text style={styles.installCmd} numberOfLines={1}>
				{cmd}
			</Text>
			<Pressable onPress={handleCopy} style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.6 }]}>
				<Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
			</Pressable>
		</View>
	);
}

function FeatureCard({ title, description, accent, width }: (typeof FEATURES)[0] & { width: number }) {
	return (
		<View style={[styles.featureCard, { width, borderTopColor: accent }]}>
			<Text style={styles.featureTitle}>{title}</Text>
			<Text style={styles.featureDesc}>{description}</Text>
		</View>
	);
}

function ComponentCard({
	name,
	description,
	color,
	cardWidth,
	onPress,
}: (typeof COMPONENT_CARDS)[0] & { cardWidth: number; onPress: () => void }) {
	return (
		<Pressable
			onPress={onPress}
			style={({ hovered, pressed }) => [
				styles.componentCard,
				{ width: cardWidth, borderColor: color + '45' },
				hovered && Platform.OS === 'web' ? styles.componentCardHovered : null,
				pressed && { opacity: 0.85 },
			]}
		>
			<View style={[styles.componentCardStrip, { backgroundColor: color }]} />
			<View style={styles.componentCardBody}>
				<Text style={styles.componentName}>{name}</Text>
				<Text style={styles.componentDesc}>{description}</Text>
				<Text style={[styles.componentArrow, { color }]}>View -&gt;</Text>
			</View>
		</Pressable>
	);
}

const mono = Platform.OS === 'web' ? 'Menlo, Consolas, monospace' : 'monospace';

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: '#09090b' },
	scroll: { flex: 1 },
	scrollContent: { flexGrow: 1, paddingBottom: 48 },
	navbarSticky: { backgroundColor: '#09090b', zIndex: 20 },
	hero: { alignItems: 'center', paddingHorizontal: 24 },
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 24,
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 99,
		borderWidth: 1,
		borderColor: '#3f3f46',
		backgroundColor: '#18181b',
	},
	badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
	badgeText: { color: '#a1a1aa', fontSize: 12, fontWeight: '500' },
	heroIconWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 18,
	},
	heroIconImage: { width: '100%', height: '100%' },
	headline: { color: '#ffffff', fontWeight: '800', textAlign: 'center', letterSpacing: 0, marginBottom: 20, maxWidth: '86%' },
	subhead: { color: '#f4f4f5', textAlign: 'center', lineHeight: 28, marginBottom: 28 },
	badgesRow: { marginBottom: 28 },
	installWrap: { width: '100%', maxWidth: 520, marginBottom: 32 },
	installBox: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#111113',
		gap: 10,
	},
	installPrompt: { color: '#4ade80', fontSize: 13, fontFamily: mono, fontWeight: '600' },
	installCmd: { flex: 1, color: '#d4d4d8', fontSize: 13, fontFamily: mono },
	copyBtn: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#3f3f46',
		backgroundColor: '#1c1c1f',
	},
	copyBtnText: { color: '#a1a1aa', fontSize: 11, fontWeight: '500' },
	ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
	ctaPrimary: {
		paddingHorizontal: 28,
		paddingVertical: 15,
		borderRadius: 10,
		backgroundColor: '#ff3d7f',
		borderWidth: 1,
		borderColor: 'rgba(255,184,77,0.34)',
	},
	ctaPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
	ctaPrimaryText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
	ctaSecondary: {
		paddingHorizontal: 28,
		paddingVertical: 15,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#3f3f46',
		backgroundColor: '#18181b',
	},
	ctaSecondaryText: { color: '#e4e4e7', fontWeight: '600', fontSize: 15 },
	statsStrip: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		flexWrap: 'wrap',
		marginTop: 16,
		marginBottom: 8,
		paddingVertical: 20,
		paddingHorizontal: 24,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#1f1f23',
		backgroundColor: '#0d0d10',
	},
	statsDivider: { width: 1, height: 32, backgroundColor: '#27272a', marginHorizontal: 24 },
	statItem: { alignItems: 'center', paddingHorizontal: 8 },
	statValue: { color: '#ffffff', fontSize: 26, fontWeight: '700', letterSpacing: 0 },
	statLabel: { color: '#52525b', fontSize: 11, fontWeight: '500', marginTop: 2, textTransform: 'uppercase' },
	section: { paddingVertical: 64 },
	sectionHeader: { alignItems: 'center', marginBottom: 40 },
	sectionTitle: { color: '#ffffff', fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 10, letterSpacing: 0 },
	sectionSub: { color: '#52525b', fontSize: 15, textAlign: 'center', lineHeight: 24, maxWidth: 480 },
	grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
	featureCard: {
		backgroundColor: '#111113',
		borderWidth: 1,
		borderTopWidth: 3,
		borderColor: '#1f1f23',
		borderRadius: 12,
		padding: 20,
		margin: 7,
	},
	featureTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 6 },
	featureDesc: { color: '#71717a', fontSize: 13, lineHeight: 20 },
	previewWrap: { width: '100%', maxWidth: 900, alignSelf: 'center' },
	componentsGrid: { width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
	componentCard: { backgroundColor: '#0f0f12', borderWidth: 1, borderRadius: 14, overflow: 'hidden', minHeight: 160, transitionDuration: '180ms' },
	componentCardHovered: { backgroundColor: '#141418', transform: [{ translateY: -3 }] },
	componentCardStrip: { height: 3, width: '100%' },
	componentCardBody: { padding: 18, flex: 1, justifyContent: 'space-between' },
	componentName: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 10 },
	componentDesc: { color: '#71717a', fontSize: 13, lineHeight: 20, marginBottom: 14 },
	componentArrow: { fontSize: 13, fontWeight: '600' },
});
