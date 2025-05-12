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
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      {orders.length === 0 ? (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
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