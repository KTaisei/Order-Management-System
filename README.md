# Cultural Festival Order Management System
A real-time order management system designed for food stalls, enabling seamless communication between the register and kitchen terminals over a local network.

## Features

### 🔥 Key Features
- **Real-time Order Synchronization**: Instant updates between register and kitchen terminals
- **Multi-Terminal Support**: Dedicated interfaces for both register and kitchen staff
- **Order Status Tracking**: Track orders from creation to completion
- **Sales Analytics**: Comprehensive sales data visualization
- **Local Network Operation**: Works within a local network without internet dependency

### 💻 Terminal Types

#### Register Terminal
- Create and manage orders
- View active order status
- Track recently completed orders
- Real-time connection status monitoring

#### Kitchen Terminal
- View incoming orders in real-time
- Update order status (Start/Complete)
- Audio notifications for new orders
- Filter and manage order queue

#### Analytics Dashboard
- Daily sales visualization
- Product-wise sales distribution
- Total revenue tracking
- Order volume analytics

## 🛠 Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js with React-Chartjs-2
- **Real-time Communication**: Socket.IO
- **State Management**: React Context
- **Backend**: Express + Socket.IO Server

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## 🔧 Configuration

### Network Setup
- The server listens on port 3001
- Frontend development server runs on port 5173
- Both servers are configured to accept connections from all network interfaces

### Environment Variables
No environment variables are required for basic setup.

## 📱 Usage Guide

### Register Terminal
1. Select food and drink items
2. Adjust quantities as needed
3. Add notes if required
4. Confirm order
5. Monitor order status in real-time

### Kitchen Terminal
1. View incoming orders in the "New Orders" section
2. Click "Start" to begin preparing an order
3. Click "Complete" when the order is ready
4. Toggle sound notifications as needed

### Analytics Dashboard
1. View daily sales trends
2. Check product-wise sales distribution
3. Monitor total revenue and order count
4. Switch between analytics and detailed order list views

## 🔍 Order States

- **New**: Order just created
- **In Progress**: Kitchen has started preparing
- **Completed**: Order is ready for service

## 💡 Best Practices

1. **Order Management**
   - Process orders in FIFO (First In, First Out) order
   - Update order status promptly
   - Check connection status regularly

2. **Kitchen Operations**
   - Enable sound notifications during peak hours
   - Mark orders as "In Progress" before starting preparation
   - Complete orders promptly to maintain accurate statistics

3. **Analytics Review**
   - Monitor daily sales trends
   - Track popular items
   - Use insights for inventory management

## 🔒 Security Considerations

- System operates within local network only
- No sensitive data storage
- No authentication required (designed for trusted local network)

## ⚠️ Known Limitations

- Requires devices to be on the same local network
- No persistent data storage (data is stored in localStorage)
- No print receipt functionality
- No external API integrations

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**
   - Ensure all devices are on the same network
   - Check if the server is running
   - Verify correct IP addresses and ports

2. **Order Not Updating**
   - Check connection status indicator
   - Refresh the page if needed
   - Restart the server if issues persist

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 起動方法

一つのターミナルでは、 node server/index.js  を実行し、
もう一つのターミナルでは、　npm run dev  を実行することにより、バックエンドと、フロントエンドそれぞれが起動する