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
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/Theme';
import { Heart, MessageCircle, Share2, Bell, MoreHorizontal, Send, X } from 'lucide-react-native';
import ProfileScreen from './ProfileScreen';
import PostCard from '../components/home/PostCard';


const { width } = Dimensions.get('window');

// AvatarImage moved to PostCard.tsx

export default function HomeScreen() {
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


  useEffect(() => {
    const joinedCommunities = userData?.joinedCommunities || [];
    
    let query: any = firestore().collection('posts');
    
    // If user has joined some communities, filter by them
    if (joinedCommunities.length > 0) {
       // Note: Firestore IN query is capped at 10 or 30 items max generally setups.
       // It filters where communityName matches items inside array smoothly layout setup.
       query = query.where('communityName', 'in', joinedCommunities);
    }

    const unsubscribe = query
       .onSnapshot((snapshot: any) => {
         if (snapshot) {
            const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            setPosts(list);
         }
         setLoading(false);
       }, (err: any) => {
         console.error('Error fetching filtered posts:', err);
         setLoading(false);
       });

    const uid = auth().currentUser?.uid;
    let unsubFollow = () => {};
    if (uid) {
      unsubFollow = firestore()
        .collection('followers')
        .where('followerUid', '==', uid)
        .onSnapshot(snap => {
          const list = snap.docs.map(doc => doc.data().followedUid);
          setFollowingList(list);
        }, err => console.error('Error following:', err));
    }

    return () => {
      unsubscribe();
      unsubFollow();
    };
  }, []);


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
        });

      await firestore()
        .collection('posts')
        .doc(activePost.id)
        .update({
          commentsCount: firestore.FieldValue.increment(1),
        });

      // Notify Post Creator
      if (activePost.userId !== uid) {
        await firestore().collection('notifications').add({
          type: 'comment',
          actorUid: uid,
          actorUsername: userData?.username || 'user',
          targetUid: activePost.userId,
          postId: activePost.id,
          commentText: commentText.trim(),
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      setCommentText('');
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
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle={Colors.background === '#F4F4F5' ? 'dark-content' : 'light-content'} />
      
      {/* Top Navbar Navbar with Safe Area Support */}
      <View style={[styles.navbar, { paddingTop: insets.top + 10, height: 60 + insets.top, backgroundColor: Colors.surface, borderBottomColor: Colors.border }]}>
        <Text style={[styles.navTitle, { color: Colors.text }]}>HERE</Text>
      </View>


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
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 }}>
              <Text style={{ color: Colors.textMuted, fontSize: 14 }}>No posts found. Start sharing what matters!</Text>
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
                <Text style={styles.commentTitle}>Comments ({comments.length})</Text>
                <TouchableOpacity onPress={() => setIsCommentOpen(false)}>
                  <X size={18} color="#E4E4E7" />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
                {comments.length === 0 ? (
                  <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                ) : (
                  comments.map((item: any) => (
                    <View key={item.id} style={styles.commentItem}>
                      <Text style={styles.commentUser}>@{item.username}</Text>
                      <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Input Row */}
              <View style={[styles.commentInputRow, { paddingBottom: insets.bottom + 12 }]}>
                <TextInput
                  placeholder="Add a comment..."
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
    backgroundColor: '#070708',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0c0c12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16161E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
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
    backgroundColor: '#101015',
    marginBottom: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  communityName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  optionsBtn: {
    padding: 4,
  },
  caption: {
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
    backgroundColor: '#16161E',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(255, 69, 0, 0.08)',
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  actionText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },
  followText: {
    color: '#3863FA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  commentSheet: {
    height: '65%',
    backgroundColor: '#101015',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  commentTitle: {
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    backgroundColor: '#0c0c12',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#16161E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sendBtn: {
    marginLeft: 12,
    padding: 8,
  },
  noComments: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});
