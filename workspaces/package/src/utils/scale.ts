import { Dimensions, Platform } from "react-native";

// The width the size tokens were authored at. On TV we scale everything relative to this so
// the 10-foot UI grows/shrinks with the panel instead of being pinned to phone-sized values.
const REFERENCE_WIDTH = 1920;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.1;

/**
 * TV distance / pixel-ratio scale factor.
 *
 * Mirrors the ztor `getTvScale`: the active window width relative to a 1920 reference,
 * clamped to a sane range. Returns 1 on non-TV platforms so phone/web sizing is untouched.
 * This is the value fed to `sizeToCssVars` (as `--pixel-ratio`) and `scaleSizeValues`.
 */
export function getTvScale(): number {
	if (!Platform.isTV) return 1;
	const { width } = Dimensions.get("window");
	const raw = width / REFERENCE_WIDTH;
	return Math.min(Math.max(raw, MIN_SCALE), MAX_SCALE);
}

export default getTvScale;
