import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCircleStore } from '../../store/circleStore';
import { Colors, Shadows } from '../../theme/Theme';
import {
  Mail,
  Zap,
  Lock,
  Camera,
  Users,
  Activity,
  Bell,
  PlusCircle,
  Link,
  UserPlus,
  Ticket,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppHeader } from '../../components/AppHeader';
import { SettingsPanel } from '../../components/SettingsPanel';
import { uploadUserAvatar } from '../../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut, userData, loadingUserData, refreshProfile } = useAuth();
  const { allCircles, stats, fetchAllCircles, fetchHomeData } = useCircleStore();
  
  const getDaysAtCircloLabel = () => {
    const createdAt = user?.created_at;
    if (!createdAt) return "I'm new to Circlo";
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return `I'm at Circlo from almost ${diffDays} days`;
  };
  
  const [uploading, setUploading] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  useEffect(() => {
    fetchAllCircles();
    fetchHomeData(); // Get fresh stats including streak
  }, []);

  const handleInvite = async () => {
    try {
      await Share.share({
        message: `Join me on Circlo, the space for real friendships! My invite code is: ${(profile?.username || 'USER').toUpperCase()}\n\nDownload the app to stay connected.`,
        title: 'Invite to Circlo',
      });
    } catch (error: any) {
      console.error('Share error:', error.message);
    }
  };

  const profile = userData;

  const handleEditAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    try {
      setUploading(true);
      await uploadUserAvatar({
        uri: asset.uri!,
        type: asset.type!,
        name: asset.fileName!,
      });
      await refreshProfile();
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not update photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loadingUserData && !profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AppHeader 
        showCircleSelector={false} 
        showSettings={true}
        showNotification={false}
        onSettingsPress={() => setShowSettingsPanel(true)}
      />

      <SettingsPanel
        visible={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        onLogout={handleLogout}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Section - Redesigned to left-aligned */}
        <View style={styles.identitySection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: profile?.avatar_url ||
                    'https://ui-avatars.com/api/?name=' + (profile?.username || 'U') + '&background=8B5CF6&color=fff&size=200',
                }}
                style={styles.avatar}
              />
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={handleEditAvatar}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Camera size={14} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.profileTextContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{profile?.username || 'User'}</Text>
                {profile?.is_paid && (
                  <ShieldCheck size={20} color={Colors.primary} style={{ marginLeft: 6 }} />
                )}
              </View>
              <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
            </View>
          </View>

          {/* New Invite Friends Card */}
          <TouchableOpacity 
            style={styles.inviteCard} 
            activeOpacity={0.9}
            onPress={handleInvite}
          >
            <View style={styles.inviteIconCircle}>
              <Ticket size={20} color="#FFF" />
            </View>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invite Friends</Text>
              <Text style={styles.inviteSubtitle}>{getDaysAtCircloLabel()}</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{allCircles.length}</Text>
            <Text style={styles.statLabel}>Circles</Text>
          </View>
          <View style={[styles.statBlock, styles.statDivider]}>
            <Text style={styles.statValue}>{(stats as any).total_messages || 0}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{stats.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>


        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            <ActionButton icon={<PlusCircle size={20} color="#FFF" />} label="Create" color="#8B5CF6" />
            <ActionButton icon={<Link size={20} color="#4F46E5" />} label="Invite" color="#F1F5F9" textColor="#4F46E5" />
            <ActionButton icon={<UserPlus size={20} color="#4F46E5" />} label="Join" color="#F1F5F9" textColor="#4F46E5" />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>RECENT CIRCLES</Text>
          {allCircles.slice(0, 3).map((item, index) => (
            <TouchableOpacity key={index} style={styles.recentItem}>
              <View style={styles.recentInfo}>
                <View style={styles.circleIconSmall}>
                  <Users size={16} color="#64748B" />
                </View>
                <View>
                  <Text style={styles.recentName}>{item.name}</Text>
                  <Text style={styles.recentSub}>Last message 2m ago</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
          {allCircles.length === 0 && (
            <Text style={styles.emptyText}>No recent activity found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Sub-components

const ActionButton = ({ icon, label, color, textColor = "#FFF" }: any) => (
  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color }]}>
    {icon}
    <Text style={[styles.actionBtnText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 100 },
  
  // Identity
  identitySection: { paddingHorizontal: 24, paddingVertical: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.softBg },
  editBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: Colors.primary, padding: 8, borderRadius: 20,
    borderWidth: 3, borderColor: Colors.white,
  },
  profileTextContainer: { marginLeft: 20, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  profileEmail: { fontSize: 15, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },

  // Invite Card
  inviteCard: {
    backgroundColor: Colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    ...Shadows.dark,
  },
  inviteIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteContent: {
    flex: 1,
    marginLeft: 16,
  },
  inviteTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  inviteSubtitle: {
    color: Colors.textTertiary,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.softBg,
    marginHorizontal: 24, paddingVertical: 18, borderRadius: 24,
    marginTop: 12,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 20, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, marginTop: 4, textTransform: 'uppercase' },


  // Actions
  actionsSection: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: Colors.textTertiary, letterSpacing: 1.5, marginBottom: 16 },
  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8, ...Shadows.soft },
  actionBtnText: { fontSize: 14, fontWeight: '800' },

  // Recent
  recentSection: { paddingHorizontal: 24, marginTop: 32 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  recentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circleIconSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.softBg, justifyContent: 'center', alignItems: 'center' },
  recentName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  recentSub: { fontSize: 11, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' },
  emptyText: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center', marginTop: 10 },
});

export default ProfileScreen;
