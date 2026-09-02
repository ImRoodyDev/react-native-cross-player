// External imports
import { ComponentProps, useCallback, useMemo } from "react";
import { DimensionValue, Platform } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";

// Internal imports
import { Icons, IconType } from "../constants/icons";
import { StateType } from "../hooks/useComponentState";

// Components
import Button from "./Button";
import Spinner from "./Spinner";
import { LocalizationKeys, t } from "../libs/localization";
import { useResponsiveSize, useResponsiveSizeType } from "../hooks/useResponsiveSize";
import { green, red, zinc } from "tailwindcss/colors";
import { View, Text, AnimatedView } from "./styled";

type EntryOrExitLayoutType = ComponentProps<typeof Animated.View>["entering"];

type ComponentStatusProps = {
	state: StateType;
	messages?: string | string[];
	enableOk?: boolean;
	onOkPress?: () => void;
	okText?: LocalizationKeys;
	okIcon?: IconType;
	flexBasic?: DimensionValue;
	enteringAnimation?: EntryOrExitLayoutType;
};

function ComponentStatus(props: ComponentStatusProps) {
	const screenType = useResponsiveSizeType();
	const { h1, span2, h2, outlineWidth } = useResponsiveSize();

	const textElement = useCallback(
		(extra: string = "") => {
			if (typeof props.messages !== "string") {
				return props.messages?.map((text, index) => (
					<Text
						key={index}
						numberOfLines={index == 0 ? 1 : 4}
						ellipsizeMode={"tail"}
						selectable={false}
						className={index == 0 && text.length < 5 ? "component-status-title-txt" : "component-status-txt"}
					>
						{text}
					</Text>
				));
			} else {
				return (
					<Text numberOfLines={4} ellipsizeMode={"tail"} selectable={false} className="component-status-txt">
						{props.messages || ""}
						{extra}
					</Text>
				);
			}
		},
		[props.messages]
	);

	const iconSize = useMemo(() => {
		if (screenType == "mobile" || screenType == "mobile_landscape") {
			return h2;
		} else {
			return h1 * 1.3;
		}
	}, [screenType, h1, h2]);

	return (
		<AnimatedView entering={props.enteringAnimation || FadeInLeft} className={"component-status"} style={{ pointerEvents: "box-none" }}>
			<View className={"component-status-ctn"} style={[{ pointerEvents: "box-none", flexBasis: props.flexBasic }, Platform.OS !== "web" && { flexGrow: 1 }]}>
				{props.state == "loading" && (
					<View className="component-status-loading">
						<Spinner size={iconSize} strokeWidth={Math.max(outlineWidth, 2) + 1} />
						{textElement("...")}
					</View>
				)}

				{props.state == "succeed" && (
					<View className="component-status-succeed">
						<Icons.success className={"component-status-icon"} color={green["500"]} size={iconSize} />
					</View>
				)}

				{props.state == "error" && (
					<>
						<View className="component-status-failed">
							<Icons.danger className={"component-status-icon"} color={red["500"]} size={iconSize} />
						</View>
						{textElement()}
						{(props.enableOk || props.onOkPress) && (
							<Button
								onPress={props.onOkPress}
								text={t(props.okText || "OK")}
								className="component-status-btn"
								textClassName="component-status-btn-text"
								icon={props.okIcon}
								borderRadius={99999}
								iconSize={span2}
								textColor={"black"}
								backgroundColor={zinc[700]}
								selectedBackgroundColor={zinc[600]}
								pressedBackgroundColor={zinc[500]}
								style={{ pointerEvents: "auto" }}
							/>
						)}
					</>
				)}
			</View>
		</AnimatedView>
	);
}

export default ComponentStatus;
