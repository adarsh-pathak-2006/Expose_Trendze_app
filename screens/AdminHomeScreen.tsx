import { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OrderCard } from '../components/OrderCard';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import type { RootStackParamList } from '../types/navigation';

export function AdminHomeScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useAuthStore((state) => state.profile);
  const fetchAll = useOrdersStore((state) => state.fetchAll);
  const orders = useOrdersStore((state) => state.orders);
  const dashboard = useOrdersStore((state) => state.dashboard);
  const isLoading = useOrdersStore((state) => state.isLoading);
  const compact = width < 520;

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ScreenShell onRefresh={fetchAll} refreshing={isLoading}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Welcome, {profile?.fullName ?? 'Admin'}</Text>
      </View>

      <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
        <StatCard label="Total Orders" value={dashboard?.totalOrders ?? orders.length} />
        <StatCard label="Active Pipelines" value={dashboard?.activeOrders ?? 0} />
      </View>

      <SectionTitle
        title="Manual Tracking Control"
        subtitle="Open any order and set the exact stage that should appear in customer live tracking."
      />

      <View style={styles.stack}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            onPress={() => navigation.navigate('AdminOrderControl', { orderId: order.id })}
            order={order}
            showCustomer
          />
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: SPACING.xs,
    paddingTop: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 28,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statsRowCompact: {
    flexDirection: 'column',
  },
  stack: {
    gap: SPACING.md,
  },
});
