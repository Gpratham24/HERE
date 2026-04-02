import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../theme/Theme';
import { Clock, User } from 'lucide-react-native';

interface CircleCardProps {
  name: string;
  memberCount: number;
  lastActivity: string;
  avatarUrl?: string;
  presenceCount?: number;
  onPress: () => void;
}

export const CircleCard = ({ name, memberCount, lastActivity, avatarUrl, presenceCount = 0, onPress }: CircleCardProps) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.topRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.placeholderText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.circleName}>{name}</Text>
          <View style={styles.statsRow}>
            <User size={13} color="#6B7280" strokeWidth={2.5} />
            <Text style={styles.memberCount}>{memberCount} members</Text>
          </View>
        </View>
        {presenceCount > 0 && (
          <View style={styles.presenceBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.presenceText}>{presenceCount} Active</Text>
          </View>
        )}
      </View>
      <View style={styles.divider} />
      <View style={styles.footer}>
        <Clock size={12} color="#9CA3AF" />
        <Text style={styles.activityText}>Active {lastActivity}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    // Modern elevation (Shadow-only)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6358E1',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  circleName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 6,
  },
  presenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5', // Soft green tint
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  presenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
