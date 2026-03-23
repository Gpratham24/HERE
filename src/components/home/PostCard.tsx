import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, ThumbsUp, Lightbulb, HelpCircle, MessageSquare } from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import { likePost } from '../../services/postService';

const { width } = Dimensions.get('window');
const avatarCache: Record<string, string> = {};

const AvatarImage = ({ userId, style }: { userId: string, style: any }) => {
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&q=80');

  useEffect(() => {
    if (!userId) return;
    if (avatarCache[userId]) {
      setAvatar(avatarCache[userId]);
      return;
    }
    const loadAvatar = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data?.photoURL) {
            avatarCache[userId] = data.photoURL;
            setAvatar(data.photoURL);
          }
        }
      } catch (e) { /* silent ignore fallback */ }
    };
    loadAvatar();
  }, [userId]);

  return <Image source={{ uri: avatar }} style={style} />;
};

const formatTime = (timestamp: any) => {
  if (!timestamp) return 'now';
  const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

interface PostCardProps {
  item: any;
  userData: any;
  followingList: string[];
  onFollow: (targetUid: string) => void;
  onCommentPress: () => void;
  onProfilePress: (userId: string) => void;
  onCommunityPress?: (name: string) => void;
}

export default function PostCard({
  item,
  userData,
  followingList,
  onFollow,
  onCommentPress,
  onProfilePress,
  onCommunityPress,
}: PostCardProps) {
  const { Colors } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const uid = auth().currentUser?.uid;
  const likedBy = item.likedBy || [];
  const isLikedInitial = uid ? likedBy.includes(uid) : false;
  const likesCountInitial = item.likesCount !== undefined ? item.likesCount : (item.likes || 0);

  // 🚀 Local States for Optimistic UI & Debounced Toggle
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likesCount, setLikesCount] = useState(likesCountInitial);
  const timeoutRef = useRef<any>(null);

  // Sync to Firestore push snapshots setup layout
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (userData?.savedPosts) {
      setIsSaved(userData.savedPosts.includes(item.id));
    }
  }, [userData?.savedPosts, item.id]);

  useEffect(() => {
    if (!uid || (!item.communityName && !item.community)) return;
    const cName = item.communityName || item.community;
    firestore().collection('communities').doc(cName.toLowerCase().replace(/ /g, '-')).get().then(snap => {
       if (snap.exists() && snap.data()?.createdBy === uid) {
          setIsAdmin(true);
       }
    });
  }, [item.communityName, item.community, uid]);

  const handleRejectPost = async () => {
     setShowOptions(false);
     try {
        await firestore().collection('posts').doc(item.id).delete();
     } catch (e) { console.error('Reject post failed:', e); }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const handleSaveToggle = async () => {
    if (!uid) return;
    const nextIsSaved = !isSaved;
    setIsSaved(nextIsSaved);

    const userRef = firestore().collection('users').doc(uid);
    try {
      if (nextIsSaved) {
        await userRef.update({ savedPosts: firestore.FieldValue.arrayUnion(item.id) });
        showToast('Saved to profile');
      } else {
        await userRef.update({ savedPosts: firestore.FieldValue.arrayRemove(item.id) });
        showToast('Removed from saves');
      }
    } catch (err) {
      setIsSaved(!nextIsSaved); // rollback
      console.error(err);
    }
  };

  // Sync to Firestore push snapshots setup layout
  useEffect(() => {
    setIsLiked(isLikedInitial);
    setLikesCount(likesCountInitial);
  }, [isLikedInitial, likesCountInitial]);

  const handleLikeToggle = () => {
    if (!uid) return;

    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev: number) => prev + (nextIsLiked ? 1 : -1));

    // Clear previous timer triggers continuous fast tapping continuous.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounce timer
    timeoutRef.current = setTimeout(async () => {
      if (nextIsLiked !== isLikedInitial) {
        try {
          // isLikedInitial is the snapshot state we started from during this burst
          await likePost(item.id, isLikedInitial, item.userId, userData?.username || 'user');
        } catch (err) {
          // Rollback local state on write failure
          setIsLiked(isLikedInitial);
          setLikesCount(likesCountInitial);
        }
      }
    }, 400); // 400ms is standard for rapid human inputs debounced
  };

  const lastTapRef = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleLikeToggle();
    }
    lastTapRef.current = now;
  };

  const [commentsPreview, setCommentsPreview] = useState<any[]>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [trueCommentCount, setTrueCommentCount] = useState(item.commentsCount !== undefined ? item.commentsCount : 0);

  useEffect(() => {
    if (!item.id) return;
    try {
      // Aggregate correct count excluding sub-thread replies directly inside snapshot trigger layouts 
      const countQuery = firestore()
        .collection('posts')
        .doc(item.id)
        .collection('comments')
        .where('parentId', '==', null)
        .count();

      countQuery.get().then(snap => {
        if (snap && snap.data) setTrueCommentCount(snap.data().count);
      }).catch(err => console.log('Aggregate counting skipped:', err));
    } catch (e) { /* silent skip */ }
  }, [item.id, item.commentsCount]);

  useEffect(() => {
    if (!item.id) return;
    const unsubscribe = firestore()
      .collection('posts')
      .doc(item.id)
      .collection('comments')
      .where('parentId', '==', null)
      .limit(2)
      .onSnapshot(snapshot => {
        if (snapshot) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCommentsPreview(list);
        }
      }, err => console.error('Error doc preview fetch:', err));
    return () => unsubscribe();
  }, [item.id]);

  return (
    <View style={{ marginHorizontal: 16, marginVertical: 8, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 }}>

      {/* Context Menu Options Popover */}
      {showOptions && (
        <View style={{ position: 'absolute', top: 42, right: 16, backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, zIndex: 110, width: 130 }}>
          <TouchableOpacity style={{ paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }} onPress={() => setShowOptions(false)}>
            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500' }}>Share Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 4 }} onPress={() => setShowOptions(false)}>
            <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '600' }}>Report</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={{ paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9' }} onPress={handleRejectPost}>
              <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '700' }}>Decline & Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Reaction Popover */}
      {showReactions && (
        <View style={{ position: 'absolute', top: -45, left: 16, backgroundColor: '#ffffff', flexDirection: 'row', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, gap: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 4, zIndex: 100 }}>
          <TouchableOpacity onPress={() => setShowReactions(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ThumbsUp size={16} color="#4ADE80" />
            <Text style={{ color: '#111111', fontSize: 12, fontWeight: '600' }}>Agree</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowReactions(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Lightbulb size={16} color="#FACC15" />
            <Text style={{ color: '#111111', fontSize: 12, fontWeight: '600' }}>Insightful</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowReactions(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <HelpCircle size={16} color="#60A5FA" />
            <Text style={{ color: '#111111', fontSize: 12, fontWeight: '600' }}>Question</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔹 Top Section (Fix hierarchy) */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onCommunityPress?.(item.communityNames && item.communityNames.length > 0 ? item.communityNames[0] : (item.communityName || 'OpenAudience'))} activeOpacity={0.7}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
              {item.communityNames && item.communityNames.length > 1
                ? item.communityNames.map((c: string) => `c/${c}`).join(', ')
                : `c/${item.communityName || 'HERE'}`} • {formatTime(item.createdAt)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 4 }} onPress={() => setShowOptions(!showOptions)}>
            <MoreHorizontal size={16} color="#6B6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2, fontWeight: '500' }}>
          Because you follow {item.communityName || 'this interest'}
        </Text>
      </View>

      {/* Post Body: Double Tap to Like */}
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={{ marginBottom: 12 }}>
          {/* Caption */}
          {item.content || item.caption ? (
            <Text style={{ fontSize: 14, color: '#111111', lineHeight: 21, marginBottom: 8 }}>
              {item.content || item.caption}
            </Text>
          ) : null}

          {/* Media Frame */}
          {item.mediaUrl || item.media ? (
            <View style={{ marginVertical: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#F5F5F7' }}>
              <Image source={{ uri: item.mediaUrl || item.media }} style={{ width: '100%', height: width * 0.58 }} resizeMode="cover" />
            </View>
          ) : null}

          {/* 🔹 Author Name & Avatar row */}
          <TouchableOpacity
            onPress={() => onProfilePress(item.userId)}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
          >
            <AvatarImage
              userId={item.userId}
              style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#F1F5F9' }}
            />
            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>@{item.username || 'user'}</Text>
          </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>

      {/* 💬 Discussion Preview (Inline Thread setup) */}
      {commentsPreview.length > 0 && (
        <TouchableOpacity style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 }} onPress={onCommentPress} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <MessageCircle size={14} color="#8B5CF6" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A202C' }}>{trueCommentCount} discussions</Text>
          </View>
          <View style={{ borderLeftWidth: 2, borderLeftColor: '#E2E8F0', paddingLeft: 12, gap: 4 }}>
            {commentsPreview.map((comment: any) => (
              <View key={comment.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#4A5568', fontSize: 12, fontWeight: '700' }}>@{comment.username}: </Text>
                <Text style={{ color: '#718096', fontSize: 12, flex: 1 }} numberOfLines={1}>
                  {comment.text}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* 💖 Action Bar consistent CTAs */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 16 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          onPress={handleLikeToggle}
          onLongPress={() => setShowReactions(!showReactions)}
        >
          <Heart size={18} color={isLiked ? '#8B5CF6' : '#444444'} fill={isLiked ? '#8B5CF6' : 'none'} />
          <Text style={{ color: isLiked ? '#8B5CF6' : '#444444', fontSize: 12, fontWeight: '600' }}>Appreciate {likesCount > 0 ? `(${likesCount})` : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={onCommentPress}>
          <MessageSquare size={18} color="#444444" />
          <Text style={{ color: '#444444', fontSize: 12, fontWeight: '600' }}>Discuss</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={handleSaveToggle}>
          <Bookmark size={18} color={isSaved ? '#8B5CF6' : '#444444'} fill={isSaved ? '#8B5CF6' : 'none'} />
          <Text style={{ color: isSaved ? '#8B5CF6' : '#444444', fontSize: 12, fontWeight: '600' }}>{isSaved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Animated Toast Feedback */}
      <Animated.View style={{ position: 'absolute', bottom: 30, left: 32, right: 32, backgroundColor: 'rgba(15, 23, 42, 0.92)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, alignItems: 'center', opacity: toastOpacity, zIndex: 500, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 }} pointerEvents="none">
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>{toastMsg}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  reactionPopover: {
    position: 'absolute',
    top: -45,
    left: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 100,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  communityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  communityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  optionsBtn: {
    padding: 4,
  },
  whyText: {
    fontSize: 11,
    marginBottom: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  contentContainer: {
    marginBottom: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  postMedia: {
    width: '100%',
    height: width * 0.65,
    backgroundColor: '#F1F5F9',
  },
  authorTag: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  discussionSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  discussionCount: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  discussionItem: {
    flexDirection: 'row',
    marginTop: 4,
  },
  discussionUser: {
    fontSize: 12,
    fontWeight: '700',
  },
  discussionText: {
    flex: 1,
    fontSize: 12,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  followText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '700',
  },
});
