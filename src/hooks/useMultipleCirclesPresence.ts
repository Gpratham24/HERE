import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export const useMultipleCirclesPresence = (circleIds: string[], currentUser: any) => {
  const [presenceCounts, setPresenceCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!circleIds.length || !currentUser) return;

    const channels = circleIds.map(id => {
      const channel = supabase.channel(`presence:${id}`, {
        config: { presence: { key: currentUser.id } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setPresenceCounts(prev => ({
            ...prev,
            [id]: Object.keys(state).length,
          }));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              userId: currentUser.id,
              onlineAt: new Date().toISOString(),
            });
          }
        });

      return channel;
    });

    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, [circleIds, currentUser]);

  return presenceCounts;
};
