import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  userData: any | null;
  isLoading: boolean;
  isLoadingUserData: boolean;
  
  setUser: (user: User | null) => void;
  setUserData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setLoadingUserData: (loading: boolean) => void;
  
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userData: null,
  isLoading: true,
  isLoadingUserData: true,

  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingUserData: (isLoadingUserData) => set({ isLoadingUserData }),

  initialize: async () => {
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    set({ user, isLoading: false });

    if (user) {
      get().setLoadingUserData(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      set({ userData: data, isLoadingUserData: false });
    } else {
      set({ isLoadingUserData: false });
    }

    // Listen to changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      set({ user: newUser });
      
      if (newUser) {
        set({ isLoadingUserData: true });
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', newUser.id)
          .single();
        set({ userData: data, isLoadingUserData: false });
      } else {
        set({ userData: null, isLoadingUserData: false });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, userData: null });
  }
}));
