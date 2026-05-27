import "react-native";
import { ScrollViewPropsAndroid, ScrollViewPropsIOS, Touchable, VirtualizedListProps } from "react-native";

declare module "react-native" {
	interface ScrollViewProps extends ViewProps, ScrollViewPropsIOS, ScrollViewPropsAndroid, Touchable {
		contentContainerClassName?: string;
		indicatorClassName?: string;
	}

	interface FlatListProps<ItemT> extends VirtualizedListProps<ItemT> {
		columnWrapperClassName?: string;
	}

	interface ViewProps {
		className?: string;
	}

	interface PressableProps {
		className?: string;
	}

	interface TextProps {
		className?: string;
	}

	interface PressableProps {
		className?: string;
	}

	interface TouchableOpacityProps {
		className?: string;
	}
}
