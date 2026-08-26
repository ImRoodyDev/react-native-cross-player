/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',
		'./src/styles/**/*.css',
		// Scan the player source so its className utilities are generated.
		'../package/src/**/*.{js,jsx,ts,tsx}',
	],
	presets: [require('nativewind/preset')],
	darkMode: 'class',
	theme: {
		extend: {},
	},
	plugins: [],
};
