import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export interface Message {
  id: string;
  circle_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string;
  };
}

export interface TypingUser {
  user_id: string;
  username: string;
}

export const useChat = (circleId: string) => {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<any>(null);

  // ─── Fetch Messages ───
  const fetchMessages = useCallback(async () => {
    if (!circleId) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*, user:users(username, avatar_url)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Chat] Fetch Error:', error);
      setError(error);
    } else if (data) {
      setMessages(data as any);
      setError(null);
    }
    setIsLoading(false);
  }, [circleId]);

  // ─── User Cache ───
  const userCache = useRef<Record<string, { username: string; avatar_url: string }>>({});

  // ─── Real-time Subscriptions ───
  useEffect(() => {
    if (!circleId) return;

    fetchMessages();

    // Subscribe to new messages
    const messageChannel = supabase
      .channel(`chat:${circleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `circle_id=eq.${circleId}`,
        },
        async (payload) => {
          const userId = payload.new.user_id;

          // Helper to add message after fetching/getting user details
          const addMessageWithUser = (userData: any) => {
            const newMessage = {
              ...payload.new,
              user: userData,
            } as Message;

            setMessages((current) => {
              if (current.some(m => m.id === payload.new.id)) return current;
              return [newMessage, ...current];
            });
          };

          // Check Cache First
          if (userCache.current[userId]) {
            addMessageWithUser(userCache.current[userId]);
          } else {
            // Fetch once and store in cache
            const { data: userData } = await supabase
              .from('users')
              .select('username, avatar_url')
              .eq('id', userId)
              .single();

            if (userData) {
              userCache.current[userId] = userData as any;
              addMessageWithUser(userData);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to typing status
    const typingChannel = supabase
      .channel(`typing:${circleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `circle_id=eq.${circleId}`,
        },
        async (payload) => {
          // Refresh list of typing users
          const { data } = await supabase
            .from('typing_status')
            .select('user_id, users(username)')
            .eq('circle_id', circleId)
            .eq('is_typing', true)
            // Only show if updated recently (e.g. last 10 seconds)
            .gt('updated_at', new Date(Date.now() - 10000).toISOString());

          const typing = (data || [])
            .filter((t: any) => t.user_id !== user?.id)
            .map((t: any) => ({
              user_id: t.user_id,
              username: t.users?.username || 'Someone',
            }));
            
          setTypingUsers(typing);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [circleId, fetchMessages, user?.id]);

  // ─── Send Message ───
  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    const tempId = Math.random().toString(36).substring(7);
    const optimisticMessage: Message = {
      id: tempId,
      circle_id: circleId,
      user_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      user: {
        username: userData?.username || 'Me',
        avatar_url: userData?.avatar_url || '',
      },
    };

    // 1. Update state immediately (Optimistic UI)
    setMessages((prev) => [optimisticMessage, ...prev]);

    // 2. Insert into database
    const { data: serverMessage, error } = await supabase
      .from('messages')
      .insert({
        circle_id: circleId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat] Send Error:', error);
      // Remove the failed optimistic message
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      throw error;
    }

    // 3. Update the optimistic message with the real server message (important for ID consistency)
    if (serverMessage) {
      setMessages((prev) => 
        prev.map(m => m.id === tempId ? { ...m, ...serverMessage } : m)
      );
    }
    
    // Immediately stop typing status when message is sent
    setTypingStatus(false);
  };

  // ─── Typing Status ───
  const setTypingStatus = async (isTyping: boolean) => {
    if (!user || !circleId) return;

    const { error } = await supabase.from('typing_status').upsert({
      circle_id: circleId,
      user_id: user.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'circle_id,user_id' });

    if (error) console.warn('[Chat] Typing Error:', error);
  };

  const handleTyping = () => {
    setTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
    }, 3000);
  };

  return {
    messages,
    isLoading,
    error,
    typingUsers,
    sendMessage,
    handleTyping,
    refresh: fetchMessages,
    markAsSeen: async (messageIds: string[]) => {
      if (!user || messageIds.length === 0) return;
      
      const { error } = await supabase
        .from('message_status')
        .upsert(
          messageIds.map(id => ({
            message_id: id,
            user_id: user.id,
            seen: true,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'message_id,user_id' }
        );
      if (error) console.warn('Failed to mark as seen:', error);
    }
  };
};
