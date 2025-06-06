import React from 'react';
import { Order, OrderStatus } from '../types';
import { useOrders } from '../context/OrderContext';
import { Clock, CheckCircle } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  isKitchenView?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isKitchenView = false }) => {
  const { updateOrderStatus } = useOrders();
  
  const handleStatusChange = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getTimeElapsed = () => {
    const created = new Date(order.createdAt);
    const now = new Date();
    const elapsedMs = now.getTime() - created.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    
    if (elapsedMinutes < 1) return 'Just now';
    return `${elapsedMinutes} min ago`;
  };
  
  const getStatusColor = () => {
    switch (order.status) {
      case 'new':
        return 'bg-orange-50 border-orange-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeColor = () => {
    switch (order.status) {
      case 'new':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className={`border-2 rounded-lg overflow-hidden ${getStatusColor()} transition-all duration-200`}>
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Order #{order.id}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
            {order.status === 'new' ? 'New' : 
             order.status === 'in-progress' ? 'In Progress' : 
             'Completed'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span className="text-sm">{getTimeElapsed()}</span>
        </div>
      </div>

      {/* 注文内容 */}
      <div className="p-4 bg-white bg-opacity-50">
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.quantity}x</span>
                <span className="font-medium text-lg">{item.name}</span>
              </div>
              <span className="text-gray-600">¥{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* フッター部分 */}
      <div className="p-4 bg-white bg-opacity-75 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              受付: <span className="font-medium">{formatTime(order.createdAt)}</span>
            </div>
            {order.completedAt && (
              <div className="text-sm text-gray-600">
                Completed: <span className="font-medium">{formatTime(order.completedAt)}</span>
              </div>
            )}
          </div>
          
          {isKitchenView && order.status !== 'completed' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={18} />
                完了
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;