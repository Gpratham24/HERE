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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings, 
  Share2, 
  Grid, 
  MessageSquare, 
  Bookmark, 
  Users, 
  ChevronRight, 
  LogOut, 
  Plus, 
  X, 
  ArrowLeft, 
  Heart 
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes } from '../theme/Theme';
import EditProfileScreen from './EditProfileScreen';
import SettingsScreen from './SettingsScreen';
import { ProfileStats } from '../components/profile/ProfileStats';
import { UsersListModal } from '../components/profile/UsersListModal';
import { useAuth } from '../context/AuthContext';
import CommunityViewScreen from './CommunityViewScreen';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  userId?: string;
  onClose?: () => void;
}

export default function ProfileScreen({ userId, onClose }: ProfileScreenProps) {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userData: myData } = useAuth();
  const currentUid = auth().currentUser?.uid;
  const uid = userId || currentUid;
  const isMe = uid === currentUid;

  const { userData: contextUserData } = useAuth();
  const [localUserData, setLocalUserData] = useState<any>(null);
  const userData = isMe ? contextUserData : localUserData;

  const setUserData = setLocalUserData; // Keep name alias if needed elsewhere
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'saved' | 'communities'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [newBio, setNewBio] = useState('');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [commentError, setCommentError] = useState(false);
  const [followersLiveCount, setFollowersLiveCount] = useState(0);
  const [followingLiveCount, setFollowingLiveCount] = useState(0);
  const [isUsersListOpen, setIsUsersListOpen] = useState(false);
  const [userListTitle, setUserListTitle] = useState('Followers');
  const [usersList, setUsersList] = useState<any[]>([]);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityPostsLoading, setCommunityPostsLoading] = useState(false);
  const [createdCommunities, setCreatedCommunities] = useState<string[]>([]);

  const handleOpenCommunity = (name: string) => {
     setSelectedCommunity(name);
     setCommunityPostsLoading(true);
     firestore()
       .collection('posts')
       .where('communityName', '==', name)
       .get()
       .then(snap => {
          if (snap) {
             const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             list.sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0));
             setCommunityPosts(list);
          }
          setCommunityPostsLoading(false);
       })
       .catch(err => {
          console.error(err);
          setCommunityPostsLoading(false);
       });
  };

  const handleToggleFollow = async () => {

    if (!currentUid || !uid) return;
    try {
      const batch = firestore().batch();
      const myRef = firestore().collection('users').doc(currentUid);
      const targetRef = firestore().collection('users').doc(uid);

      if (isFollowing) {
         const snap = await firestore()
           .collection('followers')
           .where('followerUid', '==', currentUid)
           .where('followedUid', '==', uid)
           .get();
         snap.docs.forEach(doc => batch.delete(doc.ref));

         batch.update(myRef, { followingCount: firestore.FieldValue.increment(-1) });
         batch.update(targetRef, { followersCount: firestore.FieldValue.increment(-1) });
      } else {
         const followerRef = firestore().collection('followers').doc();
         batch.set(followerRef, {
           followerUid: currentUid,
           followedUid: uid,
         });

         batch.update(myRef, { followingCount: firestore.FieldValue.increment(1) });
         batch.update(targetRef, { followersCount: firestore.FieldValue.increment(1) });

         const notifRef = firestore().collection('notifications').doc();
         batch.set(notifRef, {
           type: 'follow',
           actorUid: currentUid,
           actorUsername: myData?.username || 'user',
           targetUid: uid,
           createdAt: firestore.FieldValue.serverTimestamp(),
         });
      }
      await batch.commit();
    } catch (e) { console.error('Error toggle follow:', e); }
  };

  const handleShowList = async (type: 'followers' | 'following') => {
     if (!isMe) return; 
     try {
       const matchField = type === 'followers' ? 'followedUid' : 'followerUid';
       console.log('Fetching list for type:', type, 'matchField:', matchField, 'uid:', uid);

       const snap = await firestore()
         .collection('followers')
         .where(matchField, '==', uid)
         .get();
       
       console.log('Snap docs length:', snap.docs.length);
       const users = [];
       for (const doc of snap.docs) {
          const data = doc.data();
          const targetId = type === 'followers' ? data.followerUid : data.followedUid;
          console.log('Mapping targetId:', targetId, 'from doc data:', data);

          const userDoc = await firestore().collection('users').doc(targetId).get();
          console.log('User doc exists:', userDoc.exists(), 'for ID:', targetId);

          if (userDoc.exists()) {
             users.push({ id: targetId, ...userDoc.data() });
          } else {
             // Fallback for mock/deleted users
             users.push({ id: targetId, username: 'user_' + targetId.substring(0, 5) });
          }
       }
       console.log('Final Users list:', users);
       setUsersList(users);
       setUserListTitle(type === 'followers' ? 'Followers' : 'Following');
       setIsUsersListOpen(true);
     } catch (e) { console.error('Error list:', e); }
  };

  const handlePickImage = () => {


    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) return;
      if (res.assets && res.assets.length > 0) {
        setNewAvatarUri(res.assets[0].uri || null);
      }
    });
  };

  useEffect(() => {
    if (!uid) return;

    // A. Fetch Created Communities for Owners badges
    firestore()
       .collection('communities')
       .where('createdBy', '==', uid)
       .get()
       .then(snap => {
          if (snap) setCreatedCommunities(snap.docs.map(doc => doc.data().name));
       });

    if (isMe) return; // AuthContext handles fetching isMe automatically without flicker!
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(doc => {
        if (doc && doc.exists()) {
           const data = doc.data();
           setUserData(data);
           
           // 🧹 Temporary Cleanup logic to remove duplicate testing items
           if (data && data.joinedCommunities) {
              const list = data.joinedCommunities;
              if (list.some((c: string) => c.toLowerCase().includes('community') || c === 'ai-builders')) {
                 firestore().collection('users').doc(uid).update({ joinedCommunities: ['AI Builders'] });
              }
           }
        }
      });

    // Check Following status
    let unsubscribeFollow = () => {};
    if (!isMe && currentUid) {
      unsubscribeFollow = firestore()
        .collection('followers')
        .where('followerUid', '==', currentUid)
        .where('followedUid', '==', uid)
        .onSnapshot(snap => {
          setIsFollowing(!snap.empty);
        });
    }

    return () => {
      unsubscribe();
      unsubscribeFollow();
    };
  }, [uid, isMe, currentUid]);

  useEffect(() => {
    if (!uid) return;
    const unsubFollowers = firestore()
      .collection('followers')
      .where('followedUid', '==', uid)
      .onSnapshot(snap => {
         setFollowersLiveCount(snap.size);
      }, err => console.log('Followers listen denied (Check Firebase Rules):', err.message));
    
    const unsubFollowing = firestore()
      .collection('followers')
      .where('followerUid', '==', uid)
      .onSnapshot(snap => {
         setFollowingLiveCount(snap.size);
      }, err => console.log('Following listen denied (Check Firebase Rules):', err.message));

    return () => {
      unsubFollowers();
      unsubFollowing();
    };
  }, [uid]);

  useEffect(() => {
    if (uid) {

      // Fetch User Posts Live

      const unsubscribePosts = firestore()
        .collection('posts')
        .where('userId', '==', uid)
        .onSnapshot(snapshot => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserPosts(list);
        }, err => console.log('Posts listen denied (Check Firebase Rules):', err.message));

      // Fetch User Comments across posts (Iterative Workaround to Bypass Index Error)
      const fetchComments = async () => {
        try {
          const postsSnap = await firestore().collection('posts').get();
          const allComments: any[] = [];
          
          await Promise.all(
            postsSnap.docs.map(async postDoc => {
              const commentsSnap = await postDoc.ref
                .collection('comments')
                .where('userId', '==', uid)
                .get();
                
              commentsSnap.docs.forEach(cDoc => {
                allComments.push({
                  id: cDoc.id,
                  ...cDoc.data(),
                  parentPost: postDoc.data(),
                });
              });
            })
          );

          // Sort client-side
          allComments.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds || 0;
            const tB = b.createdAt?.seconds || 0;
            return tB - tA;
          });

          setUserComments(allComments);
          setCommentError(false);
        } catch (e) {
          console.error('Error comments loop:', e);
          setCommentError(true);
        }
      };

      fetchComments();

      return () => {
        unsubscribePosts();
      };

    }
  }, [uid]);



  const handleLogout = () => {
    auth().signOut();
  };

  const renderTabContent = () => {
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
                style={styles.gridItem} 
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedPost(post);
                  setIsPostDetailOpen(true);
                }}
              >
                {post.mediaUrl || post.media ? (
                  <Image source={{ uri: post.mediaUrl || post.media }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridImage, { backgroundColor: '#1C1C24', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#A1A1AA', fontSize: 12 }}>Text Post</Text>
                  </View>
                )}
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridText} numberOfLines={1}>c/{post.communityName || post.community}</Text>
                </View>
              </TouchableOpacity>
            ))}

          </View>
        );
      case 'comments':
        if (userComments.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>💬 No comments made yet.</Text>
            </View>
          );
        }
        return (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {userComments.map(comment => (
              <TouchableOpacity key={comment.id} style={styles.listCard} activeOpacity={0.8}>
                <View style={[styles.listIcon, { backgroundColor: 'rgba(56, 99, 250, 0.12)' }]}>
                  <MessageSquare size={16} color="#3863FA" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.listCardName} numberOfLines={1}>{comment.text}</Text>
                  {comment.parentPost && (
                    <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 4 }}>
                      On post in c/{comment.parentPost.communityName || 'Community'}
                    </Text>
                  ) || (
                    <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 4 }}>
                      On a post
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );


      case 'saved':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🔖 No saved posts yet.</Text>
            <Text style={{ color: '#A1A1AA', fontSize: 11, marginTop: 4 }}>Posts you bookmark will appear here.</Text>
          </View>
        );
      case 'communities':

        const joined = userData?.joinedCommunities || [];
        if (joined.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No communities joined yet.</Text>
            </View>
          );
        }

        const mapIdToName = (id: string) => {
           const dict: Record<string, string> = {
             '1': 'AI Builders', '2': 'Startup Founders', '3': 'Coding Tips', '4': 'Fitness Club', '5': 'Memes Hub'
           };
           if (dict[id]) return dict[id];
           if (!isNaN(Number(id))) return 'Community ' + id;
           return id; // Fallback directly for names e.g. "AI Builders"
        };

        return (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {joined.map((id: string, index: number) => {
              // Standard text name from hardcoded maps inside dict
              const cName = mapIdToName(id);
              const isOwner = createdCommunities.some(c => c.toLowerCase() === cName.toLowerCase());
              return (
              <TouchableOpacity 
                key={id} 
                style={styles.listCard} 
                activeOpacity={0.8}
                onPress={() => handleOpenCommunity(cName)}
              >
                <View style={[styles.listIcon, { backgroundColor: isOwner ? '#F59E0B' : index % 2 === 0 ? '#3863FA' : '#10B981' }]}>
                   <Text style={{ color: '#fff', fontWeight: 'bold' }}>{cName[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.listCardName}>{cName}</Text>
                  <Text style={{ color: isOwner ? '#FCD34D' : Colors.textMuted, fontSize: 12 }}>
                     {isOwner ? '👑 Owner Admin' : 'Joined Member'}
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )})}
          </View>
        );
      default:
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items to show yet.</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle={Colors.background === '#F4F4F5' ? 'dark-content' : 'light-content'} translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Cover Photo Container */}
        <View style={styles.coverPhotoContainer}>
          <Image 
            source={{ uri: userData?.coverPhotoURL || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80' }} 
            style={styles.coverPhoto} 
          />
          {/* Top Buttons Overlay */}
          <View style={[styles.headerToolbarOverlay, { paddingTop: insets.top + 12 }]}>
            {onClose && (
              <TouchableOpacity style={[styles.headerIconBtn, { left: 16, position: 'absolute' }]} onPress={onClose}>
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

        {/* Profile Info framing */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: userData?.photoURL || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&q=80' }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.userName}>@{userData?.username || 'user'}</Text>
          <Text style={styles.bio}>{userData?.bio || "Building cool things 🚀"}</Text>
          
          {/* Stats Bar Component */}
          <ProfileStats 
            followersCount={followersLiveCount}
            followingCount={followingLiveCount}
            joinedCommunitiesCount={userData?.joinedCommunities?.length || 0}
            isMe={isMe}
            onShowFollowers={() => handleShowList('followers')}
            onShowFollowing={() => handleShowList('following')}
          />




          {/* Action Buttons row */}
          <View style={styles.actionRow}>
            {isMe ? (
              <TouchableOpacity 
                style={styles.editBtn} 
                activeOpacity={0.8}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.editBtn, isFollowing && { backgroundColor: '#1C1C24', borderColor: 'rgba(255,255,255,0.08)' }]} 
                activeOpacity={0.8}
                onPress={() => handleToggleFollow()}
              >
                <Text style={styles.editBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
              <Share2 size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

        </View>

        {/* Segmented Tab Header */}
        <View style={styles.tabHeader}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]} 
            onPress={() => setActiveTab('posts')}
          >
            <Grid size={18} color={activeTab === 'posts' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'comments' && styles.tabItemActive]} 
            onPress={() => setActiveTab('comments')}
          >
            <MessageSquare size={18} color={activeTab === 'comments' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]} 
            onPress={() => setActiveTab('saved')}
          >
            <Bookmark size={18} color={activeTab === 'saved' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'communities' && styles.tabItemActive]} 
            onPress={() => setActiveTab('communities')}
          >
            <Users size={18} color={activeTab === 'communities' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
        </View>

        {/* Tab Body list elements */}
        {renderTabContent()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Post Detail Modal */}
      <Modal visible={isPostDetailOpen} transparent animationType="slide" onRequestClose={() => setIsPostDetailOpen(false)}>
        <View style={styles.modalOverlay}>
            {selectedPost && (
              <View style={styles.postDetailContainer}>
                 {/* Header layout */}
                 <View style={styles.postDetailHeader}>
                    <Text style={styles.postDetailTitle}>c/{selectedPost.communityName || selectedPost.community}</Text>
                    <TouchableOpacity onPress={() => setIsPostDetailOpen(false)}>
                       <X size={20} color="#ffffff"/>
                    </TouchableOpacity>
                 </View>
                 
                 {/* Modal scroll Content */}
                 <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {selectedPost.content && (
                      <Text style={styles.postDetailContent}>{selectedPost.content}</Text>
                    )}
                    {(selectedPost.mediaUrl || selectedPost.media) && (
                       <Image source={{uri: selectedPost.mediaUrl || selectedPost.media}} style={styles.postDetailImage} />
                    )}
                 </ScrollView>
              </View>
            )}
        </View>
      </Modal>

      {/* Full Screen Edit Modal */}

      <Modal visible={isEditing} transparent={false} animationType="slide">
        <EditProfileScreen 
          userData={userData} 
          onClose={() => setIsEditing(false)} 
          onSave={async (updatedData) => {
            const uid = auth().currentUser?.uid;
            if (uid) {
              await firestore().collection('users').doc(uid).set(updatedData, { merge: true });
            }
          }} 
        />
      </Modal>

      {/* Users List Modal for Followers/Following */}
      <UsersListModal 
         visible={isUsersListOpen}
         title={userListTitle}
         users={usersList}
         onClose={() => setIsUsersListOpen(false)}
      />

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} transparent={false} animationType="slide" onRequestClose={() => setIsSettingsOpen(false)}>
         <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
      </Modal>

      {/* 🏙 Community Feed Modal */}
      <Modal visible={!!selectedCommunity} transparent={false} animationType="slide" onRequestClose={() => setSelectedCommunity(null)}>
         <CommunityViewScreen 
            communityName={selectedCommunity || ''} 
            onClose={() => setSelectedCommunity(null)} 
         />
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070708',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  headerToolbarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  headerIconBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  coverPhotoContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#16161E',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    paddingHorizontal: 24,
    marginTop: -45, // Overlap cover photo
    zIndex: 1,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#070708',
    marginBottom: 12,
    alignSelf: 'flex-start', // Align to left like LinkedIn or center? User wants just like inkdein
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  bio: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 18,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#101015',
    paddingVertical: 14,
    borderRadius: Sizes.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 4,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 30,
  },
  editBtn: {
    flex: 1,
    height: 42,
    backgroundColor: Colors.primary,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#16161E',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  gridItem: {
    width: width / 2 - 4,
    height: width / 2 - 4,
    margin: 2,
    backgroundColor: '#16161E',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  gridText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101015',
    padding: 12,
    borderRadius: Sizes.radiusMd,
    marginBottom: 10,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#101015',
    borderRadius: Sizes.radiusMd,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#16161E',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
    borderColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    marginBottom: 20,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    height: 45,
    backgroundColor: '#1C1C24',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSave: {
    flex: 1,
    height: 45,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postDetailContainer: {
    backgroundColor: '#101015',
    borderRadius: Sizes.radiusMd,
    maxHeight: '80%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  postDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  postDetailTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postDetailContent: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postDetailImage: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#16161E',
  },
});
