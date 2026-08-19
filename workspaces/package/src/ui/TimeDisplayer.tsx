import { forwardRef, memo, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { runOnJS, SharedValue, useAnimatedReaction } from "react-native-reanimated";
import { formatTime } from "../utils/helpers";
import { Text, AnimatedView } from "./styled";
import clsx from "clsx";

interface Props {
	currentTime: SharedValue<number>;
	fullTime: SharedValue<number>;
	/**
	 * Controls' fade opacity. While faded out the clock is invisible, so it stops crossing to JS —
	 * the auto-hide means that's most of playback. Omit to always update.
	 */
	visibility?: SharedValue<number>;
	className?: string;
}

const TimeDisplayer = forwardRef(({ currentTime, fullTime, visibility, className }: Props, ref?: any) => {
	const [currentDuration, setCurrentDuration] = useState(0);
	const [fullDuration, setFullDuration] = useState(0);

	// Only whole seconds are rendered, and only while the controls are actually on screen. Each
	// update is a React commit (~17ms — a whole 60fps frame), so gate it on both: the raw float
	// used to hop to JS ~4x/s, even with the controls faded out.
	// -1 means "don't update"; going visible again always differs from -1, so it refreshes at once.
	useAnimatedReaction(
		() => {
			const shown = visibility ? visibility.value > 0.01 : true;
			return shown ? Math.floor(currentTime.value) : -1;
		},
		(seconds, previous) => {
			"worklet";
			if (seconds >= 0 && seconds !== previous) runOnJS(setCurrentDuration)(seconds);
		}
	);

	useAnimatedReaction(
		() => {
			const shown = visibility ? visibility.value > 0.01 : true;
			return shown ? Math.floor(fullTime.value) : -1;
		},
		(seconds, previous) => {
			"worklet";
			if (seconds >= 0 && seconds !== previous) runOnJS(setFullDuration)(seconds);
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

// memo: every prop is a stable shared value, so a PlayerControls render shouldn't re-render the
// clock — its own reaction owns when it updates.
export default memo(TimeDisplayer);
