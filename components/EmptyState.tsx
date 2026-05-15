import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

type Props = {
  title: string;
  subtitle: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function EmptyState({ title, subtitle, icon = 'package-variant' }: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons color={COLORS.accent} name={icon} size={34} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
    textAlign: 'center',
  },
});
