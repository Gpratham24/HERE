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
  BackHandler,
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
  
  const [viewUid, setViewUid] = useState(userId || currentUid);
  const uid = viewUid;
  const isMe = uid === currentUid;

  useEffect(() => {
    setViewUid(userId || currentUid);
  }, [userId, currentUid]);

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
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
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
  const [uidHistory, setUidHistory] = useState<string[]>([userId || currentUid]);
  const [countersLoaded, setCountersLoaded] = useState({ doc: false, followers: false, following: false, posts: false });
  const [gridColumns, setGridColumns] = useState<number>(3);

  useEffect(() => {
     if (isMe && myData?.gridPreference) {
        setGridColumns(myData.gridPreference);
     }
  }, [myData?.gridPreference, isMe]);

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

  const handleOpenUserProfile = (targetUid: string) => {
     if (targetUid === uid) {
        setIsUsersListOpen(false);
        return;
     }

     setUserPosts([]);
     setUserComments([]);
     setLocalUserData(null);
     setIsFollowing(false);
     setFollowersLiveCount(0);
     setFollowingLiveCount(0);
     setCountersLoaded({ doc: false, followers: false, following: false, posts: false });

     setViewUid(targetUid);
     setUidHistory(prev => [...prev, targetUid]);
     setIsUsersListOpen(false);
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

    // 🔔 Profile Visit Notification Setup triggers
    if (currentUid && uid !== currentUid) {
         firestore().collection('notifications').add({
            type: 'profile_visit',
            actorUid: currentUid,
            actorUsername: myData?.username || 'user',
            targetUid: uid,
            createdAt: firestore.FieldValue.serverTimestamp()
         }).catch(() => {});
    }

    if (isMe) return; // AuthContext handles fetching isMe automatically without flicker!
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(doc => {
        if (doc && doc.exists()) {
           const data = doc.data();
           setUserData(data);

           if (data?.gridPreference) {
              setGridColumns(data.gridPreference);
           }
           
           // 🧹 Temporary Cleanup logic to remove duplicate testing items
           if (data && data.joinedCommunities) {
              const list = data.joinedCommunities;
              if (list.some((c: string) => c.toLowerCase().includes('community') || c === 'ai-builders')) {
                 firestore().collection('users').doc(uid).update({ joinedCommunities: ['AI Builders'] });
              }
            }
         }
         setCountersLoaded(prev => ({ ...prev, doc: true }));
      }, err => {
         console.log('User load error:', err);
         setCountersLoaded(prev => ({ ...prev, doc: true }));
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
        }, err => console.log('Follow Check Denied:', err));
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
         setCountersLoaded(prev => ({ ...prev, followers: true }));
      }, err => {
         console.log('Followers listen denied:', err.message);
         setCountersLoaded(prev => ({ ...prev, followers: true }));
      });
        const unsubFollowing = firestore()
      .collection('followers')
      .where('followerUid', '==', uid)
      .onSnapshot(snap => {
         setFollowingLiveCount(snap.size);
         setCountersLoaded(prev => ({ ...prev, following: true }));
      }, err => {
         console.log('Following listen denied (Check Firebase Rules):', err.message);
         setCountersLoaded(prev => ({ ...prev, following: true }));
      });

    return () => {
      unsubFollowers();
      unsubFollowing();
    };
  }, [uid]);

  useEffect(() => {
    if (uid) {

      // Fetch User Posts Live

      const unsubPosts = firestore()
      .collection('posts')
      .where('userId', '==', uid)
      .onSnapshot(snap => {
         if (snap) {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
            // 🔃 Sort client-side safely without crashing index dependencies
            list.sort((a: any, b: any) => {
               const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
               const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
               return tB - tA;
            });

            // 🤝 Merge duplicate sub-posts into a single card triggers
            const grouped: any[] = [];
            list.forEach((p: any) => {
               const key = `${p.userId}_${p.createdAt?.seconds || p.createdAt?.seconds === undefined ? (p.createdAt?.toDate ? p.createdAt.toDate().getTime() : 0) : p.createdAt?.seconds}_${(p.content || '').substring(0,10)}`;
               const match = grouped.find(g => {
                  const gKey = `${g.userId}_${g.createdAt?.seconds || g.createdAt?.seconds === undefined ? (g.createdAt?.toDate ? g.createdAt.toDate().getTime() : 0) : g.createdAt?.seconds}_${(g.content || '').substring(0,10)}`;
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

            setUserPosts(grouped);
         }
         setCountersLoaded(prev => ({ ...prev, posts: true }));
      }, err => {
         console.log('Posts load error:', err);
         setCountersLoaded(prev => ({ ...prev, posts: true }));
      });

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
        unsubPosts();
      };

    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const savedIds = userData?.savedPosts || [];
    if (savedIds.length === 0) {
       setSavedPosts([]);
       return;
    }

    const queryIds = savedIds.slice(0, 10);
    const unsubscribeSaved = firestore()
       .collection('posts')
       .where(firestore.FieldPath.documentId(), 'in', queryIds)
       .onSnapshot(snapshot => {
          if (snapshot) {
             const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
             list.sort((a: any, b: any) => {
                const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return tB - tA;
             });
             setSavedPosts(list);
          }
       }, err => console.log('Saved Fetch Error:', err));

    return () => unsubscribeSaved();
  }, [userData?.savedPosts, uid]);

  useEffect(() => {
     const backAction = () => {
        if (isEditing) { setIsEditing(false); return true; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return true; }
        if (isUsersListOpen) { setIsUsersListOpen(false); return true; }
        if (isPostDetailOpen) { setIsPostDetailOpen(false); return true; }
        if (selectedCommunity) { setSelectedCommunity(null); return true; }
        
        if (uidHistory.length > 1) {
             const newHist = [...uidHistory];
             newHist.pop(); 
             const prevUid = newHist[newHist.length - 1];
             
             setUserPosts([]);
             setUserComments([]);
             setLocalUserData(null);
             setIsFollowing(false);
             setFollowersLiveCount(0);
             setFollowingLiveCount(0);
             
             setUidHistory(newHist);
             setViewUid(prevUid);
             return true;
        }
        
        if (onClose) { onClose(); return true; }
        return false;
     };

     const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
     return () => backHandler.remove();
  }, [isEditing, isSettingsOpen, isUsersListOpen, isPostDetailOpen, selectedCommunity, uidHistory, onClose]);



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
                style={[styles.gridItem, { width: (width - 4 * (gridColumns + 1)) / gridColumns, height: (width - 4 * (gridColumns + 1)) / gridColumns }]} 
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedPost(post);
                  setIsPostDetailOpen(true);
                }}
              >
                {post.mediaUrl || post.media ? (
                  <Image source={{ uri: post.mediaUrl || post.media }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridImage, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Text Post</Text>
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
        if (savedPosts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>🔖 No saved posts yet.</Text>
              <Text style={{ color: '#A1A1AA', fontSize: 11, marginTop: 4 }}>Posts you bookmark will appear here.</Text>
            </View>
          );
        }
        return (
          <View style={styles.gridList}>
            {savedPosts.map(post => (
              <TouchableOpacity 
                key={post.id} 
                style={[styles.gridItem, { width: (width - 4 * (gridColumns + 1)) / gridColumns, height: (width - 4 * (gridColumns + 1)) / gridColumns }]} 
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedPost(post);
                  setIsPostDetailOpen(true);
                }}
              >
                {post.mediaUrl || post.media ? (
                  <Image source={{ uri: post.mediaUrl || post.media }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridImage, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Text Post</Text>
                  </View>
                )}
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridText} numberOfLines={1}>c/{post.communityName || post.community}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
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
          
          <Text style={{ color: '#64748B', fontSize: 11, fontStyle: 'italic', marginTop: 3, marginBottom: 8 }}>
             Joined {userData?.createdAt ? new Date(userData.createdAt.toDate ? userData.createdAt.toDate() : userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Join Date Loading'}
          </Text>
          
          {/* Stats Bar Component */}
          {(!isMe && !(countersLoaded.doc && countersLoaded.followers && countersLoaded.following && countersLoaded.posts)) ? (
            <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
               <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
          <ProfileStats 
            postsCount={userPosts.length}
            followersCount={followersLiveCount}
            followingCount={followingLiveCount}
            joinedCommunitiesCount={userData?.joinedCommunities?.length || 0}
            isMe={isMe}
            onShowFollowers={() => handleShowList('followers')}
            onShowFollowing={() => handleShowList('following')}
            visibilitySettings={userData?.visibilitySettings}
          />
          )}




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
              <Share2 size={18} color="#0F172A" />
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

          {(isMe || userData?.visibilitySettings?.showSaved !== false) && (
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]} 
            onPress={() => setActiveTab('saved')}
          >
            <Bookmark size={18} color={activeTab === 'saved' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'communities' && styles.tabItemActive]} 
            onPress={() => setActiveTab('communities')}
          >
            <Users size={18} color={activeTab === 'communities' ? Colors.primary : '#8E8E93'} />
          </TouchableOpacity>
        </View>

        {/* 🎛 Grid Columns Sizer Toggle (Only for feeds layout) */}
        {(activeTab === 'posts' || activeTab === 'saved') && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 10, gap: 6 }}>
             {[1, 2, 3, 4].map(num => (
                <TouchableOpacity 
                   key={num} 
                   onPress={() => {
                      setGridColumns(num);
                      if (isMe) {
                         firestore().collection('users').doc(currentUid).update({
                            gridPreference: num
                         }).catch(() => {});
                      }
                   }} 
                   style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: gridColumns === num ? Colors.primary : '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }}
                >
                   <Text style={{ fontSize: 11, color: gridColumns === num ? '#ffffff' : '#475569', fontWeight: '700' }}>{num}</Text>
                </TouchableOpacity>
             ))}
          </View>
        )}

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
                     <View style={{ flex: 1, marginRight: 16 }}>
                        <TouchableOpacity onPress={() => {
                           setIsPostDetailOpen(false);
                           setTimeout(() => {
                              setSelectedCommunity(selectedPost.communityName || selectedPost.community);
                           }, 300);
                        }}>
                           <Text style={styles.postDetailTitle}>
                              {selectedPost.communityNames && selectedPost.communityNames.length > 1
                                ? selectedPost.communityNames.map((c: string) => `c/${c}`).join(', ')
                                : `c/${selectedPost.communityName}`}
                           </Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
                           {selectedPost.createdAt ? new Date(selectedPost.createdAt.toDate ? selectedPost.createdAt.toDate() : selectedPost.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                        </Text>
                     </View>
                     <TouchableOpacity onPress={() => setIsPostDetailOpen(false)}>
                        <X size={20} color="#0F172A"/>
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
          onUserPress={handleOpenUserProfile}
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
    backgroundColor: '#F8FAFC',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  coverPhotoContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    paddingHorizontal: 24,
    marginTop: -45,
    zIndex: 1,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#F8FAFC',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  userName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  bio: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 18,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: Sizes.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 4,
  },
  statNumber: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
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
    backgroundColor: '#ffffff',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    width: (width - 12) / 3,
    height: (width - 12) / 3,
    margin: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  gridText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: Sizes.radiusMd,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: Sizes.radiusMd,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    borderColor: '#E2E8F0',
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
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#ffffff',
    borderRadius: Sizes.radiusMd,
    maxHeight: '80%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  postDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  postDetailTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postDetailContent: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postDetailImage: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#F1F5F9',
  },
});
