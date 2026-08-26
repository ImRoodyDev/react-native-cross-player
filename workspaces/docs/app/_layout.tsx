import '../global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
	return (
		<GestureHandlerRootView className="responsive-vars" style={{ flex: 1 }}>
			<SafeAreaProvider>
				<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }} />
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
