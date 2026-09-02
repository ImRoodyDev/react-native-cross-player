// External imports
import { useMemo, useSyncExternalStore } from "react";
import { Dimensions, Platform } from "react-native";
import { vars } from "nativewind";

// Internal imports
import { sizes, SizeType, SizeValues, scaleSizeValues, sizeToCssVars } from "../constants/sizes";
import { getTvScale } from "../utils/scale";

/**
 * Breakpoints — kept in sync with the ztor tv app (contexts/ResponsiveContext.getSizeType):
 *   - width <= 599                      -> mobile
 *   - width <= 1023 && height <= 479    -> mobile_landscape
 *   - width <= 899                      -> tablet
 *   - otherwise                         -> default (large screens / TV)
 * Order matters: the first match wins.
 */
const getSizeType = (width: number, height: number): SizeType => {
	if (width <= 599) return "mobile";
	if (width <= 1023 && height <= 479) return "mobile_landscape";
	if (width <= 899) return "tablet";
	return "default";
};

/**
 * One app-wide breakpoint store shared by every responsive hook.
 *
 * `Dimensions` is an external store, so the React-recommended way to read it is
 * `useSyncExternalStore`. Previously each consumer (PlayerControls, every dropdown, every
 * button, ...) opened its own `Dimensions` listener and held its own state — 20+ identical
 * subscriptions on a single player. Here we keep ONE listener for the whole tree, attached
 * only while something is mounted, and expose the active breakpoint. The snapshot is a stable
 * primitive (the `SizeType`), so components re-render only when the breakpoint actually
 * changes — never on the intermediate pixels of a resize or rotation.
 */
const computeSizeType = (): SizeType => {
	const { width, height } = Dimensions.get("window");
	return getSizeType(width, height);
};

let currentSizeType: SizeType | null = null;
const listeners = new Set<() => void>();
let dimSubscription: ReturnType<typeof Dimensions.addEventListener> | null = null;

const handleChange = () => {
	const next = computeSizeType();
	// Only wake React when we actually cross a breakpoint.
	if (next !== currentSizeType) {
		currentSizeType = next;
		listeners.forEach((notify) => notify());
	}
};

const subscribe = (onStoreChange: () => void): (() => void) => {
	listeners.add(onStoreChange);
	if (!dimSubscription) {
		dimSubscription = Dimensions.addEventListener("change", handleChange);
		// A resize may have happened before the first subscriber attached.
		currentSizeType = computeSizeType();
	}
	return () => {
		listeners.delete(onStoreChange);
		if (listeners.size === 0 && dimSubscription) {
			dimSubscription.remove();
			dimSubscription = null;
		}
	};
};

// Stable snapshot (primitive) so useSyncExternalStore never tears or over-renders.
const getSizeTypeSnapshot = (): SizeType => {
	if (currentSizeType === null) currentSizeType = computeSizeType();
	return currentSizeType;
};

/** Active responsive breakpoint. Backed by a single, shared `Dimensions` subscription. */
export const useResponsiveSizeType = (): SizeType =>
	// Third arg (server snapshot) keeps react-native-web SSR from throwing.
	useSyncExternalStore(subscribe, getSizeTypeSnapshot, getSizeTypeSnapshot);

/**
 * Active responsive tokens as numbers, TV-scaled (via getTvScale) so inline styles match the
 * scaled CSS variables. On non-TV platforms the raw tokens are returned unchanged.
 */
export const useResponsiveSize = (): Readonly<SizeValues> => {
	const type = useResponsiveSizeType();
	return useMemo(() => {
		const raw = sizes[type];
		return Platform.isTV ? scaleSizeValues(raw, getTvScale()) : raw;
	}, [type]);
};

/**
 * The CSS custom properties (nativewind `vars()`) for the active breakpoint, scaled by the TV
 * pixel-ratio. Apply on the player root so every `var(--...)` in styles.css resolves on native.
 */
export const useResponsiveVars = () => {
	const type = useResponsiveSizeType();
	return useMemo(() => vars(sizeToCssVars(sizes[type], Platform.isTV ? getTvScale() : 1)), [type]);
};

export default useResponsiveSize;
