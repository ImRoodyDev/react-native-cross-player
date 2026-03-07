/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
	preset: "react-native",
	modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/src/hooks", "<rootDir>/src/ui"],
	// Allow these ESM modules to be transformed by Babel/Jest
	transformIgnorePatterns: ["/node_modules/(?!(@react-native|react-native|p-limit|yocto-queue)/)"],
	moduleNameMapper: {
		"^react-native-blob-util$": "<rootDir>/tests/modules/react-native-blob-util-stub.js"
	}
};
