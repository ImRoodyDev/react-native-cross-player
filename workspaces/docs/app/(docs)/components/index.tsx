import React from 'react';
import { Platform as RNPlatform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link } from 'expo-router';
import { PlatformBadges } from '../../../components/PlatformBadges';

type Platform = 'ios' | 'android' | 'web' | 'tv';

const COMPONENT_GROUPS = [
	{
		title: 'Player UI',
		description: 'Ready-made playback surfaces and controls.',
		accent: '#6366f1',
		components: [
			{
				name: 'VideoPlayer',
				href: '/components/video-player',
				description: 'High-level player that wires media state, video rendering, controls, subtitles, and callbacks.',
				platforms: ['ios', 'android', 'web', 'tv'] as Platform[],
			},
			{
				name: 'PlayerControls',
				href: '/components/player-controls',
				description: 'Control overlay for play/pause, source, subtitle, quality, audio, rate, volume, and fullscreen.',
				platforms: ['ios', 'android', 'web', 'tv'] as Platform[],
			},
		],
	},
	{
		title: 'Controller',
		description: 'Build custom playback UI while reusing the player logic.',
		accent: '#06b6d4',
		components: [
			{
				name: 'usePlayerController',
				href: '/components/use-player-controller',
				description: 'Hook that returns native video props, player state, discovered resources, and imperative controls.',
				platforms: ['ios', 'android', 'web', 'tv'] as Platform[],
			},
			{
				name: 'Media Playground',
				href: '/components/media-playground',
				description: 'Interactive examples for bundled media files, VTT subtitles, and remote video URLs.',
				platforms: ['web'] as Platform[],
			},
		],
	},
];

export default function ComponentsIndexPage() {
	const { width } = useWindowDimensions();
	const isWide = width >= 900;

	return (
		<ScrollView className="flex-1 bg-zinc-950" contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator>
			<View className="px-6 pt-10 pb-4" style={{ maxWidth: 768 }}>
				<Text className="text-4xl font-bold text-white mb-3">Components</Text>
				<Text className="text-zinc-400 text-base leading-7 mb-10">
					react-native-cross-player exposes a complete player UI and lower-level controller primitives for React Native,
					Web, and TV-friendly playback experiences.
				</Text>

				{COMPONENT_GROUPS.map((group) => (
					<View key={group.title} className="mb-12">
						<View className="flex-row items-center gap-3 mb-1">
							<View className="w-1 h-5 rounded-full" style={{ backgroundColor: group.accent }} />
							<Text className="text-xl font-bold text-white">{group.title}</Text>
						</View>
						<Text className="text-zinc-500 text-sm mb-5 pl-4">{group.description}</Text>

						<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
							{group.components.map((comp) => (
								<ComponentCard key={comp.name} {...comp} accent={group.accent} cardWidth={isWide ? 340 : width - 48} />
							))}
						</View>
					</View>
				))}
			</View>
		</ScrollView>
	);
}

function ComponentCard({
	name,
	href,
	description,
	platforms,
	accent,
	cardWidth,
}: {
	name: string;
	href: string;
	description: string;
	platforms: Platform[];
	accent: string;
	cardWidth: number;
}) {
	return (
		<Link href={href as any} asChild>
			<Pressable
				style={({ hovered, pressed }) => [
					styles.componentCard,
					{ width: cardWidth, borderColor: accent + '45' },
					hovered && RNPlatform.OS === 'web' ? styles.componentCardHovered : null,
					pressed ? styles.componentCardPressed : null,
				]}
			>
				<View className="flex-row items-start justify-between mb-3">
					<Text className="text-white font-semibold text-base">{name}</Text>
					<View className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: accent }} />
				</View>
				<Text className="text-zinc-500 text-sm leading-5 mb-4">{description}</Text>
				<View className="flex-row items-center justify-between">
					<PlatformBadges platforms={platforms} size="sm" />
					<Text style={{ color: accent }} className="text-xs font-medium">
						View -&gt;
					</Text>
				</View>
			</Pressable>
		</Link>
	);
}

const styles = StyleSheet.create({
	componentCard: {
		borderRadius: 12,
		borderWidth: 1,
		backgroundColor: '#18181b',
		padding: 16,
		minHeight: 172,
		transitionDuration: '180ms',
	},
	componentCardHovered: {
		backgroundColor: '#1f1f23',
		transform: [{ translateY: -3 }],
		shadowColor: '#6366f1',
		shadowOpacity: 0.24,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 10 },
	},
	componentCardPressed: {
		opacity: 0.82,
		transform: [{ scale: 0.99 }],
	},
});
