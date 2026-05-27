import React from 'react';
import { Text, View } from 'react-native';
import { Callout, DocPage } from '../../components/DocPage';
import { CodeBlock } from '../../components/CodeBlock';

const INSTALL_NPM = `npm install react-native-cross-player`;
const INSTALL_YARN = `yarn add react-native-cross-player`;

const PEERS = `npm install nativewind react-native-awesome-slider react-native-blob-util react-native-gesture-handler react-native-orientation-locker react-native-reanimated react-native-safe-area-context react-native-svg react-native-system-navigation-bar react-native-video react-native-worklets tailwindcss`;

const BABEL_CONFIG = `// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['@babel/plugin-proposal-export-namespace-from', 'react-native-reanimated/plugin'],
  };
};`;

const METRO_CONFIG = `// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });`;

const WEB_CSS = `/* global.css */
@import "react-native-cross-player/styles.css";`;

const PROVIDER_SETUP = `import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView className="responsive-vars" style={{ flex: 1 }}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
}`;

export default function InstallationPage() {
	return (
		<DocPage
			title="Installation"
			description="Get react-native-cross-player installed with the video, gesture, subtitle, and styling runtime it expects."
			sections={[
				{
					title: '1. Install the package',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm mb-2">With npm:</Text>
							<CodeBlock code={INSTALL_NPM} language="bash" />
							<Text className="text-zinc-400 text-sm mt-2 mb-2">Or with yarn:</Text>
							<CodeBlock code={INSTALL_YARN} language="bash" />
						</View>
					),
				},
				{
					title: '2. Install peer dependencies',
					content: (
						<View className="gap-3">
							<Callout type="warning">
								The package keeps video, gesture, animation, and app shell libraries as peers so your app controls
								the native versions.
							</Callout>
							<CodeBlock code={PEERS} language="bash" />
						</View>
					),
				},
				{
					title: '3. Configure Babel and Metro',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								NativeWind powers the built-in controls. Use the NativeWind JSX import source and keep Reanimated as
								the last Babel plugin.
							</Text>
							<CodeBlock code={BABEL_CONFIG} language="js" />
							<Text className="text-zinc-400 text-sm leading-6">
								Metro also needs to load your global stylesheet through NativeWind.
							</Text>
							<CodeBlock code={METRO_CONFIG} language="js" />
						</View>
					),
				},
				{
					title: '4. Import web styles',
					content: (
						<View className="gap-3">
							<Callout type="info">For web, import the player CSS once in your global stylesheet or app entry.</Callout>
							<CodeBlock code={WEB_CSS} language="css" />
							<Text className="text-zinc-400 text-sm leading-6">
								The CSS defines player sizing variables under the `responsive-vars` class. Add that class to your app
								root so every player can read `--side-padding`, `--h1-size`, and the other responsive variables.
							</Text>
						</View>
					),
				},
				{
					title: '5. Wrap your app',
					content: (
						<View className="gap-3">
							<Text className="text-zinc-400 text-sm leading-6">
								Mount gesture and safe-area providers around screens that render the player, and keep `responsive-vars`
								on the application root. Without that class, the CSS variables used by the controls are not defined.
							</Text>
							<CodeBlock code={PROVIDER_SETUP} language="tsx" />
						</View>
					),
				},
			]}
		/>
	);
}
