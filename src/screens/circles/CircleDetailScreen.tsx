import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../utils/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { useGlobalPresence } from '../../hooks/useGlobalPresence';
import { CheckinButton } from '../../components/CheckinButton';
import * as api from '../../services/api';
import { ChevronLeft, Send, History, Info } from 'lucide-react-native';
import { Colors, Shadows, Sizes } from '../../theme/Theme';

interface Post {
  id: string;
  type: string;
  note: string;
  created_at: string;
  users: { username: string; avatar_url: string } | null;
}

const CircleDetailScreen = ({ route, navigation }: any) => {
  const { circleId, circleName } = route.params;
  const { user } = useAuthStore();
  const onlineMembers = useGlobalPresence(circleId, user);

  const [posts, setPosts] = useState<Post[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch activity feed directly from Supabase (reads are direct) ──
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('check_ins')
      .select('id, type, note, created_at, users(username, avatar_url)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(50);

    setPosts((data as any) || []);
    setIsLoading(false);
  }, [circleId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Real-time subscription refreshes the feed on new check-ins ──
  useRealtime(circleId, (payload) => {
    if (payload.eventType === 'INSERT') {
      fetchPosts();
    }
  });

  // ── Submit via Go Backend (handles business logic) ──
  const handleSendCheckin = async (type: 'Done' | 'Missed' | 'Focus' | 'Rest') => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      await api.submitCheckin(circleId, type, inputText);
      setInputText('');
      // Realtime subscription will trigger fetchPosts automatically
    } catch (err: any) {
      Alert.alert('Check-in Failed', err.message || 'Could not submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const typeColor: Record<string, string> = {
    Done: '#22C55E',
    Missed: '#EF4444',
    Focus: '#F59E0B',
    Rest: '#6366F1',
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.users?.avatar_url || `https://ui-avatars.com/api/?name=${item.users?.username || 'U'}&background=8B5CF6&color=fff` }}
          style={styles.postAvatar}
        />
        <View style={styles.postInfo}>
          <Text style={styles.postUser}>@{item.users?.username || 'user'}</Text>
          <Text style={styles.postTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: (typeColor[item.type] || '#8B5CF6') + '20' }]}>
          <Text style={[styles.typeText, { color: typeColor[item.type] || '#8B5CF6' }]}>
            {item.type}
          </Text>
        </View>
      </View>
      {!!item.note && <Text style={styles.postNote}>{item.note}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.titleCol}>
           <Text style={styles.title}>{circleName || 'Circle'}</Text>
           <Text style={styles.onlineCount}>{onlineMembers.length} active now</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CircleMemory', { circleId, circleName })}
          style={styles.headerIcon}
        >
          <History size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Live Now row */}
      {onlineMembers.length > 0 && (
        <View style={styles.liveContainer}>
          <Text style={styles.liveLabel}>LIVE NOW · {onlineMembers.length}</Text>
          <FlatList
            horizontal
            data={onlineMembers}
            keyExtractor={(m) => m.userId}
            renderItem={({ item }) => (
              <View style={styles.liveAvatarWrap}>
                <Image
                  source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.username}&background=8B5CF6&color=fff` }}
                  style={styles.liveAvatar}
                />
                <View style={styles.presenceDot} />
              </View>
            )}
            contentContainerStyle={{ paddingLeft: 20 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Activity Feed */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#8B5CF6" />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            inverted
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No check-ins yet.{'\n'}Be the first! 👇</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Check-in Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={styles.inputArea}>
          <View style={styles.checkinRow}>
            <CheckinButton type="Done" onPress={() => handleSendCheckin('Done')} />
            <CheckinButton type="Missed" onPress={() => handleSendCheckin('Missed')} />
            <CheckinButton type="Focus" onPress={() => handleSendCheckin('Focus')} />
            <CheckinButton type="Rest" onPress={() => handleSendCheckin('Rest')} />
          </View>
          <View style={styles.textInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a context note..."
              value={inputText}
              onChangeText={setInputText}
              placeholderTextColor="#94A3B8"
              editable={!submitting}
            />
            <TouchableOpacity
              style={[styles.sendBtn, submitting && { opacity: 0.5 }]}
              onPress={() => handleSendCheckin('Focus')}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: { padding: 8 },
  titleCol: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text },
  onlineCount: { fontSize: 11, color: '#22C55E', fontWeight: '700', marginTop: 2 },
  liveContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 10,
  },
  liveAvatarWrap: { marginRight: 12, position: 'relative' },
  liveAvatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: Colors.lavender },
  presenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  listContent: { padding: 20 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: Colors.textTertiary, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: Colors.lavender },
  postInfo: { flex: 1, marginLeft: 12 },
  postUser: { fontSize: 14, fontWeight: '800', color: Colors.text },
  postTime: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', marginTop: 2 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeText: { fontSize: 11, fontWeight: '800' },
  postNote: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontWeight: '500' },
  inputArea: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 16,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...Shadows.premium,
  },
  checkinRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lavender,
    borderRadius: 20,
    paddingRight: 6,
  },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.text, fontWeight: '500' },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
});

export default CircleDetailScreen;
