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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Mic, ChevronLeft, Users } from 'lucide-react-native';
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
};

type Props = {
  navigation: { goBack: () => void };
  circle: any;
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

const ThreadScreen = ({ navigation, circle }: Props) => {
  const { Colors } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async () => {
    if (!circle?.id) return;
    try {
      const data = await api.get(`/circles/${circle.id}/messages?limit=100`);
      if (data?.messages) {
        // Reverse so oldest messages are first
        const sorted = [...data.messages].reverse();
        setMessages(sorted);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [circle?.id]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time WS messages from the Presence Hub
    const unsubscribe = PresenceService.subscribe((event: any) => {
      if (event.type === 'RECEIVE_MESSAGE') {
        const payload = event.payload;
        // Only append if it belongs to this circle and is not from our own send
        if (payload?.circle_id === circle?.id) {
          const isMe = payload.user_id === userData?.id;
          const newMsg: Message = {
            id: payload.id || String(Date.now()),
            user_id: payload.user_id,
            username: payload.username || 'Unknown',
            avatar_url: payload.avatar_url || '',
            content: payload.content,
            created_at: payload.timestamp || new Date().toISOString(),
            is_me: isMe,
          };
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      }
    });

    return () => unsubscribe();
  }, [fetchMessages, circle?.id, userData?.id]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    const content = message.trim();
    setMessage('');
    setSending(true);

    // Optimistically add the message to local state
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      user_id: userData?.id || '',
      username: userData?.username || 'You',
      avatar_url: userData?.avatar_url || '',
      content,
      created_at: new Date().toISOString(),
      is_me: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await api.post(`/circles/${circle.id}/messages`, { content });
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prev = messages[index - 1];
    const showDateSep =
      !prev || formatDateSeparator(prev.created_at) !== formatDateSeparator(item.created_at);
    const showAvatar = !prev || prev.user_id !== item.user_id;

    if (item.is_me) {
      return (
        <>
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
              <Text style={styles.myBubbleTime}>{formatTime(item.created_at)}</Text>
            </View>
          </View>
        </>
      );
    }

    return (
      <>
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
                {item.username}
              </Text>
            )}
            <View style={[styles.theirBubble, { backgroundColor: Colors.surface }]}>
              <Text style={[styles.theirBubbleText, { color: Colors.text }]}>{item.content}</Text>
              <Text style={[styles.theirBubbleTime, { color: Colors.textMuted }]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header — paddingTop accounts for status bar on Android */}
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
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={[styles.emptyTitle, { color: Colors.text }]}>No messages yet</Text>
          <Text style={[styles.emptySubtitle, { color: Colors.textMuted }]}>
            Be the first to say something in {circle?.name}!
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
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={[styles.inputArea, { backgroundColor: Colors.surface, borderTopColor: Colors.border }]}>
          <TextInput
            style={[styles.input, { color: Colors.text, backgroundColor: Colors.background }]}
            placeholder="Message..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
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
            <TouchableOpacity style={[styles.micBtn, { backgroundColor: Colors.background }]}>
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
    borderRadius: 10,
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
    fontSize: 16,
    fontWeight: '700',
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
    gap: 8,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dateSep: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSepText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  // Their messages (left side)
  theirMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    maxWidth: '80%',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  avatarSpacer: { width: 32 },
  theirName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 2,
  },
  theirBubble: {
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  theirBubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  theirBubbleTime: {
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  // My messages (right side)
  myMsgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  myBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  myBubbleText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 21,
  },
  myBubbleTime: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  // Input
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});

export default ThreadScreen;
