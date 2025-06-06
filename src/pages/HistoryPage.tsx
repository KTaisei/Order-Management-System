import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import SalesChart from '../components/SalesChart';
import { Trash2 } from 'lucide-react';
import * as orderService from '../services/orderService';

const HistoryPage: React.FC = () => {
  const { allOrders } = useOrders();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'analytics'>('analytics');
  
  // Sort orders by most recent first
  const sortedOrders = [...allOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Filter orders based on status and search term
  const filteredOrders = sortedOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) || 
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
  
  // Format date and time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate processing time
  const getProcessingTime = (order: any) => {
    if (!order.completedAt) return 'N/A';
    
    const created = new Date(order.createdAt);
    const completed = new Date(order.completedAt);
    const diffMinutes = Math.floor((completed.getTime() - created.getTime()) / 60000);
    
    if (diffMinutes < 1) return '<1 min';
    return `${diffMinutes} min`;
  };

  // Handle clear history
  const handleClearHistory = () => {
    if (window.confirm('本当に全ての取引履歴を削除しますか？この操作は取り消せません。')) {
      orderService.clearOrderHistory();
      window.location.reload(); // Reload to refresh the data
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">取引履歴</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-2"
              >
                <Trash2 size={18} />
                履歴を削除
              </button>
              <Link 
                to="/" 
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                レジ端末
              </Link>
              <Link 
                to="/kitchen" 
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                厨房端末
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 rounded-md ${
                view === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              分析
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md ${
                view === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              注文一覧
            </button>
          </div>
        </div>

        {view === 'analytics' ? (
          <SalesChart orders={allOrders} />
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="statusFilter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">全ての注文</option>
                      <option value="new">新規</option>

                      <option value="completed">完了</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by order number or item..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Showing {filteredOrders.length} of {allOrders.length} orders
                </div>
              </div>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                注文はまだありません。フィルターを変更するか、検索してください
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        注文番号
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        注文内容
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        受付時間
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        製作時間
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <ul>
                            {order.items.map((item: any, index: number) => (
                              <li key={index}>{item.quantity}x {item.name}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'new' ? 'bg-orange-100 text-orange-800' : 
                              order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'}`}
                          >
                            {order.status === 'new' ? 'New' : 
                              order.status === 'in-progress' ? 'In Progress' : 
                              'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getProcessingTime(order)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;