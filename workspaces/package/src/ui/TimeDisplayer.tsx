import { forwardRef, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { runOnJS, SharedValue, useAnimatedReaction } from "react-native-reanimated";
import { formatTime } from "../utils/helpers";
import { Text, AnimatedView } from "./styled";
import clsx from "clsx";

interface Props {
	currentTime: SharedValue<number>;
	fullTime: SharedValue<number>;
	className?: string;
}

const TimeDisplayer = forwardRef(({ currentTime, fullTime, className }: Props, ref?: any) => {
	const [currentDuration, setCurrentDuration] = useState(0);
	const [fullDuration, setFullDuration] = useState(0);

	useAnimatedReaction(
		() => {
			return currentTime.value;
		},
		(currentValue) => {
			"worklet";
			runOnJS(setCurrentDuration)(currentValue);
		}
	);

	useAnimatedReaction(
		() => {
			return fullTime.value;
		},
		(currentValue) => {
			"worklet";
			runOnJS(setFullDuration)(currentValue);
		}
	);

	return (
		<AnimatedView ref={ref} style={styles.container} className={clsx("player-time-displayer", className)}>
			<Text selectable={false} style={styles.timeText} className={"player-time-text"}>
				{formatTime(currentDuration)}
			</Text>
			<Text selectable={false} className={"player-time-separator"}>
				{" "}
				-{" "}
			</Text>
			<Text selectable={false} style={styles.timeText} className={"player-time-text"}>
				{formatTime(fullDuration)}
			</Text>
		</AnimatedView>
	);
});

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center"
	},
	timeText: {
		fontVariant: ["tabular-nums"], // Ensures consistent digit width
		color: "white"
	}
});

export default TimeDisplayer;
