import React from 'react';
import { Order } from '../types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  title: string;
  isKitchenView?: boolean;
  emptyMessage?: string;
}

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  title, 
  isKitchenView = false,
  emptyMessage = 'No orders yet'
}) => {
  // Sort orders by creation time (oldest first) for kitchen view
  const sortedOrders = isKitchenView 
    ? [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      {sortedOrders.length === 0 ? (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {sortedOrders.map(order => (
            <OrderCard 
              key={`order-${order.id}-${order.status}`} 
              order={order} 
              isKitchenView={isKitchenView} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;