import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export interface PresenceUser {
  userId: string;
  username: string;
  avatarUrl: string;
  status: string;
  lastSeen: string;
}

export const useGlobalPresence = (circleId: string, currentUser: any) => {
  const [onlineMembers, setOnlineMembers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!circleId || !currentUser) return;

    const channel = supabase.channel(`presence:${circleId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const members: PresenceUser[] = [];
        
        for (const id in state) {
          const presenceInfo = state[id][0] as any;
          members.push({
            userId: id,
            username: presenceInfo.username || 'User',
            avatarUrl: presenceInfo.avatarUrl || '',
            status: presenceInfo.status || 'free',
            lastSeen: new Date().toISOString(),
          });
        }
        setOnlineMembers(members);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: currentUser.id,
            username: currentUser.user_metadata?.username || currentUser.email,
            avatarUrl: currentUser.user_metadata?.avatar_url || '',
            status: 'online', // This can be updated dynamiclly
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [circleId, currentUser]);

  return onlineMembers;
};
