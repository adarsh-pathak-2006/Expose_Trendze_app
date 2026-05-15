import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, SPACING } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export function SectionTitle({ title, subtitle, rightSlot }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 24,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
});
