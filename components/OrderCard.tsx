import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import type { Order } from '../types/order';
import { formatDateTime } from '../utils/format';
import { AnimatedEntrance } from './AnimatedEntrance';
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
  showCustomer?: boolean;
};

export function OrderCard({ order, onPress, showCustomer = false }: Props) {
  const { width } = useWindowDimensions();
  const productName = order.items[0]?.productName ?? 'Order item';
  const customerLabel = order.customer?.companyName ?? order.customer?.fullName ?? order.customer?.email;
  const delay = (order.orderNumber.charCodeAt(order.orderNumber.length - 1) % 5) * 40 + 70;
  const compact = width < 390;

  return (
    <AnimatedEntrance delay={delay} distance={16} duration={480}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={[styles.accent, { backgroundColor: accentColor(order.status) }]} />
        <View style={styles.content}>
          <View style={[styles.headerRow, compact && styles.headerRowCompact]}>
            <View style={styles.headerText}>
              <Text style={styles.product}>{productName}</Text>
              {showCustomer && customerLabel ? <Text style={styles.customer}>{customerLabel}</Text> : null}
              <Text style={styles.date}>Updated {formatDateTime(order.updatedAt ?? order.placedAt)}</Text>
            </View>
            <Text style={[styles.code, compact && styles.codeCompact]}>{order.orderNumber}</Text>
          </View>
          <View style={[styles.footerRow, compact && styles.footerRowCompact]}>
            <StatusBadge label={order.status} />
            <View style={styles.inline}>
              <MaterialCommunityIcons color={COLORS.accent} name="package-variant-closed" size={16} />
              <Text style={styles.inlineText}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </AnimatedEntrance>
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
  headerRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  product: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
  },
  date: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  customer: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  code: {
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    fontSize: 13,
  },
  codeCompact: {
    alignSelf: 'flex-start',
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
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
