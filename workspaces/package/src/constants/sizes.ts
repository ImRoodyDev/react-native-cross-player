export type SizeType = keyof typeof sizes;
export type SizeValues = typeof sizes.default;

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
