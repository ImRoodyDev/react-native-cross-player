import { useEffect, useRef } from "react";

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler | undefined>;
type UseWebKeyboardOptions = {
	event?: "keydown" | "keyup" | "keypress";
	target?: Window | HTMLElement | Document | null;
	enabled?: boolean;
};

/**
 * useWebKeyboard
 * - Provide a mapping of keys to handlers: { "a": (e) => {}, "Escape": (e) => {} }
 * - Options: `event` (keydown|keyup|keypress), `target` (window/document/element), `enabled`
 */
export function useWebKeyboard(keys: KeyMap, options?: UseWebKeyboardOptions) {
	const keysRef = useRef<KeyMap>(keys);
	const enabledRef = useRef<boolean>(options?.enabled ?? true);
	const eventType = options?.event ?? "keydown";

	useEffect(() => {
		keysRef.current = keys;
	}, [keys]);

	useEffect(() => {
		enabledRef.current = options?.enabled ?? true;
	}, [options?.enabled]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (!enabledRef.current) return;
			const key = e.key;
			// direct match, then try lowercase/uppercase fallback
			const fn = keysRef.current[key] ?? keysRef.current[key.toLowerCase()] ?? keysRef.current[key.toUpperCase()];
			if (fn) fn(e);
		};

		const target = options?.target ?? (typeof window !== "undefined" ? window : null);
		if (!target || !("addEventListener" in target)) return; // attach
		(target as Window).addEventListener(eventType, handler as EventListener);
		return () => {
			(target as Window).removeEventListener(eventType, handler as EventListener);
		};
	}, [eventType, options?.target]);
}

export default useWebKeyboard;
