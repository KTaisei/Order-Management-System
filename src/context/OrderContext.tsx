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
    setActiveOrders(orderService.getActiveOrders());
    setCompletedOrders(orderService.getCompletedOrders());
    setAllOrders(orderService.getOrders());
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
      handleNewOrder(order);
    });

    const removeUpdateOrderListener = socketService.addListener('update-order', (order: Order) => {
      handleOrderUpdate(order);
    });

    const removeCompleteOrderListener = socketService.addListener('complete-order', (order: Order) => {
      handleOrderComplete(order);
    });

    const removeCancelOrderListener = socketService.addListener('cancel-order', (orderId: number) => {
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
    setActiveOrders(prev => [...prev, order]);
    setAllOrders(prev => [...prev, order]);
    orderService.syncOrders([...allOrders, order]);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setActiveOrders(prev => 
      prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
    );
    setAllOrders(prev =>
      prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
    );
    orderService.syncOrders(allOrders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const handleOrderComplete = (completedOrder: Order) => {
    setActiveOrders(prev => prev.filter(order => order.id !== completedOrder.id));
    setCompletedOrders(prev => [completedOrder, ...prev]);
    setAllOrders(prev =>
      prev.map(order => order.id === completedOrder.id ? completedOrder : order)
    );
    orderService.syncOrders(allOrders.map(order => 
      order.id === completedOrder.id ? completedOrder : order
    ));
  };

  const handleOrderCancel = (orderId: number) => {
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    setAllOrders(prev => prev.filter(order => order.id !== orderId));
    orderService.cancelOrder(orderId);
  };

  const addOrder = (items: OrderItem[], totalPrice: number) => {
    const newOrder = orderService.addOrder(items, totalPrice);
    handleNewOrder(newOrder);
    socketService.sendNewOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: number, status: 'new' | 'in-progress' | 'completed') => {
    const updatedOrder = orderService.updateOrderStatus(orderId, status);
    if (!updatedOrder) return;

    if (status === 'completed') {
      handleOrderComplete(updatedOrder);
      socketService.sendCompleteOrder(updatedOrder);
    } else {
      handleOrderUpdate(updatedOrder);
      socketService.sendUpdateOrder(updatedOrder);
    }
  };

  const cancelOrder = (orderId: number) => {
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