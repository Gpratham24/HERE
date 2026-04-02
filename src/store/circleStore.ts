import { create } from 'zustand';
import { supabase } from '../utils/supabase';

interface Circle {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  member_count?: number;
  last_activity_at?: string;
}

interface CircleState {
  circles: Circle[];
  activeCircle: Circle | null;
  isLoading: boolean;
  error: string | null;

  setCircles: (circles: Circle[]) => void;
  setActiveCircle: (circle: Circle | null) => void;
  setLoading: (loading: boolean) => void;

  fetchUserCircles: (userId: string) => Promise<void>;
}

export const useCircleStore = create<CircleState>((set) => ({
  circles: [],
  activeCircle: null,
  isLoading: false,
  error: null,

  setCircles: (circles) => set({ circles }),
  setActiveCircle: (activeCircle) => set({ activeCircle }),
  setLoading: (isLoading) => set({ isLoading }),

  // Reads go direct to Supabase — fastest path, no extra hop
  fetchUserCircles: async (userId) => {
    set({ isLoading: true, error: null });

    // 1. Get circle memberships for this user
    const { data: memberData, error: memberError } = await supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', userId);

    if (memberError || !memberData?.length) {
      set({ circles: [], isLoading: false });
      return;
    }

    const circleIds = memberData.map((m: any) => m.circle_id);

    // 2. Fetch full circle details with member count
    const { data: circlesData, error: circlesError } = await supabase
      .from('circles')
      .select(`
        id,
        name,
        description,
        avatar_url,
        last_activity_at,
        circle_members(count)
      `)
      .in('id', circleIds)
      .order('last_activity_at', { ascending: false });

    if (circlesError) {
      set({ error: circlesError.message, isLoading: false });
      return;
    }

    // Normalize member_count from the nested count query
    const normalized = (circlesData || []).map((c: any) => ({
      ...c,
      member_count: c.circle_members?.[0]?.count ?? 0,
    }));

    set({ circles: normalized, isLoading: false });
  },
}));
