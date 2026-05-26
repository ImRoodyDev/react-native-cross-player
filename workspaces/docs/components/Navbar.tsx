import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { publicAsset } from '../utils/publicAsset';

export function Navbar({ onMenuPress }: { onMenuPress?: () => void }) {
	const { width } = useWindowDimensions();
	const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
	const isWide = viewportWidth >= 768;
	const isMobile = viewportWidth < 520;

	return (
		<View
			style={[
				styles.navbar,
				Platform.OS === 'web'
					? ({
							backdropFilter: 'blur(12px)',
							WebkitBackdropFilter: 'blur(12px)',
							backgroundColor: 'rgba(9,9,11,0.88)',
						} as any)
					: { backgroundColor: '#09090b' },
			]}
		>
			<View style={styles.navLeft}>
				<Link href="/" asChild>
					<Pressable
						style={({ pressed, hovered }) => [
							styles.logoBtn,
							hovered && Platform.OS === 'web' ? styles.logoBtnHovered : null,
							pressed && { opacity: 0.7 },
						]}
					>
						<View style={styles.logoBadge}>
							<Image source={{ uri: publicAsset('img/ctn-icon.png') }} style={styles.logoImage} resizeMode="cover" />
						</View>
					</Pressable>
				</Link>
			</View>

			{!isMobile && (
				<View style={styles.centerNav}>
					<NavLink href="/installation" label="Docs" />
					<NavLink href="/quick-start" label="Quick Start" />
					<NavLink href="/components" label="Components" />
				</View>
			)}

			<View style={styles.navRight}>
				<Pressable
					onPress={() =>
						Platform.OS === 'web'
							? (window as Window).open('https://www.npmjs.com/package/react-native-cross-player', '_blank')
							: undefined
					}
					style={({ pressed, hovered }) => [
						styles.headerActionBtn,
						hovered && Platform.OS === 'web' ? styles.headerButtonHovered : null,
						pressed && { opacity: 0.65 },
					]}
				>
					<NpmIcon />
					{isWide && <Text style={styles.headerActionText}>npm</Text>}
					<ExternalIcon />
				</Pressable>
				<Pressable
					onPress={() =>
						Platform.OS === 'web'
							? (window as Window).open('https://github.com/imroodydev/react-native-cross-player', '_blank')
							: undefined
					}
					style={({ pressed, hovered }) => [
						styles.headerActionBtn,
						hovered && Platform.OS === 'web' ? styles.headerButtonHovered : null,
						pressed && { opacity: 0.65 },
					]}
				>
					<GithubIcon />
					{isWide && <Text style={styles.headerActionText}>GitHub</Text>}
					<ExternalIcon />
				</Pressable>
				{onMenuPress && (
					<Pressable
						onPress={onMenuPress}
						style={({ pressed, hovered }) => [
							styles.menuBtn,
							hovered && Platform.OS === 'web' ? styles.headerButtonHovered : null,
							pressed && { opacity: 0.65 },
						]}
					>
						<Text style={styles.menuBtnText}>Menu</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}

function NavLink({ href, label }: { href: string; label: string }) {
	const pathname = usePathname() ?? '';
	const router = useRouter();
	const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

	return (
		<Pressable
			onPress={() => router.push(href as any)}
			style={({ pressed, hovered }) => [
				styles.navLink,
				active ? styles.navLinkActiveContainer : null,
				hovered && Platform.OS === 'web' ? styles.navLinkHovered : null,
				pressed && { opacity: 0.65 },
			]}
		>
			<Text style={[styles.navLinkText, active && styles.navLinkActive]}>{label}</Text>
			{active && <View style={styles.navLinkDot} />}
		</Pressable>
	);
}

function GithubIcon() {
	return (
		<View style={styles.githubIcon}>
			{Platform.OS !== 'web' && <Text style={styles.githubIconFallback}>GH</Text>}
		</View>
	);
}

function NpmIcon() {
	return (
		<Image
			source={{ uri: 'https://raw.githubusercontent.com/npm/logos/master/npm%20square/n-64.png' }}
			style={styles.npmIcon}
			resizeMode="contain"
		/>
	);
}

function ExternalIcon() {
	return <Text style={styles.externalIconClean}>{'\u2197'}</Text>;
}

const styles = StyleSheet.create({
	navbar: {
		height: 60,
		zIndex: 100,
		borderBottomWidth: 1,
		borderBottomColor: '#18181b',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
	},
	navLeft: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	logoBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		transitionDuration: '160ms',
	},
	logoBtnHovered: {
		transform: [{ translateY: -1 }],
	},
	logoBadge: {
		width: 32,
		height: 32,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#18181b',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoImage: {
		width: 32,
		height: 32,
		borderRadius: 8,
	},
	centerNav: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	navRight: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		gap: 8,
	},
	headerActionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#111113',
		transitionDuration: '160ms',
	},
	headerButtonHovered: {
		borderColor: '#52525b',
		backgroundColor: '#18181b',
		transform: [{ translateY: -1 }],
	},
	headerActionText: {
		color: '#a1a1aa',
		fontSize: 13,
		fontWeight: '500',
	},
	npmIcon: {
		width: 16,
		height: 16,
	},
	githubIcon: {
		width: 15,
		height: 15,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		...((Platform.OS === 'web'
			? {
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 98 96'%3E%3Cpath fill='%23e4e4e7' d='M48.9 0C21.9 0 0 22 0 49.1c0 21.7 14 40.1 33.5 46.6 2.4.5 3.3-1.1 3.3-2.4 0-1.2-.1-5.2-.1-9.5-13.6 3-16.5-5.9-16.5-5.9-2.2-5.7-5.4-7.2-5.4-7.2-4.4-3 .3-3 .3-3 4.9.3 7.5 5.1 7.5 5.1 4.3 7.5 11.4 5.3 14.2 4.1.4-3.2 1.7-5.3 3.1-6.5-10.9-1.2-22.3-5.5-22.3-24.4 0-5.4 1.9-9.8 5-13.2-.5-1.2-2.2-6.3.5-13 0 0 4.1-1.3 13.4 5.1 3.9-1.1 8-1.6 12.2-1.6 4.1 0 8.3.6 12.2 1.6 9.3-6.4 13.4-5.1 13.4-5.1 2.7 6.7 1 11.8.5 13 3.1 3.4 5 7.8 5 13.2 0 18.9-11.4 23.1-22.3 24.4 1.8 1.5 3.3 4.5 3.3 9.1 0 6.5-.1 11.8-.1 13.4 0 1.3.9 2.9 3.4 2.4C84 89.2 98 70.8 98 49.1 97.8 22 75.9 0 48.9 0z'/%3E%3C/svg%3E\")",
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'contain',
				}
			: {}) as any),
	},
	githubIconFallback: {
		color: '#e4e4e7',
		fontSize: 8,
		fontWeight: '800',
	},
	externalIconClean: {
		color: '#71717a',
		fontSize: 12,
		fontWeight: '700',
	},
	menuBtn: {
		minWidth: 44,
		height: 36,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#111113',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 10,
		transitionDuration: '160ms',
	},
	menuBtnText: {
		color: '#a1a1aa',
		fontSize: 12,
		fontWeight: '700',
	},
	navLink: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'transparent',
		minWidth: 76,
		transitionDuration: '160ms',
	},
	navLinkActiveContainer: {
		backgroundColor: 'rgba(255,61,127,0.08)',
		borderColor: 'rgba(255,138,0,0.22)',
	},
	navLinkHovered: {
		backgroundColor: 'rgba(255,61,127,0.10)',
		borderColor: 'rgba(255,138,0,0.30)',
		transform: [{ translateY: -1 }],
	},
	navLinkText: {
		fontSize: 13,
		fontWeight: '500',
		color: '#71717a',
	},
	navLinkActive: {
		color: '#e4e4e7',
	},
	navLinkDot: {
		width: 3,
		height: 3,
		borderRadius: 2,
		backgroundColor: '#ff3d7f',
		marginTop: 3,
	},
});
