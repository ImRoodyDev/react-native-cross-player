import { StatusBar, Platform, View } from "react-native";
import React, { useCallback, useState } from "react";
import SystemNavigationBar from "react-native-system-navigation-bar";
import Orientation from "react-native-orientation-locker";

export function useFullscreen(props: { videoRef?: React.RefObject<any>; playerViewRef?: React.RefObject<View | null> }) {
	const { videoRef, playerViewRef } = props || {};

	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

	const onFullscreenEnter = useCallback(() => {
		setIsFullscreen(true);
		StatusBar.setHidden(true);
		Orientation.lockToLandscape();
		if (Platform.OS === "android") SystemNavigationBar.navigationHide();
	}, []);

	const onFullscreenExit = useCallback(() => {
		setIsFullscreen(false);
		StatusBar.setHidden(false);
		Orientation.unlockAllOrientations();
		if (Platform.OS === "android") SystemNavigationBar.navigationShow();
	}, []);

	const requestFullscreen = useCallback(
		(enable: boolean) => {
			if (enable) {
				if (Platform.OS === "web") {
					const screen = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
						? videoRef?.current?.nativeHtmlVideoRef?.current
						: playerViewRef?.current;
					if (!screen) return;
					// use browser fullscreen API
					(screen as any).requestFullscreen?.();
				} else videoRef?.current?.presentFullscreenPlayer?.();
				onFullscreenEnter();
			} else {
				if (Platform.OS === "web") (document as any).exitFullscreen?.();
				else videoRef?.current?.dismissFullscreenPlayer?.();
				onFullscreenExit();
			}
		},
		[videoRef, playerViewRef, onFullscreenEnter, onFullscreenExit]
	);

	return { isFullscreen, onFullscreenEnter, onFullscreenExit, requestFullscreen };
}
