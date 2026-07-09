export type SizeType = keyof typeof sizes;
export type SizeValues = typeof sizes.default;
export type SizesKeys = keyof SizeValues;
export type CssVars = Record<`--${string}`, string | number>;

// Define font sizes that match your CSS variables
export const sizes = {
	default: {
		sidePadding: 42,
		topPadding: 32,

		h1: 48,
		h2: 42,
		h3: 36,
		h4: 32,
		h5: 28,
		span1: 24,
		span1b: 20,
		span2: 18,
		span3: 16,
		span4: 14,
		span5: 12,
		span6: 8,
		outlineWidth: 2
	},
	tablet: {
		sidePadding: 42,
		topPadding: 32,

		h1: 44,
		h2: 38,
		h3: 32,
		h4: 28,
		h5: 24,
		span1: 22,
		span1b: 20,
		span2: 16,
		span3: 14,
		span4: 12,
		span5: 10,
		span6: 8,
		outlineWidth: 1
	},
	mobile: {
		sidePadding: 22,
		topPadding: 20,

		h1: 36,
		h2: 30,
		h3: 26,
		h4: 24,
		h5: 22,
		span1: 20,
		span1b: 18,
		span2: 16,
		span3: 14,
		span4: 12,
		span5: 10,
		span6: 6,
		outlineWidth: 2
	},
	mobile_landscape: {
		sidePadding: 22,
		topPadding: 20,

		h1: 36,
		h2: 30,
		h3: 26,
		h4: 24,
		h5: 22,
		span1: 20,
		span1b: 18,
		span2: 16,
		span3: 14,
		span4: 12,
		span5: 10,
		span6: 6,
		outlineWidth: 2
	}
};

// ---------------------------------------------------------------------------------------------
// Responsive scaling — mirrors the ztor tv approach (see contexts/ResponsiveContext + sizes.native).
// On TV, px-like tokens are multiplied by a pixel-ratio/distance scale so the 10-foot UI tracks the
// panel size. Ratios / structural values are unitless and must never be scaled.
// ---------------------------------------------------------------------------------------------

const px = (n: number) => `${Math.round(n)}px`;
const px_unit = (n: number) => Math.round(n);
// Clamp hairline lines to >= 1px so an outline never vanishes when scaled down.
const hairline = (n: number) => Math.max(1, Math.round(n));

// px-like fields that scale with the TV distance factor.
const SCALABLE_SIZE_KEYS: SizesKeys[] = [
	"sidePadding",
	"topPadding",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"span1",
	"span1b",
	"span2",
	"span3",
	"span4",
	"span5",
	"span6"
];

/**
 * Numeric equivalent of `sizeToCssVars` for consumers that read tokens directly in inline styles.
 * Returns a copy with px-like values multiplied by `scale` (rounded); `scale === 1` is a no-op.
 */
export function scaleSizeValues(s: SizeValues, scale = 1): SizeValues {
	if (scale === 1) return s;

	const out = { ...s } as Record<SizesKeys, number>;
	for (const key of SCALABLE_SIZE_KEYS) {
		const value = out[key];
		if (typeof value === "number") out[key] = px_unit(value * scale);
	}
	if (typeof out.outlineWidth === "number") out.outlineWidth = hairline(out.outlineWidth * scale);

	return out as SizeValues;
}

/**
 * Emits the CSS custom properties consumed by styles.css (`--side-padding`, `--h5-size`, ...),
 * scaled by the TV pixel-ratio. Feed the result to nativewind's `vars()` and apply it on the
 * player root so the variables resolve on native (they only cascade from an ancestor that sets them).
 */
export function sizeToCssVars(s: SizeValues, scale = 1): CssVars {
	const sc = (n: number) => px(n * scale);
	return {
		"--pixel-ratio": scale,
		"--side-padding": sc(s.sidePadding),
		"--top-padding": sc(s.topPadding),

		"--h1-size": sc(s.h1),
		"--h2-size": sc(s.h2),
		"--h3-size": sc(s.h3),
		"--h4-size": sc(s.h4),
		"--h5-size": sc(s.h5),
		"--span1-size": sc(s.span1),
		"--span1b-size": sc(s.span1b),
		"--span2-size": sc(s.span2),
		"--span3-size": sc(s.span3),
		"--span4-size": sc(s.span4),
		"--span5-size": sc(s.span5),
		"--span6-size": sc(s.span6),

		"--outline-width": px(hairline(s.outlineWidth * scale))
	};
}
