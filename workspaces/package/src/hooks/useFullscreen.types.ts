import type React from "react";
import type { View } from "react-native";

export type UseFullscreenProps = {
	videoRef?: React.RefObject<any>;
	playerViewRef?: React.RefObject<View | null>;
};

export type UseFullscreenResult = {
	isFullscreen: boolean;
	onFullscreenEnter: () => void;
	onFullscreenExit: () => void;
	requestFullscreen: (enable: boolean) => void;
};

export type UseFullscreen = (props: UseFullscreenProps) => UseFullscreenResult;
