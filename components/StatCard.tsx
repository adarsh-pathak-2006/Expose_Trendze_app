import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { AnimatedEntrance } from './AnimatedEntrance';

type Props = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: Props) {
  const { width } = useWindowDimensions();
  const delay = label.toLowerCase().includes('active') ? 60 : 120;
  const compact = width < 380;

  return (
    <AnimatedEntrance delay={delay} distance={18} duration={460}>
      <View style={styles.card}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
      </View>
    </AnimatedEntrance>
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
    minHeight: 116,
    padding: SPACING.md,
    ...SHADOW,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  value: {
    color: COLORS.accent,
    fontFamily: FONTS.heading,
    fontSize: 28,
  },
  valueCompact: {
    fontSize: 24,
  },
});
