import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Camera, 
  Image as ImageIcon, 
  Bell, 
  Shield, 
  LogOut, 
  Trash2, 
  ChevronRight,
  Settings
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import * as ImagePicker from 'react-native-image-picker';
import { UserMinus, Ban, Users } from 'lucide-react-native';

type Props = {
  navigation: { goBack: () => void };
  circle: any;
};

const CircleSettingsScreen = ({ navigation, circle }: Props) => {
  const { Colors, isDark } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  
  const { fetchCircles } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(circle?.notifications_enabled ?? true);
  const [muteMentions, setMuteMentions] = useState(circle?.mute_mentions ?? false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const isAdmin = circle?.created_by === userData?.id;

  React.useEffect(() => {
    fetchMembers();
  }, [circle?.id]);

  const fetchMembers = async () => {
    try {
      const data = await api.get(`/v2/circle-data?circle_id=${circle.id}`);
      setMembers(data.members || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const handlePickImage = async (type: 'icon' | 'wallpaper') => {
    if (!isAdmin) return;
    
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      async (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) {
          try {
            setLoading(true);
            await api.uploadCircleMedia(circle.id, asset.uri, type);
            await fetchCircles();
            Alert.alert('Success', `${type === 'icon' ? 'Circle icon' : 'Wallpaper'} updated`);
          } catch (err: any) {
            Alert.alert('Error', err.message || `Failed to upload ${type}`);
          } finally {
            setLoading(false);
          }
        }
      }
    );
  };

  const handleRemoveMember = (member: any) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.username} from the circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/circles/${circle.id}/members/${member.id}`);
              await fetchMembers();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdateName = () => {
    if (!isAdmin) return;
    Alert.prompt(
      'Circle Name',
      'Enter new name for the circle',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async (newName) => {
            if (!newName) return;
            try {
              setLoading(true);
              await api.patch(`/circles/${circle.id}`, { name: newName });
              await fetchCircles();
              Alert.alert('Success', 'Circle name updated');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update circle name');
            } finally {
              setLoading(false);
            }
          }
        },
      ],
      'plain-text',
      circle?.name
    );
  };

  const handleLeaveCircle = () => {
    Alert.alert(
      'Leave Circle',
      'Are you sure you want to leave this circle?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/circles/${circle.id}/leave`);
              await fetchCircles();
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to leave circle');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleDeleteCircle = () => {
    if (!isAdmin) return;
    Alert.alert(
      'Delete Circle',
      'This action cannot be undone. All data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/circles/${circle.id}`);
              await fetchCircles();
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete circle');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await api.patch(`/circles/${circle.id}/notifications`, { enabled: value });
    } catch (err) {
      console.error('Failed to toggle notifications:', err);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textMuted }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: Colors.border }]}>
        {children}
      </View>
    </View>
  );

  const renderItem = (
    icon: any, 
    label: string, 
    value?: string, 
    onPress?: () => void, 
    showChevron = true,
    destructive = false,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress} 
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: destructive ? 'rgba(255, 59, 48, 0.1)' : (isDark ? '#262626' : '#F1F5F9') }]}>
        {icon}
      </View>
      <Text style={[styles.itemLabel, { color: destructive ? '#FF3B30' : Colors.text }]}>{label}</Text>
      <View style={styles.itemRight}>
        {value && <Text style={[styles.itemValue, { color: Colors.textMuted }]}>{value}</Text>}
        {rightElement}
        {showChevron && <ChevronRight size={18} color={Colors.textMuted} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors.border, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Circle Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Circle Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {circle?.avatar_url ? (
              <Image source={{ uri: circle.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: Colors.primary }]}>
                <Text style={styles.avatarInitial}>{circle?.name?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            {isAdmin && (
              <TouchableOpacity 
                style={[styles.cameraBtn, { backgroundColor: Colors.primary }]}
                onPress={() => handlePickImage('icon')}
              >
                <Camera size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.circleName, { color: Colors.text }]}>{circle?.name || 'Untitled Circle'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? Colors.primary + '20' : Colors.textMuted + '20' }]}>
            <Shield size={12} color={isAdmin ? Colors.primary : Colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.roleText, { color: isAdmin ? Colors.primary : Colors.textMuted }]}>
              {isAdmin ? 'Circle Admin' : 'Member'}
            </Text>
          </View>
        </View>

        {renderSection('GENERAL', (
          <>
            {renderItem(<Settings size={20} color={Colors.textSecondary} />, 'Circle Name', circle?.name, isAdmin ? handleUpdateName : undefined)}
            {renderItem(<Camera size={20} color={Colors.textSecondary} />, 'Circle Icon', undefined, isAdmin ? () => handlePickImage('icon') : undefined)}
            {renderItem(<ImageIcon size={20} color={Colors.textSecondary} />, 'Chat Wallpaper', 'Default', () => handlePickImage('wallpaper'))}
          </>
        ))}

        {isAdmin && renderSection('MEMBERS', (
          <View style={styles.memberList}>
            {members.filter(m => m.id !== userData?.id).map((member) => (
              <View key={member.id} style={styles.memberItemRow}>
                <View style={styles.memberInfo}>
                  <View style={[styles.memberAvatar, { backgroundColor: Colors.surface }]}>
                    <Text style={{ color: Colors.text }}>{member.username?.[0]?.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.memberName, { color: Colors.text }]}>{member.username}</Text>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleRemoveMember(member)}
                  >
                    <UserMinus size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {members.length <= 1 && (
              <Text style={{ color: Colors.textMuted, textAlign: 'center', padding: 10 }}>No other members yet</Text>
            )}
          </View>
        ))}

        {renderSection('NOTIFICATIONS', (
          <>
            {renderItem(
              <Bell size={20} color={Colors.textSecondary} />, 
              'Allow Notifications', 
              undefined, 
              undefined, 
              false,
              false,
              <Switch 
                value={notificationsEnabled} 
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#767577', true: Colors.primary }}
              />
            )}
            {notificationsEnabled && renderItem(
              <Bell size={20} color={Colors.textSecondary} />, 
              'Notification Rules', 
              muteMentions ? 'Mentions Only' : 'All Messages',
              async () => {
                const newValue = !muteMentions;
                setMuteMentions(newValue);
                await api.patch(`/circles/${circle.id}/notifications`, { mute_mentions: newValue });
              }
            )}
          </>
        ))}

        {renderSection('DANGER ZONE', (
          <>
            {renderItem(<LogOut size={20} color="#FF3B30" />, 'Leave Circle', undefined, handleLeaveCircle, true, true)}
            {isAdmin && renderItem(<Trash2 size={20} color="#FF3B30" />, 'Delete Circle', undefined, handleDeleteCircle, true, true)}
          </>
        ))}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: Colors.textMuted }]}>
            Circle ID: {circle?.id || 'N/A'}
          </Text>
          <Text style={[styles.footerText, { color: Colors.textMuted }]}>
            Created on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    paddingTop: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 32,
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  circleName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  memberList: {
    padding: 8,
  },
  memberItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderRadius: 8,
  },
});

export default CircleSettingsScreen;
