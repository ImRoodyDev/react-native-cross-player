const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

module.exports = (() => {
	const projectRoot = __dirname;
	const monorepoRoot = path.resolve(projectRoot, '../..');
	const packageRoot = path.resolve(monorepoRoot, 'workspaces/package');
	const packageSourceEntry = path.resolve(packageRoot, 'src/index.ts');

	const config = getDefaultConfig(projectRoot);

	const defaultResolveRequest = config.resolver.resolveRequest;

	config.resolver.resolveRequest = (context, moduleName, platform) => {
		// Only alias react-native-cross-player for native platforms (android/ios)
		if (moduleName === 'react-native-cross-player') {
			return {
				type: 'sourceFile',
				filePath: packageSourceEntry,
			};
		}

		// pretty-format v30 ships an ESM build whose *default* export is undefined under Metro's
		// web resolution (exports/browser condition). @expo/metro-runtime's HMRClient does
		// `prettyFormat.default`, which then throws "Cannot read properties of undefined". Pin it
		// to the CJS build so the default export exists (native already picks CJS via `main`).
		if (moduleName === 'pretty-format') {
			return {
				type: 'sourceFile',
				filePath: path.resolve(monorepoRoot, 'node_modules/pretty-format/build/index.js'),
			};
		}

		// Let Expo/Metro handle everything else normally.
		return defaultResolveRequest
			? defaultResolveRequest(context, moduleName, platform)
			: context.resolveRequest(context, moduleName, platform);
	};

	config.transformer = {
		...config.transformer,
		babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
	};

	config.resolver = {
		...config.resolver,
		assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
		sourceExts: [...config.resolver.sourceExts, 'svg'],
	};

	return withNativeWind(config, {
		input: './src/styles/global.css',
	});
})();
