import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export function useHydratedViewportWidth(fallbackWidth = 390) {
	const { width } = useWindowDimensions();
	const [hydratedWidth, setHydratedWidth] = useState(fallbackWidth);

	useEffect(() => {
		const readWidth = () => {
			if (Platform.OS === 'web' && typeof window !== 'undefined') {
				setHydratedWidth(window.innerWidth);
				return;
			}

			setHydratedWidth(width);
		};

		readWidth();

		if (Platform.OS !== 'web' || typeof window === 'undefined') {
			return undefined;
		}

		window.addEventListener('resize', readWidth);
		return () => window.removeEventListener('resize', readWidth);
	}, [width]);

	return hydratedWidth;
}
