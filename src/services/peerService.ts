import { useEffect, useState } from 'react';
import { Message, Order, Peer } from '../types';

// This is a simplified peer connection service for local network communication
// In a real implementation, you would use a more robust WebRTC or WebSocket solution

const DISCOVERY_INTERVAL = 2000; // 2 seconds
const BROADCAST_ADDRESS = '192.168.1.255'; // This would need to be configured based on actual network

class PeerService {
  private peers: Map<string, Peer> = new Map();
  private listeners: Set<(message: Message) => void> = new Set();
  private peerId: string = Math.random().toString(36).substring(2, 10);
  private peerType: 'register' | 'kitchen';
  
  constructor(type: 'register' | 'kitchen') {
    this.peerType = type;
    this.startDiscovery();
  }

  // In a real implementation, this would use actual network discovery
  private startDiscovery() {
    console.log(`Starting peer discovery as ${this.peerType} with ID ${this.peerId}`);
    
    // Simulate discovering peers on the network
    // In a real implementation, this would use UDP broadcast or similar
    setInterval(() => {
      this.broadcastPresence();
    }, DISCOVERY_INTERVAL);
    
    // Listen for messages
    // In a real implementation, this would use actual network listeners
    window.addEventListener('storage', this.handleStorageEvent);
  }

  private broadcastPresence() {
    // Simulate broadcasting presence on network
    // In a real implementation, this would send UDP packets
    console.log(`Broadcasting presence as ${this.peerType}`);
    localStorage.setItem('peer-broadcast', JSON.stringify({
      id: this.peerId,
      type: this.peerType,
      timestamp: Date.now()
    }));
  }

  // This uses localStorage as a simulation of network communication
  // In a real implementation, this would use WebRTC or WebSockets
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'peer-broadcast') {
      try {
        const data = JSON.parse(event.newValue || '{}');
        if (data.id !== this.peerId) {
          this.peers.set(data.id, {
            id: data.id,
            type: data.type
          });
          console.log(`Discovered peer: ${data.type} (${data.id})`);
        }
      } catch (error) {
        console.error('Error parsing peer broadcast:', error);
      }
    } else if (event.key === 'peer-message') {
      try {
        const messageData = JSON.parse(event.newValue || '{}');
        if (messageData.targetId === this.peerId || messageData.targetId === 'all') {
          this.notifyListeners(messageData.message);
        }
      } catch (error) {
        console.error('Error parsing peer message:', error);
      }
    }
  };

  public sendMessage(message: Message, targetId?: string) {
    // Simulate sending a message to a specific peer or all peers
    // In a real implementation, this would use WebRTC or WebSockets
    console.log('Sending message:', message, 'to:', targetId || 'all');
    localStorage.setItem('peer-message', JSON.stringify({
      sourceId: this.peerId,
      targetId: targetId || 'all',
      message,
      timestamp: Date.now()
    }));
  }

  public addListener(listener: (message: Message) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(message: Message) {
    this.listeners.forEach(listener => listener(message));
  }

  public getPeerId() {
    return this.peerId;
  }

  public getPeerType() {
    return this.peerType;
  }

  public getConnectedPeers() {
    return Array.from(this.peers.values());
  }

  public cleanup() {
    window.removeEventListener('storage', this.handleStorageEvent);
  }
}

// React hook for using the peer service
export const usePeerConnection = (type: 'register' | 'kitchen') => {
  const [peerService] = useState(() => new PeerService(type));
  const [connectedPeers, setConnectedPeers] = useState<Peer[]>([]);

  useEffect(() => {
    // Check for connected peers every second
    const interval = setInterval(() => {
      setConnectedPeers(peerService.getConnectedPeers());
    }, 1000);

    return () => {
      clearInterval(interval);
      peerService.cleanup();
    };
  }, [peerService]);

  return {
    peerId: peerService.getPeerId(),
    peerType: peerService.getPeerType(),
    connectedPeers,
    sendMessage: (message: Message, targetId?: string) => peerService.sendMessage(message, targetId),
    addListener: (listener: (message: Message) => void) => peerService.addListener(listener)
  };
};