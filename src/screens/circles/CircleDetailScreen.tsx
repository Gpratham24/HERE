import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { useGlobalPresence } from '../../hooks/useGlobalPresence';
import * as api from '../../services/api';
import { Send, Plus } from 'lucide-react-native';
import { Colors, Shadows } from '../../theme/Theme';
import { AppHeader } from '../../components/AppHeader';

interface Message {
  id: string;
  user_id: string;
  type: string;
  note: string;
  created_at: string;
  users: {
    username: string;
    avatar_url: string;
    id: string;
  } | null;
}

const CircleDetailScreen = ({ route, navigation }: any) => {
  const { circleId, circleName } = route?.params || {};
  const { user } = useAuth();
  const onlineMembers = useGlobalPresence(circleId, user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('check_ins')
      .select(
        'id, user_id, type, note, created_at, users(id, username, avatar_url)',
      )
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(50);

    setMessages((data as any) || []);
    setIsLoading(false);
  }, [circleId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useRealtime(circleId, payload => {
    if (payload.eventType === 'INSERT') {
      fetchMessages();
    }
  });

  const handleSendMessage = async () => {
    if (!user || submitting || !inputText.trim()) return;
    setSubmitting(true);
    try {
      await api.logCheckIn(circleId, 'Focus', inputText.trim());
      setInputText('');
    } catch (err: any) {
      Alert.alert('Failed to send', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.user_id === user?.id;
    const isStatus = item.type !== 'Focus' && !item.note;

    if (isStatus) {
      return (
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {item.users?.username} just checked in
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
        ]}
      >
        {!isMe && (
          <Image
            source={{
              uri:
                item.users?.avatar_url ||
                `https://ui-avatars.com/api/?name=${item.users?.username}&background=6366F1&color=fff`,
            }}
            style={styles.avatar}
          />
        )}
        <View style={styles.bubbleCol}>
          {!isMe && (
            <View style={styles.senderHeader}>
              <Text style={styles.senderName}>{item.users?.username}</Text>
              {item.users?.username.toLowerCase().includes('admin') && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>CIRCLE LEAD</Text>
                </View>
              )}
            </View>
          )}
          <View
            style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
          >
            <Text
              style={[
                styles.messageText,
                isMe ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {item.note}
            </Text>
          </View>
          <Text
            style={[
              styles.timeText,
              isMe && { textAlign: 'right', marginRight: 4 },
            ]}
          >
            {isMe
              ? 'Delivered'
              : new Date(item.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AppHeader
        title={circleName}
        showBackButton={true}
        onBack={() => navigation.goBack()}
        showSettings={true}
        onSettingsPress={() => {}}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        inverted
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={{ height: 20 }} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.plusBtn}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Share a thought..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
              onPress={handleSendMessage}
              disabled={submitting || !inputText.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Send size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  messageWrapper: { flexDirection: 'row', marginBottom: 24, maxWidth: '85%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginTop: 4 },
  bubbleCol: { marginLeft: 12, marginRight: 12, flexShrink: 1 },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  roleBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  roleText: {
    color: '#B91C1C',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bubble: { borderRadius: 20, padding: 16, ...Shadows.soft },
  myBubble: { backgroundColor: '#4F46E5', borderTopRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  myMessageText: { color: '#FFFFFF' },
  theirMessageText: { color: '#1E293B' },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  statusRow: { alignItems: 'center', marginVertical: 20 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
    marginRight: 8,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: '#9F1239' },
  inputWrapper: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1E293B',
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
});

export default CircleDetailScreen;
