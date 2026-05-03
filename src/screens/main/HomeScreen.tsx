import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { api } from '../../utils/api';
import { PresenceService } from '../../utils/presence';
import { PresenceModal } from '../../components/PresenceModal';

const THEME = {
  purple: '#7F77DD',
  text: '#1A1B2E',
  textMuted: '#64748B',
  border: '#E2E8F0',
  offWhite: '#F8FAFC',
};

const DEFAULT_CIRCLE_IMAGE = 'https://via.placeholder.com/150';

const HomeScreen = () => {
  const { Colors } = useTheme();
  const { activeCircle, userData, fetchUserData } = useAuth();
  const initialPresence = userData?.live_status
    ? (userData.live_status.charAt(0).toUpperCase() + userData.live_status.slice(1))
    : 'Focus';

  const [activePresence, setActivePresence] = useState(initialPresence);
  const [modalVisible, setModalVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [moments, setMoments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const lastFetchedCircleId = React.useRef<string | null>(null);

  // Sync activePresence with userData
  useEffect(() => {
    if (userData?.live_status) {
      const status = userData.live_status.charAt(0).toUpperCase() + userData.live_status.slice(1);
      setActivePresence(status);
    }
  }, [userData?.live_status]);

  useEffect(() => {
    // Show presence modal on app start if user hasn't set a status recently
    if (userData && !userData.live_status_note && (userData.live_status === 'free' || !userData.live_status)) {
      setModalVisible(true);
    }
  }, [userData?.id]);

  useEffect(() => {
    const fetchHomeData = async () => {
      const circleId = activeCircle?.id || 'all';
      if (lastFetchedCircleId.current === circleId && moments.length > 0) return;
      
      setLoading(true);
      try {
        const circleName = activeCircle?.name || '';
        lastFetchedCircleId.current = circleId;

        if (circleId !== 'all') {
          const circleMeta = await api.get(`/v2/circle-data?circle_id=${circleId}`);
          setMembers(circleMeta.members || []);
        } else {
          setMembers([]);
        }

        const endpoint = circleId === 'all'
          ? '/v2/moments'
          : `/v2/moments?circle_id=${circleId}&circle_name=${encodeURIComponent(circleName)}`;

        const data = await api.get(endpoint);
        setMoments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch Home Data Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [activeCircle?.id]); // Only depend on ID

  useEffect(() => {
    PresenceService.connect();
    const unsubscribe = PresenceService.subscribe((event) => {
      if (event.type === 'PRESENCE_UPDATE') {
        const payload = event.payload;
        if (payload.user_id === userData?.id) {
          setActivePresence(payload.status);
        }
        
        // Update specific member in state instead of re-fetching
        setMembers(prev => prev.map(m => 
          m.id === payload.user_id 
            ? { ...m, live_status: payload.status, live_status_note: payload.note, is_online: true }
            : m
        ));
      } else if (event.type === 'USER_OFFLINE') {
        const payload = event.payload;
        setMembers(prev => prev.map(m => 
          m.id === payload.user_id ? { ...m, is_online: false } : m
        ));
      } else if (event.type === 'POST_CREATED') {
        const newPost = event.payload;
        // Check if post belongs to current circle or 'all'
        if (activeCircle?.id === 'all' || newPost.circle_id === activeCircle?.id) {
          setMoments(prev => [newPost, ...prev]);
        }
      }
    });
    return () => unsubscribe();
  }, [activeCircle?.id, userData?.id]);

  const handlePresenceChange = async (presenceData: any) => {
    const status = typeof presenceData === 'string' ? presenceData : presenceData.selectedStatus;
    const duration = presenceData.duration || 'Until change';
    const note = presenceData.note || '';

    setActivePresence(status);
    try {
      await api.post('/presence', {
        status,
        duration,
        note
      });
      await fetchUserData(); // Refresh profile to sync global state
    } catch (err) {
      console.error('Presence Update Error:', err);
    }
  };

  const presenceOptions = [
    { label: 'Focus', emoji: '🧠', color: '#8B5CF6' },
    { label: 'Free', emoji: '💬', color: '#10B981' },
    { label: 'Busy', emoji: '🔕', color: '#EF4444' },
    { label: 'More', emoji: '✨', color: '#6366F1' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: THEME.offWhite }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{members.length} members · {members.filter(m => m.is_online).length} active now</Text>
        </View>

        {/* Personal Presence Card */}
        <View style={styles.personalCard}>
          <View style={styles.avatarContainerLarge}>
            <View style={[styles.avatarCircle, { backgroundColor: THEME.purple }]}>
              <Text style={styles.avatarLetter}>Y</Text>
            </View>
            <View style={[styles.statusDotLarge, { backgroundColor: activePresence === 'Free' ? '#10B981' : (activePresence === 'Busy' ? '#F43F5E' : THEME.purple) }]} />
          </View>
          <View style={styles.personalInfo}>
            <Text style={styles.userName}>You</Text>
            <Text style={styles.statusDetail}>{activePresence} · since {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Live Room Card */}
        {members.filter(m => m.is_online && m.live_status === 'Free').length > 0 ? (
          <View style={styles.liveCard}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.livePulse} />
              <View style={styles.liveTextContainer}>
                <Text style={styles.liveTitle}>Live room open</Text>
                <Text style={styles.liveMembers}>
                  {members.filter(m => m.is_online && m.live_status === 'Free').slice(0, 2).map(m => m.username).join(' + ')} are in
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.enterBtn}>
              <Text style={styles.enterBtnText}>Enter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.liveCard, { backgroundColor: '#F1F5F9', borderStyle: 'dashed' }]}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.livePulse, { backgroundColor: '#94A3B8' }]} />
              <View style={styles.liveTextContainer}>
                <Text style={[styles.liveTitle, { color: '#64748B' }]}>Quiet right now</Text>
                <Text style={styles.liveMembers}>Start a room to hangout</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.enterBtn, { backgroundColor: '#94A3B8' }]} onPress={() => setModalVisible(true)}>
              <Text style={styles.enterBtnText}>Start</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Who's Around Section */}
        <View style={styles.aroundSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.aroundTitle}>WHO'S AROUND</Text>
            <TouchableOpacity onPress={() => setMembersModalVisible(true)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aroundScroll}>
            {members.map((member) => {
              const isOnline = member.is_online === true;
              const status = isOnline ? (member.live_status || 'Free') : 'Offline';
              const statusColor = !isOnline ? '#94A3B8' : (status === 'Free' ? '#10B981' : (status === 'Busy' ? '#EF4444' : (status === 'Coding' ? '#3B82F6' : (status === 'Out' ? '#F59E0B' : (status === 'Resting' ? '#6366F1' : THEME.purple)))));

              return (
                <View key={member.id} style={styles.memberItem}>
                  {isOnline && member.live_status_note ? (
                    <View style={styles.thoughtCloud}>
                      <Text style={styles.thoughtText} numberOfLines={1}>{member.live_status_note}</Text>
                      <View style={styles.thoughtTail} />
                    </View>
                  ) : null}
                  <View style={styles.avatarContainerSmall}>
                    <View style={[styles.avatarCircleSmall, { backgroundColor: '#E2E8F0' }]}>
                      <Text style={styles.avatarLetterSmall}>{member.username?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusDotSmall, { backgroundColor: statusColor }]} />
                  </View>
                  <Text style={styles.memberLabel} numberOfLines={1}>{member.username}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <PresenceModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={(presence) => {
            handlePresenceChange(presence);
            setModalVisible(false);
          }}
        />

        {/* Members List Modal */}
        <Modal
          visible={membersModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setMembersModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.membersFullList}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Who's Around</Text>
                <TouchableOpacity onPress={() => setMembersModalVisible(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.membersListContent}>
                {members.map((member) => {
                  const isOnline = member.is_online === true;
                  const status = isOnline ? (member.live_status || 'Free') : 'Offline';
                  const statusColor = !isOnline ? '#94A3B8' : (status === 'Free' ? '#10B981' : (status === 'Busy' ? '#EF4444' : (status === 'Coding' ? '#3B82F6' : (status === 'Out' ? '#F59E0B' : (status === 'Resting' ? '#6366F1' : THEME.purple)))));
                  const bgColor = !isOnline ? 'rgba(148, 163, 184, 0.1)' : (status === 'Free' ? 'rgba(16, 185, 129, 0.1)' : (status === 'Busy' ? 'rgba(239, 68, 68, 0.1)' : (status === 'Coding' ? 'rgba(59, 130, 246, 0.1)' : (status === 'Out' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(127, 119, 221, 0.1)'))));

                  const getFallbackNote = (s: string) => {
                    switch (s) {
                      case 'Free': return 'Free to chat';
                      case 'Busy': return 'Busy right now';
                      case 'Coding': return 'Deep in code';
                      case 'Out': return 'Out and about';
                      case 'Resting': return 'Taking a break';
                      default: return 'In focus mode';
                    }
                  };

                  return (
                    <View key={member.id} style={styles.memberRowItem}>
                      <View style={styles.memberRowInfo}>
                        <View style={styles.avatarCircleSmall}>
                          <Text style={styles.avatarLetterSmall}>{member.username?.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.memberTextInfo}>
                          <Text style={styles.memberNameFull}>{member.username}</Text>
                          <Text style={styles.memberNoteFull}>
                            {isOnline ? (member.live_status_note || getFallbackNote(status)) : 'Offline'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: bgColor }]}>
                        <Text style={[styles.statusPillText, { color: statusColor }]}>
                          {status}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Moments Section */}
        <View style={styles.momentsHeader}>
          <Text style={styles.aroundTitle}>MOMENTS</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.purple} style={{ marginTop: 20 }} />
        ) : moments.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Text style={{ color: THEME.textMuted, textAlign: 'center' }}>No moments yet.</Text>
          </View>
        ) : (
          moments.map((moment) => (
            <GlassCard key={moment.id} style={styles.momentCard}>
              <View style={styles.momentRow}>
                <View style={styles.momentTextContent}>
                  <Text style={styles.momentUser}>{moment.user?.username || 'Member'}</Text>
                  <Text style={styles.momentCaptionText}>{moment.caption || 'Shared a moment'}</Text>
                  <Text style={styles.momentTimeText}>{new Date(moment.created_at).toLocaleDateString()}</Text>
                </View>
                {moment.content_url && (
                  <Image source={{ uri: moment.content_url }} style={styles.momentThumbnail} />
                )}
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerStats: { marginBottom: 12, paddingHorizontal: 4 },
  statsText: { fontSize: 13, color: THEME.textMuted, fontWeight: '600' },
  
  // Personal Card
  personalCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: THEME.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  avatarContainerLarge: { position: 'relative' },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  statusDotLarge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
  personalInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 18, fontWeight: '700', color: THEME.text },
  statusDetail: { fontSize: 13, color: THEME.textMuted, marginTop: 2 },
  changeBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  changeBtnText: { fontSize: 14, fontWeight: '600', color: THEME.text },

  // Live Card
  liveCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF1F2', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#FECDD3',
    marginBottom: 32
  },
  liveIndicatorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 12 },
  liveTextContainer: { flex: 1 },
  liveTitle: { fontSize: 18, fontWeight: '700', color: '#881337' },
  liveMembers: { fontSize: 13, color: '#9F1239', marginTop: 2 },
  enterBtn: { backgroundColor: '#BE123C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 18 },
  enterBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Who's Around
  aroundSection: { marginBottom: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  aroundTitle: { fontSize: 12, fontWeight: '800', color: THEME.textMuted, letterSpacing: 1 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: THEME.purple },
  aroundScroll: { paddingLeft: 4 },
  memberItem: { alignItems: 'center', marginRight: 24 },
  avatarContainerSmall: { position: 'relative', marginBottom: 8 },
  avatarCircleSmall: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarLetterSmall: { color: THEME.text, fontSize: 18, fontWeight: '700' },
  statusDotSmall: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFF' },
  memberLabel: { fontSize: 12, fontWeight: '600', color: THEME.text },

  // Moments
  momentsHeader: { marginBottom: 16, paddingHorizontal: 4 },
  momentCard: { padding: 16, marginBottom: 12, borderRadius: 24 },
  momentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  momentTextContent: { flex: 1, marginRight: 16 },
  momentUser: { fontWeight: '700', fontSize: 14, color: THEME.text, marginBottom: 4 },
  momentCaptionText: { fontSize: 15, color: THEME.text, lineHeight: 20 },
  momentTimeText: { fontSize: 11, color: THEME.textMuted, marginTop: 8 },
  momentThumbnail: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F1F5F9' },
  emptyFeed: { padding: 40, alignItems: 'center' },

  // Thought Cloud
  thoughtCloud: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    position: 'absolute',
    top: -40,
    minWidth: 50,
    maxWidth: 100,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  thoughtText: { fontSize: 10, fontWeight: '700', color: THEME.text, textAlign: 'center' },
  thoughtTail: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: THEME.border,
  },

  // Members Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  membersFullList: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: THEME.text },
  closeBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  closeBtnText: { fontWeight: '700', color: THEME.text },
  membersListContent: { paddingBottom: 40 },
  memberRowItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  memberRowInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberTextInfo: { marginLeft: 16 },
  memberNameFull: { fontSize: 16, fontWeight: '700', color: THEME.text },
  memberNoteFull: { fontSize: 13, color: THEME.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusPillText: { fontSize: 12, fontWeight: '800' },
});

export default HomeScreen;
