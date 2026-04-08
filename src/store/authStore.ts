import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { setSessionToken, getUserProfile } from '../services/api';

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
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      isLoading: true,
      isLoadingUserData: true,

      setUser: user => set({ user }),
      setUserData: userData => set({ userData }),
      setLoading: isLoading => set({ isLoading }),
      setLoadingUserData: isLoadingUserData => set({ isLoadingUserData }),

      initialize: async () => {
        if (!supabase) {
          set({ isLoading: false });
          return;
        }

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            setSessionToken(session.access_token);
            set({ user: session.user });
          }

          // Fetch fresh profile in background even if we have it in storage
          if (session?.user) {
            try {
              const profileData = await getUserProfile();
              set({ userData: profileData });
            } catch (err) {
              console.warn(
                '⚠️ BG Profile Sync failed. Using cached data if available.',
              );
              // If no profile data exists at all (not even in cache), logout as before
              if (!get().userData) {
                await supabase.auth.signOut();
                set({ user: null, userData: null });
              }
            } finally {
              set({ isLoadingUserData: false, isLoading: false });
            }
          } else {
            set({
              user: null,
              userData: null,
              isLoadingUserData: false,
              isLoading: false,
            });
          }
        } catch (err: any) {
          set({
            user: null,
            userData: null,
            isLoadingUserData: false,
            isLoading: false,
          });
        }

        // Listen for changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          const newUser = session?.user ?? null;
          set({ user: newUser });
          setSessionToken(session?.access_token ?? null);

          if (newUser) {
            try {
              const profileData = await getUserProfile();
              set({ userData: profileData });
            } catch (err) {
              set({ userData: null });
            }
          } else {
            set({ userData: null });
          }
        });
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoadingUserData: true });
        try {
          const profileData = await getUserProfile();
          set({ userData: profileData });
        } finally {
          set({ isLoadingUserData: false });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, userData: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist loading states
      partialize: state => ({
        user: state.user,
        userData: state.userData,
      }),
    },
  ),
);
