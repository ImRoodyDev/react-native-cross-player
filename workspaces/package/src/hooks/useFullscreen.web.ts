import { useCallback, useState } from "react";
import type { UseFullscreenProps, UseFullscreenResult } from "./useFullscreen.types";

// Web implementation. Deliberately imports NO native-only modules
// (react-native-system-navigation-bar / react-native-orientation-locker), which
// call TurboModuleRegistry at import time and are undefined on react-native-web.
// Uses the browser Fullscreen API instead. See useFullscreen.native.ts.
export function useFullscreen(props: UseFullscreenProps): UseFullscreenResult {
	const { videoRef, playerViewRef } = props || {};

	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

	const onFullscreenEnter = useCallback(() => setIsFullscreen(true), []);
	const onFullscreenExit = useCallback(() => setIsFullscreen(false), []);

	const requestFullscreen = useCallback(
		(enable: boolean) => {
			if (enable) {
				// Safari exposes the underlying <video> element for fullscreen; other
				// browsers fullscreen the player container so custom controls stay visible.
				const screen = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
					? videoRef?.current?.nativeHtmlVideoRef?.current
					: playerViewRef?.current;
				if (!screen) return;
				(screen as any).requestFullscreen?.();
				onFullscreenEnter();
			} else {
				(document as any).exitFullscreen?.();
				onFullscreenExit();
			}
		},
		[videoRef, playerViewRef, onFullscreenEnter, onFullscreenExit]
	);

	return { isFullscreen, onFullscreenEnter, onFullscreenExit, requestFullscreen };
}
