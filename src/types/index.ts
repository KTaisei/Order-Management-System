export type OrderStatus = 'new' | 'in-progress' | 'completed';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink';
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
  totalPrice: number;
}

export interface Message {
  type: 'new-order' | 'update-order' | 'complete-order' | 'sync-orders';
  payload: any;
}