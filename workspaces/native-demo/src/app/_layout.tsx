import '../styles/global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

// Mirrors the ztor app root: gesture root + keyboard provider + a native Stack with
// freezeOnBlur. expo-router provides the SafeAreaProvider / NavigationContainer
// (and the PreventRemoveProvider that showed up in the OOM investigation).
export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<Stack screenOptions={{ headerShown: false, freezeOnBlur: true }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="play" />
				</Stack>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}
