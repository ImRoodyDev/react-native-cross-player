import React from "react";
import { Platform, View, ViewProps } from "react-native";
import * as ReactNative from "react-native";

export type FocusGuideProps = ViewProps & {
	/**
	 * When the guide gains TV focus, redirect it to the last-focused (or first focusable)
	 * descendant instead of leaving it on the guide itself.
	 */
	autoFocus?: boolean;
	/** Optional explicit focus destinations (react-native-tvos). */
	destinations?: unknown[];
	trapFocusUp?: boolean;
	trapFocusDown?: boolean;
	trapFocusLeft?: boolean;
	trapFocusRight?: boolean;
};

// react-native-tvos exports TVFocusGuideView; plain react-native (phone/web builds) does not.
// Resolve defensively so this component never breaks non-tvos bundles or web.
const TVFocusGuideView = (ReactNative as unknown as { TVFocusGuideView?: React.ComponentType<FocusGuideProps> }).TVFocusGuideView;

/**
 * TV spatial-navigation focus guide with a plain <View> fallback off-TV.
 *
 * On Android TV the native focus finder picks the geometrically "best" candidate in the pressed
 * direction — with a large non-focusable gap (e.g. the gesture area between a player's header and
 * its bottom button row) it can keep bouncing between two nearby focusables and never reach the
 * far cluster. Wrapping the far cluster in a focus guide makes its WHOLE area a valid focus
 * target, and `autoFocus` forwards the focus to a real button inside.
 *
 * NOTE: style must be passed inline (TVFocusGuideView does not reliably support className).
 */
export function FocusGuide({ autoFocus, destinations, trapFocusUp, trapFocusDown, trapFocusLeft, trapFocusRight, ...viewProps }: FocusGuideProps) {
	if (Platform.isTV && TVFocusGuideView) {
		return (
			<TVFocusGuideView
				autoFocus={autoFocus}
				destinations={destinations}
				trapFocusUp={trapFocusUp}
				trapFocusDown={trapFocusDown}
				trapFocusLeft={trapFocusLeft}
				trapFocusRight={trapFocusRight}
				{...viewProps}
			/>
		);
	}

	// Non-TV (web, phone): the guide is purely structural.
	return <View {...viewProps} />;
}

export default FocusGuide;
