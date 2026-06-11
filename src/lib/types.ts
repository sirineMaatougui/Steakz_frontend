export type Role =
  | 'ADMIN'
  | 'HQ_MANAGER'
  | 'BRANCH_MANAGER'
  | 'CHEF'
  | 'CASHIER'
  | 'WAITER'
  | 'CUSTOMER'
  | 'DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'PAID'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD';
export type DeliveryStatus = 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  branchId: number | null;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  _count?: { users: number; menuItems: number; orders: number };
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  available: boolean;
  branchId: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface Delivery {
  id: number;
  address: string;
  status: DeliveryStatus;
  driver?: { id: number; name: string } | null;
  order?: { id: number; branchId: number; total: number; status: OrderStatus; type: OrderType };
}

export interface Order {
  id: number;
  branchId: number;
  type: OrderType;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  delivery?: Delivery | null;
  branch?: { id: number; name: string };
  customer?: { id: number; name: string; email: string } | null;
  waiter?: { id: number; name: string } | null;
}

export interface ChainReport {
  perBranch: { branchId: number; branch: string; orders: number; revenue: number; staff: number }[];
  totals: { orders: number; revenue: number };
  branchCount: number;
}

export interface BranchReport {
  branchId: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  topItems: { name: string; quantity: number }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
