import React from 'react';
import { Text, View } from 'react-native';

type Platform = 'ios' | 'android' | 'web' | 'tv';

const BADGE_STYLES: Record<Platform, { bg: string; text: string; label: string }> = {
	ios: { bg: 'bg-sky-500/20', text: 'text-sky-300', label: 'iOS' },
	android: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Android' },
	web: { bg: 'bg-violet-500/20', text: 'text-violet-300', label: 'Web' },
	tv: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'TV' },
};

type Props = {
	platforms?: Platform[];
	size?: 'sm' | 'md';
};

export function PlatformBadges({ platforms = ['ios', 'android', 'web', 'tv'], size = 'md' }: Props) {
	return (
		<View className="flex-row flex-wrap gap-2">
			{platforms.map((p) => {
				const s = BADGE_STYLES[p];
				return (
					<View key={p} className={`rounded-full border px-2.5 py-0.5 ${s.bg} border-current`}>
						<Text className={`font-medium ${s.text} ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>{s.label}</Text>
					</View>
				);
			})}
		</View>
	);
}
