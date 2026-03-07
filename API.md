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

## Notes on audio tracks

- `audioTracks` are discovered at load time (HLS manifest or native `onLoad`).
- Use `controls.setAudioTrack(index)` to switch tracks; on web HLS the `AUDIO_TRACK_SWITCHED` event keeps the controller state in sync.

---

If you need more detailed machine-readable tables for every exported type or function, I can generate a complete props table automatically from the TypeScript sources.
