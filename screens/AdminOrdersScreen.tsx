import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OrderCard } from '../components/OrderCard';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { useOrdersStore } from '../store/ordersStore';
import type { RootStackParamList } from '../types/navigation';
import { SPACING } from '../constants/theme';

export function AdminOrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fetchAll = useOrdersStore((state) => state.fetchAll);
  const orders = useOrdersStore((state) => state.orders);
  const isLoading = useOrdersStore((state) => state.isLoading);

  useEffect(() => {
    if (!orders.length) {
      fetchAll();
    }
  }, [fetchAll, orders.length]);

  return (
    <ScreenShell onRefresh={fetchAll} refreshing={isLoading}>
      <SectionTitle
        title="All Orders"
        subtitle="Choose an order to update the stage shown to the customer."
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
  stack: {
    gap: SPACING.md,
  },
});
