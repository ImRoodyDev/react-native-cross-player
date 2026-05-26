"use client";

import VideoPlayer from "./ui/VideoPlayer";
import PlayerControls from "./ui/PlayerControls";

// Re-export CSS path for consumers to import in their global CSS
// Usage: @import "react-native-cross-player/css";
export const CSS_PATH = "react-native-cross-player/dist/css/styles.css";

export { VideoPlayer, PlayerControls };

// Core Libraries
export * from "./libs/media";
export * from "./libs/blob";
export * from "./libs/error";

// Utilities
export * from "./utils/logger";
export * from "./utils/detectors";

// HLS Proxy
export * from "./controllers/hls-proxy";
export * from "./controllers/proxy-loader";
export * from "./controllers/proxy-manager";

// Types
export * from "./types/hls";
export * from "./types/media";

// Hooks
export * from "./hooks/useWebKeyboard";

// UI Components
export * from "./ui/VideoPlayer";
export * from "./ui/PlayerControls";
export * from "./hooks/usePlayerController";
