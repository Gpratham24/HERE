import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export type UserStatus = 'free' | 'busy' | 'coding' | 'gym' | 'away' | 'offline';

interface PresenceState {
  currentStatus: UserStatus;
  statusText: string;
  isLoading: boolean;
  
  setStatus: (userId: string, status: UserStatus, text?: string) => Promise<void>;
  syncPresence: (userId: string, isActive: boolean) => Promise<void>;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  currentStatus: 'free',
  statusText: '',
  isLoading: false,

  setStatus: async (userId, status, text = '') => {
    set({ isLoading: true });
    
    const { error } = await supabase
      .from('users')
      .update({ 
        live_status: status,
        status_text: text,
        last_seen_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (!error) {
      set({ currentStatus: status, statusText: text });
    }
    set({ isLoading: false });
  },

  syncPresence: async (userId, isActive) => {
    const status = isActive ? 'free' : 'offline';
    await supabase
      .from('users')
      .update({ 
        live_status: status,
        last_seen_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (isActive) {
       set({ currentStatus: 'free' });
    }
  },
}));
