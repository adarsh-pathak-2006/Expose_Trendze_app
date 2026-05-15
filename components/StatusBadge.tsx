import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { alpha } from '../utils/format';

function getStatusTheme(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('deliver') || normalized === 'paid') {
    return { color: COLORS.success };
  }

  if (normalized.includes('cancel') || normalized.includes('overdue') || normalized.includes('error')) {
    return { color: COLORS.error };
  }

  if (normalized.includes('dispatch') || normalized.includes('transit')) {
    return { color: COLORS.info };
  }

  if (normalized.includes('pending')) {
    return { color: COLORS.textSecondary };
  }

  return { color: COLORS.warning };
}

type Props = {
  label: string;
};

export function StatusBadge({ label }: Props) {
  const { color } = getStatusTheme(label);

  return (
    <View style={[styles.badge, { backgroundColor: alpha(color, 0.16), borderColor: alpha(color, 0.4) }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  text: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
