import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { api } from '../../utils/api';
import { PresenceService } from '../../utils/presence';
import { PresenceModal } from '../../components/PresenceModal';
import { Edit2, ArrowRight } from 'lucide-react-native';

const DEFAULT_CIRCLE_IMAGE = 'https://via.placeholder.com/150';

const HomeScreen = () => {
  const { Colors } = useTheme();
  const { activeCircle, userData, fetchUserData } = useAuth();
  const initialPresence = userData?.live_status
    ? (userData.live_status.charAt(0).toUpperCase() + userData.live_status.slice(1))
    : 'Focus';

  const [activePresence, setActivePresence] = useState(initialPresence);
  const [modalVisible, setModalVisible] = useState(false);
  const [moments, setMoments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const circleId = activeCircle?.id || 'all';
        const circleName = activeCircle?.name || '';

        // 1st part: Fetch circle and member data (only if a specific circle is selected)
        if (circleId !== 'all') {
          const circleMeta = await api.get(`/v2/circle-data?circle_id=${circleId}`);
          setMembers(circleMeta.members || []);
        } else {
          setMembers([]);
        }

        // 2nd part: Fetch all moments/posts
        // If it's a single circle, we can pass circle_id or circle_name as requested
        const endpoint = circleId === 'all'
          ? '/v2/moments'
          : `/v2/moments?circle_id=${circleId}&circle_name=${encodeURIComponent(circleName)}`;

        const data = await api.get(endpoint);
        setMoments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch Home Data Error:', err);
        setMoments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [activeCircle]);

  useEffect(() => {
    PresenceService.connect();
    const unsubscribe = PresenceService.subscribe((event) => {
      // Handle presence updates
    });
    return () => unsubscribe();
  }, []);

  const handlePresenceChange = async (label: string) => {
    setActivePresence(label);
    try {
      await api.post('/presence', {
        status: label,
      });
      await fetchUserData(); // Instantly refresh profile
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
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Presence Selection */}
        <View style={styles.presenceSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 }}>
            <Text style={[styles.sectionTitle, { color: Colors.text, flexShrink: 1 }]}>How are you feeling?</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.editButton}
            >
              <Edit2 size={12} color={Colors.primary} />
              <Text style={[styles.editText, { color: Colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vibeRow}>
            {[
              { id: 'Focus', label: 'In zone', color: '#8B5CF6' },
              { id: 'Free', label: 'Free', color: '#10B981' },
              { id: 'Busy', label: 'Busy', color: '#F43F5E' },
            ].map((vibe) => (
              <TouchableOpacity
                key={vibe.id}
                onPress={() => handlePresenceChange(vibe.id)}
                style={[
                  styles.vibeChip,
                  activePresence === vibe.id ? {
                    backgroundColor: vibe.color,
                    borderColor: vibe.color,
                  } : {
                    backgroundColor: Colors.surface,
                    borderColor: 'rgba(0,0,0,0.05)',
                  }
                ]}
              >
                <Text style={[
                  styles.vibeLabel,
                  { color: activePresence === vibe.id ? '#FFF' : Colors.text }
                ]}>{vibe.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PresenceModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={(presence) => {
            handlePresenceChange(presence.selectedStatus);
            setModalVisible(false);
          }}
        />

        {/* Live Room Feature */}
        <GlassCard style={styles.liveRoomSection}>
          <View style={styles.liveRoomHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>HAPPENING NOW</Text>
            </View>
            <Text style={[styles.roomTitle, { color: Colors.text }]}>
              {activeCircle?.id === 'all' ? 'Circles Activity' : `${activeCircle?.name} Room`}
            </Text>
          </View>
          <View style={styles.avatarStack}>
            {members.slice(0, 4).map((member, i) => (
              <Image
                key={member.id}
                source={{ uri: member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}&background=random` }}
                style={[styles.stackedAvatar, { borderColor: Colors.surfaceElevated, backgroundColor: Colors.surface }]}
              />
            ))}
            {members.length > 4 && (
              <Text style={[styles.stackText, { color: Colors.textSecondary }]}>+{members.length - 4} others hanging out</Text>
            )}
            {members.length === 0 && activeCircle?.id !== 'all' && (
              <Text style={[styles.stackText, { color: Colors.textSecondary }]}>No one here yet</Text>
            )}
            {activeCircle?.id === 'all' && (
              <Text style={[styles.stackText, { color: Colors.textSecondary }]}>Select a circle to see who's live</Text>
            )}
          </View>
          <GradientButton title="Jump In" onPress={() => { }} style={styles.joinBtn} />
        </GlassCard>

        {/* Moments Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            {activeCircle?.id === 'all' ? 'Recent Moments' : `${activeCircle?.name} Moments`}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : moments.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>No moments yet. Share what's happening!</Text>
          </View>
        ) : (
          moments.map((moment) => {
            // Aggregate reactions
            const reactionCounts: Record<string, number> = {};
            (moment.reactions || []).forEach((r: any) => {
              reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
            });
            const topReactions = Object.entries(reactionCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            return (
              <GlassCard key={moment.id} style={styles.momentCard}>
                <View style={styles.momentRow}>
                  <View style={styles.momentTextContent}>
                    <View style={styles.momentHeader}>
                      <Text style={[styles.momentUserName, { color: Colors.text }]}>
                        {moment.user?.username || 'Member'}
                        <Text style={{ fontWeight: '400', color: Colors.textMuted }}> in </Text>
                        {moment.circle?.name || 'Circlo'}
                      </Text>
                      <Text style={[styles.momentTime, { color: Colors.textMuted }]}>
                        {new Date(moment.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>

                    {moment.caption ? (
                      <Text style={[styles.momentCaption, { color: Colors.text }]}>
                        {moment.caption}
                      </Text>
                    ) : (
                      <Text style={[styles.momentCaption, { color: Colors.textMuted, fontStyle: 'italic', fontWeight: '400' }]}>
                        Shared a moment
                      </Text>
                    )}

                    <View style={styles.reactionsRow}>
                      {topReactions.length > 0 ? (
                        topReactions.map(([emoji, count], idx) => (
                          <View key={idx} style={styles.reactionPill}>
                            <Text style={styles.reactionEmoji}>{emoji}</Text>
                            <Text style={[styles.reactionCount, { color: Colors.textSecondary }]}>{count}</Text>
                          </View>
                        ))
                      ) : null}
                    </View>
                  </View>

                  {moment.content_url && (
                    <Image source={{ uri: moment.content_url }} style={styles.momentThumbnail} />
                  )}
                </View>
              </GlassCard>
            );
          })
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  presenceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18, // Increased for breathing room
    paddingHorizontal: 4,
    width: '100%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.06)', // Softer background
    paddingHorizontal: 12, // More horizontal room
    paddingVertical: 6, // Better vertical balance
    borderRadius: 24,
  },
  editText: {
    fontSize: 10, // Slightly smaller for premium look
    fontWeight: '900', // Heavier weight
    textTransform: 'uppercase',
    marginLeft: 5,
    letterSpacing: 1, // Increased tracking for high-end feel
  },
  vibeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  vibeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  vibeLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  liveRoomSection: {
    marginBottom: 32,
    padding: 20,
  },
  liveRoomHeader: {
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stackedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: -10,
  },
  stackText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 18,
  },
  joinBtn: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  momentCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 24,
  },
  momentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top for better text flow
  },
  momentTextContent: {
    flex: 1,
    marginRight: 16,
  },
  momentHeader: {
    marginBottom: 8,
  },
  momentUserName: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  momentTime: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  momentCaption: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginVertical: 4,
    letterSpacing: -0.2,
  },
  momentThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyFeed: {
    padding: 40,
    alignItems: 'center',
  },
});

export default HomeScreen;
