import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getHomeData,
  logCheckIn,
  updatePresence,
  addReaction,
  getCircles,
} from '../services/api';
import { supabase } from '../utils/supabase';

export type UserStatus =
  | 'studying'
  | 'gym'
  | 'coding'
  | 'free'
  | 'resting'
  | 'focus'
  | 'offline';

export interface Member {
  id: string;
  username: string;
  avatar_url?: string;
  live_status: UserStatus;
  last_seen_at?: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  circle_id: string;
  type: 'done' | 'missed' | 'focus' | 'resting';
  note?: string;
  created_at: string;
}

export interface Reaction {
  id: number;
  user_id: string;
  post_id: string;
  emoji: string;
}

export interface Post {
  id: string;
  user_id: string;
  circle_id: string;
  content_url: string;
  caption?: string;
  type: string;
  created_at: string;
  reactions: Reaction[];
}

interface CircleState {
  hasCircle: boolean;
  circle: any | null;
  members: Member[];
  myPresence: UserStatus;
  todayCheckIn: CheckIn | null;
  posts: Post[];
  stats: { streak: number };
  allCircles: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHomeData: (circleId?: string) => Promise<void>;
  fetchAllCircles: () => Promise<void>;
  switchCircle: (circleId: string) => Promise<void>;
  setPresence: (status: UserStatus) => Promise<void>;
  submitCheckIn: (type: CheckIn['type'], note?: string) => Promise<void>;
  reactToPost: (postId: string, emoji: string) => Promise<void>;
  updateMemberPresence: (userId: string, status: UserStatus) => void;
}

export const useCircleStore = create<CircleState>()(
  persist(
    (set, get) => ({
      hasCircle: false,
      circle: null,
      members: [],
      myPresence: 'free',
      todayCheckIn: null,
      posts: [],
      stats: { streak: 0 },
      allCircles: [],
      isLoading: false,
      error: null,

      fetchHomeData: async (circleId?: string) => {
        const isInitialFetch = get().members.length === 0;
        if (isInitialFetch) set({ isLoading: true });

        try {
          const data = await getHomeData(circleId); // Note: updated api.ts might be needed for optional ID
          if (data.has_circle || circleId) {
            set({
              hasCircle: true,
              circle: data.circle,
              myPresence: (data.my_presence as UserStatus) || 'free',
              members: data.members || [],
              todayCheckIn: data.today_checkin,
              posts: data.recent_posts || [],
              stats: data.stats || { streak: 0 },
            });
          } else {
            set({ hasCircle: false });
          }
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAllCircles: async () => {
        try {
          const circles = await getCircles();
          set({ allCircles: circles || [] });
        } catch (err) {
          console.error('Fetch All Circles Error:', err);
        }
      },

      switchCircle: async (circleId: string) => {
        set({ isLoading: true });
        await get().fetchHomeData(circleId);
        set({ isLoading: false });
      },

      setPresence: async (status: UserStatus) => {
        try {
          await updatePresence(status);
          set({ myPresence: status });
          const { data } = await supabase.auth.getUser();
          if (data.user?.id) {
            get().updateMemberPresence(data.user.id, status);
          }
        } catch (err: any) {
          console.error('Update Presence Error:', err);
        }
      },

      submitCheckIn: async (type: CheckIn['type'], note?: string) => {
        const { circle } = get();
        if (!circle) return;

        try {
          const resp = await logCheckIn(circle.id, type, note);
          set({ todayCheckIn: resp.checkin, stats: { streak: resp.streak } });
        } catch (err: any) {
          console.error('Log CheckIn Error:', err);
        }
      },

      reactToPost: async (postId: string, emoji: string) => {
        try {
          await addReaction(postId, emoji);
        } catch (err: any) {
          console.error('Reaction Error:', err);
        }
      },

      updateMemberPresence: (userId: string, status: UserStatus) => {
        const { members } = get();
        const updatedMembers = members.map(m =>
          m.id === userId ? { ...m, live_status: status } : m,
        );
        set({ members: updatedMembers });
      },
    }),
    {
      name: 'circle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        hasCircle: state.hasCircle,
        circle: state.circle,
        members: state.members,
        myPresence: state.myPresence,
        todayCheckIn: state.todayCheckIn,
        posts: state.posts,
        stats: state.stats,
        allCircles: state.allCircles,
      }),
    },
  ),
);
