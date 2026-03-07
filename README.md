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

<table>
<thead>
  <tr>
    <th>Prop</th>
    <th>Type</th>
    <th>Default</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>videoTitle</code></td>
    <td><code>string</code></td>
    <td>—</td>
    <td>No</td>
    <td>Title displayed in the controls header</td>
  </tr>
  <tr>
    <td><code>language</code></td>
    <td><code>Languages</code></td>
    <td><code>en</code></td>
    <td>No</td>
    <td>Localization setting</td>
  </tr>
  <tr>
    <td><code>playerConfig</code></td>
    <td><code>Omit&lt;PlayerControllerProps, "playerViewRef" | "videoRef" | "controlsRef"&gt;</code></td>
    <td><code>{}</code></td>
    <td>No</td>
    <td>Full runtime configuration for <code>usePlayerController</code>. See key fields below.</td>
  </tr>
  <tr>
    <td><code>viewStyle</code></td>
    <td><code>StyleProp&lt;ViewStyle&gt;</code></td>
    <td>—</td>
    <td>No</td>
    <td>Style for the outer container view</td>
  </tr>
  <tr>
    <td><code>videoStyle</code></td>
    <td><code>StyleProp&lt;ViewStyle&gt;</code></td>
    <td>—</td>
    <td>No</td>
    <td>Style applied to the native video element</td>
  </tr>
</tbody>
</table>

Example usage (concise `playerConfig`):

```ts
const playerConfig = {
	videoSources: [{ uri: 'https://example.com/stream.m3u8' }],
	initialVideoSource: -1,
	autoStart: false,
	proxyURL: 'https://proxy.example.com'
};

<VideoPlayer playerConfig={playerConfig} />
```

Key `playerConfig` fields (examples):

<table>
<thead>
  <tr>
    <th>Field</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>videoSources</code></td>
    <td><code>VideoSource[]</code></td>
    <td><code>[]</code></td>
    <td>List of sources to present in the sources menu</td>
  </tr>
  <tr>
    <td><code>subtitleSources</code></td>
    <td><code>SubtitleSource[]</code></td>
    <td><code>[]</code></td>
    <td>List of subtitle tracks to offer</td>
  </tr>
  <tr>
    <td><code>initialVideoSource</code></td>
    <td><code>number</code></td>
    <td><code>-1</code></td>
    <td>Index to auto-select a video source on mount</td>
  </tr>
  <tr>
    <td><code>initialSubtitleSource</code></td>
    <td><code>number</code></td>
    <td><code>-1</code></td>
    <td>Index to auto-select a subtitle</td>
  </tr>
  <tr>
    <td><code>initialAudioTrack</code></td>
    <td><code>number</code></td>
    <td><code>-1</code></td>
    <td>Index to auto-select an audio track (applied after load)</td>
  </tr>
  <tr>
    <td><code>autoStart</code></td>
    <td><code>boolean</code></td>
    <td><code>false</code></td>
    <td>Start playback automatically after load</td>
  </tr>
  <tr>
    <td><code>startPosition</code></td>
    <td><code>number</code></td>
    <td><code>0</code></td>
    <td>Seek position (seconds) applied on initial load</td>
  </tr>
  <tr>
    <td><code>proxyURL</code></td>
    <td><code>string</code></td>
    <td>—</td>
    <td>Proxy tunnel URL used for playlist and fragment requests</td>
  </tr>
  <tr>
    <td><code>lazyLoadSources</code></td>
    <td><code>boolean</code></td>
    <td><code>true</code></td>
    <td>Defer creation of blob/playlist URLs until first use</td>
  </tr>
  <tr>
    <td><code>preservePlaybackOnSourceChange</code></td>
    <td><code>boolean</code></td>
    <td><code>true</code></td>
    <td>Preserve current time when switching sources</td>
  </tr>
  <tr>
    <td><code>maxResolutionHeight</code></td>
    <td><code>number</code></td>
    <td>—</td>
    <td>Prefer/filter quality levels with height &lt;= this value. Useful to cap resolution for bandwidth or device constraints.</td>
  </tr>
</tbody>
</table>

For the full API (controller methods, control props, types and helper exports) see [API.md](API.md).

## Contributing

Contributions are welcome. Open an issue or submit a PR. Follow the code style in the repo and add tests if you introduce behavior changes.

## License

This project is licensed under the MIT License. See the full license text in [LICENSE](LICENSE).

---
