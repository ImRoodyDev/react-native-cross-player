import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { FlatList as RNFlatList } from "react-native";
import { useResponsiveSize } from "../hooks/useResponsiveSize";
import Button from "./Button";
import { zinc } from "tailwindcss/colors";
import { View, Text, AnimatedView, FlatList } from "./styled";

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

	const flatListRef = useRef<RNFlatList<T>>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const height = useSharedValue(0);
	const opacity = useSharedValue(0);

	const resolvedDefaultIndex = useMemo(() => {
		if ("defaultSelected" in rest && typeof rest.defaultSelected === "number") {
			return rest.defaultSelected;
		}

		if ("defaultValue" in rest) {
			const idx = items.findIndex((i) => Object.is(i, rest.defaultValue));
			return idx >= 0 ? idx : 0;
		}

		return 0;
	}, [items, rest]);

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

		// Scroll to selected item after opening
		timeoutRef.current = setTimeout(() => {
			if (selectedIndex > 0 && selectedIndex < items.length) {
				flatListRef.current?.scrollToIndex({
					index: selectedIndex,
					animated: true,
					viewPosition: 0.5 // center in view
				});
			}
		}, 500); // wait for animation to start

		setDropdownOpen(true);
	}, [isDropdownOpen, selectedIndex, items]);
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
			<AnimatedView className={"player-dropdown-item-ptn"}>
				<Button
					onPress={() => onItemPress(item, index)}
					disabled={!isDropdownOpen}
					className="player-dropdown-item"
					textClassName={"player-dropdown-item-text"}
					text={getItemText(item)}
					borderRadius={8}
					textColor={"white"}
					focusedTextColor={"white"}
					backgroundColor={"transparent"}
					selectedBackgroundColor={zinc[700]}
					pressedBackgroundColor={zinc[800]}
				/>
				{index == selectedIndex && <View className={"player-dropdown-item-line"} />}
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
		<AnimatedView className="player-dropdown" style={[animatedStyle]}>
			{isDropdownOpen && <View className={"player-dropdown-touch-area"} onTouchStart={closeDropdown} onPointerDown={closeDropdown} />}
			<View className={"player-dropdown-bg"} />

			<View className={"player-dropdown-header"}>
				<Text className={"player-dropdown-title"}>{title}</Text>
				<View className={"player-dropdown-header-line"} />
			</View>

			<FlatList<T>
				className={"player-dropdown-scroll"}
				contentContainerClassName={"player-dropdown-items"}
				ref={flatListRef}
				data={items}
				keyExtractor={(_: T, i: number) => i.toString()}
				renderItem={renderItem}
				scrollEnabled={isDropdownOpen}
				aria-disabled={isDropdownOpen}
				showsVerticalScrollIndicator={true}
			/>
		</AnimatedView>
	);
}

export default memo(forwardRef(PlayerDropdown)) as <T>(props: Props<T> & { ref?: React.Ref<DropdownRef> }) => React.ReactElement;
