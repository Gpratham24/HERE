import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/Theme';
import { 
  LogOut, 
  UserCircle, 
  Shield, 
  Users, 
  ChevronRight, 
  Layers, 
  Lock, 
  Zap,
  Edit2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { userData, signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: userData?.avatar_url || 'https://i.pravatar.cc/150?u=' + userData?.username }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Edit2 size={16} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
          <Text style={styles.username}>@{userData?.username || 'user'}</Text>
          <Text style={styles.bio}>Digital Curator & Connector</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.mainStatCard}>
            <View style={styles.iconCircle}>
              <Zap size={24} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statLargeVal}>V2 System</Text>
              <Text style={styles.statSubText}>Architecture Tier</Text>
            </View>
          </View>

          <View style={styles.sideStatsCol}>
            <View style={[styles.miniCard, { backgroundColor: '#CCFBF1' }]}>
              <View style={styles.miniIconBox}>
                <Layers size={18} color="#0D9488" />
              </View>
              <View>
                <Text style={styles.miniVal}>10 Limit</Text>
                <Text style={styles.miniLabel}>ACTIVE CAPACITY</Text>
              </View>
            </View>

            <View style={[styles.miniCard, { backgroundColor: '#F3E8FF' }]}>
              <View style={styles.miniIconBox}>
                <Lock size={18} color="#9333EA" />
              </View>
              <View>
                <Text style={styles.miniVal}>Private</Text>
                <Text style={styles.miniLabel}>STATUS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>ACCOUNT SETTINGS</Text>
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={[styles.itemIcon, { backgroundColor: '#F3F2FF' }]}>
              <UserCircle size={22} color={Colors.primary} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Edit Profile</Text>
              <Text style={styles.itemSub}>Update identity and bio</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={[styles.itemIcon, { backgroundColor: '#ECFDF5' }]}>
              <Shield size={22} color="#10B981" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Privacy & Trust</Text>
              <Text style={styles.itemSub}>Manage data and security</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={[styles.itemIcon, { backgroundColor: '#FEF2F2' }]}>
              <Users size={22} color="#EF4444" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Manage Circles</Text>
              <Text style={styles.itemSub}>Organize your connections</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity 
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#991B1B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#F3F2FF',
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  bio: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: '#F3F2FF',
    borderRadius: 32,
    padding: 24,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLargeVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  statSubText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  sideStatsCol: {
    flex: 1,
    gap: 12,
  },
  miniCard: {
    flex: 1,
    padding: 16,
    borderRadius: 32,
    justifyContent: 'center',
  },
  miniIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },
  miniLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // Settings Section
  section: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 20,
    marginLeft: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextCol: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    backgroundColor: '#F5F3FF',
    paddingVertical: 22,
    borderRadius: 30,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
    marginLeft: 12,
  }
});

export default ProfileScreen;
