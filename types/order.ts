export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue';
export type AppRole = 'customer' | 'admin';

export type OrderItem = {
  id: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, string>;
};

export type OrderStage = {
  id: string;
  stageNumber: number;
  stageName: string;
  stageNote?: string;
  isCompleted: boolean;
  completedAt?: string;
  updatedBy?: string;
};

export type OrderPricingHistoryEntry = {
  id: string;
  previousTotalAmount?: number;
  newTotalAmount: number;
  currency: string;
  changeNote?: string;
  changedAt: string;
  changedBy?: string;
};

export type Order = {
  id: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  expectedDelivery?: string;
  placedAt: string;
  updatedAt?: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    companyName?: string;
  };
  items: OrderItem[];
  stages: OrderStage[];
  pricingHistory: OrderPricingHistoryEntry[];
};

export type UserProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: AppRole;
  phone?: string;
  companyName?: string;
  country?: string;
  isActive: boolean;
};

export type DashboardSummary = {
  activeOrders: number;
  totalOrders: number;
  recentUpdates: Array<{
    id: string;
    orderNumber: string;
    stageName: string;
    completedAt?: string;
  }>;
};

export type OrderFilter = 'All' | 'Active' | 'Completed' | 'Cancelled';
