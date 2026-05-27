import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type BooleanControl = {
	type: 'boolean';
	label: string;
	value: boolean;
	onChange: (v: boolean) => void;
};

type SelectControl = {
	type: 'select';
	label: string;
	value: string;
	options: string[];
	onChange: (v: string) => void;
};

type Control = BooleanControl | SelectControl;

type Props = {
	controls: Control[];
};

export function PropControls({ controls }: Props) {
	return (
		<View style={styles.panel}>
			<Text style={styles.heading}>Props</Text>
			<View style={styles.rows}>
				{controls.map((ctrl) => (
					<View key={ctrl.label} style={styles.row}>
						<Text style={styles.label}>
							<Text style={styles.labelProp}>{ctrl.label}</Text>
						</Text>
						{ctrl.type === 'boolean' ? (
							<Pressable
								onPress={() => ctrl.onChange(!ctrl.value)}
								accessibilityRole="switch"
								accessibilityState={{ checked: ctrl.value }}
								style={({ hovered, pressed }) => [
									styles.toggle,
									ctrl.value ? styles.toggleOn : styles.toggleOff,
									hovered && Platform.OS === 'web' ? styles.toggleHovered : null,
									pressed && styles.controlPressed,
								]}
							>
								<View style={[styles.toggleThumb, ctrl.value ? styles.thumbOn : styles.thumbOff]} />
							</Pressable>
						) : (
							<View style={styles.options}>
								{ctrl.options.map((opt) => (
									<Pressable
										key={opt}
										onPress={() => ctrl.onChange(opt)}
										style={({ pressed, hovered }) => [
											styles.option,
											ctrl.value === opt ? styles.optionActive : null,
											Platform.OS === 'web' ? styles.optionWeb : null,
											hovered && Platform.OS === 'web' && ctrl.value !== opt ? styles.optionHovered : null,
											pressed && { opacity: 0.7 },
										]}
									>
										<Text style={[styles.optionText, ctrl.value === opt ? styles.optionTextActive : null]}>{opt}</Text>
									</Pressable>
								))}
							</View>
						)}
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	panel: {
		marginTop: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#1f1f23',
		backgroundColor: '#0d0d10',
		overflow: 'hidden',
	},
	heading: {
		color: '#52525b',
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#1a1a1e',
	},
	rows: {
		gap: 0,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#111113',
		gap: 12,
	},
	label: {
		flex: 1,
	},
	labelProp: {
		color: '#a1a1aa',
		fontSize: 13,
		fontFamily: 'monospace',
	},
	toggle: {
		width: 40,
		height: 22,
		borderRadius: 11,
		justifyContent: 'center',
		paddingHorizontal: 2,
		transitionDuration: '160ms',
	},
	toggleOn: {
		backgroundColor: '#6366f1',
	},
	toggleOff: {
		backgroundColor: '#27272a',
	},
	toggleHovered: {
		shadowColor: '#6366f1',
		shadowOpacity: 0.35,
		shadowRadius: 10,
	},
	controlPressed: {
		transform: [{ scale: 0.96 }],
	},
	toggleThumb: {
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: '#ffffff',
	},
	thumbOn: {
		alignSelf: 'flex-end',
	},
	thumbOff: {
		alignSelf: 'flex-start',
	},
	options: {
		flexDirection: 'row',
		gap: 4,
		flexWrap: 'wrap',
		justifyContent: 'flex-end',
	},
	option: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#27272a',
		backgroundColor: '#111113',
	},
	optionWeb: {
		transitionDuration: '140ms',
	},
	optionHovered: {
		borderColor: '#52525b',
		backgroundColor: '#18181b',
	},
	optionActive: {
		borderColor: '#6366f1',
		backgroundColor: 'rgba(99,102,241,0.12)',
	},
	optionText: {
		color: '#52525b',
		fontSize: 12,
		fontFamily: 'monospace',
	},
	optionTextActive: {
		color: '#a5b4fc',
		fontWeight: '600',
	},
});
