import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export type PropRow = {
	name: string;
	type: string;
	default?: string;
	description: string;
	required?: boolean;
};

type Props = {
	props: PropRow[];
};

const COL = [150, 210, 110, 290];

export function PropsTable({ props }: Props) {
	return (
		<View style={styles.wrap}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View style={{ minWidth: COL.reduce((a, b) => a + b, 0) }}>
					<View style={styles.headRow}>
						{['Prop', 'Type', 'Default', 'Description'].map((h, i) => (
							<View key={h} style={[styles.cell, { width: COL[i] }]}>
								<Text style={styles.headText}>{h}</Text>
							</View>
						))}
					</View>

					{props.map((row, i) => (
						<View key={row.name} style={[styles.row, i % 2 === 1 ? styles.rowAlt : null, i === props.length - 1 ? styles.rowLast : null]}>
							<View style={[styles.cell, { width: COL[0] }]}>
								<View style={styles.nameRow}>
									<Text style={styles.propName}>{row.name}</Text>
									{row.required && (
										<View style={styles.reqBadge}>
											<Text style={styles.reqText}>req</Text>
										</View>
									)}
								</View>
							</View>
							<View style={[styles.cell, { width: COL[1] }]}>
								<Text style={styles.typeText} numberOfLines={3}>
									{row.type}
								</Text>
							</View>
							<View style={[styles.cell, { width: COL[2] }]}>
								<Text style={styles.defaultText}>{row.default ?? '-'}</Text>
							</View>
							<View style={[styles.cell, { width: COL[3] }]}>
								<Text style={styles.descText}>{row.description}</Text>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#1f1f23',
		overflow: 'hidden',
	},
	headRow: {
		flexDirection: 'row',
		backgroundColor: '#0d0d10',
		borderBottomWidth: 1,
		borderBottomColor: '#1f1f23',
	},
	row: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#18181b',
	},
	rowAlt: {
		backgroundColor: 'rgba(255,255,255,0.015)',
	},
	rowLast: {
		borderBottomWidth: 0,
	},
	cell: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		justifyContent: 'flex-start',
	},
	headText: {
		color: '#52525b',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.6,
		textTransform: 'uppercase',
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		flexWrap: 'wrap',
	},
	propName: {
		color: '#a5b4fc',
		fontSize: 13,
		fontFamily: 'monospace',
		fontWeight: '500',
	},
	reqBadge: {
		paddingHorizontal: 5,
		paddingVertical: 1,
		borderRadius: 4,
		backgroundColor: 'rgba(239,68,68,0.15)',
		borderWidth: 1,
		borderColor: 'rgba(239,68,68,0.25)',
	},
	reqText: {
		color: '#f87171',
		fontSize: 10,
		fontWeight: '600',
	},
	typeText: {
		color: '#fcd34d',
		fontSize: 12,
		fontFamily: 'monospace',
		lineHeight: 20,
	},
	defaultText: {
		color: '#52525b',
		fontSize: 12,
		fontFamily: 'monospace',
	},
	descText: {
		color: '#a1a1aa',
		fontSize: 13,
		lineHeight: 20,
	},
});
