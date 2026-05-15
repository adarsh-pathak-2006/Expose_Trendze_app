import { ORDER_STAGES } from '../constants/app';
import type { DashboardSummary, Order, UserProfile } from '../types/order';

const now = new Date();

export const mockCustomerProfile: UserProfile = {
  id: 'customer-1',
  userId: 'demo-user',
  fullName: 'Ava Sterling',
  email: 'ava.sterling@et-demo.com',
  role: 'customer',
  phone: '+1 212 555 0149',
  companyName: 'Sterling Atelier',
  country: 'United States',
  isActive: true,
};

export const mockAdminProfile: UserProfile = {
  id: 'admin-1',
  userId: 'demo-admin',
  fullName: 'Shan Verma',
  email: 'admin@et-demo.com',
  role: 'admin',
  phone: '+91 99999 11111',
  companyName: 'Expose Trendze',
  country: 'India',
  isActive: true,
};

function makeStage(stageNumber: number, completed: boolean, offsetDays: number, note?: string) {
  return {
    id: `stage-${stageNumber}`,
    stageNumber,
    stageName: ORDER_STAGES[stageNumber - 1],
    stageNote: note,
    isCompleted: completed,
    completedAt: completed
      ? new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };
}

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    customerId: mockCustomerProfile.id,
    orderNumber: 'ET-2026-041',
    status: 'Shipment in Transit',
    totalAmount: 8420,
    currency: 'USD',
    paymentStatus: 'paid',
    expectedDelivery: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    placedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-1',
        productName: 'Handcrafted Premium Leather Tote',
        sku: 'ET-LTH-201',
        quantity: 40,
        unitPrice: 115,
        totalPrice: 4600,
      },
      {
        id: 'item-2',
        productName: 'Monogram Travel Organizer',
        sku: 'ET-ORG-077',
        quantity: 30,
        unitPrice: 127.33,
        totalPrice: 3820,
      },
    ],
    stages: [
      makeStage(1, true, 18),
      makeStage(2, true, 17),
      makeStage(3, true, 15),
      makeStage(4, true, 12),
      makeStage(5, true, 10, 'QC passed for first batch.'),
      makeStage(6, true, 8),
      makeStage(7, true, 6),
      makeStage(8, true, 1, 'Freight departed hub and is moving to destination.'),
      makeStage(9, false, 0),
      makeStage(10, false, 0),
      makeStage(11, false, 0),
    ],
  },
  {
    id: 'order-2',
    customerId: mockCustomerProfile.id,
    orderNumber: 'ET-2026-029',
    status: 'Product in Production',
    totalAmount: 5240,
    currency: 'USD',
    paymentStatus: 'partial',
    expectedDelivery: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    placedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-3',
        productName: 'Structured Laptop Satchel',
        sku: 'ET-SAT-119',
        quantity: 20,
        unitPrice: 182,
        totalPrice: 3640,
      },
      {
        id: 'item-4',
        productName: 'Leather Tech Sleeve',
        sku: 'ET-SLV-110',
        quantity: 20,
        unitPrice: 80,
        totalPrice: 1600,
      },
    ],
    stages: [
      makeStage(1, true, 9),
      makeStage(2, true, 8),
      makeStage(3, true, 6),
      makeStage(4, true, 1, 'Production on second colorway is underway.'),
      makeStage(5, false, 0),
      makeStage(6, false, 0),
      makeStage(7, false, 0),
      makeStage(8, false, 0),
      makeStage(9, false, 0),
      makeStage(10, false, 0),
      makeStage(11, false, 0),
    ],
  },
  {
    id: 'order-3',
    customerId: mockCustomerProfile.id,
    orderNumber: 'ET-2026-011',
    status: 'Delivered',
    totalAmount: 2130,
    currency: 'USD',
    paymentStatus: 'paid',
    expectedDelivery: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    placedAt: new Date(now.getTime() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-5',
        productName: 'Executive Passport Wallet',
        sku: 'ET-TRV-092',
        quantity: 30,
        unitPrice: 71,
        totalPrice: 2130,
      },
    ],
    stages: ORDER_STAGES.map((stageName, index) => ({
      id: `delivered-${index + 1}`,
      stageNumber: index + 1,
      stageName,
      isCompleted: true,
      completedAt: new Date(now.getTime() - (32 - index) * 24 * 60 * 60 * 1000).toISOString(),
      stageNote: index === 10 ? 'Consignment received and confirmed by customer.' : undefined,
    })),
  },
];

export const mockDashboardSummary: DashboardSummary = {
  activeOrders: mockOrders.filter((order) => order.status !== 'Delivered' && order.status !== 'Cancelled').length,
  totalOrders: mockOrders.length,
  recentUpdates: mockOrders
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
    .slice(0, 3),
};

let demoOrders = structuredClone(mockOrders);

export function getDemoOrders() {
  return structuredClone(demoOrders) as Order[];
}

export function updateDemoOrderStage(orderId: string, stageNumber: number, stageNote?: string) {
  const order = demoOrders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  order.stages = order.stages.map((stage) => ({
    ...stage,
    isCompleted: stage.stageNumber <= stageNumber,
    completedAt:
      stage.stageNumber <= stageNumber
        ? stage.completedAt ?? new Date().toISOString()
        : undefined,
    stageNote: stage.stageNumber === stageNumber ? stageNote || stage.stageNote : stage.stageNote,
  }));

  order.status = order.stages[stageNumber - 1]?.stageName ?? order.status;
  order.updatedAt = new Date().toISOString();
}
