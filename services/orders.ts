import type { RealtimeChannel } from '@supabase/supabase-js';

import { getDemoOrders, mockDashboardSummary, updateDemoOrderStage } from './mockData';
import { hasSupabaseConfig, supabase } from './supabase';
import type { DashboardSummary, Order, OrderPricingHistoryEntry, OrderStage } from '../types/order';
import { ORDER_STAGES } from '../constants/app';

function normalizeStages(stages: any[] | null | undefined): OrderStage[] {
  const stageMap = new Map<number, OrderStage>();

  for (const stage of stages ?? []) {
    const normalized = {
      id: stage.id,
      stageNumber: stage.stage_number,
      stageName: stage.stage_name,
      stageNote: stage.stage_note ?? undefined,
      isCompleted: stage.is_completed,
      completedAt: stage.completed_at ?? undefined,
      updatedBy: stage.updated_by ?? undefined,
    } satisfies OrderStage;

    const existing = stageMap.get(normalized.stageNumber);
    if (!existing || (normalized.completedAt ?? '') > (existing.completedAt ?? '')) {
      stageMap.set(normalized.stageNumber, normalized);
    }
  }

  return Array.from(stageMap.values()).sort((a, b) => a.stageNumber - b.stageNumber);
}

function normalizeOrder(order: any): Order {
  return {
    id: order.id,
    customerId: order.customer_id,
    orderNumber: order.order_number,
    status: order.status,
    totalAmount: Number(order.total_amount),
    currency: order.currency,
    paymentStatus: order.payment_status,
    expectedDelivery: order.expected_delivery ?? undefined,
    placedAt: order.placed_at,
    updatedAt: order.updated_at ?? undefined,
    customer: order.customers
      ? {
          id: order.customers.id,
          fullName: order.customers.full_name,
          email: order.customers.email,
          companyName: order.customers.company_name ?? undefined,
        }
      : undefined,
    items: (order.order_items ?? []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      sku: item.sku ?? undefined,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
      specifications: item.specifications ?? undefined,
    })),
    stages: normalizeStages(order.order_stages),
    pricingHistory: ((order.order_pricing_history ?? []) as any[])
      .map(
        (entry: any) =>
          ({
            id: entry.id,
            previousTotalAmount:
              entry.previous_total_amount === null || entry.previous_total_amount === undefined
                ? undefined
                : Number(entry.previous_total_amount),
            newTotalAmount: Number(entry.new_total_amount),
            currency: entry.currency,
            changeNote: entry.change_note ?? undefined,
            changedAt: entry.changed_at,
            changedBy: entry.changed_by ?? undefined,
          }) satisfies OrderPricingHistoryEntry,
      )
      .sort((a: OrderPricingHistoryEntry, b: OrderPricingHistoryEntry) => b.changedAt.localeCompare(a.changedAt)),
  };
}

export function buildDashboardSummary(orders: Order[]): DashboardSummary {
  const recentUpdates = orders
    .flatMap((order) =>
      order.stages
        .filter((stage) => stage.isCompleted)
        .slice(-2)
        .map((stage) => ({
          id: `${order.id}-${stage.id}`,
          orderNumber: order.orderNumber,
          stageName: stage.stageName,
          completedAt: stage.completedAt,
        })),
    )
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, 3);

  return {
    activeOrders: orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status)).length,
    totalOrders: orders.length,
    recentUpdates,
  };
}

export async function fetchOrders(): Promise<Order[]> {
  if (!hasSupabaseConfig || !supabase) {
    return getDemoOrders();
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_id, order_number, status, total_amount, currency, payment_status, expected_delivery, placed_at, updated_at, customers(id, full_name, email, company_name), order_items(*), order_stages(*), order_pricing_history(*)',
    )
    .order('placed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order | undefined> {
  if (!hasSupabaseConfig || !supabase) {
    return getDemoOrders().find((order) => order.id === orderId);
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_id, order_number, status, total_amount, currency, payment_status, expected_delivery, placed_at, updated_at, customers(id, full_name, email, company_name), order_items(*), order_stages(*), order_pricing_history(*)',
    )
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeOrder(data) : undefined;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  if (!hasSupabaseConfig || !supabase) {
    return mockDashboardSummary;
  }

  const orders = await fetchOrders();
  return buildDashboardSummary(orders);
}

export async function updateOrderStage(orderId: string, stageNumber: number, stageNote?: string) {
  if (!hasSupabaseConfig || !supabase) {
    updateDemoOrderStage(orderId, stageNumber, stageNote);
    return;
  }

  const stageName = ORDER_STAGES[stageNumber - 1];
  if (!stageName) {
    throw new Error('Invalid stage number.');
  }

  const {
    data,
    error,
  } = await supabase.rpc('update_order_stage', {
    target_order_id: orderId,
    target_stage_number: stageNumber,
    target_stage_note: stageNote ?? null,
    updated_by_label: 'admin-panel',
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Order stage update did not return a result.');
  }
}

export function subscribeToOrderUpdates(orderId: string, onRefresh: () => void) {
  if (!hasSupabaseConfig || !supabase) {
    return {
      unsubscribe: () => undefined,
      active: false,
    };
  }

  const channel: RealtimeChannel = supabase
    .channel(`order-updates-${orderId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'order_stages', filter: `order_id=eq.${orderId}` },
      () => onRefresh(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      () => onRefresh(),
    )
    .subscribe();

  return {
    unsubscribe: () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    },
    active: true,
  };
}
