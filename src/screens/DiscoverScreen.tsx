import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Search, Users, Flame, Hash, Check, ArrowLeft, Heart, MessageCircle, Share2, Plus, X } from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes } from '../theme/Theme';
import { useTheme } from '../context/ThemeContext';
import CommunityViewScreen from './CommunityViewScreen';
import CreateCommunityModal from '../components/discover/CreateCommunityModal';

const { width } = Dimensions.get('window');

const HARDCODED_TOPICS = [
  'AI', 'Startups', 'Coding', 'Fitness', 'Gaming', 'Movies', 'Tech', 'Design'
];

export default function DiscoverScreen() {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  // Topic filter state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicPosts, setTopicPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot((snap: any) => {
         if (snap && snap.exists) {
            setJoinedCommunities(snap.data()?.joinedCommunities || []);
         }
      }, (err: any) => console.error('Error fetching joined communities:', err));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 1. Fetch Trending Communities
    const unsubscribeCommunities = firestore()
      .collection('communities')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        if (snapshot) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCommunities(list);
        }
        setLoading(false);
      }, err => console.error('Error fetching communities:', err));

    // 2. Fetch Suggested Users
    const unsubscribeUsers = firestore()
      .collection('users')
      .orderBy('followersCount', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        if (snapshot) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Filter out current user
          const filtered = list.filter(u => u.id !== auth().currentUser?.uid);
          setSuggestedUsers(filtered);
        }
      }, err => console.error('Error fetching users:', err));

    return () => {
      unsubscribeCommunities();
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    if (!selectedTopic) {
      setTopicPosts([]);
      return;
    }
    setPostsLoading(true);
    const unsubscribe = firestore()
      .collection('posts')
      .onSnapshot(snapshot => {
        if (snapshot) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const filtered = list.filter((post: any) => {
            const topicLower = selectedTopic.toLowerCase();
            const caption = (post.caption || '').toLowerCase();
            const community = (post.communityName || post.community || '').toLowerCase();
            return caption.includes(topicLower) || community.includes(topicLower);
          });
          setTopicPosts(filtered);
        }
        setPostsLoading(false);
      }, err => {
        console.error(err);
        setPostsLoading(false);
      });
    return () => unsubscribe();
  }, [selectedTopic]);

  const handleFollowToggle = (userId: string) => {
    setFollowingStates(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleJoinToggle = async (communityName: string) => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const isJoined = joinedCommunities.some(c => c.toLowerCase() === communityName.toLowerCase());
    const batch = firestore().batch();
    const userRef = firestore().collection('users').doc(uid);

    if (isJoined) {
       batch.update(userRef, { joinedCommunities: firestore.FieldValue.arrayRemove(communityName) });
    } else {
       batch.update(userRef, { joinedCommunities: firestore.FieldValue.arrayUnion(communityName) });
    }
    await batch.commit();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle={Colors.background === '#F4F4F5' ? 'dark-content' : 'light-content'} translucent backgroundColor="transparent" />
      
      {/* Search Bar with Safe Area */}
      <View style={[styles.searchContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchBar}>
          <Search size={18} color="#A1A1AA" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities, users, posts"
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {selectedTopic ? (
         <View style={{ flex: 1 }}>
           <CommunityViewScreen communityName={selectedTopic} onClose={() => setSelectedTopic(null)} />
         </View>
      ) : (
        // Standard Sections
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <TouchableOpacity style={styles.createMainBtn} onPress={() => setIsCreateModalOpen(true)}>
             <Plus size={16} color="#ffffff" />
             <Text style={styles.createMainBtnText}>Create Community</Text>
          </TouchableOpacity>

          {/* 1. Trending Communities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Flame size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Trending Communities</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScroll}
            >
              {communities.filter(c => !joinedCommunities.some(j => j.toLowerCase() === c.name.toLowerCase())).length > 0 ? (
                communities
                  .filter(c => !joinedCommunities.some(j => j.toLowerCase() === c.name.toLowerCase()))
                  .map(item => (
                  <View key={item.id} style={styles.communityCard}>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => setSelectedTopic(item.name)} 
                      style={{ alignItems: 'center', width: '100%' }}
                    >
                      <Image 
                        source={{ uri: item.iconUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&q=80' }} 
                        style={styles.communityIcon} 
                      />
                      <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.memberCountRow}>
                        <Users size={12} color="#A1A1AA" />
                        <Text style={styles.memberCountText}>{item.membersCount || 0}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.joinBtn, 
                        joinedCommunities.some(c => c.toLowerCase() === item.name.toLowerCase()) && styles.joinedBtn
                      ]}
                      onPress={() => handleJoinToggle(item.name)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.joinBtnText}>
                        {joinedCommunities.some(c => c.toLowerCase() === item.name.toLowerCase()) ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No communities found</Text>
              )}
            </ScrollView>
          </View>

          {/* 2. Topics / Interests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Hash size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Topics & Interests</Text>
            </View>
            
            <View style={styles.chipContainer}>
              {HARDCODED_TOPICS.map((topic, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.chip} 
                  activeOpacity={0.7}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <Text style={styles.chipText}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 3. Suggested Users */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color="#E879F9" />
              <Text style={styles.sectionTitle}>Suggested Users</Text>
            </View>

            <View style={styles.usersList}>
              {suggestedUsers.length > 0 ? (
                suggestedUsers.map(user => {
                  const isFollowing = followingStates[user.id];
                  return (
                    <View key={user.id} style={styles.userRow}>
                      <Image 
                        source={{ uri: user.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&q=80' }} 
                        style={styles.userAvatar} 
                      />
                      <View style={styles.userInfo}>
                        <Text style={styles.username}>@{user.username || 'user'}</Text>
                        <Text style={styles.userStats}>{user.followersCount || 0} followers</Text>
                      </View>
                      <TouchableOpacity 
                        style={[
                          styles.followBtn, 
                          isFollowing && styles.followingBtn
                        ]} 
                        onPress={() => handleFollowToggle(user.id)}
                        activeOpacity={0.8}
                      >
                        {isFollowing ? (
                          <Check size={16} color="#A1A1AA" />
                        ) : (
                          <Text style={styles.followBtnText}>Follow</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>No suggestions available</Text>
              )}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* 🧱 Create Community Modal */}
      <CreateCommunityModal 
         visible={isCreateModalOpen} 
         onClose={() => setIsCreateModalOpen(false)} 
         onSuccess={(name) => {
            setIsCreateModalOpen(false);
            setSelectedTopic(name);
         }} 
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070708',
  },
  createMainBtn: {
    backgroundColor: '#16161E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  createMainBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  communityCard: {
    backgroundColor: '#16161E',
    borderRadius: 12,
    padding: 10,
    width: 120,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
    backgroundColor: '#1C1C24',
  },
  communityName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  joinedBtn: {
    backgroundColor: '#1C1C24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCountText: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#16161E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  usersList: {
    paddingHorizontal: 16,
    backgroundColor: '#16161E',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  userStats: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#71717A',
    fontSize: 14,
    paddingLeft: 16,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  backBtn: {
    marginRight: 12,
  },
  topicHeaderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  postCard: {
    backgroundColor: '#101015',
    marginBottom: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postCommunity: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  postUsername: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  postCaption: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postMedia: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
    backgroundColor: '#16161E',
  },
});
