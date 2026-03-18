import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Sizes } from '../../theme/Theme';

interface ProfileStatsProps {
  followersCount: number;
  followingCount: number;
  joinedCommunitiesCount: number;
  isMe: boolean;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  followersCount,
  followingCount,
  joinedCommunitiesCount,
  isMe,
  onShowFollowers,
  onShowFollowing,
}) => {
  return (
    <View style={styles.statsBar}>
      <TouchableOpacity 
        style={styles.statItem}
        disabled={!isMe}
        onPress={onShowFollowers}
      >
        <Text style={styles.statNumber}>{followersCount}</Text>
        <Text style={styles.statLabel}>FOLLOWERS</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.statItem}
        disabled={!isMe}
        onPress={onShowFollowing}
      >
        <Text style={styles.statNumber}>{followingCount}</Text>
        <Text style={styles.statLabel}>FOLLOWING</Text>
      </TouchableOpacity>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{joinedCommunitiesCount}</Text>
        <Text style={styles.statLabel}>COMMUNITIES</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
    paddingHorizontal: 1,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
