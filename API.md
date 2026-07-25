# API Reference

This file documents the public API of react-native-cross-player. It's extracted from the README for easier consumption and to provide more detailed, machine-friendly tables.

## Exports

- `VideoPlayer` (component) — in `src/ui/VideoPlayer`
- `PlayerControls` (component) — in `src/ui/PlayerControls`
- `usePlayerController` (hook) — in `src/hooks/usePlayerController`
- `HlsProxy` and controllers — in `src/controllers`
- Utility libs and types — in `src/libs` and `src/types`

## Types

### `AudioTrack`

<table>
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>id</code></td>
    <td><code>number</code></td>
    <td>Index or id of the audio track (matches HLS/native index)</td>
  </tr>
  <tr>
    <td><code>name</code></td>
    <td><code>string</code></td>
    <td>Display name for the audio track</td>
  </tr>
  <tr>
    <td><code>lang?</code></td>
    <td><code>string</code></td>
    <td>Optional ISO language code</td>
  </tr>
</tbody>
</table>

### `QualityLevel`

<table>
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>id</code></td>
    <td><code>number</code></td>
    <td>Unique id for level (HLS index or -1 for auto)</td>
  </tr>
  <tr>
    <td><code>height</code></td>
    <td><code>number</code></td>
    <td>Vertical resolution</td>
  </tr>
  <tr>
    <td><code>width</code></td>
    <td><code>number</code></td>
    <td>Horizontal resolution</td>
  </tr>
  <tr>
    <td><code>bitrate</code></td>
    <td><code>number</code></td>
    <td>Level bitrate</td>
  </tr>
  <tr>
    <td><code>name</code></td>
    <td><code>string</code></td>
    <td>Human label (e.g. <code>720p</code>)</td>
  </tr>
</tbody>
</table>

## `usePlayerController` (hook)

See `src/hooks/usePlayerController.ts` for full typings and runtime options. Key points:

- Returns `playerState`, `nativeVideoProps`, `playbackResources` and `controls`.
- `playerState` now includes an `isLive: boolean` flag that indicates whether the loaded media is a live stream (HLS live playlist or a source with no finite duration).
- Supports `initialVideoSource`, `initialSubtitleSource`, and `initialAudioTrack` (audio applied after media load).
- Accepts `maxResolutionHeight` to help filter or prefer quality levels when building level lists.

## `HlsProxy` and HLS helpers

- `HlsProxy` extends `hls.js` to include runtime proxy manager control.
- Methods: `setSource(url, options?, startTime?)`, `setProxyTunnelURL`, `setProxyTunnelHeaders`, `runDestroy`, etc.

## `controllers` and helpers

- `proxy-manager` and `proxy-loader` classes integrate with HLS loaders.
- Use when you need runtime proxying or rewriting of playlists.

## UI components

- `VideoPlayer` — high-level component that wires `usePlayerController` and `PlayerControls`.
- `PlayerControls` — UI controls and dropdowns for sources, subtitles, audio tracks and quality.

### `VideoPlayerProps`

<table>
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>videoTitle</code></td>
    <td><code>string</code></td>
    <td>Title shown in the player controls header.</td>
  </tr>
  <tr>
    <td><code>nextLabel?</code></td>
    <td><code>string</code></td>
    <td>Optional label for the next-video action button.</td>
  </tr>
  <tr>
    <td><code>language?</code></td>
    <td><code>Languages</code></td>
    <td>Localization language used by the built-in controls.</td>
  </tr>
  <tr>
    <td><code>playerConfig</code></td>
    <td><code>Omit&lt;PlayerControllerProps, "playerViewRef" | "videoRef" | "controlsRef"&gt;</code></td>
    <td>Configuration passed to <code>usePlayerController</code>.</td>
  </tr>
  <tr>
    <td><code>viewStyle?</code></td>
    <td><code>StyleProp&lt;ViewStyle&gt;</code></td>
    <td>Style applied to the outer player container.</td>
  </tr>
  <tr>
    <td><code>videoStyle?</code></td>
    <td><code>StyleProp&lt;ViewStyle&gt;</code></td>
    <td>Style applied to the rendered video element.</td>
  </tr>
  <tr>
    <td><code>theme?</code></td>
    <td><code>SliderThemeType</code></td>
    <td>Optional theme object forwarded to the progress slider from <code>react-native-awesome-slider</code>.</td>
  </tr>
  <tr>
    <td><code>onControlVisibilityChange?</code></td>
    <td><code>(visible: boolean) =&gt; void</code></td>
    <td>Called whenever the built-in controls are shown or hidden.</td>
  </tr>
  <tr>
    <td><code>onClosePlayer?</code></td>
    <td><code>() =&gt; void</code></td>
    <td>Called when the close button is pressed.</td>
  </tr>
  <tr>
    <td><code>onNextVideo?</code></td>
    <td><code>() =&gt; void</code></td>
    <td>Called when the next-video action is pressed.</td>
  </tr>
  <tr>
    <td><code>onSourceChange?</code></td>
    <td><code>(index: number, source: VideoSource) =&gt; void</code></td>
    <td>Called when the active video source changes.</td>
  </tr>
  <tr>
    <td><code>onSubtitleChange?</code></td>
    <td><code>(index: number, subtitle: SubtitleSource) =&gt; void</code></td>
    <td>Called when a subtitle track becomes active.</td>
  </tr>
  <tr>
    <td><code>onPlaybackChange?</code></td>
    <td><code>(isPlaying: boolean) =&gt; void</code></td>
    <td>Called when playback toggles between playing and paused.</td>
  </tr>
  <tr>
    <td><code>onProgress?</code></td>
    <td><code>(currentTime: number) =&gt; void</code></td>
    <td>Called on each progress update with the current playback time in seconds.</td>
  </tr>
  <tr>
    <td><code>onEnd?</code></td>
    <td><code>() =&gt; void</code></td>
    <td>Called when the active media finishes playback.</td>
  </tr>
  <tr>
    <td><code>onError?</code></td>
    <td><code>(error: PlayerError) =&gt; void</code></td>
    <td>Called when a source fails while preparing, while switching, or during playback. The player still shows its own error state; this only reports it. Act on <code>fatal</code> only.</td>
  </tr>
</tbody>
</table>

### `PlayerError`

Reported through `onError`. Lets a host that holds several alternative links for the same
media switch away the moment one is rejected, rather than inferring failure from a
"no playback yet" timeout.

<table>
<thead>
  <tr>
    <th>Field</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>phase</code></td>
    <td><code>"initialize" | "source-change" | "playback"</code></td>
    <td>Stage reached when the source failed. The first two mean it never played at all.</td>
  </tr>
  <tr>
    <td><code>sourceIndex</code></td>
    <td><code>number</code></td>
    <td>Index into <code>videoSources</code>, or <code>-1</code> when the failure predates source selection.</td>
  </tr>
  <tr>
    <td><code>sourceId?</code></td>
    <td><code>string | number</code></td>
    <td>Id of the failing source, when one was selected.</td>
  </tr>
  <tr>
    <td><code>fatal</code></td>
    <td><code>boolean</code></td>
    <td><code>true</code> when the source is unusable. Non-fatal hls.js errors are recoverable and retried internally — switching away on those abandons a healthy source.</td>
  </tr>
  <tr>
    <td><code>message</code></td>
    <td><code>string</code></td>
    <td>Human-readable summary, localized where the player had a message for it.</td>
  </tr>
  <tr>
    <td><code>cause?</code></td>
    <td><code>unknown</code></td>
    <td>Underlying error or native/hls.js event payload, for logging.</td>
  </tr>
</tbody>
</table>

```tsx
<VideoPlayer
  onError={(error) => {
    if (error.fatal) switchToNextSource(error.sourceIndex);
  }}
  // ...
/>
```

### `VideoPlayerRef`

<table>
<thead>
  <tr>
    <th>Method</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>setState</code></td>
    <td><code>(state: State) =&gt; void</code></td>
    <td>Sets the control overlay state shown by the player UI.</td>
  </tr>
  <tr>
    <td><code>setSubtitle</code></td>
    <td><code>(index: number) =&gt; Promise&lt;void&gt;</code></td>
    <td>Selects a subtitle track by index.</td>
  </tr>
  <tr>
    <td><code>setVideoSource</code></td>
    <td><code>(index: number) =&gt; Promise&lt;void&gt;</code></td>
    <td>Switches the active video source by index.</td>
  </tr>
  <tr>
    <td><code>seek</code></td>
    <td><code>(time: number) =&gt; void</code></td>
    <td>Seeks playback to the provided time in seconds.</td>
  </tr>
  <tr>
    <td><code>play</code></td>
    <td><code>() =&gt; void</code></td>
    <td>Resumes playback.</td>
  </tr>
  <tr>
    <td><code>pause</code></td>
    <td><code>() =&gt; void</code></td>
    <td>Pauses playback.</td>
  </tr>
  <tr>
    <td><code>getCurrentTime</code></td>
    <td><code>() =&gt; Promise&lt;number&gt;</code></td>
    <td>Returns the current playback time in seconds.</td>
  </tr>
  <tr>
    <td><code>getCurrentVideoIndex</code></td>
    <td><code>() =&gt; number</code></td>
    <td>Returns the currently selected video source index.</td>
  </tr>
  <tr>
    <td><code>getCurrentSubtitleIndex</code></td>
    <td><code>() =&gt; number</code></td>
    <td>Returns the currently selected subtitle index.</td>
  </tr>
</tbody>
</table>

## Notes on audio tracks

- `audioTracks` are discovered at load time (HLS manifest or native `onLoad`).
- Use `controls.setAudioTrack(index)` to switch tracks; on web HLS the `AUDIO_TRACK_SWITCHED` event keeps the controller state in sync.

---

If you need more detailed machine-readable tables for every exported type or function, I can generate a complete props table automatically from the TypeScript sources.
