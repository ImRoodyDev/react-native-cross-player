// External imports
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

// Internal imports
import { sizes, SizeType, SizeValues } from "../constants/sizes";

type ResponsiveValues = SizeValues;

// Function to get the current device type based on screen width
const getSizeType = (width: number, height: number): SizeType => {
	if (width <= 767 && height >= 480) {
		return "mobile";
	} else if (width <= 1023 && width >= 768 && height >= 480) return "tablet";
	else if (width <= 1023 && height <= 480) return "mobile_landscape";

	return "default";
};

/** Custom hook to get responsive sizes based on device type */
export const useResponsiveSize = () => {
	// Get the window dimensions
	const dimensionsRef = useRef<ScaledSize>(Dimensions.get("window"));

	// Keep track of the current size type
	const [_, setCurrentSizeType] = useState<SizeType>("default");

	// Store responsive values based on device type
	const [responsiveValues, setResponsiveValues] = useState<ResponsiveValues>(sizes.default);

	// Update responsive values only when size type changes
	useEffect(() => {
		const onChange = () => {
			dimensionsRef.current = Dimensions.get("window");
			const { width, height } = dimensionsRef.current;

			// Get the current size type based on the window dimensions
			const newSizeType = getSizeType(width, height);
			//console.log('Current size type:', newSizeType );

			// Only update if the size type has actually changed
			// if (newSizeType !== currentSizeType) {
			setCurrentSizeType(newSizeType);
			setResponsiveValues(sizes[newSizeType]);
			// }
		};

		// Listen for window dimension changes
		const dimensionSubsription = Dimensions.addEventListener("change", onChange);

		// Initialize setup
		onChange();
		return () => {
			dimensionSubsription?.remove();
		};
	}, []);

	return responsiveValues as Readonly<ResponsiveValues>;
};
