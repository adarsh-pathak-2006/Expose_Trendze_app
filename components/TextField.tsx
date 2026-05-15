import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
};

export function TextField({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.textSecondary}
        style={[styles.input, style]}
        selectionColor={COLORS.accent}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.sm,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.white,
    fontFamily: FONTS.body,
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
});
