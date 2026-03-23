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
import PostCard from '../components/home/PostCard';
import ProfileScreen from './ProfileScreen';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HARDCODED_TOPICS = [
  'AI', 'Startups', 'Coding', 'Fitness', 'Gaming', 'Movies', 'Tech', 'Design'
];

export default function DiscoverScreen() {
  const { Colors } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  // Topic filter state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [topicPosts, setTopicPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
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
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('followers')
      .where('followerUid', '==', uid)
      .onSnapshot(snapshot => {
         if (snapshot) {
            setFollowingList(snapshot.docs.map(doc => doc.data().followedUid));
         }
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 1. Fetch Trending Communities
    const unsubscribeCommunities = firestore()
      .collection('communities')
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
      .limit(30)
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

  useEffect(() => {
     console.log('Suggested Users Diagnostics list:', suggestedUsers.map(u => ({ id: u.id, username: u.username })));
  }, [suggestedUsers]);

  const handleFollowToggle = async (userId: string) => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const isFollowing = followingList.includes(userId);
    try {
      const batch = firestore().batch();
      const myRef = firestore().collection('users').doc(uid);
      const targetRef = firestore().collection('users').doc(userId);

      if (isFollowing) {
         const snap = await firestore()
           .collection('followers')
           .where('followerUid', '==', uid)
           .where('followedUid', '==', userId)
           .get();
         snap.docs.forEach(doc => batch.delete(doc.ref));

         batch.update(myRef, { followingCount: firestore.FieldValue.increment(-1) });
         batch.update(targetRef, { followersCount: firestore.FieldValue.increment(-1) });
      } else {
         const followerRef = firestore().collection('followers').doc();
         batch.set(followerRef, {
           followerUid: uid,
           followedUid: userId,
         });

         batch.update(myRef, { followingCount: firestore.FieldValue.increment(1) });
         batch.update(targetRef, { followersCount: firestore.FieldValue.increment(1) });

         // Trigger Notif optional addition just like profile screen
         const notifRef = firestore().collection('notifications').doc();
         batch.set(notifRef, {
           type: 'follow',
           actorUid: uid,
           actorUsername: userData?.username || 'user',
           targetUid: userId,
           createdAt: firestore.FieldValue.serverTimestamp(),
         });
      }
      await batch.commit();
    } catch (e) { console.error('Error suggested follow toggle:', e); }
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
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Search Bar with Safe Area */}
      <View style={[styles.searchContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchBar}>
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities, users, posts"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {selectedCommunity ? (
         <View style={{ flex: 1 }}>
            <CommunityViewScreen communityName={selectedCommunity} onClose={() => setSelectedCommunity(null)} />
         </View>
      ) : selectedTopic ? (
         <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
               <TouchableOpacity onPress={() => setSelectedTopic(null)} style={{ padding: 6 }}>
                  <ArrowLeft size={22} color="#0F172A" />
               </TouchableOpacity>
               <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '700', marginLeft: 8 }}>#{selectedTopic}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
               {/* 1. Related Communities list */}
               <View style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
                    <Users size={18} color="#8B5CF6" />
                    <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '700' }}>Related Communities</Text>
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}>
                     {communities.filter(c => c.name.toLowerCase().includes(selectedTopic.toLowerCase())).length > 0 ? (
                        communities.filter(c => c.name.toLowerCase().includes(selectedTopic.toLowerCase())).map(item => (
                        <View key={item.id} style={styles.communityCard}>
                          <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedCommunity(item.name)} style={{ alignItems: 'center', width: '100%' }}>
                            {item.iconUrl ? (
                              <Image source={{ uri: item.iconUrl }} style={styles.communityIcon} />
                            ) : (
                              <View style={[styles.communityIcon, { backgroundColor: '#3863FA', justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>{item.name[0].toUpperCase()}</Text>
                              </View>
                            )}
                            <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.memberCountRow}>
                              <Users size={12} color="#64748B" />
                              <Text style={styles.memberCountText}>{item.membersCount || 0}</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.joinBtn, joinedCommunities.some(c => c.toLowerCase() === item.name.toLowerCase()) && styles.joinedBtn]} 
                            onPress={() => handleJoinToggle(item.name)}
                          >
                            <Text style={styles.joinBtnText}>{joinedCommunities.some(c => c.toLowerCase() === item.name.toLowerCase()) ? 'Joined' : 'Join'}</Text>
                          </TouchableOpacity>
                        </View>
                        ))
                     ) : (
                        <Text style={{ color: '#64748B', fontSize: 13, paddingLeft: 16 }}>No related communities</Text>
                     )}
                  </ScrollView>
               </View>

               {/* 2. Posts Feed inside topic row layout section */}
               <View style={{ marginTop: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 6, marginBottom: 12 }}>
                    <Flame size={16} color="#F59E0B" />
                    <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '700' }}>Recent Posts</Text>
                  </View>

                  {postsLoading ? (
                     <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 20 }} />
                  ) : topicPosts.length === 0 ? (
                     <Text style={{ color: '#64748B', fontSize: 13, paddingHorizontal: 16 }}>No posts found for this topic.</Text>
                  ) : (
                     topicPosts.map((post: any) => (
                        <PostCard 
                          key={post.id}
                          item={post} 
                          userData={userData} 
                          followingList={[]} 
                          onFollow={() => {}} 
                          onCommentPress={() => {}} 
                          onProfilePress={() => {}} 
                        />
                     ))
                  )}
               </View>
            </ScrollView>
         </View>
      ) : (
        // Standard Sections
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <TouchableOpacity style={styles.createMainBtn} onPress={() => setIsCreateModalOpen(true)}>
             <Plus size={16} color="#0F172A" />
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
              {communities.length > 0 ? (
                communities.map(item => (
                  <View key={item.id} style={styles.communityCard}>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => setSelectedCommunity(item.name)} 
                      style={{ alignItems: 'center', width: '100%' }}
                    >
                      {item.iconUrl ? (
                         <Image source={{ uri: item.iconUrl }} style={styles.communityIcon} />
                      ) : (
                         <View style={[styles.communityIcon, { backgroundColor: '#3863FA', justifyContent: 'center', alignItems: 'center' }]}>
                           <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>{item.name[0].toUpperCase()}</Text>
                         </View>
                      )}
                      <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.memberCountRow}>
                        <Users size={12} color="#64748B" />
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
              {suggestedUsers.filter(u => !followingList.includes(u.id)).length > 0 ? (
                suggestedUsers.filter(u => !followingList.includes(u.id)).map(user => {
                  const isFollowing = followingList.includes(user.id);
                  return (
                    <TouchableOpacity key={user.id} style={styles.userRow} activeOpacity={0.8} onPress={() => setSelectedUserId(user.id)}>
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
                          <Check size={16} color="#64748B" />
                        ) : (
                          <Text style={styles.followBtnText}>Follow</Text>
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
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

      {/* 👤 View User Profile Modal */}
      <Modal visible={selectedUserId !== null} transparent={false} animationType="slide">
        <ProfileScreen userId={selectedUserId || undefined} onClose={() => setSelectedUserId(null)} />
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  createMainBtn: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  createMainBtnText: {
    color: '#0F172A',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
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
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  communityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    width: 120,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  communityName: {
    color: '#0F172A',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    fontSize: 11,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '500',
  },
  usersList: {
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  userStats: {
    color: '#64748B',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    paddingLeft: 16,
  },
});
