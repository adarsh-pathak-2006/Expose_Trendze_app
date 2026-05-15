import type { RealtimeChannel } from '@supabase/supabase-js';

import { getDemoOrders, mockDashboardSummary, updateDemoOrderStage } from './mockData';
import { hasSupabaseConfig, supabase } from './supabase';
import type { DashboardSummary, Order, OrderStage } from '../types/order';
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
  };
}

export async function fetchOrders(): Promise<Order[]> {
  if (!hasSupabaseConfig || !supabase) {
    return getDemoOrders();
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_id, order_number, status, total_amount, currency, payment_status, expected_delivery, placed_at, updated_at, order_items(*), order_stages(*)',
    )
    .order('placed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order | undefined> {
  const orders = await fetchOrders();
  return orders.find((order) => order.id === orderId);
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  if (!hasSupabaseConfig || !supabase) {
    return mockDashboardSummary;
  }

  const orders = await fetchOrders();
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

export async function updateOrderStage(orderId: string, stageNumber: number, stageNote?: string) {
  if (!hasSupabaseConfig || !supabase) {
    updateDemoOrderStage(orderId, stageNumber, stageNote);
    return;
  }

  const stageName = ORDER_STAGES[stageNumber - 1];
  if (!stageName) {
    throw new Error('Invalid stage number.');
  }

  const { error: insertError } = await supabase.from('order_stages').upsert(
    {
      order_id: orderId,
      stage_number: stageNumber,
      stage_name: stageName,
      stage_note: stageNote || null,
      is_completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'order_id,stage_number' },
  );

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: stageName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    throw updateError;
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
