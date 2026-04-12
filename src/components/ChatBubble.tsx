import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Shadows } from '../theme/Theme';
import { Check, CheckCheck } from 'lucide-react-native';

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isMe: boolean;
  username?: string;
  avatarUrl?: string;
  status?: 'sending' | 'delivered' | 'seen';
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  content,
  timestamp,
  isMe,
  username,
  avatarUrl,
  status = 'delivered',
}) => {
  return (
    <View
      style={[
        styles.wrapper,
        isMe ? styles.myWrapper : styles.theirWrapper,
      ]}
    >
      {!isMe && (
        <Image
          source={{
            uri:
              avatarUrl ||
              `https://ui-avatars.com/api/?name=${username}&background=6366F1&color=fff`,
          }}
          style={styles.avatar}
        />
      )}
      <View style={styles.bubbleCol}>
        {!isMe && <Text style={styles.senderName}>{username}</Text>}
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {content}
          </Text>
          <View style={styles.footer}>
            <Text
              style={[
                styles.timeText,
                isMe ? styles.myTimeText : styles.theirTimeText,
              ]}
            >
              {new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isMe && (
              <View style={styles.statusIcon}>
                {status === 'seen' ? (
                  <CheckCheck size={12} color="#93C5FD" strokeWidth={3} />
                ) : (
                  <Check size={12} color="#E0E7FF" strokeWidth={3} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  theirWrapper: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 4,
    backgroundColor: '#F1F5F9',
  },
  bubbleCol: {
    marginHorizontal: 8,
    flexShrink: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...Shadows.soft,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#1E293B',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  myTimeText: {
    color: '#E0E7FF',
  },
  theirTimeText: {
    color: '#94A3B8',
  },
  statusIcon: {
    marginLeft: 4,
  },
});
