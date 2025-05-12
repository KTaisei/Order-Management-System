import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { MenuItem, OrderItem } from '../types';
import { menuItems } from '../data/menu';
import { Plus, Minus, Trash2 } from 'lucide-react';

const OrderForm: React.FC = () => {
  const { addOrder } = useOrders();
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem>>({});
  
  const addMenuItem = (menuItem: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev[menuItem.id];
      return {
        ...prev,
        [menuItem.id]: {
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: (existing?.quantity || 0) + 1,
          price: menuItem.price
        }
      };
    });
  };
  
  const decreaseQuantity = (menuItemId: string) => {
    setOrderItems(prev => {
      const existing = prev[menuItemId];
      if (!existing || existing.quantity <= 1) {
        const { [menuItemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [menuItemId]: {
          ...existing,
          quantity: existing.quantity - 1
        }
      };
    });
  };
  
  const removeItem = (menuItemId: string) => {
    setOrderItems(prev => {
      const { [menuItemId]: _, ...rest } = prev;
      return rest;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(orderItems).length === 0) {
      alert('注文項目を選択してください');
      return;
    }
    
    const items = Object.values(orderItems);
    const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    addOrder(items, totalPrice);
    setOrderItems({});
  };
  
  const foodItems = menuItems.filter(item => item.category === 'food');
  const drinkItems = menuItems.filter(item => item.category === 'drink');
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">新規注文</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">フード</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {foodItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => addMenuItem(item)}
              className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">¥{item.price}</div>
            </button>
          ))}
        </div>
        
        <h3 className="text-lg font-medium mb-3">ドリンク</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {drinkItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => addMenuItem(item)}
              className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">¥{item.price}</div>
            </button>
          ))}
        </div>
      </div>
      
      {Object.keys(orderItems).length > 0 && (
        <div className="border-t pt-4 mb-6">
          <h3 className="text-lg font-medium mb-3">注文内容</h3>
          <div className="space-y-3">
            {Object.values(orderItems).map(item => (
              <div key={item.menuItemId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex-grow">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">¥{item.price * item.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.menuItemId)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => addMenuItem(menuItems.find(m => m.id === item.menuItemId)!)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.menuItemId)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-right text-lg font-medium">
            合計: ¥{Object.values(orderItems).reduce((sum, item) => sum + (item.quantity * item.price), 0)}
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={Object.keys(orderItems).length === 0}
        >
          注文を確定
        </button>
      </div>
    </form>
  );
};

export default OrderForm;