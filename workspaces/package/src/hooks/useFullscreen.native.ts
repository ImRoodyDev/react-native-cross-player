import { StatusBar, Platform, Dimensions } from "react-native";
import { useCallback, useEffect, useState } from "react";
import SystemNavigationBar from "react-native-system-navigation-bar";
import Orientation from "react-native-orientation-locker";
import type { UseFullscreenProps, UseFullscreenResult } from "./useFullscreen.types";

// Native (iOS/Android/tvOS) implementation. This file is the only place that
// imports native-only modules (react-native-system-navigation-bar,
// react-native-orientation-locker) so the web bundle never pulls them in — a
// higher, TurboModule-based version of those packages would otherwise crash at
// import time on react-native-web. See useFullscreen.web.ts for the web variant.
export function useFullscreen(props: UseFullscreenProps): UseFullscreenResult {
	// playerViewRef is only consumed by the web variant; native uses videoRef.
	const { videoRef } = props || {};

	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

	// Drive the system bars from device orientation for the whole player lifetime —
	// rotating a phone into landscape is this player's "fullscreen".
	//   - portrait (inline): status bar visible (Android: nav bar hidden)
	//   - landscape (fullscreen): status bar hidden (Android: nav bar hidden too)
	// `isFullscreen` is kept in sync so <StatusBar hidden={isFullscreen}> in VideoPlayer
	// follows along — that component hides the status bar on iOS. On Android, edge-to-edge
	// makes RN's StatusBar unreliable (time/battery stayed visible in landscape), so the
	// bars are driven imperatively via sticky immersive (WindowInsetsController) instead.
	useEffect(() => {
		if (Platform.OS !== "android" && Platform.OS !== "ios") return;

		const apply = (landscape: boolean) => {
			setIsFullscreen(landscape);
			if (Platform.OS === "android") {
				if (landscape) {
					// Hide status + navigation bars; a swipe reveals them briefly, then they re-hide.
					SystemNavigationBar.stickyImmersive(true);
				} else {
					// Leave immersive, but keep the nav bar hidden while the player is on screen.
					SystemNavigationBar.stickyImmersive(false);
					SystemNavigationBar.navigationHide();
				}
			}
			// iOS: <StatusBar hidden={isFullscreen}> in VideoPlayer follows the state set above.
		};

		const { width, height } = Dimensions.get("window");
		apply(width > height);
		const subscription = Dimensions.addEventListener("change", ({ window }) => apply(window.width > window.height));

		return () => {
			subscription?.remove();
			// Restore normal system bars when the player is destroyed (Android only).
			if (Platform.OS === "android") {
				SystemNavigationBar.stickyImmersive(false);
				SystemNavigationBar.navigationShow();
			}
		};
	}, []);

	const onFullscreenEnter = useCallback(() => {
		setIsFullscreen(true);
		// iOS has no immersive API; hide the status bar directly. On Android the effect
		// above already owns bar visibility (edge-to-edge makes setHidden unreliable there).
		if (Platform.OS !== "android") StatusBar.setHidden(true);
		Orientation.lockToLandscape();
	}, []);

	const onFullscreenExit = useCallback(() => {
		setIsFullscreen(false);
		if (Platform.OS !== "android") StatusBar.setHidden(false);
		Orientation.unlockAllOrientations();
	}, []);

	const requestFullscreen = useCallback(
		(enable: boolean) => {
			if (enable) {
				videoRef?.current?.presentFullscreenPlayer?.();
				onFullscreenEnter();
			} else {
				videoRef?.current?.dismissFullscreenPlayer?.();
				onFullscreenExit();
			}
		},
		[videoRef, onFullscreenEnter, onFullscreenExit]
	);

	return { isFullscreen, onFullscreenEnter, onFullscreenExit, requestFullscreen };
}
