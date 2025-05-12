import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';
import ConnectionStatus from '../components/ConnectionStatus';
import { useOrders } from '../context/OrderContext';

const RegisterTerminal: React.FC = () => {
  const { activeOrders, completedOrders, isConnected, connectedTo } = useOrders();
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Get only recent completed orders (last hour)
  const recentCompletedOrders = completedOrders.filter(order => {
    const completedTime = new Date(order.completedAt || '');
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return completedTime > oneHourAgo;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Register Terminal</h1>
            <div className="flex space-x-4">
              <Link 
                to="/kitchen" 
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                Switch to Kitchen
              </Link>
              <Link 
                to="/history" 
                className="px-4 py-2 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200"
              >
                View History
              </Link>
            </div>
          </div>
          <ConnectionStatus isConnected={isConnected} connectedTo={connectedTo} />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <OrderForm />
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Completed Orders</h2>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showCompleted ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showCompleted && (
                <div className="space-y-4">
                  {recentCompletedOrders.length > 0 ? (
                    recentCompletedOrders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                      No completed orders in the last hour
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <OrderList 
              orders={activeOrders} 
              title="Active Orders" 
              emptyMessage="No active orders" 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterTerminal;