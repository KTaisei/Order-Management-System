import { Order, OrderItem, OrderStatus } from '../types';

// Local storage keys
const ORDERS_KEY = 'festival-orders';
const LAST_ORDER_ID_KEY = 'festival-last-order-id';

// Get all orders
export const getOrders = (): Order[] => {
  try {
    const orders = localStorage.getItem(ORDERS_KEY);
    const result = orders ? JSON.parse(orders) : [];
    console.log('getOrders result:', result);
    return result;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Get active orders (not completed)
export const getActiveOrders = (): Order[] => {
  const allOrders = getOrders();
  const result = allOrders.filter(order => order.status !== 'completed');
  console.log('getActiveOrders result:', result);
  return result;
};

// Get completed orders
export const getCompletedOrders = (): Order[] => {
  const allOrders = getOrders();
  const result = allOrders.filter(order => order.status === 'completed');
  console.log('getCompletedOrders result:', result);
  return result;
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
    console.log('Generated next order ID:', nextId);
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
  
  console.log('Adding new order to storage:', newOrder);
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  console.log('Orders after adding new order:', orders);
  return newOrder;
};

// Update order status
export const updateOrderStatus = (orderId: number, status: OrderStatus): Order | null => {
  console.log(`updateOrderStatus called with orderId: ${orderId}, status: ${status}`);
  
  const orders = getOrders();
  console.log('Current orders in storage:', orders);
  
  const orderIndex = orders.findIndex(order => order.id === orderId);
  console.log(`Order index for ID ${orderId}:`, orderIndex);
  
  if (orderIndex === -1) {
    console.error(`Order with ID ${orderId} not found in orders:`, orders);
    return null;
  }
  
  const originalOrder = { ...orders[orderIndex] };
  console.log('Original order before update:', originalOrder);
  
  orders[orderIndex].status = status;
  
  // If the order is being marked as completed, add the completion timestamp
  if (status === 'completed') {
    orders[orderIndex].completedAt = new Date().toISOString();
  }
  
  console.log('Updated order:', orders[orderIndex]);
  
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    console.log('Successfully saved updated orders to localStorage');
    
    // Verify the save worked
    const savedOrders = getOrders();
    const savedOrder = savedOrders.find(order => order.id === orderId);
    console.log('Verified saved order:', savedOrder);
    
    return orders[orderIndex];
  } catch (error) {
    console.error('Error saving updated orders to localStorage:', error);
    return null;
  }
};

// Cancel order
export const cancelOrder = (orderId: number): boolean => {
  console.log(`cancelOrder called with orderId: ${orderId}`);
  
  const orders = getOrders();
  console.log('Current orders before cancellation:', orders);
  
  const filteredOrders = orders.filter(order => order.id !== orderId);
  console.log('Orders after filtering:', filteredOrders);
  
  if (filteredOrders.length === orders.length) {
    console.error(`Order with ID ${orderId} not found for cancellation`);
    return false; // Order not found
  }
  
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filteredOrders));
    console.log('Successfully saved filtered orders to localStorage');
    return true;
  } catch (error) {
    console.error('Error saving filtered orders to localStorage:', error);
    return false;
  }
};

// Calculate total for an order
export const calculateOrderTotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
};

// Sync orders (for when new peers connect)
export const syncOrders = (orders: Order[]): void => {
  console.log('Syncing orders:', orders);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    console.log('Successfully synced orders to localStorage');
  } catch (error) {
    console.error('Error syncing orders to localStorage:', error);
  }
};

// Clear all order history
export const clearOrderHistory = (): void => {
  console.log('Clearing order history');
  localStorage.removeItem(ORDERS_KEY);
  localStorage.removeItem(LAST_ORDER_ID_KEY);
  console.log('Order history cleared');
};