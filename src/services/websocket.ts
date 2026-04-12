import { Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import { useCircleStore } from '../store/circleStore';

// Note: Use ws:// for local development. Handle Android Emulator 10.0.2.2 mapping.
const WS_URL = 'wss://backend-circlo.onrender.com/api/v1/presence/ws';
// const WS_URL = 'ws://127.0.0.1:8080/api/v1/presence/ws';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: any = null;

  async connect() {
    if (this.socket) {
      console.log('WebSocket already connecting/connected');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const hasCircle = useCircleStore.getState().hasCircle;

    if (!token) {
      console.error('No auth token available for WebSocket');
      return;
    }

    if (!hasCircle) {
      console.log('Skipping WebSocket: No active circle found.');
      return;
    }

    // Pass the bearer token in the protocol or a query param if header is not supported by standard WebSocket browser API (some RN environments do support headers)
    // Here we'll rely on the backend expecting the token, typically in the initial upgrade request.
    // Standard react-native WebSocket supports headers.
    console.log(`📡 WebSocket connecting to: ${WS_URL}`);
    this.socket = new WebSocket(WS_URL, undefined, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.onopen = () => {
      console.log('✅ WebSocket Connected');
    };

    this.socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PRESENCE_UPDATE') {
          // Update the store
          useCircleStore
            .getState()
            .updateMemberPresence(data.user_id, data.status);
        }
      } catch (err) {
        console.error('WebSocket Message Parse Error:', err);
      }
    };

    this.socket.onerror = e => {
      console.error('❌ WebSocket Error Details:', JSON.stringify(e));
    };

    this.socket.onclose = e => {
      console.log(`🔴 WebSocket Closed: [Code: ${e.code}] Reason: ${e.reason || 'No reason provided'}`);
      this.socket = null;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      console.log('🔄 Attempting WebSocket Reconnect...');
      this.connect();
    }, 5000);
  }

  updateStatus(status: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ status }));
    } else {
      console.warn(
        'WebSocket not open. Status update queued locally via REST fallback?',
      );
    }
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
