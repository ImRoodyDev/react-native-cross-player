import 'react-native';
import 'react-native/Libraries/Components/Pressable/Pressable';
import 'react-native/Libraries/StyleSheet/StyleSheetTypes';

declare module 'react-native/Libraries/Components/Pressable/Pressable' {
	interface PressableStateCallbackType {
		readonly hovered?: boolean;
		readonly focused?: boolean;
	}
}

declare module 'react-native/Libraries/StyleSheet/StyleSheetTypes' {
	interface ViewStyle {
		transitionDuration?: string | number;
		transitionProperty?: string;
		transitionTimingFunction?: string;
	}

	interface TextStyle {
		transitionDuration?: string | number;
		transitionProperty?: string;
		transitionTimingFunction?: string;
	}

	interface ImageStyle {
		transitionDuration?: string | number;
		transitionProperty?: string;
		transitionTimingFunction?: string;
	}
}
