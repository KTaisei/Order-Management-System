import { io, Socket } from 'socket.io-client';
import { Order } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Get the server URL from the current hostname
    const serverUrl = `http://${window.location.hostname}:3001`;
    
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('サーバーに接続しました');
    });

    this.socket.on('disconnect', () => {
      console.log('サーバーから切断されました');
    });

    this.socket.on('connect_error', (error) => {
      console.error('接続エラー:', error);
    });

    ['new-order', 'update-order', 'complete-order', 'cancel-order', 'clientCount'].forEach(event => {
      this.socket.on(event, (data) => {
        const listeners = this.listeners.get(event);
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      });
    });
  }

  public addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public sendNewOrder(order: Order) {
    this.socket?.emit('new-order', order);
  }

  public sendUpdateOrder(order: Order) {
    this.socket?.emit('update-order', order);
  }

  public sendCompleteOrder(order: Order) {
    this.socket?.emit('complete-order', order);
  }

  public sendCancelOrder(orderId: number) {
    this.socket?.emit('cancel-order', orderId);
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

const socketService = new SocketService();
export default socketService;