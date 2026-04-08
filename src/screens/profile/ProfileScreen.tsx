import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Shadows } from '../../theme/Theme';
import { deleteAccount } from '../../services/api';
import {
  Mail,
  Activity,
  Zap,
  Lock,
  Camera,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import { AppHeader } from '../../components/AppHeader';
import { SettingsPanel } from '../../components/SettingsPanel';
import { uploadUserAvatar } from '../../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { signOut, userData, loadingUserData, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

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
      // Refresh global profile state
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
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  profile?.avatar_url ||
                  'https://ui-avatars.com/api/?name=' + (profile?.username || 'U') + '&background=8B5CF6&color=fff&size=200&font-size=0.33',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={handleEditAvatar}
              disabled={uploading}
              activeOpacity={0.8}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={16} color="#FFFFFF" strokeWidth={3} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.username}>@{profile?.username || 'user'}</Text>
          <View style={styles.emailBadge}>
            <Mail size={14} color="#64748B" />
            <Text style={styles.bio}>{profile?.email}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.mainStatCard}>
            <View style={styles.iconCircle}>
              <Activity size={24} color="#8B5CF6" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statLargeVal}>HERE Active</Text>
              <Text style={styles.statSubText}>Account Status</Text>
            </View>
          </View>

          <View style={styles.sideStatsCol}>
            <View style={[styles.miniCard, { backgroundColor: '#F0F9FF' }]}>
              <View style={styles.miniIconBox}>
                <Zap size={18} color="#0EA5E9" />
              </View>
              <View>
                <Text style={styles.miniVal}>Tier 1</Text>
                <Text style={styles.miniLabel}>ACCESS LEVEL</Text>
              </View>
            </View>

            <View style={[styles.miniCard, { backgroundColor: '#F3E8FF' }]}>
              <View style={styles.miniIconBox}>
                <Lock size={18} color="#9333EA" />
              </View>
              <View>
                <Text style={styles.miniVal}>Secure</Text>
                <Text style={styles.miniLabel}>SYNC STATUS</Text>
              </View>
            </View>
          </View>
        </View>
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
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#F3F2FF',
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
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
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  bio: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
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
    ...Shadows.soft,
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
});

export default ProfileScreen;
