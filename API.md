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

| Property |     Type | Description                                               |
| -------- | -------: | --------------------------------------------------------- |
| `id`     | `number` | Index or id of the audio track (matches HLS/native index) |
| `name`   | `string` | Display name for the audio track                          |
| `lang?`  | `string` | Optional ISO language code                                |

### `QualityLevel`

| Property  |     Type | Description                                    |
| --------- | -------: | ---------------------------------------------- |
| `id`      | `number` | Unique id for level (HLS index or -1 for auto) |
| `height`  | `number` | Vertical resolution                            |
| `width`   | `number` | Horizontal resolution                          |
| `bitrate` | `number` | Level bitrate                                  |
| `name`    | `string` | Human label (e.g. `720p`)                      |

## `usePlayerController` (hook)

See `src/hooks/usePlayerController.ts` for full typings and runtime options. Key points:

- Returns `playerState`, `nativeVideoProps`, `playbackResources` and `controls`.
- `playerState` now includes an `isLive: boolean` flag that indicates whether the
- loaded media is a live stream (HLS live playlist or a source with no finite duration).
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
