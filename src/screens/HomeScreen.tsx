import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EditCommunityModal from '../components/discover/EditCommunityModal';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../context/AuthContext';
import CommunityViewScreen from './CommunityViewScreen';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/Theme';
import { Heart, MessageCircle, Share2, Bell, MoreHorizontal, Send, X, Plus } from 'lucide-react-native';
import ProfileScreen from './ProfileScreen';
import PostCard from '../components/home/PostCard';


import StoriesBar from '../components/home/StoriesBar';
import Header from '../components/common/Header';

const { width } = Dimensions.get('window');

// AvatarImage moved to PostCard.tsx

interface HomeScreenProps {
  onExploreCommunities: () => void;
  onCreatePost: () => void;
  onNotificationPress: () => void;
  onProfilePress: () => void;
}

export default function HomeScreen({ onExploreCommunities, onCreatePost, onNotificationPress, onProfilePress }: HomeScreenProps) {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment Modal state
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const [selectedProfileUser, setSelectedProfileUser] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'communities' | 'interests' | 'discussions'>('communities');
  const [replyingToComment, setReplyingToComment] = useState<any | null>(null);

  // States for Community Details sheet Modal
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communityDetails, setCommunityDetails] = useState<any>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);

  useEffect(() => {
     const migrate = async () => {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        const mainDoc = await firestore().collection('users').doc(uid).get();
        if (mainDoc.exists() && !mainDoc.data()?.stats) {
            const data = mainDoc.data() || {};
            await mainDoc.ref.update({
               stats: {
                  postsCount: data.postsCount || 0,
                  followersCount: data.followersCount || 0,
                  followingCount: data.followingCount || 0,
                  joinedCommunitiesCount: data.joinedCommunities?.length || 0,
                  appreciationsTotal: data.appreciationsTotal || 0
               },
               joinedCommunities: data.joinedCommunities || [],
               savedPosts: data.savedPosts || []
            });
        }
     };
     migrate();
  }, []);



  useEffect(() => {
    if (!activePost) return;
    const unsubscribe = firestore()
      .collection('posts')
      .doc(activePost.id)
      .collection('comments')
      //      .orderBy('createdAt', 'desc') // Need index, using client sort
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setComments(list);
      }, err => console.error('Error comments:', err));
    return () => unsubscribe();
  }, [activePost]);


  // 1. Fetch Posts based on activeTab
  useEffect(() => {
    setLoading(true);
    const joinedCommunities = userData?.joinedCommunities || [];
    let query: any = firestore().collection('posts');

    // If on communities tab, filter by joined communities
    if (activeTab === 'communities' && joinedCommunities.length > 0) {
      query = query.where('communityName', 'in', joinedCommunities);
    }

    const unsubscribe = query
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          let list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

          // Client-side filtering for feed sections
          if (activeTab === 'discussions') {
            list = list.filter((p: any) => (p.commentsCount || 0) > 0);
          } else if (activeTab === 'interests') {
            // Simulate interests filter layout trigger
            list = list.filter((p: any) => p.mediaUrl || (p.content && p.content.length > 50));
          }

          list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

          // 🤝 Merge duplicate sub-posts into a single card triggers
          const grouped: any[] = [];
          list.forEach((p: any) => {
             const key = `${p.userId}_${p.createdAt?.seconds || p.createdAt?.nanoseconds || 0}_${(p.content || '').substring(0,10)}`;
             const match = grouped.find(g => {
                const gKey = `${g.userId}_${g.createdAt?.seconds || g.createdAt?.nanoseconds || 0}_${(g.content || '').substring(0,10)}`;
                return gKey === key;
             });
             if (match) {
                if (!match.communityNames) match.communityNames = [match.communityName];
                if (!match.communityNames.includes(p.communityName)) match.communityNames.push(p.communityName);
             } else {
                p.communityNames = [p.communityName];
                grouped.push(p);
             }
          });

          setPosts(grouped);
        }
        setLoading(false);
      }, (err: any) => {
        console.error('Error fetching filtered posts:', err);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [activeTab, userData?.joinedCommunities]);

  // 2. Fetch Following List
  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('followers')
      .where('followerUid', '==', uid)
      .onSnapshot(snap => {
        const list = snap.docs.map(doc => doc.data().followedUid);
        setFollowingList(list);
      }, err => console.error('Error following:', err));

    return () => unsubscribe();
  }, []);

  // 3. Fetch Community Details when selected
  useEffect(() => {
    if (selectedCommunity) {
      setIsLoadingCommunity(true);

      const unsubscribeDetails = firestore()
        .collection('communities')
        .where('name', '==', selectedCommunity)
        .onSnapshot(snap => {
          if (snap && !snap.empty) {
            setCommunityDetails({ id: snap.docs[0].id, ...snap.docs[0].data() });
          } else {
            setCommunityDetails({ name: selectedCommunity, membersCount: 0 });
          }
        }, err => console.error('Error community details:', err));

      const unsubscribePosts = firestore()
        .collection('posts')
        .where('communityName', '==', selectedCommunity)
        .onSnapshot(snap => {
          if (snap) {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort client side to avoid needing composite index
            list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setCommunityPosts(list);
          }
          setIsLoadingCommunity(false);
        }, err => {
          console.error('Error community posts:', err);
          setIsLoadingCommunity(false);
        });

      return () => {
        unsubscribeDetails();
        unsubscribePosts();
      };
    } else {
      setCommunityDetails(null);
      setCommunityPosts([]);
    }
  }, [selectedCommunity]);

  // handleLike logic moved to PostCard and postService

  const handleFollow = async (targetUid: string) => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    try {
      const batch = firestore().batch();
      const myRef = firestore().collection('users').doc(uid);
      const targetRef = firestore().collection('users').doc(targetUid);

      const isFollowing = followingList.includes(targetUid);
      if (isFollowing) {
        const snap = await firestore()
          .collection('followers')
          .where('followerUid', '==', uid)
          .where('followedUid', '==', targetUid)
          .get();
        snap.docs.forEach(doc => batch.delete(doc.ref));

        batch.update(myRef, { followingCount: firestore.FieldValue.increment(-1) });
        batch.update(targetRef, { followersCount: firestore.FieldValue.increment(-1) });
      } else {
        const followerRef = firestore().collection('followers').doc();
        batch.set(followerRef, {
          followerUid: uid,
          followedUid: targetUid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        batch.update(myRef, { followingCount: firestore.FieldValue.increment(1) });
        batch.update(targetRef, { followersCount: firestore.FieldValue.increment(1) });

        const notifRef = firestore().collection('notifications').doc();
        batch.set(notifRef, {
          type: 'follow',
          actorUid: uid,
          actorUsername: userData?.username || 'user',
          targetUid: targetUid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (err) {
      console.error('Error following user:', err);
    }
  };


  const handleCreateComment = async () => {
    if (!commentText.trim() || !activePost) return;
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    try {
      await firestore()
        .collection('posts')
        .doc(activePost.id)
        .collection('comments')
        .add({
          userId: uid,
          username: userData?.username || 'user',
          text: commentText.trim(),
          createdAt: firestore.FieldValue.serverTimestamp(),
          parentId: replyingToComment ? replyingToComment.id : null,
        });

      if (!replyingToComment) {
        await firestore()
          .collection('posts')
          .doc(activePost.id)
          .update({
            commentsCount: firestore.FieldValue.increment(1),
          });
      }

      // Notify Post Creator OR Parent Comment Creator
      const targetUid = replyingToComment ? replyingToComment.userId : activePost.userId;
      if (targetUid !== uid) {
        await firestore().collection('notifications').add({
          type: replyingToComment ? 'reply' : 'comment',
          actorUid: uid,
          actorUsername: userData?.username || 'user',
          targetUid: targetUid,
          postId: activePost.id,
          commentText: commentText.trim(),
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      setCommentText('');
      setReplyingToComment(null);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };


  const renderPost = ({ item }: { item: any }) => {
    return (
      <PostCard
        item={item}
        userData={userData}
        followingList={followingList}
        onFollow={handleFollow}
        onCommentPress={() => { setActivePost(item); setIsCommentOpen(true); }}
        onProfilePress={(id) => { setSelectedProfileUser(id); setIsProfileModalOpen(true); }}
        onCommunityPress={(name) => setSelectedCommunity(name)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* 🚀 Top Navbar matched exactly to Screenshot */}
      <Header onNotificationPress={onNotificationPress} onProfilePress={onProfilePress} />


      {/* 🏘️ Community Detail View Modal */}
      <Modal
        visible={selectedCommunity !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedCommunity(null)}
      >
        {selectedCommunity && (
          <CommunityViewScreen
            communityName={selectedCommunity}
            onClose={() => setSelectedCommunity(null)}
          />
        )}
      </Modal>

      {loading && posts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.feedList, { paddingBottom: 100 }]} // Space for bottom nav
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<StoriesBar onCreatePost={onCreatePost} />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80, paddingHorizontal: 32 }}>
              {userData?.joinedCommunities && userData.joinedCommunities.length === 0 ? (
                <>
                  <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>Join communities to see posts</Text>
                  <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>Your feed is empty because you aren't in any communities yet.</Text>
                  <TouchableOpacity 
                    style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 }}
                    onPress={onExploreCommunities}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Explore Communities</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>Be the first to post 🚀</Text>
                  <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>This community looks a bit quiet. Start the conversation!</Text>
                  <TouchableOpacity 
                    style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 }}
                    onPress={onCreatePost}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Create Post</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          }
        />
      )}

      {/* Comment Modal */}
      <Modal visible={isCommentOpen} transparent animationType="slide" onRequestClose={() => setIsCommentOpen(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.commentSheet}>
              {/* Header */}
              <View style={styles.commentHeader}>
                <Text style={styles.commentTitle}>Discussions ({comments.filter((c: any) => !c.parentId).length})</Text>
                <TouchableOpacity onPress={() => { setIsCommentOpen(false); setReplyingToComment(null); }}>
                  <X size={18} color="#E4E4E7" />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
                {comments.length === 0 ? (
                  <Text style={styles.noComments}>No discussions yet. Be the first!</Text>
                ) : (
                  comments.filter((item: any) => !item.parentId).map((item: any) => (
                    <View key={item.id} style={styles.commentItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.commentUser}>@{item.username}</Text>
                        <TouchableOpacity onPress={() => { setReplyingToComment(item); setCommentText(`@${item.username} `); }}>
                          <Text style={{ color: Colors.primary || '#3863FA', fontSize: 11, fontWeight: '600' }}>Reply</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.commentText}>{item.text}</Text>

                      {/* Sub-threads replies */}
                      {comments.filter((c: any) => c.parentId === item.id).map((sub: any) => (
                        <View key={sub.id} style={{ marginLeft: 20, marginTop: 10, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#E2E8F0' }}>
                          <Text style={styles.commentUser}>@{sub.username}</Text>
                          <Text style={styles.commentText}>{sub.text}</Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Replying Banner Above Input */}
              {replyingToComment && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopColor: 'rgba(255,255,255,0.03)', borderTopWidth: 1 }}>
                  <Text style={{ color: '#A1A1AA', fontSize: 12 }}>Replying to @{replyingToComment.username}</Text>
                  <TouchableOpacity onPress={() => { setReplyingToComment(null); setCommentText(''); }}>
                    <X size={14} color="#A1A1AA" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Input Row */}
              <View style={[styles.commentInputRow, { paddingBottom: insets.bottom + 12 }]}>
                <TextInput
                  placeholder="Add to discussion..."
                  placeholderTextColor="#A1A1AA"
                  style={styles.commentInput}
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={handleCreateComment} disabled={!commentText.trim()} style={styles.sendBtn}>
                  <Send size={18} color={commentText.trim() ? Colors.primary : "#A1A1AA"} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={isProfileModalOpen} transparent={false} animationType="slide" onRequestClose={() => setIsProfileModalOpen(false)}>
        {selectedProfileUser && (
          <ProfileScreen userId={selectedProfileUser} onClose={() => setIsProfileModalOpen(false)} />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  unreadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4500',
  },
  feedList: {
    paddingVertical: 12,
  },
  card: {
    marginBottom: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    fontSize: 12,
    marginTop: 2,
  },
  optionsBtn: {
    padding: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postMedia: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  followText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  commentSheet: {
    height: '65%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  commentTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentUser: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#ffffff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    marginLeft: 12,
    padding: 8,
  },
  noComments: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
