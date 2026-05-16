import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { COLORS, FONTS, SPACING } from '../constants/theme';
import { AnimatedEntrance } from './AnimatedEntrance';

type Props = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export function SectionTitle({ title, subtitle, rightSlot }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 420;

  return (
    <AnimatedEntrance delay={70} distance={14} duration={440}>
      <View style={[styles.row, compact && styles.rowCompact]}>
        <View style={styles.copy}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  rowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  copy: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 24,
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 21,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
