import { memo, useCallback, useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";

// Internal imports
import { Icons, IconType } from "../constants/icons";
import { useResponsiveSize } from "../hooks/useResponsiveSize";
import { View, AnimatedView } from "./styled";

type Props = {
	icon: IconType;
	onPress: () => void;
	tap?: number;
	autoHide?: boolean;
	disable?: boolean;
};

const AnimationDuration = 300;
const ResetDelay = 200;

function PlayerGesture(props: Props) {
	const sizes = useResponsiveSize();
	const animatedOpacity = useSharedValue(1); // Starts visible
	const animatedScale = useSharedValue(1); // Starts at normal scale

	// Effect to handle autoHide on mount and when autoHide prop changes
	useEffect(() => {
		if (props.autoHide) {
			// Trigger auto-hide animation after delay
			animatedOpacity.value = withDelay(1000, withTiming(0, { duration: AnimationDuration, easing: Easing.ease }));
			animatedScale.value = withDelay(1000, withTiming(0, { duration: AnimationDuration, easing: Easing.ease }));
		} else {
			// If autoHide is false, ensure component stays visible
			animatedOpacity.value = withTiming(1, { duration: AnimationDuration, easing: Easing.ease });
			animatedScale.value = withTiming(1, { duration: AnimationDuration, easing: Easing.ease });
		}
	}, [props.autoHide]);

	const animateTouch = useCallback(() => {
		// Show then auto-hide
		animatedOpacity.value = withSequence(
			withTiming(1, { duration: AnimationDuration, easing: Easing.ease }),
			withDelay(ResetDelay * 3, withTiming(0, { duration: AnimationDuration, easing: Easing.ease }))
		);

		animatedScale.value = withSequence(withSpring(1), withDelay(ResetDelay, withTiming(0, { duration: AnimationDuration, easing: Easing.in(Easing.ease) })));
	}, [props.autoHide]);

	const doubleTap = Gesture.Tap()
		.numberOfTaps(props.tap || 2)
		.onStart(() => {
			props.onPress();
			animateTouch();
		});

	if (props.disable) return null;

	return (
		<View className={"player-gesture"}>
			<GestureDetector gesture={doubleTap}>
				<View className={"player-gesture-ctn"}>
					<AnimatedView
						style={[
							{
								opacity: animatedOpacity,
								transform: [{ scale: animatedScale }]
							}
						]}
						className={"player-gesture-icon"}
					/>
					<AnimatedView style={{ opacity: animatedOpacity }}>{Icons[props.icon]({ color: "white", size: sizes.h1 })}</AnimatedView>
				</View>
			</GestureDetector>
		</View>
	);
}

export default memo(PlayerGesture);
