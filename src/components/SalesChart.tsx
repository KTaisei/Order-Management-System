import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Order } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesChartProps {
  orders: Order[];
}

const SalesChart: React.FC<SalesChartProps> = ({ orders }) => {
  // 日付ごとの売上を集計
  const dailySales = orders.reduce((acc: Record<string, number>, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('ja-JP');
    acc[date] = (acc[date] || 0) + order.totalPrice;
    return acc;
  }, {});

  // 商品ごとの販売数を集計
  const itemSales = orders.reduce((acc: Record<string, number>, order) => {
    order.items.forEach(item => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
    });
    return acc;
  }, {});

  // 売上グラフのデータ
  const salesData = {
    labels: Object.keys(dailySales),
    datasets: [
      {
        label: '売上 (円)',
        data: Object.values(dailySales),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  // 商品別販売数のデータ
  const itemData = {
    labels: Object.keys(itemSales),
    datasets: [
      {
        data: Object.values(itemSales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '日別売上',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '商品別販売数',
      },
    },
  };

  // 総売上と総注文数を計算
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">総売上</h3>
          <p className="text-3xl font-bold text-blue-600">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">総注文数</h3>
          <p className="text-3xl font-bold text-green-600">{totalOrders}件</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Bar options={options} data={salesData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Pie options={pieOptions} data={itemData} />
        </div>
      </div>
    </div>
  );
};

export default SalesChart;