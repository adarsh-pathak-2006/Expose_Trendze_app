export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  AdminOrderControl: { orderId: string };
  OrderDetail: { orderId: string };
  Tracking: { orderId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Track: { orderId?: string } | undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  Profile: undefined;
};
