import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../../theme/Theme';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  joinedCommunitiesCount: number;
  isMe: boolean;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  visibilitySettings?: any;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  postsCount,
  followersCount,
  followingCount,
  joinedCommunitiesCount,
  isMe,
  onShowFollowers,
  onShowFollowing,
  visibilitySettings,
}) => {
  const settings = visibilitySettings || {};
  const showPosts = isMe || settings.showPosts !== false;
  const showFollowers = isMe || settings.showFollowers !== false;
  const showFollowing = isMe || settings.showFollowing !== false;
  const showCommunities = isMe || settings.showCommunities !== false;

  const items: React.ReactNode[] = [];

  if (showPosts) {
    items.push(
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{postsCount}</Text>
        <Text style={styles.statLabel}>POSTS</Text>
      </View>
    );
  }

  if (showFollowers) {
    items.push(
      <TouchableOpacity 
        style={styles.statItem}
        disabled={!isMe}
        onPress={onShowFollowers}
      >
        <Text style={styles.statNumber}>{followersCount}</Text>
        <Text style={styles.statLabel}>FOLLOWERS</Text>
      </TouchableOpacity>
    );
  }

  if (showFollowing) {
    items.push(
      <TouchableOpacity 
        style={styles.statItem}
        disabled={!isMe}
        onPress={onShowFollowing}
      >
        <Text style={styles.statNumber}>{followingCount}</Text>
        <Text style={styles.statLabel}>FOLLOWING</Text>
      </TouchableOpacity>
    );
  }

  if (showCommunities) {
    items.push(
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{joinedCommunitiesCount}</Text>
        <Text style={styles.statLabel}>COMMUNITIES</Text>
      </View>
    );
  }

  return (
    <View style={styles.statsBar}>
       {items.map((item, index) => (
          <React.Fragment key={index}>
             {index > 0 && <View style={styles.divider} />}
             {item}
          </React.Fragment>
       ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
});
