import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Colors, Shadows, Sizes } from '../theme/Theme';
import { Post, Reaction } from '../store/circleStore';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Smile,
  Send,
  Trash2,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCircleStore } from '../store/circleStore';
import { Alert } from 'react-native';

interface PostCardProps {
  post: Post;
  authorName: string;
  authorAvatar?: string;
  onReact: (postId: string, emoji: string) => void;
  onComment?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = React.memo(({
  post,
  authorName,
  authorAvatar,
  onReact,
  onComment,
}) => {
  const { userData } = useAuth();
  const deletePost = useCircleStore(state => state.deletePost);
  const isOwner = userData?.id === post.user_id;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${authorName} shared a moment on Circlo: ${post.caption || ''}`,
        url: post.content_url,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete post');
            }
          }
        },
      ]
    );
  };

  const reactionEmojis = ['❤️', '🔥', '👍', '😂', '👀'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.authorText}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.timeText}>
              {new Date(post.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        
        {isOwner && (
          <TouchableOpacity onPress={handleDelete}>
            <MoreHorizontal size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        {post.content_url ? (
          <Image
            source={{ uri: post.content_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.textModePlaceholder}>
            <Text style={styles.textModePlaceholderText}>{post.caption}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {post.caption && (
          <Text style={styles.caption}>
            <Text style={styles.captionAuthor}>{authorName} </Text>
            {post.caption}
          </Text>
        )}

        <View style={styles.actionsBar}>
          <View style={styles.reactionsRow}>
            {reactionEmojis.map(emoji => {
              // Count reactions of this type
              const count =
                post.reactions?.filter(r => r.emoji === emoji).length || 0;
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.reactionButton,
                    count > 0 && styles.activeReaction,
                  ]}
                  onPress={() => onReact(post.id, emoji)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  {count > 0 && (
                    <Text style={styles.reactionCount}>{count}</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity 
              style={styles.commentButton}
              onPress={() => onComment && onComment(post.id)}
            >
              <MessageCircle size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.shareIcon}>
            <Send size={18} color={Colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMd,
    marginBottom: 16,
    marginHorizontal: 16,
    ...Shadows.soft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  authorText: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  contentContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.softBg,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  textModePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  textModePlaceholderText: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  captionAuthor: {
    fontWeight: '700',
    color: Colors.text,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.softBg,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  activeReaction: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#C7D2FE',
    borderWidth: 0.5,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },
  commentButton: {
    padding: 4,
    marginLeft: 8,
  },
  shareIcon: {
    padding: 4,
  },
});
