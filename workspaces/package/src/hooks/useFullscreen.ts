// Platform-neutral entry for `useFullscreen`.
//
// The real implementations live in the platform-specific siblings:
//   - useFullscreen.web.ts    -> browser Fullscreen API, zero native imports
//   - useFullscreen.native.ts -> iOS/Android/tvOS, uses the native modules
//
// Metro / Expo web / webpack (react-native-web) resolve `.web` and `.native`
// suffixes at bundle time, so this file is never bundled when a platform
// variant matches. It exists so TypeScript (moduleResolution: "bundler", which
// does not resolve platform suffixes) can resolve `./useFullscreen`, and as the
// fallback for native bundlers. It re-exports the native variant, so this base
// must not be reached on web — the `.web` file always wins there.
export * from "./useFullscreen.native";
export type { UseFullscreenProps, UseFullscreenResult, UseFullscreen } from "./useFullscreen.types";
