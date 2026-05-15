import { create } from 'zustand';

import * as orderService from '../services/orders';
import type { DashboardSummary, Order } from '../types/order';

type OrdersStore = {
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  orders: Order[];
  dashboard: DashboardSummary | null;
  fetchAll: () => Promise<void>;
  updateStage: (orderId: string, stageNumber: number, stageNote?: string) => Promise<void>;
  getOrderById: (orderId?: string) => Order | undefined;
};

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  isLoading: false,
  isUpdating: false,
  error: null,
  orders: [],
  dashboard: null,
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [orders, dashboard] = await Promise.all([
        orderService.fetchOrders(),
        orderService.fetchDashboardSummary(),
      ]);

      set({ orders, dashboard, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to fetch orders.',
      });
    }
  },
  updateStage: async (orderId, stageNumber, stageNote) => {
    set({ isUpdating: true, error: null });
    try {
      await orderService.updateOrderStage(orderId, stageNumber, stageNote);
      const [orders, dashboard] = await Promise.all([
        orderService.fetchOrders(),
        orderService.fetchDashboardSummary(),
      ]);
      set({ orders, dashboard, isUpdating: false });
    } catch (error) {
      set({
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Unable to update order stage.',
      });
      throw error;
    }
  },
  getOrderById: (orderId) => get().orders.find((order) => order.id === orderId),
}));
