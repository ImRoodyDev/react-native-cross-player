import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { useHydratedViewportWidth } from '../../utils/useHydratedViewportWidth';

export default function DocsLayout() {
	const viewportWidth = useHydratedViewportWidth();
	const isWide = viewportWidth >= 768;
	const [drawerOpen, setDrawerOpen] = useState(false);

	if (Platform.OS === 'web' && isWide) {
		return (
			<View style={[styles.root, webStyles.root as any]}>
				<View style={webStyles.navbarFixed}>
					<Navbar />
				</View>
				<View style={styles.body as any}>
					<View style={webStyles.sidebarFixed}>
						<Sidebar />
					</View>
					<View style={[styles.content, webStyles.contentScrollable]}>
						<Slot />
					</View>
				</View>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.root} edges={['top']}>
			<Navbar onMenuPress={() => setDrawerOpen(true)} />
			<Modal visible={drawerOpen} transparent animationType="none" onRequestClose={() => setDrawerOpen(false)}>
				<MobileDrawer onClose={() => setDrawerOpen(false)} />
			</Modal>
			<View style={styles.content}>
				<Slot />
			</View>
		</SafeAreaView>
	);
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
	const translateX = useRef(new Animated.Value(-SIDEBAR_W)).current;
	const overlayOpacity = useRef(new Animated.Value(0)).current;
	const isClosing = useRef(false);

	useEffect(() => {
		Animated.parallel([
			Animated.spring(translateX, {
				toValue: 0,
				useNativeDriver: true,
				tension: 240,
				friction: 28,
			}),
			Animated.timing(overlayOpacity, {
				toValue: 1,
				duration: 180,
				useNativeDriver: true,
			}),
		]).start();
	}, [overlayOpacity, translateX]);

	const closeDrawer = () => {
		if (isClosing.current) return;
		isClosing.current = true;
		Animated.parallel([
			Animated.timing(translateX, {
				toValue: -SIDEBAR_W,
				duration: 180,
				useNativeDriver: true,
			}),
			Animated.timing(overlayOpacity, {
				toValue: 0,
				duration: 160,
				useNativeDriver: true,
			}),
		]).start(onClose);
	};

	return (
		<View style={styles.drawerRoot}>
			<Animated.View style={[styles.drawerPanel, { transform: [{ translateX }] }]}>
				<Sidebar onClose={closeDrawer} />
			</Animated.View>
			<Animated.View style={[styles.drawerOverlay, { opacity: overlayOpacity }]}>
				<Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
			</Animated.View>
		</View>
	);
}

const NAVBAR_H = 60;
const SIDEBAR_W = 260;

const webStyles = {
	root: {
		minHeight: '100vh',
	} as any,
	navbarFixed: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		height: NAVBAR_H,
		zIndex: 100,
	} as any,
	sidebarFixed: {
		width: SIDEBAR_W,
		position: 'sticky',
		top: NAVBAR_H,
		alignSelf: 'flex-start',
		height: `calc(100vh - ${NAVBAR_H}px)`,
		overflowY: 'auto',
		zIndex: 50,
	} as any,
	contentScrollable: {
		overflowY: 'auto',
		height: `calc(100vh - ${NAVBAR_H}px)`,
	} as any,
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#09090b',
	},
	body: {
		flexDirection: 'row',
		flex: 1,
		marginTop: NAVBAR_H,
		minHeight: 0,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	drawerRoot: {
		flex: 1,
		flexDirection: 'row',
	},
	drawerPanel: {
		width: SIDEBAR_W,
		height: '100%',
		zIndex: 2,
	},
	drawerOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.62)',
		zIndex: 1,
	},
});
