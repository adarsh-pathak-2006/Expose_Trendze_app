export const APP_NAME = 'Expose Trendze';
export const APP_TAGLINE = 'Your Orders. Your Way.';
export const SUPPORT_EMAIL = 'info@exposetrendze.in';
export const APP_VERSION = '1.0.0';
export const ADMIN_TAGLINE = 'Control order stages manually from the ET admin panel.';

export const ORDER_STAGES = [
  'Order Received',
  'Raw Material / Leather Received',
  'Manufacturing Started',
  'Product in Production',
  'Quality Check in Progress',
  'Packaging Started',
  'Order Dispatched from India',
  'Shipment in Transit',
  'Customs / International Transit',
  'Out for Delivery',
  'Delivered',
] as const;

export const ORDER_STATUS_FILTERS = ['All', 'Active', 'Completed', 'Cancelled'] as const;
export const LOGIN_VARIANTS = ['customer', 'admin'] as const;
