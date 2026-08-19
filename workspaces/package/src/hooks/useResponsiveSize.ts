// External imports
import { useEffect, useMemo, useState } from "react";
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

// Shared subscription to the active breakpoint's raw (unscaled) tokens.
const useRawResponsiveValues = (): SizeValues => {
	const [values, setValues] = useState<SizeValues>(() => {
		const { width, height } = Dimensions.get("window");
		return sizes[getSizeType(width, height)];
	});

	useEffect(() => {
		const onChange = () => {
			const { width, height } = Dimensions.get("window");
			setValues(sizes[getSizeType(width, height)]);
		};

		const subscription = Dimensions.addEventListener("change", onChange);
		onChange();
		return () => subscription?.remove();
	}, []);

	return values;
};

/**
 * Active responsive tokens as numbers, TV-scaled (via getTvScale) so inline styles match the
 * scaled CSS variables. On non-TV platforms the raw tokens are returned unchanged.
 */
export const useResponsiveSize = (): Readonly<SizeValues> => {
	const raw = useRawResponsiveValues();
	return useMemo(() => (Platform.isTV ? scaleSizeValues(raw, getTvScale()) : raw), [raw]);
};

/**
 * The CSS custom properties (nativewind `vars()`) for the active breakpoint, scaled by the TV
 * pixel-ratio. Apply on the player root so every `var(--...)` in styles.css resolves on native.
 */
export const useResponsiveVars = () => {
	const raw = useRawResponsiveValues();
	return useMemo(() => vars(sizeToCssVars(raw, Platform.isTV ? getTvScale() : 1)), [raw]);
};

export default useResponsiveSize;
