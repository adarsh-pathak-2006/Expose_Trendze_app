import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME, APP_TAGLINE } from '../constants/app';
import { COLORS, FONTS, SPACING } from '../constants/theme';

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function BrandHeader({ eyebrow = APP_NAME, title, subtitle = APP_TAGLINE }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  eyebrow: {
    color: COLORS.accent,
    fontFamily: FONTS.heading,
    fontSize: 30,
    letterSpacing: 1,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
