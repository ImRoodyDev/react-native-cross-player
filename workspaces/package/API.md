# API Reference

This file documents the public API of react-native-cross-player. It's extracted from the README for easier consumption and to provide more detailed, machine-friendly tables.

## Exports

- `VideoPlayer` (component) — in `src/ui/VideoPlayer`
- `PlayerControls` (component) — in `src/ui/PlayerControls`
- `FocusGuide` (component) — in `src/ui/FocusGuide`; `TVFocusGuideView` on TV, plain `View` elsewhere. Wrap overlay clusters that D-pad focus can't reach across non-focusable areas (style must be inline — TVFocusGuideView doesn't reliably support className).
- `usePlayerController` (hook) — in `src/hooks/usePlayerController`
- `useTVRemote` (hook) — in `src/hooks/useTVRemote`
- `useResponsiveSize` / `useResponsiveVars` (hooks) — in `src/hooks/useResponsiveSize`
- `useWebKeyboard` (hook) — in `src/hooks/useWebKeyboard`
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
- The initialization effect is keyed on the **content** of `videoSources`/`subtitleSources` (their ids), not array identity — passing inline arrays from a parent that re-renders (e.g. on progress/visibility updates) does not re-initialize the player.
- On native, side-loaded subtitles are exposed to react-native-video as `source.textTracks` built from each subtitle's created local VTT file (raw remote URL for entries not yet created). Selection uses `selectedTextTrack: { type: 'title' }` matched against the track title (set to the subtitle id) — index-based selection is unreliable on Android (react-native-video#2349). See "Notes on subtitles" below.

## `useTVRemote` (hook)

`useTVRemote(handlers, enabled?)` — subscribe to TV remote / D-pad key events. No-op outside TV platforms (requires `react-native-tvos`, which exposes `TVEventHandler.addListener`).

- `handlers`: partial map of `up | down | left | right | select | longSelect | playPause | fastForward | rewind | menu` to callbacks, plus an optional `any(event)` fired before each handled event (useful to reset auto-hide timers).
- Fires once per physical press (skips Android's key-down half; Android only dispatches key-up by default).
- Handlers are read through a ref — passing a fresh object every render is fine and does not resubscribe.

## `useResponsiveSize` / `useResponsiveVars` (hooks)

- Breakpoints: `mobile ≤ 599px`, `mobile_landscape ≤ 1023×479`, `tablet ≤ 899px`, `default` otherwise.
- `useResponsiveSize()` returns the active numeric size tokens, multiplied by the TV pixel-ratio scale (`window width / 1920`, clamped 0.4–1.1) on TV.
- `useResponsiveVars()` returns the same tokens as NativeWind CSS variables (`--side-padding`, `--h1-size`, …, plus `--pixel-ratio`); `VideoPlayer` applies these on its root so the stylesheet resolves on native.

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
    <td><code>subtitleStyle?</code></td>
    <td><code>SubtitleStyle</code></td>
    <td>Native subtitle rendering style (Android/iOS), merged over a responsive default <code>fontSize</code> (TV-scaled). Without an explicit font size some Android devices render side-loaded subtitles invisibly small.</td>
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
</tbody>
</table>

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

## Notes on subtitles

- **Web:** subtitles are converted to WebVTT (SRT → VTT supported), stored as `blob:` URLs and attached as `<track>` elements on the `<video>`. Attachment is idempotent per subtitle id (re-adding replaces the existing track).
- **Native:** subtitles are fetched, converted to WebVTT if needed and written to a local cache file which is declared in `source.textTracks` (`text/vtt`, or `application/x-subrip` for raw remote SRT). Requires react-native-video `>=6.0.0 <=6.14.1` — later 6.x releases (observed on 6.19.x) regressed side-loaded track handling.
- **All subtitles are declared in `source.textTracks` up front** (on the first load), regardless of `lazyLoadSources`: ExoPlayer only reads `textTracks` when it (re)prepares the source, so tracks merged in later — with an unchanged `uri` — never arrive. Not-yet-created entries are declared by their raw remote URL. Switching subtitles only flips `selectedTextTrack`; the source is never rebuilt for subtitles. Tracks are never attached to a source without a `uri` (media3 NPE).
- Native track selection is **title-based** (`selectedTextTrack: { type: 'title', value: <subtitle id> }`; each track's `title` is set to its subtitle id). Index-based selection does not reliably match ExoPlayer's internal track order (react-native-video#2349).
- The controller subscribes to `onTextTracks` and logs the tracks the native player actually discovered (`index`/`title`/`language`/`selected`) via `CNPLogger` — the first thing to check when a subtitle doesn't render: if the track is missing, the `textTracks` wiring failed; if present but `selected: false`, the selection didn't match.
- `VideoPlayer` always passes a `subtitleStyle` with a responsive `fontSize` (overridable via the `subtitleStyle` prop) so native subtitles are never rendered at an invisible size.

## Notes on audio tracks

- `audioTracks` are discovered at load time (HLS manifest or native `onLoad`).
- Use `controls.setAudioTrack(index)` to switch tracks; on web HLS the `AUDIO_TRACK_SWITCHED` event keeps the controller state in sync.

---

If you need more detailed machine-readable tables for every exported type or function, I can generate a complete props table automatically from the TypeScript sources.
