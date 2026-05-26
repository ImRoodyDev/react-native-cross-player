import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { publicAsset } from '../utils/publicAsset';

const SAMPLE_VIDEO = publicAsset('media/tos.mp4');
const SAMPLE_POSTER = publicAsset('img/background.png');
const EN_SUBTITLES = publicAsset('media/tears-en.vtt');
const FR_SUBTITLES = publicAsset('media/tears-fr.vtt');

export function MediaPlayground() {
	const videoRef = useRef<any>(null);
	const [activeUrl, setActiveUrl] = useState(SAMPLE_VIDEO);
	const [draftUrl, setDraftUrl] = useState('');
	const [subtitle, setSubtitle] = useState<'en' | 'fr' | 'off'>('en');

	const videoElement = useMemo(() => {
		if (Platform.OS !== 'web') {
			return (
				<View style={styles.nativeFallback}>
					<Text style={styles.nativeFallbackText}>Interactive HTML video preview is available on web.</Text>
				</View>
			);
		}

		const tracks =
			subtitle === 'off'
				? []
				: [
						React.createElement('track' as any, {
							key: subtitle,
							kind: 'subtitles',
							src: subtitle === 'en' ? EN_SUBTITLES : FR_SUBTITLES,
							srcLang: subtitle,
							label: subtitle === 'en' ? 'English' : 'French',
							default: true,
						}),
					];

		return React.createElement(
			'video' as any,
			{
				ref: videoRef,
				src: activeUrl,
				poster: SAMPLE_POSTER,
				controls: true,
				crossOrigin: 'anonymous',
				playsInline: true,
				style: {
					width: '100%',
					aspectRatio: '16 / 9',
					background: '#09090b',
					borderRadius: 10,
					display: 'block',
				},
			},
			...tracks,
		);
	}, [activeUrl, subtitle]);

	const loadUrl = () => {
		const next = draftUrl.trim();
		if (next.length > 0) setActiveUrl(next);
	};

	return (
		<View style={styles.wrap}>
			<View style={styles.videoWrap}>{videoElement}</View>

			<View style={styles.controls}>
				<View style={styles.buttonRow}>
					<ActionButton label="Play" onPress={() => videoRef.current?.play?.()} />
					<ActionButton label="Pause" onPress={() => videoRef.current?.pause?.()} />
					<ActionButton
						label="-10s"
						onPress={() => {
							if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
						}}
					/>
					<ActionButton
						label="+10s"
						onPress={() => {
							if (videoRef.current) videoRef.current.currentTime += 10;
						}}
					/>
				</View>

				<View style={styles.buttonRow}>
					<ActionButton label="Sample" onPress={() => setActiveUrl(SAMPLE_VIDEO)} active={activeUrl === SAMPLE_VIDEO} />
					<ActionButton label="English VTT" onPress={() => setSubtitle('en')} active={subtitle === 'en'} />
					<ActionButton label="French VTT" onPress={() => setSubtitle('fr')} active={subtitle === 'fr'} />
					<ActionButton label="Captions off" onPress={() => setSubtitle('off')} active={subtitle === 'off'} />
				</View>

				<View style={styles.urlRow}>
					<TextInput
						value={draftUrl}
						onChangeText={setDraftUrl}
						placeholder="Paste an MP4, WebM, or HLS URL"
						placeholderTextColor="#52525b"
						autoCapitalize="none"
						autoCorrect={false}
						style={styles.input}
					/>
					<Pressable onPress={loadUrl} style={({ pressed }) => [styles.loadButton, pressed && { opacity: 0.7 }]}>
						<Text style={styles.loadButtonText}>Load URL</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

function ActionButton({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed, hovered }) => [
				styles.action,
				active ? styles.actionActive : null,
				hovered && Platform.OS === 'web' && !active ? styles.actionHovered : null,
				pressed && { opacity: 0.7 },
			]}
		>
			<Text style={[styles.actionText, active && styles.actionTextActive]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	wrap: {
		width: '100%',
		gap: 14,
	},
	videoWrap: {
		width: '100%',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#050507',
		padding: 8,
	},
	nativeFallback: {
		aspectRatio: 16 / 9,
		alignItems: 'center',
		justifyContent: 'center',
	},
	nativeFallbackText: {
		color: '#71717a',
		fontSize: 13,
	},
	controls: {
		width: '100%',
		gap: 10,
	},
	buttonRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'center',
	},
	action: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#111113',
		transitionDuration: '140ms',
	},
	actionHovered: {
		borderColor: '#52525b',
		backgroundColor: '#18181b',
	},
	actionActive: {
		borderColor: '#6366f1',
		backgroundColor: 'rgba(99,102,241,0.12)',
	},
	actionText: {
		color: '#a1a1aa',
		fontSize: 12,
		fontWeight: '600',
	},
	actionTextActive: {
		color: '#a5b4fc',
	},
	urlRow: {
		flexDirection: 'row',
		gap: 8,
	},
	input: {
		flex: 1,
		minHeight: 40,
		borderWidth: 1,
		borderColor: '#27272a',
		borderRadius: 8,
		paddingHorizontal: 12,
		color: '#e4e4e7',
		backgroundColor: '#0d0d10',
		fontSize: 13,
	},
	loadButton: {
		minHeight: 40,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 14,
		backgroundColor: '#6366f1',
	},
	loadButtonText: {
		color: '#ffffff',
		fontWeight: '700',
		fontSize: 12,
	},
});
