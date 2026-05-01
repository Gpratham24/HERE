import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, 
  Share2, 
  Grid, 
  MessageSquare, 
  Bookmark, 
  Users, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EditProfileScreen from './EditProfileScreen';
import SettingsScreen from './SettingsScreen';
import { ProfileStats } from '../../components/profile/ProfileStats';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  userId?: string;
  onClose?: () => void;
}

export default function ProfileScreen({ userId, onClose }: ProfileScreenProps) {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userData: myData, logout } = useAuth();
  const currentUid = myData?.id;
  
  const [viewUid, setViewUid] = useState(userId || currentUid);
  const uid = viewUid;
  const isMe = uid === currentUid;

  useEffect(() => {
    setViewUid(userId || currentUid);
  }, [userId, currentUid]);

  const { userData: contextUserData } = useAuth();
  const [localUserData, setLocalUserData] = useState<any>(null);
  const userData = isMe ? contextUserData : localUserData;

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'saved' | 'communities'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [followersLiveCount, setFollowersLiveCount] = useState(0);
  const [followingLiveCount, setFollowingLiveCount] = useState(0);
  const [gridColumns, setGridColumns] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const profile = await api.get('/user/profile');
        if (isMe) {
          // Update global state if needed or local
          setLocalUserData(profile);
        } else {
          setLocalUserData(profile);
        }
        
        // Mocking counts until API provides them
        setFollowersLiveCount(profile.followersCount || 0);
        setFollowingLiveCount(profile.followingCount || 0);
        setUserPosts(profile.posts || []);
      } catch (e) {
        console.error('Fetch profile error:', e);
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchProfileData();
  }, [uid, isMe]);

  const handleToggleFollow = async () => {
    if (!currentUid || !uid) return;
    try {
      // API call for follow
      setIsFollowing(!isFollowing);
    } catch (e) { console.error('Error toggle follow:', e); }
  };

  const handleLogout = () => {
    logout();
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }

    switch (activeTab) {
      case 'posts':
        if (userPosts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet.</Text>
            </View>
          );
        }
        return (
          <View style={styles.gridList}>
            {userPosts.map(post => (
              <TouchableOpacity 
                key={post.id} 
                style={[styles.gridItem, { width: (width - 4 * (gridColumns + 1)) / gridColumns, height: (width - 4 * (gridColumns + 1)) / gridColumns }]} 
                activeOpacity={0.9}
              >
                {post.mediaUrl ? (
                  <Image source={{ uri: post.mediaUrl }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridImage, { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#666', fontSize: 12 }}>Text Post</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nothing to show here.</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Cover Photo */}
        <View style={styles.coverPhotoContainer}>
          <Image 
            source={{ uri: userData?.coverPhotoURL || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80' }} 
            style={styles.coverPhoto} 
          />
          <View style={[styles.headerToolbarOverlay, { paddingTop: 12 }]}>
            {onClose && (
              <TouchableOpacity style={styles.headerIconBtn} onPress={onClose}>
                <ArrowLeft size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
            {isMe && (
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSettingsOpen(true)}>
                <Settings size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: userData?.photoURL || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&q=80' }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={[styles.userName, { color: Colors.text }]}>@{userData?.username || 'user'}</Text>
          <Text style={[styles.bio, { color: Colors.textMuted }]}>{userData?.bio || "Building cool things 🚀"}</Text>
          
          <ProfileStats 
            postsCount={userPosts.length}
            followersCount={followersLiveCount}
            followingCount={followingLiveCount}
            joinedCommunitiesCount={0}
            isMe={isMe}
            onShowFollowers={() => {}}
            onShowFollowing={() => {}}
          />

          <View style={styles.actionRow}>
            {isMe ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.editBtn, isFollowing && styles.followingBtn]} onPress={handleToggleFollow}>
                <Text style={styles.editBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.shareBtn}>
              <Share2 size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabHeader}>
          <TouchableOpacity onPress={() => setActiveTab('posts')} style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]}>
            <Grid size={18} color={activeTab === 'posts' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('comments')} style={[styles.tabItem, activeTab === 'comments' && styles.tabItemActive]}>
            <MessageSquare size={18} color={activeTab === 'comments' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('saved')} style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]}>
            <Bookmark size={18} color={activeTab === 'saved' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('communities')} style={[styles.tabItem, activeTab === 'communities' && styles.tabItemActive]}>
            <Users size={18} color={activeTab === 'communities' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
        </View>

        {renderTabContent()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      {isEditing && (
        <Modal visible={isEditing} animationType="slide">
          <EditProfileScreen userData={userData} onClose={() => setIsEditing(false)} onSave={async (data) => {
            await api.post('/user/profile', data);
            setIsEditing(false);
          }} />
        </Modal>
      )}

      {isSettingsOpen && (
        <Modal visible={isSettingsOpen} animationType="slide">
          <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverPhotoContainer: { height: 200, width: '100%' },
  coverPhoto: { width: '100%', height: '100%' },
  headerToolbarOverlay: { position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { alignItems: 'center', marginTop: -50, paddingHorizontal: 20 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#0D0D0D', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  userName: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  bio: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  actionRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  editBtn: { flex: 1, height: 44, backgroundColor: '#6C5CE7', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  followingBtn: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
  editBtnText: { color: '#FFF', fontWeight: '600' },
  shareBtn: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  tabHeader: { flexDirection: 'row', marginTop: 30, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  tabItem: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#6C5CE7' },
  gridList: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 2 },
  gridItem: { backgroundColor: '#1A1A1A' },
  gridImage: { width: '100%', height: '100%' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666' },
});
