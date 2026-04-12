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

    // Remove existing channel with the same name to avoid "after subscribe" errors
    const channelName = `presence-${circleId}`;
    supabase.removeChannel(supabase.channel(channelName));

    const channel = supabase.channel(channelName, {
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
          if (presenceInfo) {
            members.push({
              userId: id,
              username: presenceInfo.username || 'User',
              avatarUrl: presenceInfo.avatarUrl || '',
              status: presenceInfo.status || 'free',
              lastSeen: new Date().toISOString(),
            });
          }
        }
        setOnlineMembers(members);
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Update persistent status table
          await supabase.from('user_status').upsert({
            user_id: currentUser.id,
            is_online: true,
            last_seen: new Date().toISOString(),
          });

          await channel.track({
            userId: currentUser.id,
            username: currentUser.user_metadata?.username || currentUser.email,
            avatarUrl: currentUser.user_metadata?.avatar_url || '',
            status: 'online',
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId, currentUser.id]); // Narrowly track only the user ID to prevent re-runs

  return onlineMembers;
};
