import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { APP_NAME, APP_TAGLINE } from '../constants/app';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { AnimatedEntrance } from './AnimatedEntrance';

const brandLogo = require('../assets/branding/logo-expose-tran.png');

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function BrandHeader({ eyebrow = APP_NAME, title, subtitle = APP_TAGLINE }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;

  return (
    <AnimatedEntrance delay={80} distance={22} duration={560} scaleFrom={0.96}>
      <View style={styles.container}>
        <Image
          resizeMode="contain"
          source={brandLogo}
          style={[styles.logo, compact && styles.logoCompact]}
        />
        <Text style={[styles.eyebrow, compact && styles.eyebrowCompact]}>{eyebrow}</Text>
        {title ? <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text> : null}
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text>
      </View>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    height: 88,
    marginBottom: SPACING.sm,
    width: 180,
  },
  logoCompact: {
    height: 72,
    width: 150,
  },
  eyebrow: {
    color: COLORS.accent,
    fontFamily: FONTS.heading,
    fontSize: 28,
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  eyebrowCompact: {
    fontSize: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 26,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 320,
    textAlign: 'center',
  },
  subtitleCompact: {
    maxWidth: 280,
  },
});
