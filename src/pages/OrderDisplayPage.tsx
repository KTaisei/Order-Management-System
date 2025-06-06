import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types';
import { Clock, CheckCircle, Monitor } from 'lucide-react';

const OrderDisplayPage: React.FC = () => {
  const { activeOrders, updateOrderStatus } = useOrders();
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'in-progress'>('all');

  // Filter orders based on status
  const filteredOrders = activeOrders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const handleStatusChange = (orderId: number, status: 'new' | 'in-progress' | 'completed') => {
    updateOrderStatus(orderId, status);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeElapsed = (order: Order) => {
    const created = new Date(order.createdAt);
    const now = new Date();
    const elapsedMs = now.getTime() - created.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    
    if (elapsedMinutes < 1) return 'Just now';
    return `${elapsedMinutes} min ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      case 'in-progress':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-8">📋</div>
          <h1 className="text-4xl font-bold text-white mb-4">注文はありません</h1>
          <p className="text-xl text-gray-400 mb-8">
            {filterStatus === 'all' ? 'All orders have been completed' : 
             filterStatus === 'new' ? 'No new orders' : 'No orders in progress'}
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl hover:bg-blue-700 transition-colors"
            >
              レジ端末へ移動
            </Link>
            <Link 
              to="/kitchen" 
              className="px-8 py-4 bg-gray-600 text-white rounded-lg text-xl hover:bg-gray-700 transition-colors"
            >
              厨房端末へ移動
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Monitor size={32} className="text-purple-400" />
              <h1 className="text-3xl font-bold">注文一覧表示</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'new' | 'in-progress')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
              >
                <option value="all">全ての注文 ({activeOrders.length})</option>
                <option value="new">新しい注文 ({activeOrders.filter(o => o.status === 'new').length})</option>
                <option value="in-progress">完了した注文 ({activeOrders.filter(o => o.status === 'in-progress').length})</option>
              </select>
              <Link 
                to="/" 
                className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                レジ端末
              </Link>
              <Link 
                to="/kitchen" 
                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                厨房端末
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-300">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-200">
              {/* Order Header */}
              <div className={`${getStatusColor(order.status)} p-6 text-white`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Order #{order.id}</h3>
                    <div className="flex items-center space-x-2 text-lg">
                      <Clock size={20} />
                      <span>{getTimeElapsed(order)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusBadgeColor(order.status)}`}>
                      {order.status === 'new' ? 'NEW' : 
                       order.status === 'in-progress' ? 'IN PROGRESS' : 'COMPLETED'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    ¥{order.totalPrice.toLocaleString()}
                  </div>
                  <div className="text-white/80 text-sm">
                    受付時間: {formatTime(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="text-xl font-bold mb-4 text-gray-800">注文内容</h4>
                <div className="space-y-3 mb-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">{item.quantity}</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800 text-3xl">{item.name}</h5>
                          <p className="text-sm text-gray-600">¥{item.price} each</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {order.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="flex items-center justify-center space-x-2 w-full py-4 bg-green-600 text-white rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={24} />
                    <span>完了</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OrderDisplayPage;