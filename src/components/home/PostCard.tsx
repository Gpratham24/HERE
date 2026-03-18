import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react-native';
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

interface PostCardProps {
  item: any;
  userData: any;
  followingList: string[];
  onFollow: (targetUid: string) => void;
  onCommentPress: () => void;
  onProfilePress: (userId: string) => void;
}

export default function PostCard({
  item,
  userData,
  followingList,
  onFollow,
  onCommentPress,
  onProfilePress,
}: PostCardProps) {
  const { Colors } = useTheme();
  const uid = auth().currentUser?.uid;
  const likedBy = item.likedBy || [];
  const isLikedInitial = uid ? likedBy.includes(uid) : false;
  const likesCountInitial = item.likesCount !== undefined ? item.likesCount : (item.likes || 0);

  // 🚀 Local States for Optimistic UI & Debounced Toggle
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likesCount, setLikesCount] = useState(likesCountInitial);
  const timeoutRef = useRef<any>(null);

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

  return (
    <View style={[styles.card, { backgroundColor: Colors.surface, borderBottomColor: Colors.border }]}>
      {/* Header: Community & User info */}
      <TouchableOpacity 
        style={styles.cardHeader}
        activeOpacity={0.8}
        onPress={() => item.userId && onProfilePress(item.userId)}
      >
        <AvatarImage userId={item.userId} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.communityName, { color: Colors.text }]}>c/{item.communityName || item.community || 'OpenAudience'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.username, { color: Colors.textMuted || '#A1A1AA' }]}>u/{item.username || 'user'}</Text>
            {uid && item.userId && uid !== item.userId && (
              <TouchableOpacity onPress={() => onFollow(item.userId)}>
                <Text style={[styles.followText, followingList.includes(item.userId) && { color: '#8E8E93' }]}>
                  • {followingList.includes(item.userId) ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.optionsBtn}>
          <MoreHorizontal size={20} color={Colors.textMuted || '#A1A1AA'} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Post Body: Double Tap to Like */}
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View>
          {/* Caption */}
          {item.content || item.caption ? (
            <Text style={[styles.caption, { color: Colors.text === '#ffffff' ? '#E4E4E7' : Colors.text }]}>
              {item.content || item.caption}
            </Text>
          ) : null}

          {/* Media Frame */}
          {item.mediaUrl || item.media ? (
            <Image source={{ uri: item.mediaUrl || item.media }} style={styles.postMedia} resizeMode="cover" />
          ) : null}
        </View>
      </TouchableWithoutFeedback>

      {/* Action Bar: Upvote, Comment, Share */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: Colors.surface === '#ffffff' ? '#F4F4F5' : '#16161E', borderColor: Colors.border }, isLiked && styles.actionBtnActive]} 
          onPress={handleLikeToggle}
          activeOpacity={0.7}
        >
          <Heart size={18} color={isLiked ? '#ff4500' : '#A1A1AA'} fill={isLiked ? '#ff4500' : 'transparent'} />
          <Text style={[styles.actionText, isLiked && { color: '#ff4500' }]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={onCommentPress}>
          <MessageCircle size={18} color="#A1A1AA" />
          <Text style={styles.actionText}>{item.commentsCount !== undefined ? item.commentsCount : (item.comments || 0)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Share2 size={18} color="#A1A1AA" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
