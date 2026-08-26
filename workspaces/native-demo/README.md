# native-demo

A minimal Expo (New Architecture) app for testing **react-native-cross-player** on a real device,
**resolved straight from the package source** — no `npm pack` / tgz rebuild needed.

- Edit anything under `../package/src/**` and it hot-reloads here (Metro watches the source).
- Versions and config mirror the `ztor` app (RN 0.79.7, Expo 53, Reanimated 3.17, NativeWind 4.1,
  expo-router native stack with `freezeOnBlur`, react-native-video, gesture-handler, etc.) so device
  behaviour matches.

## How it works

`metro.config.js` forces `react-native-cross-player` → `../package/src/index.ts` and dedupes React /
Reanimated to the single hoisted copy at the repo root. `tailwind.config.js` also scans the package
source so the player's `className` utilities are generated. `src/styles/global.css` imports the
player CSS from source (`../../../package/src/css/styles.css`).

## Run (physical device or emulator)

First build creates the native project (needed because the player uses native modules):

```bash
# from the repo root
npm run demo:prebuild        # expo prebuild --clean  (generates android/)
npm run demo:android         # expo run:android       (build + install + launch)
```

Or directly:

```bash
cd workspaces/native-demo
npx expo run:android --device      # pick your device
```

Then edit the player source and it live-reloads. The screen `src/app/play.tsx` reproduces the ztor
"movies/play" configuration (dummy MP4 + remote VTT subtitles + autoStart). `src/app/index.tsx` links
to it through the navigation stack (the OOM investigation traced the runaway re-render up to
react-navigation's `PreventRemoveProvider`, so the player is tested inside a real Stack).

## Notes

- The demo transforms the player through NativeWind's Babel/JSX transform (source), unlike the app
  which consumes the precompiled dist — so `className` is handled the "normal" way here.
- `react-native-safe-area-context` / `react-native-svg` resolve to a single hoisted copy
  (5.9.1 / 15.15.5); pin them in the root `overrides` if you need to match ztor's 5.4.0 / 15.11.2 exactly.
