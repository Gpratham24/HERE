import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCircleData,
  getCirclePosts,
  logCheckIn,
  updatePresence,
  addReaction,
  deletePost as deletePostApi,
  getCircles,
  getPendingMembers,
  approveJoinRequest,
  rejectJoinRequest,
  getNotifications,
  getMarketplaceProducts,
  getPublicCircles,
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
  unreadCounts: Record<string, number>;
  hasPromptedPresence: boolean;
  pendingMembers: any[];
  notifications: any[];
  isPremium: boolean;
  products: any[];
  publicCircles: any[];

  // Actions
  fetchHomeData: (circleId?: string, skipCache?: boolean) => Promise<void>;
  fetchCirclePosts: (circleId: string) => Promise<void>;
  fetchAllCircles: () => Promise<void>;
  fetchPublicCircles: (location?: string) => Promise<void>;
  fetchUnreadCounts: () => Promise<void>;
  markCircleAsRead: (circleId: string) => void;
  switchCircle: (circleId: string) => Promise<void>;
  setPresence: (status: UserStatus) => Promise<void>;
  setHasPromptedPresence: (val: boolean) => void;
  submitCheckIn: (type: CheckIn['type'], note?: string) => Promise<void>;
  reactToPost: (postId: string, emoji: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  updateMemberPresence: (userId: string, status: UserStatus) => void;
  fetchPendingMembers: (circleId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  approveMember: (circleId: string, userId: string) => Promise<void>;
  rejectMember: (circleId: string, userId: string) => Promise<void>;
  fetchProducts: (circleId?: string) => Promise<void>;
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
      unreadCounts: {},
      isLoading: false,
      error: null,
      hasPromptedPresence: false,
      pendingMembers: [],
      notifications: [],
      isPremium: false,
      products: [],
      publicCircles: [],

      fetchHomeData: async (circleId?: string, skipCache: boolean = false) => {
        const { members, posts, circle } = get();
        const hasData = members.length > 0 && circle;
        
        // If we have data and it's not a skipCache request, don't show loading spinner
        // This makes navigation feel "instant"
        if (!hasData || skipCache) {
          set({ isLoading: true });
        }

        try {
          // If we have data and no circleId is specified, we might not even need the network call
          // but for now we fetch it in background (stale-while-revalidate style)
          const data = await getCircleData(circleId, skipCache);
          if (data.has_circle || circleId) {
            console.log(`[STORE] ✅ Loaded Circle: ${data.circle?.name}`);
            set({
              hasCircle: true,
              circle: data.circle,
              myPresence: (data.my_presence as UserStatus) || 'free',
              members: data.members || [],
              todayCheckIn: data.today_checkin,
              posts: data.recent_posts || [],
              stats: data.stats || { streak: 0 },
              isLoading: false
            });
            // Fetch circles in background without blocking, bypassing cache to see new circles
            get().fetchAllCircles(true);
          } else {
            set({ hasCircle: false, isLoading: false });
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      fetchUnreadCounts: async () => {
        /* Commented out for now to bypass recursion error
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        try {
          const { data: unreadData, error } = await supabase
            .from('messages')
            .select('id, circle_id')
            .neq('user_id', userId);

          if (error) throw error;

          const { data: seenData } = await supabase
            .from('message_status')
            .select('message_id')
            .eq('user_id', userId);

          const seenIds = new Set((seenData || []).map(s => s.message_id));
          const counts: Record<string, number> = {};

          (unreadData || []).forEach(msg => {
            if (!seenIds.has(msg.id)) {
              counts[msg.circle_id] = (counts[msg.circle_id] || 0) + 1;
            }
          });

          set({ unreadCounts: counts });
        } catch (err) {
          console.error('Fetch Unread Counts Error:', err);
        }
        */
      },

      markCircleAsRead: (circleId: string) => {
        const { unreadCounts } = get();
        if (unreadCounts[circleId]) {
          const updated = { ...unreadCounts };
          delete updated[circleId];
          set({ unreadCounts: updated });
        }
      },

      fetchCirclePosts: async (circleId: string) => {
        try {
          const posts = await getCirclePosts(circleId);
          set({ posts: posts || [] });
        } catch (err: any) {
          console.error('Fetch Circle Posts Error:', err.message);
        }
      },

      fetchAllCircles: async (skipCache: boolean = false) => {
        try {
          const circles = await getCircles(skipCache);
          set({ allCircles: circles || [] });
        } catch (err) {
          console.error('Fetch All Circles Error:', err);
        }
      },

      fetchPublicCircles: async (location: string = '') => {
        try {
          const circles = await getPublicCircles(location);
          set({ publicCircles: circles || [] });
        } catch (err) {
          console.error('Fetch Public Circles Error:', err);
        }
      },

      switchCircle: async (circleId: string) => {
        console.log(`[STORE] 🔄 Switching to Circle: ${circleId}`);

        set({
          isLoading: true,
          posts: [],
          members: [],
          todayCheckIn: null
        });
        await get().fetchHomeData(circleId, true); // true = skipCache
        
        // If current user is the admin (check vs circle.created_by or user metadata)
        // For MVP, we try to fetch pending members; if it fails (403), we ignore it.
        const { circle } = get();
        if (circle) {
           await get().fetchPendingMembers(circle.id);
        }
        
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

      setHasPromptedPresence: (val: boolean) => {
        set({ hasPromptedPresence: val });
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

      deletePost: async (postId: string) => {
        const { circle, posts } = get();
        if (!circle) return;

        try {
          await deletePostApi(postId, circle.id);
          // Locally update posts to avoid waiting for refresh
          set({ posts: posts.filter(p => p.id !== postId) });
        } catch (err: any) {
          console.error('Delete Post Error:', err);
          throw err;
        }
      },

      fetchPendingMembers: async (circleId: string) => {
        try {
          const members = await getPendingMembers(circleId);
          set({ pendingMembers: members || [] });
        } catch (err) {
          // Likely not an admin, ignore 403s
          set({ pendingMembers: [] });
        }
      },

      fetchNotifications: async () => {
        try {
          const data = await getNotifications();
          set({ notifications: data || [] });
        } catch (err) {
          console.error('Fetch Notifications Error:', err);
        }
      },

      approveMember: async (circleId: string, userId: string) => {
        try {
          await approveJoinRequest(circleId, userId);
          set(state => ({
            pendingMembers: state.pendingMembers.filter(m => m.id !== userId)
          }));
          await get().fetchHomeData(circleId, true);
        } catch (err) {
          console.error('Approve Member Error:', err);
        }
      },

      rejectMember: async (circleId: string, userId: string) => {
        try {
          await rejectJoinRequest(circleId, userId);
          set(state => ({
            pendingMembers: state.pendingMembers.filter(m => m.id !== userId)
          }));
        } catch (err) {
          console.error('Reject Member Error:', err);
        }
      },

      fetchProducts: async (circleId?: string) => {
        try {
          const data = await getMarketplaceProducts(circleId);
          set({ products: data || [] });
        } catch (err) {
          console.error('Fetch Products Error:', err);
          set({ products: [] });
        }
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
        publicCircles: state.publicCircles,
      }),
    },
  ),
);
