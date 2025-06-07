import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderItem } from '../types';
import * as orderService from '../services/orderService';
import socketService from '../services/socketService';

interface OrderContextType {
  activeOrders: Order[];
  completedOrders: Order[];
  allOrders: Order[];
  addOrder: (items: OrderItem[], totalPrice: number) => void;
  updateOrderStatus: (orderId: number, status: 'new' | 'in-progress' | 'completed') => void;
  cancelOrder: (orderId: number) => void;
  isConnected: boolean;
  connectedClients: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ 
  children: React.ReactNode; 
  terminalType: 'register' | 'kitchen' 
}> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedClients, setConnectedClients] = useState(0);

  // 初期データを読み込む
  useEffect(() => {
    const loadInitialData = () => {
      const active = orderService.getActiveOrders();
      const completed = orderService.getCompletedOrders();
      const all = orderService.getOrders();
      
      console.log('Loading initial data:', { active, completed, all });
      
      setActiveOrders(active);
      setCompletedOrders(completed);
      setAllOrders(all);
    };
    
    loadInitialData();
  }, []);

  // WebSocket接続状態を監視
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  // WebSocketイベントリスナーを設定
  useEffect(() => {
    const removeNewOrderListener = socketService.addListener('new-order', (order: Order) => {
      console.log('Received new-order event:', order);
      handleNewOrder(order);
    });

    const removeUpdateOrderListener = socketService.addListener('update-order', (order: Order) => {
      console.log('Received update-order event:', order);
      handleOrderUpdate(order);
    });

    const removeCompleteOrderListener = socketService.addListener('complete-order', (order: Order) => {
      console.log('Received complete-order event:', order);
      handleOrderComplete(order);
    });

    const removeCancelOrderListener = socketService.addListener('cancel-order', (orderId: number) => {
      console.log('Received cancel-order event:', orderId);
      handleOrderCancel(orderId);
    });

    const removeClientCountListener = socketService.addListener('clientCount', (count: number) => {
      setConnectedClients(count);
    });

    return () => {
      removeNewOrderListener();
      removeUpdateOrderListener();
      removeCompleteOrderListener();
      removeCancelOrderListener();
      removeClientCountListener();
    };
  }, []);

  const handleNewOrder = (order: Order) => {
    console.log('Handling new order:', order);
    setActiveOrders(prev => {
      const updated = [...prev, order];
      console.log('Updated active orders:', updated);
      return updated;
    });
    setAllOrders(prev => {
      const updated = [...prev, order];
      console.log('Updated all orders:', updated);
      orderService.syncOrders(updated);
      return updated;
    });
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    console.log('Handling order update:', updatedOrder);
    setActiveOrders(prev => {
      const updated = prev.map(order => order.id === updatedOrder.id ? updatedOrder : order);
      console.log('Updated active orders after update:', updated);
      return updated;
    });
    setAllOrders(prev => {
      const updated = prev.map(order => order.id === updatedOrder.id ? updatedOrder : order);
      console.log('Updated all orders after update:', updated);
      orderService.syncOrders(updated);
      return updated;
    });
  };

  const handleOrderComplete = (completedOrder: Order) => {
    console.log('Handling order completion:', completedOrder);
    setActiveOrders(prev => {
      const updated = prev.filter(order => order.id !== completedOrder.id);
      console.log('Updated active orders after completion:', updated);
      return updated;
    });
    setCompletedOrders(prev => {
      const updated = [completedOrder, ...prev];
      console.log('Updated completed orders:', updated);
      return updated;
    });
    setAllOrders(prev => {
      const updated = prev.map(order => order.id === completedOrder.id ? completedOrder : order);
      console.log('Updated all orders after completion:', updated);
      orderService.syncOrders(updated);
      return updated;
    });
  };

  const handleOrderCancel = (orderId: number) => {
    console.log('Handling order cancellation:', orderId);
    setActiveOrders(prev => {
      const updated = prev.filter(order => order.id !== orderId);
      console.log('Updated active orders after cancellation:', updated);
      return updated;
    });
    setAllOrders(prev => {
      const updated = prev.filter(order => order.id !== orderId);
      console.log('Updated all orders after cancellation:', updated);
      orderService.syncOrders(updated);
      return updated;
    });
  };

  const addOrder = (items: OrderItem[], totalPrice: number) => {
    console.log('Adding new order:', { items, totalPrice });
    const newOrder = orderService.addOrder(items, totalPrice);
    console.log('Created new order:', newOrder);
    handleNewOrder(newOrder);
    socketService.sendNewOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: number, status: 'new' | 'in-progress' | 'completed') => {
    console.log(`Updating order ${orderId} to status ${status}`);
    
    // Find the order first to make sure it exists
    const existingOrder = allOrders.find(order => order.id === orderId);
    if (!existingOrder) {
      console.error(`Order ${orderId} not found in allOrders:`, allOrders);
      return;
    }
    
    console.log('Found existing order:', existingOrder);
    
    const updatedOrder = orderService.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      console.error(`Failed to update order ${orderId} in orderService`);
      return;
    }

    console.log('Order updated in service:', updatedOrder);

    if (status === 'completed') {
      handleOrderComplete(updatedOrder);
      socketService.sendCompleteOrder(updatedOrder);
    } else {
      handleOrderUpdate(updatedOrder);
      socketService.sendUpdateOrder(updatedOrder);
    }
  };

  const cancelOrder = (orderId: number) => {
    console.log(`Canceling order ${orderId}`);
    
    // Find the order first to make sure it exists
    const existingOrder = allOrders.find(order => order.id === orderId);
    if (!existingOrder) {
      console.error(`Order ${orderId} not found in allOrders:`, allOrders);
      return;
    }
    
    console.log('Found existing order to cancel:', existingOrder);
    
    const success = orderService.cancelOrder(orderId);
    if (!success) {
      console.error(`Failed to cancel order ${orderId} in orderService`);
      return;
    }
    
    handleOrderCancel(orderId);
    socketService.sendCancelOrder(orderId);
  };

  const value = {
    activeOrders,
    completedOrders,
    allOrders,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    isConnected,
    connectedClients
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};