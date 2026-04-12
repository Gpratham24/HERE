import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { 
  X, 
  User, 
  Shield, 
  Info, 
  Copy, 
  UserMinus, 
  Crown, 
  Check, 
  XCircle,
  ChevronRight
} from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';
import { useAuth } from '../context/AuthContext';
import { useCircleStore } from '../store/circleStore';
import { removeCircleMember, getCircleData } from '../services/api';

interface CircleSettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  circleId: string;
}

const { width } = Dimensions.get('window');

export const CircleSettingsPanel: React.FC<CircleSettingsPanelProps> = ({
  visible,
  onClose,
  circleId,
}) => {
  const { user } = useAuth();
  const slideAnim = useRef(new Animated.Value(width)).current;
  const [loading, setLoading] = useState(true);
  const [circleInfo, setCircleInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const { 
    pendingMembers, 
    approveMember, 
    rejectMember, 
    fetchPendingMembers 
  } = useCircleStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && circleId) {
      loadCircleData();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      slideAnim.setValue(width);
    }
  }, [visible, circleId]);

  const loadCircleData = async () => {
    try {
      setLoading(true);
      const data = await getCircleData(circleId);
      setCircleInfo(data.circle);
      setMembers(data.members || []);
      
      // If user is admin, fetch pending requests
      if (user?.id === data.circle?.created_by) {
        await fetchPendingMembers(circleId);
      }
    } catch (err) {
      console.error('Failed to load circle settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!circleInfo?.invite_code) return;
    try {
      Alert.alert('Invite Code', `Code: ${circleInfo.invite_code}\n\nShare this code with your friends!`, [
        { text: 'OK' },
        { 
          text: 'Share', 
          onPress: () => {
            const category = circleInfo?.category || 'Community';
            const name = circleInfo?.name || 'Circle';
            Share.share({ 
              message: `Join my ${category} circle "${name}" on Circlo! 🚀\n\nUse my invite code: ${circleInfo.invite_code}` 
            });
          }
        }
      ]);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === circleInfo?.created_by) return;
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingMemberId(memberId);
              await removeCircleMember(circleId, memberId);
              setMembers(prev => prev.filter(m => m.id !== memberId));
              Alert.alert('Success', 'Member removed successfully');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove member');
            } finally {
              setRemovingMemberId(null);
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      await approveMember(circleId, userId);
      await loadCircleData(); // Refresh members list
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to approve member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    try {
      await rejectMember(circleId, userId);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reject member');
    } finally {
      setProcessingId(null);
    }
  };

  if (!visible) return null;

  const isAdmin = user?.id === circleInfo?.created_by;
  const adminMember = members.find(m => m.id === circleInfo?.created_by);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.panel,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>{circleInfo?.name || 'Circle Settings'}</Text>
                <Text style={styles.headerSub}>Settings & Members</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Invite Section */}
                <View style={[styles.section, styles.inviteCard]}>
                  <View style={styles.inviteInfo}>
                    <Text style={styles.inviteLabel}>INVITE CODE</Text>
                    <Text style={styles.inviteCode}>{circleInfo?.invite_code || 'CODE'}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyInvite}>
                    <Copy size={20} color="#FFF" />
                    <Text style={styles.copyText}>Copy</Text>
                  </TouchableOpacity>
                </View>

                {/* Pending Requests Section (Admin Only) */}
                {isAdmin && pendingMembers.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: Colors.primary }]}>PENDING REQUESTS ({pendingMembers.length})</Text>
                    {pendingMembers.map((request: any) => (
                      <View key={request.id} style={[styles.memberItem, styles.pendingItem]}>
                        <Image 
                          source={{ uri: request.avatar_url || 'https://ui-avatars.com/api/?name=' + (request.username || 'P') }} 
                          style={styles.avatar} 
                        />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{request.username}</Text>
                          <Text style={styles.memberSub}>Wants to join</Text>
                        </View>
                        <View style={styles.approvalActions}>
                          <TouchableOpacity 
                            style={[styles.miniActionBtn, { backgroundColor: Colors.success }]}
                            onPress={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                          >
                            <Check size={16} color="#FFF" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.miniActionBtn, { backgroundColor: Colors.danger }]}
                            onPress={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                          >
                            <X size={16} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Admin/Creator Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>CREATOR</Text>
                  <View style={styles.memberItem}>
                    <Image 
                      source={{ uri: adminMember?.avatar_url || 'https://ui-avatars.com/api/?name=' + (adminMember?.username || 'A') }} 
                      style={styles.avatar} 
                    />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{adminMember?.username || 'Admin'}</Text>
                      <View style={styles.adminBadge}>
                        <Crown size={12} color="#D97706" />
                        <Text style={styles.adminBadgeText}>Creator</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Members Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>MEMBERS ({members.length})</Text>
                  {members.map((member) => {
                    if (member.id === circleInfo?.created_by) return null;
                    return (
                      <View key={member.id} style={styles.memberItem}>
                        <Image 
                          source={{ uri: member.avatar_url || 'https://ui-avatars.com/api/?name=' + (member.username || 'U') }} 
                          style={styles.avatar} 
                        />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{member.username}</Text>
                          <Text style={styles.memberSub}>Circle Member</Text>
                        </View>
                        {isAdmin && (
                          <TouchableOpacity 
                            style={styles.removeBtn} 
                            onPress={() => handleRemoveMember(member.id, member.username)}
                            disabled={removingMemberId === member.id}
                          >
                            {removingMemberId === member.id ? (
                              <ActivityIndicator size="small" color={Colors.danger} />
                            ) : (
                              <UserMinus size={18} color={Colors.danger} />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>

                <View style={styles.infoBox}>
                  <Info size={16} color={Colors.textTertiary} />
                  <Text style={styles.infoText}>Circles are private spaces. Only the creator can manage membership and settings.</Text>
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    flex: 1,
    backgroundColor: Colors.softBg,
    width: width,
    ...Shadows.dark,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: Colors.border,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 24,
    ...Shadows.soft,
    justifyContent: 'space-between',
  },
  inviteInfo: {
    flex: 1,
  },
  inviteLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  copyText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...Shadows.soft,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  memberSub: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  removeBtn: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  pendingItem: {
    borderColor: Colors.primaryLight,
    borderWidth: 1,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
