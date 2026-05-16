import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { StatusBadge } from '../components/StatusBadge';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { fetchOrderById } from '../services/orders';
import { useOrdersStore } from '../store/ordersStore';
import type { Order } from '../types/order';
import type { RootStackParamList } from '../types/navigation';
import { formatCurrency, formatDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const orderFromStore = useOrdersStore((state) => state.getOrderById(route.params.orderId));
  const [order, setOrder] = useState<Order | undefined>(orderFromStore);
  const [isLoading, setIsLoading] = useState(!orderFromStore);
  const compact = width < 420;

  useEffect(() => {
    setOrder(orderFromStore);
    if (orderFromStore) {
      setIsLoading(false);
    }
  }, [orderFromStore]);

  useEffect(() => {
    if (orderFromStore) {
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      try {
        const fetchedOrder = await fetchOrderById(route.params.orderId);
        if (isMounted) {
          setOrder(fetchedOrder);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderFromStore, route.params.orderId]);

  if (isLoading) {
    return (
      <ScreenShell>
        <Text style={styles.empty}>Loading order...</Text>
      </ScreenShell>
    );
  }

  if (!order) {
    return (
      <ScreenShell>
        <Text style={styles.empty}>Order not found.</Text>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.heroCard}>
        <Text style={styles.orderCode}>{order.orderNumber}</Text>
        <StatusBadge label={order.status} />
        <Text style={styles.meta}>Placed {formatDate(order.placedAt)}</Text>
        <Text style={styles.meta}>Expected delivery {formatDate(order.expectedDelivery)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Products</Text>
        {order.items.map((item) => (
          <View key={item.id} style={[styles.lineItem, compact && styles.lineItemCompact]}>
            <View style={styles.lineItemCopy}>
              <Text style={styles.lineItemName}>{item.productName}</Text>
              <Text style={styles.lineItemMeta}>
                Qty {item.quantity} • {formatCurrency(item.unitPrice, order.currency)} / unit
              </Text>
            </View>
            <Text style={styles.lineItemTotal}>{formatCurrency(item.totalPrice, order.currency)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Key Dates</Text>
        <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
          <Text style={styles.summaryLabel}>Order placed</Text>
          <Text style={styles.summaryValue}>{formatDate(order.placedAt)}</Text>
        </View>
        <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
          <Text style={styles.summaryLabel}>Expected delivery</Text>
          <Text style={styles.summaryValue}>{formatDate(order.expectedDelivery)}</Text>
        </View>
        <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
          <Text style={styles.summaryLabel}>Last updated</Text>
          <Text style={styles.summaryValue}>{formatDate(order.updatedAt ?? order.placedAt)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Summary</Text>
        <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
          <Text style={styles.summaryLabel}>Total order value</Text>
          <Text style={styles.summaryValue}>{formatCurrency(order.totalAmount, order.currency)}</Text>
        </View>
        <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
          <Text style={styles.summaryLabel}>Payment status</Text>
          <StatusBadge label={order.paymentStatus} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Pricing History</Text>
        {order.pricingHistory.length ? (
          order.pricingHistory.map((entry) => (
            <View key={entry.id} style={styles.timelineRow}>
              <View style={[styles.pricingHeader, compact && styles.summaryRowCompact]}>
                <Text style={styles.timelineName}>{formatCurrency(entry.newTotalAmount, entry.currency)}</Text>
                <Text style={styles.timelineMeta}>{formatDate(entry.changedAt, 'dd MMM yyyy')}</Text>
              </View>
              {entry.previousTotalAmount !== undefined ? (
                <Text style={styles.timelineMeta}>
                  Previous total {formatCurrency(entry.previousTotalAmount, entry.currency)}
                </Text>
              ) : (
                <Text style={styles.timelineMeta}>Initial recorded price</Text>
              )}
              {entry.changeNote ? <Text style={styles.pricingNote}>{entry.changeNote}</Text> : null}
              {entry.changedBy ? <Text style={styles.timelineMeta}>Updated by {entry.changedBy}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={styles.summaryLabel}>No pricing changes have been recorded for this order yet.</Text>
        )}
      </View>

      <PrimaryButton onPress={() => navigation.navigate('Tracking', { orderId: order.id })}>Track This Order</PrimaryButton>

      <View style={styles.section}>
        <Text style={styles.heading}>Timeline History</Text>
        {order.stages
          .filter((stage) => stage.isCompleted)
          .map((stage) => (
            <View key={stage.id} style={styles.timelineRow}>
              <Text style={styles.timelineName}>{stage.stageName}</Text>
              <Text style={styles.timelineMeta}>{formatDate(stage.completedAt, 'dd MMM yyyy')}</Text>
            </View>
          ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 14,
    marginTop: SPACING.xl,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  orderCode: {
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    fontSize: 16,
  },
  meta: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.md,
    padding: SPACING.md,
  },
  heading: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 18,
    textTransform: 'uppercase',
  },
  lineItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  lineItemCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  lineItemCopy: {
    flex: 1,
    gap: SPACING.xs,
  },
  lineItemName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
  lineItemMeta: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  lineItemTotal: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
  },
  timelineRow: {
    borderBottomColor: COLORS.divider,
    borderBottomWidth: 1,
    gap: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  pricingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  timelineMeta: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  pricingNote: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
});
