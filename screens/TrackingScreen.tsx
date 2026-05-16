import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { OrderCard } from '../components/OrderCard';
import { ScreenShell } from '../components/ScreenShell';
import { StatusBadge } from '../components/StatusBadge';
import { TimelineStageRow } from '../components/TimelineStageRow';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { subscribeToOrderUpdates } from '../services/orders';
import { useOrdersStore } from '../store/ordersStore';
import type { RootStackParamList } from '../types/navigation';

export function TrackingScreen() {
  const { width } = useWindowDimensions();
  const route = useRoute<RouteProp<RootStackParamList, 'Tracking'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const orders = useOrdersStore((state) => state.orders);
  const fetchAll = useOrdersStore((state) => state.fetchAll);
  const getOrderById = useOrdersStore((state) => state.getOrderById);

  const [activeOrderId, setActiveOrderId] = useState<string | undefined>(route.params?.orderId);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!orders.length) {
      fetchAll();
    }
  }, [fetchAll, orders.length]);

  useEffect(() => {
    if (route.params?.orderId) {
      setActiveOrderId(route.params.orderId);
    } else if (!activeOrderId && orders[0]?.id) {
      setActiveOrderId(orders[0].id);
    }
  }, [activeOrderId, orders, route.params?.orderId]);

  const activeOrder = getOrderById(activeOrderId) ?? orders[0];

  useEffect(() => {
    if (!activeOrder?.id) {
      return;
    }

    const subscription = subscribeToOrderUpdates(activeOrder.id, async () => {
      await fetchAll();
      setIsLive(true);
    });

    setIsLive(subscription.active);

    return () => {
      subscription.unsubscribe();
      setIsLive(false);
    };
  }, [activeOrder?.id, fetchAll]);

  const currentStageNumber = useMemo(() => {
    const completedStages = activeOrder?.stages.filter((stage) => stage.isCompleted) ?? [];
    return completedStages.length ? completedStages[completedStages.length - 1].stageNumber : 1;
  }, [activeOrder?.stages]);
  const compact = width < 520;

  return (
    <ScreenShell>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>Live Tracking</Text>
        <View style={styles.livePill}>
          <View style={[styles.liveDot, { backgroundColor: isLive ? COLORS.accent : COLORS.textSecondary }]} />
          <Text style={styles.liveLabel}>{isLive ? 'Realtime' : 'Preview'}</Text>
        </View>
      </View>

      {activeOrder ? (
        <>
          <OrderCard onPress={() => navigation.navigate('OrderDetail', { orderId: activeOrder.id })} order={activeOrder} />
          <View style={styles.orderPicker}>
            {orders.map((order) => {
              const selected = order.id === activeOrder.id;
              return (
                <Pressable
                  key={order.id}
                  onPress={() => setActiveOrderId(order.id)}
                  style={[styles.orderChip, selected && styles.orderChipActive]}
                >
                  <Text style={[styles.orderChipLabel, selected && styles.orderChipLabelActive]}>{order.orderNumber}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.timelineCard}>
            <View style={[styles.timelineHeader, compact && styles.timelineHeaderCompact]}>
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineTitle}>{activeOrder.orderNumber}</Text>
                <Text style={styles.timelineSubtitle}>Current stage {currentStageNumber} of 11</Text>
              </View>
              <StatusBadge label={activeOrder.status} />
            </View>
            {activeOrder.stages.map((stage, index) => {
              const isFuture = stage.stageNumber > currentStageNumber;
              const isCurrent = stage.stageNumber === currentStageNumber;

              return (
                <TimelineStageRow
                  isCurrent={isCurrent}
                  isFuture={isFuture}
                  isLast={index === activeOrder.stages.length - 1}
                  key={stage.id}
                  stage={stage}
                />
              );
            })}
          </View>
        </>
      ) : (
        <EmptyState
          icon="file-question-outline"
          subtitle="Orders will appear here once data is available."
          title="No trackable order found"
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  headerCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 28,
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 24,
  },
  livePill: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  liveDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  liveLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  orderPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  orderChip: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  orderChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  orderChipLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.mono,
    fontSize: 12,
  },
  orderChipLabelActive: {
    color: COLORS.white,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  timelineHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  timelineHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  timelineCopy: {
    flex: 1,
    gap: SPACING.xs,
  },
  timelineTitle: {
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    fontSize: 15,
  },
  timelineSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
});
