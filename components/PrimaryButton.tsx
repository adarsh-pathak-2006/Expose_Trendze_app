import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { AnimatedEntrance } from './AnimatedEntrance';

type Props = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive';
  style?: ViewStyle;
}>;

export function PrimaryButton({ children, onPress, disabled, variant = 'primary', style }: Props) {
  return (
    <AnimatedEntrance delay={110} distance={12} duration={380} scaleFrom={0.98}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'destructive' && styles.destructive,
          disabled && styles.disabled,
          pressed && !disabled ? styles.pressed : undefined,
          style,
        ]}
      >
        <Text
          style={[
            styles.label,
            variant === 'secondary' ? styles.secondaryLabel : styles.primaryLabel,
            variant === 'destructive' ? styles.destructiveLabel : undefined,
          ]}
        >
          {children}
        </Text>
      </Pressable>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    minHeight: 54,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    transform: [{ scale: 1 }],
    width: '100%',
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  destructive: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryLabel: {
    color: COLORS.white,
  },
  secondaryLabel: {
    color: COLORS.accent,
  },
  destructiveLabel: {
    color: COLORS.white,
  },
});
