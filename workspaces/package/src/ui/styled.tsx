/**
 * Styled components that preserve className in DOM for web.
 *
 * Problem: react-native-web transforms className into inline styles,
 * generating class names like `css-view-*` and losing original class names.
 *
 * Solution: Use Reanimated components which DO preserve className on web.
 * Reanimated's components pass className directly to the DOM element.
 */
import { FlatList as RNFlatList, ScrollView as RNScrollView } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

// Use Reanimated components - they preserve className on web
export const View = Animated.View;
export const Text = Animated.Text;
export const ScrollView = Animated.ScrollView;

// FlatList - use type assertion to fix export issue
export const FlatList = Animated.FlatList as unknown as typeof RNFlatList;

// For Pressable, use Animated.View as base (Pressable functionality handled by gesture handler)
export const Pressable = Animated.View;

// SafeAreaView - wrap with Animated.createAnimatedComponent
export const SafeAreaView = RNSafeAreaView;

// Explicit Animated exports (same as above, for clarity)
export const AnimatedView = Animated.View;
export const AnimatedText = Animated.Text;
