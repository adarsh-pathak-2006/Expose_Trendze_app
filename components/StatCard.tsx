import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../constants/theme';

type Props = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    gap: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  value: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 28,
  },
});
