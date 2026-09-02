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
						className={index == 0 && text.length < 5 ? "cnp-component-status-title-txt" : "cnp-component-status-txt"}
					>
						{text}
					</Text>
				));
			} else {
				return (
					<Text numberOfLines={4} ellipsizeMode={"tail"} selectable={false} className="cnp-component-status-txt">
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
		<AnimatedView entering={props.enteringAnimation || FadeInLeft} className={"cnp-component-status"} style={{ pointerEvents: "box-none" }}>
			<View
				className={"cnp-component-status-ctn"}
				style={[{ pointerEvents: "box-none", flexBasis: props.flexBasic }, Platform.OS !== "web" && { flexGrow: 1 }]}
			>
				{props.state == "loading" && (
					<View className="cnp-component-status-loading">
						<Spinner size={iconSize} strokeWidth={Math.max(outlineWidth, 2) + 1} />
						{textElement("...")}
					</View>
				)}

				{props.state == "succeed" && (
					<View className="cnp-component-status-succeed">
						<Icons.success className={"cnp-component-status-icon"} color={green["500"]} size={iconSize} />
					</View>
				)}

				{props.state == "error" && (
					<>
						<View className="cnp-component-status-failed">
							<Icons.danger className={"cnp-component-status-icon"} color={red["500"]} size={iconSize} />
						</View>
						{textElement()}
						{(props.enableOk || props.onOkPress) && (
							<Button
								onPress={props.onOkPress}
								text={t(props.okText || "OK")}
								className="cnp-component-status-btn"
								textClassName="cnp-component-status-btn-text"
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
