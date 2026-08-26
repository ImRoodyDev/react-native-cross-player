import { StatusBar, Platform } from "react-native";
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

	// Hide the Android navigation bar for the entire lifetime of the player and
	// restore it when the player unmounts. Tied to mount/unmount (not fullscreen)
	// so the bar stays hidden while the player is on screen — inline or fullscreen.
	//
	// NOTE: intentionally NOT hiding the *status* bar based on landscape orientation.
	// Under edge-to-edge (react-native-edge-to-edge), every way to do that had a bad
	// side effect: SystemNavigationBar immersive breaks fitsSystemWindows and leaves a
	// phantom bar-sized margin on other screens; SystemBars leaves react-native-safe-
	// area-context's top inset stuck at 0; RN <StatusBar hidden> is simply ignored. If
	// you want the status bar hidden in landscape, drive it from the host app, which
	// owns its edge-to-edge / safe-area setup, using the player's `isFullscreen` state.
	useEffect(() => {
		if (Platform.OS !== "android") return;
		SystemNavigationBar.navigationHide();
		return () => {
			SystemNavigationBar.navigationShow();
		};
	}, []);

	const onFullscreenEnter = useCallback(() => {
		setIsFullscreen(true);
		StatusBar.setHidden(true);
		Orientation.lockToLandscape();
	}, []);

	const onFullscreenExit = useCallback(() => {
		setIsFullscreen(false);
		StatusBar.setHidden(false);
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
