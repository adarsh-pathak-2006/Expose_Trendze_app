import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import type { Order } from '../types/order';
import { formatDateTime } from '../utils/format';
import { StatusBadge } from './StatusBadge';

function accentColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('deliver')) return COLORS.success;
  if (normalized.includes('cancel')) return COLORS.error;
  if (normalized.includes('dispatch') || normalized.includes('transit')) return COLORS.info;
  return COLORS.warning;
}

type Props = {
  order: Order;
  onPress?: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const productName = order.items[0]?.productName ?? 'Order item';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.accent, { backgroundColor: accentColor(order.status) }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.product}>{productName}</Text>
            <Text style={styles.date}>Updated {formatDateTime(order.updatedAt ?? order.placedAt)}</Text>
          </View>
          <Text style={styles.code}>{order.orderNumber}</Text>
        </View>
        <View style={styles.footerRow}>
          <StatusBadge label={order.status} />
          <View style={styles.inline}>
            <MaterialCommunityIcons color={COLORS.accent} name="package-variant-closed" size={16} />
            <Text style={styles.inlineText}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOW,
  },
  pressed: {
    opacity: 0.9,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    gap: SPACING.md,
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  product: {
    color: COLORS.white,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
  },
  date: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  code: {
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    fontSize: 13,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  inlineText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
});
