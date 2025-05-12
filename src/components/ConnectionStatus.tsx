import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectedClients: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, connectedClients }) => {
  return (
    <div className="flex items-center mb-4">
      <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-sm font-medium">
        {isConnected 
          ? `接続中 (${connectedClients}台の端末が接続中)` 
          : 'サーバーに接続できません'}
      </span>
    </div>
  );
};

export default ConnectionStatus;