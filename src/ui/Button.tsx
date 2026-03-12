// External imports
import { TextStyle, View as RNView, ColorValue, Platform } from "react-native";
import React, { memo, Ref, useMemo } from "react";
import clsx from "clsx";
import { ButtonAllowedStyle, CustomButton, CustomButtonProps, joinClsx, PressableStyle } from "react-native-cross-elements";

// Internal imports
import { Icons, IconType } from "../constants/icons";
import { Text } from "./styled";

// Type definitions
type ButtonProps = {
	// Text
	text?: string;
	textClassName?: string;
	textStyle?: Omit<TextStyle, "color">;

	// Icon style
	icon?: undefined | IconType;
	iconSize?: number;

	focusOutlined?: boolean;
	focusOutlineColor?: ColorValue;

	borderRadius?: number;
	hideAndDisable?: boolean;
} & Omit<CustomButtonProps, "children">;

const Button = React.forwardRef((props: ButtonProps, ref?: Ref<RNView>) => {
	// Destructure props with defaults
	const {
		style,
		text,
		textStyle,
		textClassName,
		icon,
		iconSize = 24,
		borderRadius,
		focusOutlined,
		className,
		focusOutlineColor = "white",
		...baseButtonProps
	} = props;

	// Memoized style extraction to handle dynamic styles
	const extractedStyle = useMemo((): PressableStyle => {
		return (state) => {
			const focused = state.focused || state.pressed || state.hovered;
			const result: ButtonAllowedStyle = typeof style === "function" ? style(state) : ((style ?? {}) as ButtonAllowedStyle);
			return {
				// Because on we default button have outline on it
				...(Platform.OS == "web" && { outline: "none" }),
				...result,
				borderRadius,
				...(focused &&
					focusOutlined && {
						outlineWidth: 2,
						outlineOffset: 0,
						outlineStyle: "solid",
						outlineColor: focusOutlineColor
					})
			};
		};
	}, [borderRadius, focusOutlineColor, focusOutlined, style]);

	if (props.hideAndDisable) return null;

	return (
		<CustomButton ref={ref} enableRipple {...baseButtonProps} className={clsx(className, "gap-3")} style={extractedStyle}>
			{({ currentTextColor }) => (
				<>
					{icon &&
						Icons[icon]({
							className: clsx("base-btn-icon", joinClsx(className?.split(" ").toReversed()[0], "icon")),
							color: currentTextColor as string,
							size: iconSize
						})}
					{text && (
						<Text
							selectable={false}
							numberOfLines={1}
							adjustsFontSizeToFit
							className={clsx("base-btn-txt", joinClsx(className, "txt"), textClassName)}
							style={[textStyle, { color: currentTextColor }]}
						>
							{text}
						</Text>
					)}
				</>
			)}
		</CustomButton>
	);
});

export default memo(Button);
