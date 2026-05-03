import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_WS_HOST = '127.0.0.1:8080'; // Should match API host
const WS_URL = `ws://${BASE_WS_HOST}/api/v1/presence/ws`;
console.log('🔌 [CIRCLO] Presence WS URL:', WS_URL);

export type PresenceUpdate = {
  user_id: string;
  status: string;
};

export type MessageReceived = {
  content: string;
  user_id: string;
};

export class PresenceService {
  private static socket: WebSocket | null = null;
  private static listeners: ((event: any) => void)[] = [];

  static async connect() {
    if (this.socket) return;

    const token = await AsyncStorage.getItem('access_token');
    if (!token) return;

    this.socket = new WebSocket(`${WS_URL}?token=${token}`);

    this.socket.onopen = () => {
      console.log('Presence WebSocket Connected');
    };

    this.socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.listeners.forEach(listener => listener(data));
      } catch (err) {
        console.error('WS Message Parse Error:', err);
      }
    };

    this.socket.onclose = () => {
      console.log('Presence WebSocket Disconnected');
      this.socket = null;
      // Optional: Auto-reconnect logic
    };

    this.socket.onerror = (e) => {
      console.error('WS Error:', e);
    };
  }

  static subscribe(callback: (event: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  static send(type: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WS not connected, cannot send:', type);
    }
  }

  static disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
