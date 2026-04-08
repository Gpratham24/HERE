import { create } from 'zustand';
import { apiPost } from '../services/api';

export type UserStatus =
  | 'free'
  | 'busy'
  | 'coding'
  | 'gym'
  | 'away'
  | 'offline';

interface PresenceState {
  currentStatus: UserStatus;
  statusText: string;
  isLoading: boolean;

  setStatus: (
    userId: string,
    status: UserStatus,
    text?: string,
  ) => Promise<void>;
  syncPresence: (userId: string, isActive: boolean) => Promise<void>;
}

export const usePresenceStore = create<PresenceState>(set => ({
  currentStatus: 'free',
  statusText: '',
  isLoading: false,

  setStatus: async (userId, status, text = '') => {
    set({ isLoading: true });

    try {
      // Use your backend Proxy instead of direct Supabase!
      await apiPost('/api/v1/presence', {
        status: status,
        status_text: text,
      });
      set({ currentStatus: status, statusText: text });
    } catch (err: any) {
      console.warn('Backend Presence Update Failed:', err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  syncPresence: async (userId, isActive) => {
    const status = isActive ? 'free' : 'offline';
    try {
      await apiPost('/api/v1/presence', {
        status: status,
      });
      if (isActive) {
        set({ currentStatus: 'free' });
      }
    } catch (err: any) {
      // Silent fail for background sync
    }
  },
}));
