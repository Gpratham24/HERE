import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useRealtime = (circleId: string, onUpdate: (payload: any) => void) => {
  useEffect(() => {
    if (!circleId) return;

    const channel = supabase
      .channel(`circle:${circleId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'check_ins', 
          filter: `circle_id=eq.${circleId}` 
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          // Note: Presence might be better handled via Supabase Presence API,
          // but for simple status updates, table changes work too.
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId, onUpdate]);
};
