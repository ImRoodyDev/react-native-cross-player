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
module.exports = function (api) {
	api.cache(true);
	return {
		presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
		plugins: ['@babel/plugin-proposal-export-namespace-from', 'react-native-reanimated/plugin'],
	};
};
```

Your Expo Metro config should pass the same global CSS entry to NativeWind:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

## Usage

Basic usage in a React Native app:

```tsx
import React from "react";
import { VideoPlayer } from "react-native-cross-player";

export default function App() {
	const playerId = "demo-player";
	const playerConfig = {
		playerId,
		videoSources: [
			{
				id: "main",
				playerId,
				label: "Main stream",
				source: "https://example.com/video.m3u8",
				format: "m3u8"
			}
		],
		subtitleSources: [],
		initialVideoSource: 0
	};

	return (
		<VideoPlayer
			videoTitle="Demo"
			playerConfig={playerConfig}
			viewStyle={{ flex: 1 }}
			theme={{
				minimumTrackTintColor: "#0ea5e9",
				maximumTrackTintColor: "#3f3f46",
				cacheTrackTintColor: "#71717a",
				bubbleBackgroundColor: "#0ea5e9"
			}}
		/>
	);
}
```

You can also import the controls separately:

```tsx
import { VideoPlayer, PlayerControls } from "react-native-cross-player";
```

## Build your own video player

`VideoPlayer` is the ready-made player shell, but the package also exports the lower-level pieces used to build it. Use `usePlayerController` when you want your own layout, your own buttons, or a custom TV/mobile/web player surface while still reusing the package playback logic for HLS, subtitles, source switching, proxy handling, fullscreen, audio tracks, and progress state.

The custom-player flow is:

- Render your own `react-native-video` element.
- Pass `videoRef`, `controlsRef`, and `playerViewRef` into `usePlayerController`.
- Spread `controller.nativeVideoProps` onto your video element.
- Keep native video controls disabled and drive playback through `controller.controls`.
- Render your own UI, or reuse the exported `PlayerControls` overlay.

```tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import Video from "react-native-video";
import { PlayerControls, usePlayerController } from "react-native-cross-player";

const playerId = "custom-player";

export function CustomPlayer() {
	const videoRef = React.useRef(null);
	const controlsRef = React.useRef(null);
	const playerViewRef = React.useRef(null);

	const controller = usePlayerController({
		playerId,
		videoRef,
		controlsRef,
		playerViewRef,
		videoSources: [
			{
				id: "main",
				playerId,
				label: "Main stream",
				source: "https://tears-of-steel-subtitles.s3.amazonaws.com/tos.mp4",
				format: "mp4"
			}
		],
		subtitleSources: [],
		initialVideoSource: 0
	});

	return (
		<View ref={playerViewRef} style={{ flex: 1, backgroundColor: "black" }}>
			<Video
				ref={videoRef}
				{...controller.nativeVideoProps}
				controls={false}
				paused={controller.playerState.paused}
				resizeMode="contain"
				style={{ flex: 1 }}
			/>

			<Pressable onPress={() => controller.controls.setPause(!controller.playerState.paused)}>
				<Text>{controller.playerState.paused ? "Play" : "Pause"}</Text>
			</Pressable>

			<PlayerControls
				ref={controlsRef}
				videoTitle="Custom player"
				controls={controller.controls}
				resources={controller.playbackResources}
				playerState={controller.playerState}
			/>
		</View>
	);
}
```

## Public exports

The package entry exports more than the ready-made components:

- UI: `VideoPlayer`, `PlayerControls`, `VideoPlayerRef`, `PlayerControlsRef`, `ControlsProps`.
- Controller hooks: `usePlayerController`, `PlayerControllerProps`, `useWebKeyboard`.
- Media helpers: `createM3U8Source`, `createMasterM3U8Raw`, `createVTTSource`, `convertSRTtoVTT`, `createM3U8File`, `createVTTFile`, `clearBlobFiles`, `clearBlobGroup`, `revokeAllBlobURLs`.
- HLS/proxy helpers: `HlsProxy`, `HlsProxyManager`, `ProxyLoader`, `ProxyPlaylistLoader`, `ProxyFragmentLoader`, `HlsProxyConfig`, `ProxyURLResolverCallback`.
- Types: `VideoSource`, `SubtitleSource`, `SourceRequestOptions`, `M3U8BlobOptions`, `M3U8PlaylistTrack`, `M38USubtitleTrack`, `M3U8AudioTrack`, `SubtitleBlobOptions`, `SourceTypes`, `SubtitleTypes`, `TextEncoding`, `VideoFormats`.
- Utilities: `CustomPlayerError`, `isCustomPlayerError`, `detectSourceType`, `detectSubtitleType`, `detectSubtitleEncoding`, `CNPLogger`, `ProxyLogger`, `CSS_PATH`.

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
    <td>Yes</td>
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
    <td>Yes</td>
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
  <tr>
    <td><code>theme</code></td>
    <td><code>SliderThemeType</code></td>
    <td>—</td>
    <td>No</td>
    <td>Optional slider theme forwarded to the built-in progress bar from <code>react-native-awesome-slider</code></td>
  </tr>
  <tr>
    <td><code>onControlVisibilityChange</code></td>
    <td><code>(visible: boolean) =&gt; void</code></td>
    <td>—</td>
    <td>No</td>
    <td>Called whenever the built-in controls become visible or hidden</td>
  </tr>
  <tr>
    <td><code>onSourceChange</code></td>
    <td><code>(index: number, source: VideoSource) =&gt; void</code></td>
    <td>—</td>
    <td>No</td>
    <td>Called when the active video source changes, including initial source selection and imperative/UI-driven switches</td>
  </tr>
  <tr>
    <td><code>onSubtitleChange</code></td>
    <td><code>(index: number, subtitle: SubtitleSource) =&gt; void</code></td>
    <td>—</td>
    <td>No</td>
    <td>Called when a subtitle track becomes active. It is not fired when subtitles are turned off.</td>
  </tr>
  <tr>
    <td><code>onPlaybackChange</code></td>
    <td><code>(isPlaying: boolean) =&gt; void</code></td>
    <td>—</td>
    <td>No</td>
    <td>Called when playback toggles between playing and paused after the player has mounted.</td>
  </tr>
  <tr>
    <td><code>onProgress</code></td>
    <td><code>(currentTime: number) =&gt; void</code></td>
    <td>—</td>
    <td>No</td>
    <td>Called on each native progress update with the current playback time in seconds.</td>
  </tr>
  <tr>
    <td><code>onEnd</code></td>
    <td><code>() =&gt; void</code></td>
    <td>—</td>
    <td>No</td>
    <td>Called when playback reaches the end of the active media.</td>
  </tr>
</tbody>
</table>

`theme` lets you override the colors used by the built-in seek slider without replacing the controls UI.

```tsx
import { VideoPlayer } from "react-native-cross-player";
import type { SliderThemeType } from "react-native-awesome-slider";

const sliderTheme: SliderThemeType = {
	minimumTrackTintColor: "#0ea5e9",
	maximumTrackTintColor: "#3f3f46",
	cacheTrackTintColor: "#71717a",
	bubbleBackgroundColor: "#0ea5e9"
};

<VideoPlayer videoTitle="Demo" playerConfig={playerConfig} theme={sliderTheme} />;
```

You can observe source and subtitle switches from the built-in UI or imperative ref calls:

```tsx
<VideoPlayer
	videoTitle="Demo"
	playerConfig={playerConfig}
	onSourceChange={(index, source) => {
		console.log("Active source", index, source.label);
	}}
	onSubtitleChange={(index, subtitle) => {
		console.log("Active subtitle", index, subtitle.label ?? subtitle.langISO);
	}}
	onPlaybackChange={(isPlaying) => {
		console.log("Playback changed", isPlaying ? "playing" : "paused");
	}}
	onProgress={(currentTime) => {
		console.log("Current time", currentTime);
	}}
	onEnd={() => {
		console.log("Playback finished");
	}}
/>
```

### `VideoPlayer` ref methods

`VideoPlayer` also exposes an imperative ref API for playback and track/source switching.

```tsx
type VideoPlayerRef = {
	setState: (state: State) => void;
	setSubtitle: (index: number) => Promise<void>;
	setVideoSource: (index: number) => Promise<void>;
	seek: (time: number) => void;
	play: () => void;
	pause: () => void;
	getCurrentTime: () => Promise<number>;
	getCurrentVideoIndex: () => number;
	getCurrentSubtitleIndex: () => number;
};
```

`setSubtitle(index)` selects a subtitle track by index, `setVideoSource(index)` switches the active video source by index, and the getter methods return the currently selected source and subtitle indexes.

Example usage (concise `playerConfig`):

```ts
const playerConfig = {
	playerId: 'demo-player',
	videoSources: [{
		id: 'main',
		playerId: 'demo-player',
		label: 'Main stream',
		source: 'https://example.com/stream.m3u8',
		format: 'm3u8'
	}],
	subtitleSources: [],
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
