import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { OrderCard } from '../components/OrderCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import type { RootStackParamList } from '../types/navigation';
import { formatDateTime } from '../utils/format';

type Navigation = NativeStackScreenProps<RootStackParamList>['navigation'];

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<Navigation>();
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const orders = useOrdersStore((state) => state.orders);
  const dashboard = useOrdersStore((state) => state.dashboard);
  const fetchAll = useOrdersStore((state) => state.fetchAll);
  const isLoading = useOrdersStore((state) => state.isLoading);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeOrders = orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status));
  const compact = width < 520;

  return (
    <ScreenShell onRefresh={fetchAll} refreshing={isLoading}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.welcome, compact && styles.welcomeCompact]}>Welcome back, {profile?.fullName?.split(' ')[0] ?? 'Customer'}</Text>
          <Text style={styles.caption}>Stay close to every order milestone in real time.</Text>
        </View>
        <Pressable onPress={logout}>
          <MaterialCommunityIcons color={COLORS.accent} name="logout" size={24} />
        </Pressable>
      </View>

      <View style={[styles.statsRow, compact && styles.stackOnCompact]}>
        <StatCard label="Active Orders" value={dashboard?.activeOrders ?? 0} />
        <StatCard label="Total Orders" value={dashboard?.totalOrders ?? 0} />
      </View>

      <View style={[styles.quickActions, compact && styles.stackOnCompact]}>
        <PrimaryButton onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' } as never)} style={styles.actionButton}>
          Order History
        </PrimaryButton>
        <PrimaryButton
          onPress={() =>
            navigation.navigate('Tracking', {
              orderId: activeOrders[0]?.id,
            })
          }
          style={styles.actionButton}
          variant="secondary"
        >
          Track Order
        </PrimaryButton>
      </View>

      <SectionTitle title="Active Orders" subtitle="Live orders currently in production or transit." />
      <View style={styles.stack}>
        {activeOrders.map((order) => (
          <OrderCard key={order.id} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} order={order} />
        ))}
      </View>

      <SectionTitle title="Recent Activity" subtitle="Latest updates pushed from the order pipeline." />
      <View style={styles.activityCard}>
        {dashboard?.recentUpdates.map((update) => (
          <View key={update.id} style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={styles.activityCopy}>
              <Text style={styles.activityTitle}>
                {update.orderNumber} moved to {update.stageName}
              </Text>
              <Text style={styles.activityTime}>{formatDateTime(update.completedAt)}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  headerCompact: {
    gap: SPACING.md,
  },
  headerCopy: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  welcome: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 28,
    textTransform: 'uppercase',
  },
  welcomeCompact: {
    fontSize: 24,
  },
  caption: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  stackOnCompact: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  stack: {
    gap: SPACING.md,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.md,
    padding: SPACING.md,
  },
  activityRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  activityDot: {
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  activityCopy: {
    flex: 1,
    gap: SPACING.xs,
  },
  activityTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
  activityTime: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
});
