<div align="center">
<img src="https://raw.githubusercontent.com/ImRoodyDev/react-native-cross-player/refs/heads/beta-v1/cnt.svg" width="120" alt="Grabit Engine" />
<h1>React Native Cross Player</h1>

![npm](https://img.shields.io/npm/v/react-native-cross-player?label=npm%20package&color=blue)
![license](https://img.shields.io/npm/l/react-native-cross-player)

<br/>
React Native / Web video player wrapper with HLS, subtitles and proxy support.
</div>

## Installation

Install the package:

```bash
npm install react-native-cross-player
# or
yarn add react-native-cross-player
```

Install the required peer dependencies (required by the library at runtime):

```bash
npm install --save nativewind react react-native react-native-awesome-slider react-native-blob-util react-native-gesture-handler react-native-orientation-locker react-native-reanimated react-native-safe-area-context react-native-svg react-native-system-navigation-bar react-native-video react-native-worklets tailwindcss
# or with yarn
`playerState` now includes an `isLive` boolean indicating whether the currently loaded
media is a live stream (true for HLS live playlists or streams without a finite duration).
yarn add nativewind react react-native react-native-awesome-slider react-native-blob-util react-native-gesture-handler react-native-orientation-locker react-native-reanimated react-native-safe-area-context react-native-svg react-native-system-navigation-bar react-native-video react-native-worklets tailwindcss
```

Notes:

- You do not need to install these in a library project if your app already provides them; they are peers and must be available in the consuming app.

## NativeWind Setup (Required)

This library uses NativeWind v4 for styling. You must set up NativeWind in your consuming application.

### 1. Import Component Styles

**For Web:** Import the CSS file in your global CSS or directly in your app:

```css
/* Option 1: In your global.css or app.css */
@import "react-native-cross-player/styles.css";
```

Or import directly in your entry file (e.g., with Metro Web / Expo Web):

```tsx
// In your App.tsx or _layout.tsx
import "react-native-cross-player/styles.css";
```

**For Native (iOS/Android):** The styles are applied via NativeWind's className processing. Make sure your `babel.config.js` includes:

```js
module.exports = {
	presets: [
		// ... your other presets
	],
	plugins: [
		"nativewind/babel"
		// ... your other plugins
	]
};
```

And your `tailwind.config.js` includes the library in the content paths:

```js
module.exports = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./src/**/*.{js,jsx,ts,tsx}",
		// Include react-native-cross-player source files
		"./node_modules/react-native-cross-player/src/**/*.{js,jsx,ts,tsx}"
	]
	// ... rest of config
};
```

## Usage

Basic usage in a React Native app:

```tsx
import React from "react";
import { VideoPlayer } from "react-native-cross-player";

export default function App() {
	return (
		<VideoPlayer
			source={{ uri: "https://example.com/video.m3u8" }}
			style={{ flex: 1 }}
			// additional props supported by the component (see types in src/types)
		/>
	);
}
```

You can also import the controls separately:

```tsx
import { VideoPlayer, PlayerControls } from "react-native-cross-player";
```

## API & exports

For the complete, structured API reference (component props, hook options, controllers and types) see [API.md](API.md).

Why the API is exposed

This library exports both higher-level UI components (`VideoPlayer`, `PlayerControls`) and lower-level hooks/controllers (for example `usePlayerController`) so you can either use the ready-made player UI or build your own custom player interface. Exposing the controller makes it straightforward to wire the playback logic into a custom layout or use different control components while reusing the underlying HLS/subtitle/proxy logic.

`usePlayerController` is exported from the package entry so consumers can import it directly:

```ts
import { usePlayerController } from "react-native-cross-player";
```

### `VideoPlayer` props (detailed)

`VideoPlayer` is a small wrapper that wires `usePlayerController` and `PlayerControls` together. Important props:

| Prop           | Type                                         | Description                               |
| -------------- | -------------------------------------------- | ----------------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `videoTitle`   | `string`                                     | Title displayed in the controls header    |
| `language`     | `Languages`                                  | Localization setting (default `en`)       |
| `playerConfig` | `Omit<PlayerControllerProps, "playerViewRef" | "videoRef"                                | "controlsRef">` | Full runtime configuration for `usePlayerController`. Key fields: see table below. |
| `viewStyle`    | `StyleProp<ViewStyle>`                       | Style for the container view              |
| `videoStyle`   | `StyleProp<ViewStyle>`                       | Style applied to the native video element |

Key `playerConfig` fields (examples):

| Field                            | Type               | Description                                                                                                                |
| -------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `videoSources`                   | `VideoSource[]`    | List of sources to present in the sources menu                                                                             |
| `subtitleSources`                | `SubtitleSource[]` | List of subtitle tracks to offer                                                                                           |
| `initialVideoSource`             | `number`           | Index to auto-select a video source on mount (default `-1`)                                                                |
| `initialSubtitleSource`          | `number`           | Index to auto-select a subtitle (default `-1`)                                                                             |
| `initialAudioTrack`              | `number`           | Index to auto-select an audio track (applied after load; default `-1`)                                                     |
| `autoStart`                      | `boolean`          | Start playback automatically after load (default `false`)                                                                  |
| `startPosition`                  | `number`           | Seek position (seconds) applied on initial load (default `0`)                                                              |
| `proxyURL`                       | `string`           | Proxy tunnel URL used for playlist and fragment requests                                                                   |
| `lazyLoadSources`                | `boolean`          | Defer creation of blob/playlist URLs until first use (default `true`)                                                      |
| `preservePlaybackOnSourceChange` | `boolean`          | Preserve current time when switching sources (default `true`)                                                              |
| `maxResolutionHeight`            | `number`           | New: prefer/filter quality levels with height <= this value. Useful to cap resolution for bandwidth or device constraints. |

For the full API (controller methods, control props, types and helper exports) see [API.md](API.md).

## Development

- Run tests:

```bash
npm test
```

- Build (uses react-native-builder-bob configured in package.json):

```bash
npm run build
```

## Contributing

Contributions are welcome. Open an issue or submit a PR. Follow the code style in the repo and add tests if you introduce behavior changes.

## License

MIT — see [LICENSE](LICENSE)

---

If you'd like, I can also:

- Expand the API section with exact exported function and prop signatures (pulling names from each source file).
- Add detailed prop tables for `VideoPlayer` and `PlayerControls`.
