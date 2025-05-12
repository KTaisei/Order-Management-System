import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterTerminal from './pages/RegisterTerminal';
import KitchenTerminal from './pages/KitchenTerminal';
import HistoryPage from './pages/HistoryPage';
import { OrderProvider } from './context/OrderContext';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <OrderProvider terminalType="register">
            <RegisterTerminal />
          </OrderProvider>
        } />
        <Route path="/kitchen" element={
          <OrderProvider terminalType="kitchen">
            <KitchenTerminal />
          </OrderProvider>
        } />
        <Route path="/history" element={
          <OrderProvider terminalType="register">
            <HistoryPage />
          </OrderProvider>
        } />
      </Routes>
    </Router>
  );
};

export default App;