import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { OrderCard } from '../components/OrderCard';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { ORDER_STATUS_FILTERS } from '../constants/app';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { useOrdersStore } from '../store/ordersStore';
import type { OrderFilter } from '../types/order';
import type { RootStackParamList } from '../types/navigation';

type Navigation = NativeStackScreenProps<RootStackParamList>['navigation'];

export function OrderHistoryScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<Navigation>();
  const fetchAll = useOrdersStore((state) => state.fetchAll);
  const orders = useOrdersStore((state) => state.orders);
  const isLoading = useOrdersStore((state) => state.isLoading);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('All');
  const compact = width < 520;

  useEffect(() => {
    if (!orders.length) {
      fetchAll();
    }
  }, [fetchAll, orders.length]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchMatch =
        order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        order.items.some((item) => item.productName.toLowerCase().includes(query.toLowerCase()));

      if (!searchMatch) {
        return false;
      }

      if (filter === 'All') {
        return true;
      }

      if (filter === 'Completed') {
        return order.status === 'Delivered';
      }

      if (filter === 'Cancelled') {
        return order.status === 'Cancelled';
      }

      return !['Delivered', 'Cancelled'].includes(order.status);
    });
  }, [filter, orders, query]);

  return (
    <ScreenShell onRefresh={fetchAll} refreshing={isLoading}>
      <SectionTitle title="Order History" subtitle="Search, filter, and review every current or past order." />

      <TextInput
        onChangeText={setQuery}
        placeholder="Search by order ID or product name"
        placeholderTextColor={COLORS.textSecondary}
        style={styles.search}
        value={query}
      />

      <View style={[styles.filterRow, compact && styles.filterRowCompact]}>
        {ORDER_STATUS_FILTERS.map((option) => {
          const active = filter === option;
          return (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              style={[styles.filterChip, compact && styles.filterChipCompact, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} order={order} />
          ))
        ) : (
          <EmptyState
            icon="magnify-close"
            subtitle="Try another search term or broaden the status filter."
            title="No orders found"
          />
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterRowCompact: {
    flexDirection: 'column',
  },
  filterChip: {
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
  filterChipCompact: {
    width: '100%',
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
  },
  filterLabelActive: {
    color: COLORS.white,
  },
  list: {
    gap: SPACING.md,
  },
});
