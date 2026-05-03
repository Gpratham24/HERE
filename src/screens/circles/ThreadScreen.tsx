import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Mic, ChevronLeft, Users, Check, CheckCheck, Settings } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { PresenceService } from '../../utils/presence';
import { useAuth } from '../../context/AuthContext';

type Message = {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  content: string;
  created_at: string;
  is_me: boolean;
  delivered_count?: number;
  read_count?: number;
  total_members?: number;
};

type TypingUser = {
  user_id: string;
  username: string;
};

type Props = {
  navigation: { goBack: () => void };
  circle: any;
  onOpenSettings?: () => void;
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateSeparator = (isoString: string) => {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
};

const ThreadScreen = ({ navigation, circle, onOpenSettings }: Props) => {
  const { Colors, isDark } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReadIdRef = useRef<string | null>(null);
  const isTypingRef = useRef(false);

  const fetchMessages = useCallback(async () => {
    if (!circle?.id) return;
    try {
      const data = await api.get(`/circles/${circle.id}/messages?limit=100`);
      if (data?.messages) {

        const processed = data.messages.map((m: any) => ({
          ...m,
          is_me: m.user_id === userData?.id
        })).reverse();
        setMessages(processed);

        // Mark last message as read if it's not from me
        const lastMsg = processed[processed.length - 1];
        if (lastMsg && !lastMsg.is_me) {
          sendReadReceipt(lastMsg.id);
        }
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [circle?.id]);

  const sendReadReceipt = (messageId: string) => {
    if (lastReadIdRef.current === messageId) return;
    lastReadIdRef.current = messageId;
    PresenceService.send('MESSAGE_READ', {
      message_id: messageId,
      circle_id: circle?.id
    });
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time WS messages from the Presence Hub
    const unsubscribe = PresenceService.subscribe((event: any) => {
      const payload = event.payload;

      if (event.circle_id && event.circle_id !== circle?.id) return;

      switch (event.type) {
        case 'RECEIVE_MESSAGE':
          const isMe = payload.user_id === userData?.id;

          setMessages(prev => {
            if (prev.find(m => m.id === payload.id)) return prev;

            const newMsg: Message = {
              id: payload.id || String(Date.now()),
              user_id: payload.user_id,
              username: payload.username || 'Unknown',
              avatar_url: payload.avatar_url || '',
              content: payload.content,
              created_at: payload.timestamp || new Date().toISOString(),
              is_me: isMe,
              delivered_count: payload.delivered_count || 0,
              read_count: payload.read_count || 0,
            };

            if (!isMe) {
              sendReadReceipt(newMsg.id);
              // Also notify server that we delivered it
              PresenceService.send('MESSAGE_DELIVERED', {
                message_id: newMsg.id,
                circle_id: circle?.id
              });
            }

            return [...prev, newMsg];
          });

          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          break;

        case 'TYPING_UPDATE':
          if (payload.user_id === userData?.id) return;

          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== payload.user_id);
            if (payload.is_typing) {
              return [...filtered, { user_id: payload.user_id, username: payload.username }];
            }
            return filtered;
          });
          break;

        case 'MESSAGE_STATUS_UPDATE':
          setMessages(prev => prev.map(m => {
            if (m.id === payload.message_id) {
              return {
                ...m,
                delivered_count: payload.delivered_count,
                read_count: payload.read_count,
                total_members: payload.total_members,
              };
            }
            return m;
          }));
          break;
      }
    });

    return () => {
      unsubscribe();
      if (isTypingRef.current) {
        PresenceService.send('TYPING_STOP', { circle_id: circle?.id });
      }
    };
  }, [fetchMessages, circle?.id, userData?.id]);

  const handleTextChange = (text: string) => {
    setMessage(text);

    if (!isTypingRef.current && text.length > 0) {
      isTypingRef.current = true;
      PresenceService.send('TYPING_START', { circle_id: circle?.id });
    } else if (isTypingRef.current && text.length === 0) {
      isTypingRef.current = false;
      PresenceService.send('TYPING_STOP', { circle_id: circle?.id });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        PresenceService.send('TYPING_STOP', { circle_id: circle?.id });
      }, 3000);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    const content = message.trim();
    setMessage('');
    setSending(true);

    // Stop typing immediately
    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    PresenceService.send('TYPING_STOP', { circle_id: circle?.id });

    // Optimistically add the message to local state
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      user_id: userData?.id || '',
      username: userData?.username || 'You',
      avatar_url: userData?.avatar_url || '',
      content,
      created_at: new Date().toISOString(),
      is_me: true,
      delivered_count: 0,
      read_count: 0,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await api.post(`/circles/${circle.id}/messages`, { content });
      if (response?.data) {
        setMessages(prev => prev.map(m => m.id === optimistic.id ? {
          ...m,
          id: response.data.id,
          created_at: response.data.created_at,
        } : m));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const renderTicks = (item: Message) => {
    if (!item.is_me) return null;

    // If it's optimistic, show nothing or a clock
    if (item.id.startsWith('opt-')) return null;

    const isRead = item.read_count && item.read_count > 0;
    const isDelivered = item.delivered_count && item.delivered_count > 0;

    if (isRead) {
      return <CheckCheck size={14} color={Colors.primary} style={styles.ticks} />;
    }
    if (isDelivered) {
      return <CheckCheck size={14} color={Colors.textMuted} style={styles.ticks} />;
    }
    return <Check size={14} color={Colors.textMuted} style={styles.ticks} />;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prev = messages[index - 1];
    const showDateSep =
      !prev || formatDateSeparator(prev.created_at) !== formatDateSeparator(item.created_at);
    const showAvatar = !prev || prev.user_id !== item.user_id;

    if (item.is_me) {
      return (
        <View key={item.id}>
          {showDateSep && (
            <View style={styles.dateSep}>
              <Text style={[styles.dateSepText, { color: Colors.textMuted }]}>
                {formatDateSeparator(item.created_at)}
              </Text>
            </View>
          )}
          <View style={styles.myMsgRow}>
            <View style={[styles.myBubble, { backgroundColor: Colors.primary }]}>
              <Text style={styles.myBubbleText}>{item.content}</Text>
              <View style={styles.msgStatusContainer}>
                <Text style={styles.myBubbleTime}>{formatTime(item.created_at)}</Text>
                {renderTicks(item)}
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key={item.id}>
        {showDateSep && (
          <View style={styles.dateSep}>
            <Text style={[styles.dateSepText, { color: Colors.textMuted }]}>
              {formatDateSeparator(item.created_at)}
            </Text>
          </View>
        )}
        <View style={styles.theirMsgRow}>
          {showAvatar ? (
            item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: Colors.primary }]}>
                <Text style={styles.avatarInitial}>
                  {item.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.avatarSpacer} />
          )}
          <View style={{ flex: 1 }}>
            {showAvatar && (
              <Text style={[styles.theirName, { color: Colors.textSecondary }]}>
                {item.is_me ? 'You' : (item.username || 'User')}
              </Text>
            )}
            <View style={[styles.theirBubble, { backgroundColor: isDark ? '#262626' : '#F1F5F9' }]}>
              <Text style={[styles.theirBubbleText, { color: Colors.text }]}>{item.content}</Text>
              <Text style={[styles.theirBubbleTime, { color: Colors.textMuted }]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={Colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors.border, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {circle?.avatar_url ? (
            <Image source={{ uri: circle.avatar_url }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback, { backgroundColor: Colors.primary }]}>
              <Text style={styles.headerAvatarInitial}>{circle?.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.headerTitle, { color: Colors.text }]}>
              {circle?.name || 'Circle Chat'}
            </Text>
            <View style={styles.memberRow}>
              <Users size={11} color={Colors.textMuted} style={{ marginRight: 3 }} />
              <Text style={[styles.headerSub, { color: Colors.textMuted }]}>
                {circle?.member_count || 0} members
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onOpenSettings} style={styles.settingsBtn}>
          <Settings size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Send size={40} color={Colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: Colors.text }]}>Start the conversation</Text>
          <Text style={[styles.emptySubtitle, { color: Colors.textMuted }]}>
            Be the first to say something in {circle?.name || 'this circle'}!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={() => (
            <>
              {typingUsers.length > 0 && (
                <View style={styles.typingIndicatorContainer}>
                  <View style={[styles.theirBubble, styles.typingBubble, { backgroundColor: isDark ? '#262626' : '#F1F5F9' }]}>
                    <View style={styles.typingDots}>
                      <View style={[styles.dot, { backgroundColor: Colors.textMuted }]} />
                      <View style={[styles.dot, { backgroundColor: Colors.textMuted, opacity: 0.6 }]} />
                      <View style={[styles.dot, { backgroundColor: Colors.textMuted, opacity: 0.3 }]} />
                    </View>
                    <Text style={[styles.typingText, { color: Colors.textMuted }]}>
                      {typingUsers.length === 1
                        ? `${typingUsers[0].username} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={[styles.inputArea, { backgroundColor: Colors.surface, borderTopColor: Colors.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            style={[styles.input, { color: Colors.text, backgroundColor: isDark ? '#262626' : '#F1F5F9' }]}
            placeholder="Message..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />
          {message.trim().length > 0 ? (
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: Colors.primary, opacity: sending ? 0.6 : 1 }]}
              onPress={sendMessage}
              disabled={sending}
            >
              <Send size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.micBtn, { backgroundColor: isDark ? '#262626' : '#F1F5F9' }]}>
              <Mic size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 8 },
  settingsBtn: { padding: 8 },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  headerAvatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarInitial: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  headerSub: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  dateSep: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateSepText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  // Their messages (left side)
  theirMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
    maxWidth: '85%',
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  avatarSpacer: { width: 30 },
  theirName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  theirBubble: {
    borderRadius: 20,
    borderTopLeftRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  theirBubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  theirBubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  // My messages (right side)
  myMsgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  myBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    borderTopRightRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  myBubbleText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  msgStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myBubbleTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginRight: 4,
  },
  ticks: {
    marginLeft: 2,
  },
  // Typing Indicator
  typingIndicatorContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Input
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default ThreadScreen;
