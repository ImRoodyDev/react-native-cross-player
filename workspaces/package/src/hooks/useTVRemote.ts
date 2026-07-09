// External imports
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as ReactNative from "react-native";

/**
 * Remote/D-pad event types emitted by react-native(-tvos) TVEventHandler.
 * Directional + select come from the D-pad; the media keys come from dedicated remote buttons.
 */
export type TVRemoteEvent =
	| "up"
	| "down"
	| "left"
	| "right"
	| "select"
	| "longSelect"
	| "playPause"
	| "fastForward"
	| "rewind"
	| "menu";

export type TVRemoteHandlers = Partial<Record<TVRemoteEvent, () => void>> & {
	/** Fired for every handled event, before the specific handler — useful to reset an auto-hide timer. */
	any?: (event: TVRemoteEvent) => void;
};

// react-native-tvos exposes TVEventHandler; plain react-native (phone/web builds) does not.
// Resolve it defensively so this hook is a no-op off-TV and never breaks non-tvos bundles/types.
//
// NOTE: In current react-native-tvos (RN 0.79) `TVEventHandler` is a plain object with an
// `addListener(cb)` method that returns a subscription — it is NOT a constructable class. Calling
// `new TVEventHandler()` throws "constructor is not callable", so we must use `addListener`. The
// callback receives the event directly (older versions passed `(component, event)`).
type HWEvent = { eventType: string; eventKeyAction?: number };
type TVEventSubscription = { remove: () => void };
type TVEventHandlerObject = { addListener: (callback: (event: HWEvent) => void) => TVEventSubscription };
const TVEventHandler = (ReactNative as unknown as { TVEventHandler?: TVEventHandlerObject }).TVEventHandler;

/**
 * Subscribe to TV remote key events.
 *
 * - Only active on TV (and when `enabled`); a no-op everywhere else.
 * - Handlers are read through a ref, so passing a fresh object each render is fine — the native
 *   subscription is created once (per `enabled`) and never torn down on every render.
 * - Fires once per physical press. IMPORTANT: Android's ReactAndroidHWInputDeviceHelper only
 *   dispatches `onHWKeyEvent` on key-UP (eventKeyAction === 1) by default — key-DOWN (0) is emitted
 *   only when the `enableKeyDownEvents` feature flag is on. So we must NOT act on key-down; we skip
 *   action 0 and act on everything else (up = 1, synthetic long-press = -1, tvOS = undefined). This
 *   fires exactly once per press in both configs.
 */
export function useTVRemote(handlers: TVRemoteHandlers, enabled = true) {
	const handlersRef = useRef(handlers);
	useEffect(() => {
		handlersRef.current = handlers;
	}, [handlers]);

	useEffect(() => {
		if (!Platform.isTV || !enabled || typeof TVEventHandler?.addListener !== "function") return;

		const subscription = TVEventHandler.addListener((event) => {
			if (!event) return;
			// Skip only the Android key-DOWN half so each press fires once (see note above).
			if (event.eventKeyAction === 0) return;

			const eventType = event.eventType as TVRemoteEvent;
			const map = handlersRef.current;
			const handler = map[eventType];
			if (!handler) return;

			map.any?.(eventType);
			handler();
		});

		return () => subscription?.remove?.();
	}, [enabled]);
}

export default useTVRemote;
