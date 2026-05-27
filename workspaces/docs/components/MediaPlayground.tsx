import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { VideoPlayer, type VideoPlayerRef, type SubtitleSource, type VideoSource } from 'react-native-cross-player';
import { publicAsset } from '../utils/publicAsset';

export const SAMPLE_VIDEO_URL = 'https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4';

const EN_SUBTITLES = publicAsset('media/tears-en.vtt');
const FR_SUBTITLES = publicAsset('media/tears-fr.vtt');

export function MediaPlayground({ captions = true }: { captions?: boolean }) {
	const playerRef = useRef<VideoPlayerRef>(null);
	const [activeUrl, setActiveUrl] = useState(SAMPLE_VIDEO_URL);
	const [draftUrl, setDraftUrl] = useState('');
	const [playerVersion, setPlayerVersion] = useState(0);

	const playerId = `docs-player-${playerVersion}`;
	const mediaLabel = activeUrl === SAMPLE_VIDEO_URL ? 'Tears of Steel' : 'Custom URL';

	const videoSources = useMemo<VideoSource[]>(
		() => [
			{
				id: 'primary',
				playerId,
				label: mediaLabel,
				source: activeUrl,
				format: activeUrl.toLowerCase().includes('.m3u8') ? 'm3u8' : 'mp4',
				options: { useProxy: false },
			},
		],
		[activeUrl, mediaLabel, playerId],
	);

	const subtitleSources = useMemo<SubtitleSource[]>(
		() =>
			captions
				? [
						{
							id: 'english',
							playerId,
							source: EN_SUBTITLES,
							label: 'English',
							langISO: 'en',
							type: 'vtt',
							default: true,
							options: { useProxy: false },
						},
						{
							id: 'french',
							playerId,
							source: FR_SUBTITLES,
							label: 'French',
							langISO: 'fr',
							type: 'vtt',
							options: { useProxy: false },
						},
					]
				: [],
		[captions, playerId],
	);

	const loadUrl = () => {
		const next = draftUrl.trim();
		if (next.length === 0) return;
		setActiveUrl(next);
		setPlayerVersion((value) => value + 1);
	};

	const loadSample = () => {
		setActiveUrl(SAMPLE_VIDEO_URL);
		setDraftUrl('');
		setPlayerVersion((value) => value + 1);
	};

	return (
		<View style={styles.wrap}>
			<View style={styles.playerWrap}>
				<VideoPlayer
					key={playerId}
					ref={playerRef}
					videoTitle={mediaLabel}
					playerConfig={{
						playerId,
						videoSources,
						subtitleSources,
						initialVideoSource: 0,
						initialSubtitleSource: captions ? 0 : -1,
						autoStart: false,
						lazyLoadSources: true,
					}}
					viewStyle={styles.videoPlayer}
					videoStyle={styles.videoSurface}
				/>
			</View>

			<View style={styles.controls}>
				<View style={styles.buttonRow}>
					<ActionButton label="Play" onPress={() => playerRef.current?.play()} />
					<ActionButton label="Pause" onPress={() => playerRef.current?.pause()} />
					<ActionButton label="Sample URL" onPress={loadSample} active={activeUrl === SAMPLE_VIDEO_URL} />
					<ActionButton label="English VTT" onPress={() => playerRef.current?.setSubtitle(0)} disabled={!captions} />
					<ActionButton label="French VTT" onPress={() => playerRef.current?.setSubtitle(1)} disabled={!captions} />
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
					<Pressable onPress={loadUrl} accessibilityRole="button" style={({ pressed }) => [styles.loadButton, pressed && { opacity: 0.7 }]}>
						<Text style={styles.loadButtonText}>Load URL</Text>
					</Pressable>
				</View>

				{Platform.OS === 'web' && (
					<Text style={styles.helperText} numberOfLines={2}>
						The preview is rendered with the package VideoPlayer, so the visible controls are the custom player controls.
					</Text>
				)}
			</View>
		</View>
	);
}

function ActionButton({
	label,
	onPress,
	active,
	disabled,
}: {
	label: string;
	onPress: () => void;
	active?: boolean;
	disabled?: boolean;
}) {
	return (
		<Pressable
			onPress={disabled ? undefined : onPress}
			accessibilityRole="button"
			accessibilityState={{ disabled, selected: active }}
			style={({ pressed, hovered }) => [
				styles.action,
				active ? styles.actionActive : null,
				disabled ? styles.actionDisabled : null,
				hovered && Platform.OS === 'web' && !active && !disabled ? styles.actionHovered : null,
				pressed && !disabled ? { opacity: 0.7 } : null,
			]}
		>
			<Text style={[styles.actionText, active && styles.actionTextActive, disabled && styles.actionTextDisabled]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	wrap: {
		width: '100%',
		gap: 14,
	},
	playerWrap: {
		width: '100%',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#050507',
		padding: 8,
	},
	videoPlayer: {
		width: '100%',
		aspectRatio: 16 / 9,
		backgroundColor: '#050507',
		borderRadius: 10,
		overflow: 'hidden',
	},
	videoSurface: {
		width: '100%',
		height: '100%',
		backgroundColor: '#050507',
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
	actionDisabled: {
		opacity: 0.45,
	},
	actionText: {
		color: '#a1a1aa',
		fontSize: 12,
		fontWeight: '600',
	},
	actionTextActive: {
		color: '#a5b4fc',
	},
	actionTextDisabled: {
		color: '#52525b',
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
	helperText: {
		color: '#71717a',
		fontSize: 12,
		lineHeight: 18,
		textAlign: 'center',
	},
});
