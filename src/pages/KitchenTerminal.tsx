import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrderList from '../components/OrderList';
import OrderCard from '../components/OrderCard';
import ConnectionStatus from '../components/ConnectionStatus';
import { useOrders } from '../context/OrderContext';
import { Monitor } from 'lucide-react';

const KitchenTerminal: React.FC = () => {
  const { activeOrders, completedOrders, isConnected, connectedClients } = useOrders();
  const [showCompleted, setShowCompleted] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  
  // Filter orders
  const newOrders = activeOrders.filter(order => order.status === 'new');
  const inProgressOrders = activeOrders.filter(order => order.status === 'in-progress');
  
  // Get only recent completed orders (last 30 minutes)
  const recentCompletedOrders = completedOrders.filter(order => {
    const completedTime = new Date(order.completedAt || '');
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    return completedTime > thirtyMinutesAgo;
  });
  
  // Play sound when new order arrives
  useEffect(() => {
    if (newOrders.length > orderCount && playSound) {
      try {
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Error playing sound:', e));
      } catch (error) {
        console.log('Audio playback error:', error);
      }
    }
    
    setOrderCount(newOrders.length);
  }, [newOrders.length, orderCount, playSound]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Terminal</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setPlaySound(!playSound)}
                className={`px-4 py-2 rounded-md ${
                  playSound 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {playSound ? 'Sound: On' : 'Sound: Off'}
              </button>
              <Link 
                to="/display" 
                className="px-4 py-2 bg-purple-100 rounded-md text-purple-700 hover:bg-purple-200 flex items-center gap-2"
              >
                <Monitor size={18} />
                Order Display
              </Link>
              <Link 
                to="/" 
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                Switch to Register
              </Link>
              <Link 
                to="/history" 
                className="px-4 py-2 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200"
              >
                View History
              </Link>
            </div>
          </div>
          <ConnectionStatus isConnected={isConnected} connectedClients={connectedClients} />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <OrderList 
              orders={newOrders} 
              title={`New Orders (${newOrders.length})`}
              isKitchenView={true}
              emptyMessage="No new orders"
            />
          </div>
          
          <div>
            <OrderList 
              orders={inProgressOrders} 
              title={`In Progress (${inProgressOrders.length})`}
              isKitchenView={true}
              emptyMessage="No orders in progress"
            />
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Completed</h2>
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
                      <OrderCard key={order.id} order={order} isKitchenView={false} />
                    ))
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                      No completed orders in the last 30 minutes
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KitchenTerminal;