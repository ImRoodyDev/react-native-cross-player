import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useResponsiveSize } from "../hooks/useResponsiveSize";
import Button from "./Button";
import { zinc } from "tailwindcss/colors";
import { View, Text, AnimatedView, ScrollView } from "./styled";
import FocusGuide from "./FocusGuide";

type BaseProps<T> = {
	open?: boolean;
	title: string;
	items: T[];
	onSelect: (item: T, index: number) => void;
	afterSelect?: () => void;
	getItemText: (item: T) => string;
};

type Props<T> =
	| (BaseProps<T> & {
			defaultSelected: number;
			defaultValue?: never;
	  })
	| (BaseProps<T> & {
			defaultSelected?: never;
			defaultValue: T;
	  });

export type DropdownRef = {
	toggle: () => void;
	open: () => void;
	close: () => void;
	isDropdownOpen: () => boolean;
};

function PlayerDropdown<T>({ title, open, items, onSelect, getItemText, afterSelect, ...rest }: Props<T>, ref?: React.Ref<DropdownRef>) {
	const sizes = useResponsiveSize();
	const maxHeight = sizes.h2 * 5 + sizes.h1;

	const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const height = useSharedValue(0);
	const opacity = useSharedValue(0);

	// Read off `rest` up front: `rest` itself is a fresh object every render, so depending on it
	// made this memo (and the findIndex scan) re-run on every pass.
	const defaultSelected = (rest as { defaultSelected?: number }).defaultSelected;
	const defaultValue = (rest as { defaultValue?: T }).defaultValue;

	const resolvedDefaultIndex = useMemo(() => {
		if (typeof defaultSelected === "number") {
			return defaultSelected;
		}

		if (defaultValue !== undefined) {
			const idx = items.findIndex((i) => Object.is(i, defaultValue));
			return idx >= 0 ? idx : 0;
		}

		return 0;
	}, [items, defaultSelected, defaultValue]);

	const [selectedIndex, setSelectedIndex] = useState<number>(resolvedDefaultIndex);
	const [isDropdownOpen, setDropdownOpen] = useState(open ?? false);

	// Track changes to selection inputs
	useEffect(() => {
		setSelectedIndex(resolvedDefaultIndex);
	}, [resolvedDefaultIndex]);

	// Track changes to open prop
	useEffect(() => {
		if (open && !isDropdownOpen) openDropdown();
		else if (!open && isDropdownOpen) closeDropdown();
	}, [open]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const animatedStyle = useAnimatedStyle(
		() => ({
			height: height.value,
			opacity: opacity.value,
			transform: [
				{
					translateY: withTiming(isDropdownOpen ? 0 : 10, {
						duration: 300,
						easing: Easing.out(Easing.cubic)
					})
				}
			]
		}),
		[isDropdownOpen]
	);

	const openDropdown = useCallback(() => {
		if (isDropdownOpen) return; // Prevent reopening if already open

		height.value = withSpring(maxHeight, {
			damping: 20,
			stiffness: 120
		});
		opacity.value = withTiming(1, { duration: 200 });

		// Scroll to selected item after opening. Rows are a fixed height (.cnp-player-dropdown-item is
		// var(--h1-size) tall), so we can center the selection with a plain offset — no virtualization.
		timeoutRef.current = setTimeout(() => {
			if (selectedIndex > 0 && selectedIndex < items.length) {
				const rowHeight = sizes.h1;
				const y = Math.max(0, selectedIndex * rowHeight - maxHeight / 2 + rowHeight / 2);
				scrollRef.current?.scrollTo({ y, animated: true });
			}
		}, 500); // wait for animation to start

		setDropdownOpen(true);
	}, [isDropdownOpen, selectedIndex, items, sizes.h1, maxHeight]);
	const closeDropdown = useCallback(() => {
		if (height.value > 0 || opacity.value > 0) {
			height.value = withTiming(0, { duration: 300 });
			opacity.value = withTiming(0, { duration: 200 });
			setDropdownOpen(false);
		}

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);
	const onItemPress = useCallback(
		(item: T, index: number) => {
			onSelect(item, index);
			setSelectedIndex(index);
			closeDropdown();
			afterSelect?.();
		},
		[closeDropdown, onSelect, afterSelect]
	);
	const renderItem = useCallback(
		({ item, index }: { item: T; index: number }) => (
			<AnimatedView key={index} className={"cnp-player-dropdown-item-ptn"}>
				<Button
					onPress={() => onItemPress(item, index)}
					disabled={!isDropdownOpen}
					// Closed-dropdown items must not be focus candidates: `disabled` alone doesn't strip
					// Android TV focusability, so on close the focused item would keep focus inside the
					// collapsed dropdown. Dropping focusable forces the system to relocate focus.
					focusable={isDropdownOpen}
					// TV: when the dropdown opens, pull D-pad focus onto the currently selected item
					// so the user starts navigating from their active choice instead of the focus
					// staying stuck on the trigger button behind the dropdown.
					hasTVPreferredFocus={isDropdownOpen && index === (selectedIndex < 0 ? 0 : selectedIndex)}
					className="cnp-player-dropdown-item"
					textClassName={"cnp-player-dropdown-item-text"}
					text={getItemText(item)}
					borderRadius={8}
					textColor={"white"}
					focusedTextColor={"white"}
					backgroundColor={"transparent"}
					selectedBackgroundColor={zinc[700]}
					pressedBackgroundColor={zinc[800]}
				/>
				{index == selectedIndex && <View className={"cnp-player-dropdown-item-line"} />}
			</AnimatedView>
		),
		[onItemPress, selectedIndex, getItemText, isDropdownOpen]
	);

	useImperativeHandle(
		ref,
		() => ({
			isDropdownOpen: () => isDropdownOpen,
			open: () => openDropdown(),
			close: () => closeDropdown(),
			toggle: () => {
				if (isDropdownOpen) closeDropdown();
				else openDropdown();
			}
		}),
		[isDropdownOpen, openDropdown, closeDropdown]
	);

	return (
		<AnimatedView className="cnp-player-dropdown" style={[animatedStyle, { pointerEvents: "auto" }]}>
			{isDropdownOpen && <View className={"cnp-player-dropdown-touch-area"} onTouchStart={closeDropdown} onPointerDown={closeDropdown} />}
			<View className={"cnp-player-dropdown-bg"} />

			<View className={"cnp-player-dropdown-header"}>
				<Text className={"cnp-player-dropdown-title"}>{title}</Text>
				<View className={"cnp-player-dropdown-header-line"} />
			</View>

			{/*
			  Traps MUST be conditional on the dropdown being open: unconditional traps kept holding
			  focus after close — the focused item collapsed with the dropdown and focus was locked
			  inside an invisible view, leaving the D-pad completely dead.
			*/}
			<FocusGuide
				autoFocus={isDropdownOpen}
				trapFocusLeft={isDropdownOpen}
				trapFocusRight={isDropdownOpen}
				trapFocusDown={isDropdownOpen}
				trapFocusUp={isDropdownOpen}
				className={"cnp-player-dropdown-scroll-ptn"}
			>
				{/*
			  Plain ScrollView (not FlatList): this list is small and lives inside the app's page
			  ScrollView, and a VirtualizedList nested in a same-orientation ScrollView warns and
			  breaks windowing. nestedScrollEnabled lets the inner list scroll on Android.
			*/}
				<ScrollView
					className={"cnp-player-dropdown-scroll cnp-nice-scroll"}
					contentContainerClassName={"cnp-player-dropdown-items"}
					ref={scrollRef}
					scrollEnabled={isDropdownOpen}
					nestedScrollEnabled
					showsVerticalScrollIndicator={true}
					focusable={isDropdownOpen}
				>
					{items.map((item, index) => renderItem({ item, index }))}
				</ScrollView>
			</FocusGuide>
		</AnimatedView>
	);
}

export default memo(forwardRef(PlayerDropdown)) as <T>(props: Props<T> & { ref?: React.Ref<DropdownRef> }) => React.ReactElement;
