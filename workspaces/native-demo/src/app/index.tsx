import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function Home() {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, backgroundColor: 'purple' }}>
			<Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Cross Player — Native Demo</Text>
			<Text style={{ color: '#8a8a8a', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
				Resolves react-native-cross-player from source. Edit the package and it hot-reloads here.
			</Text>
			<Link href="/play" style={{ color: '#38bdf8', fontSize: 18, padding: 14 }}>
				Open Video Player →
			</Link>
		</View>
	);
}
