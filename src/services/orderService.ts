import { Order, OrderItem, OrderStatus } from '../types';

// Local storage keys
const ORDERS_KEY = 'festival-orders';
const LAST_ORDER_ID_KEY = 'festival-last-order-id';

// Get all orders
export const getOrders = (): Order[] => {
  try {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Get active orders (not completed)
export const getActiveOrders = (): Order[] => {
  return getOrders().filter(order => order.status !== 'completed');
};

// Get completed orders
export const getCompletedOrders = (): Order[] => {
  return getOrders().filter(order => order.status === 'completed');
};

// Get order history (all orders, for transaction history)
export const getOrderHistory = (): Order[] => {
  return getOrders().sort((a, b) => {
    // Sort by ID in descending order (newest first)
    return b.id - a.id;
  });
};

// Get next order ID
export const getNextOrderId = (): number => {
  try {
    const lastId = localStorage.getItem(LAST_ORDER_ID_KEY);
    const nextId = lastId ? parseInt(lastId, 10) + 1 : 1;
    localStorage.setItem(LAST_ORDER_ID_KEY, nextId.toString());
    return nextId;
  } catch (error) {
    console.error('Error getting next order ID:', error);
    return Math.floor(Math.random() * 1000); // Fallback with random ID if localStorage fails
  }
};

// Add new order
export const addOrder = (items: OrderItem[], totalPrice: number): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    id: getNextOrderId(),
    items,
    status: 'new',
    createdAt: new Date().toISOString(),
    totalPrice
  };
  
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
};

// Update order status
export const updateOrderStatus = (orderId: number, status: OrderStatus): Order | null => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    return null;
  }
  
  orders[orderIndex].status = status;
  
  // If the order is being marked as completed, add the completion timestamp
  if (status === 'completed') {
    orders[orderIndex].completedAt = new Date().toISOString();
  }
  
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return orders[orderIndex];
};

// Calculate total for an order
export const calculateOrderTotal = (items: OrderItem[]): number => {
  // This is a placeholder. In a real application, you would have prices for each item
  // and calculate the actual total based on item prices and quantities
  return items.reduce((total, item) => total + item.quantity * 100, 0);
};

// Sync orders (for when new peers connect)
export const syncOrders = (orders: Order[]): void => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};