import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Colors, Shadows, Sizes } from '../theme/Theme';
import { Member, UserStatus } from '../store/circleStore';
import { 
  BookOpen, 
  Dumbbell, 
  Code2, 
  MessageCircle, 
  Coffee, 
  Target,
  ChevronRight, 
  Heart, 
  Sparkles,
  Circle
} from 'lucide-react-native';

const statusConfig: Record<UserStatus, { icon: any; color: string }> = {
  studying: { icon: BookOpen, color: '#3B82F6' },
  gym: { icon: Dumbbell, color: '#F59E0B' },
  coding: { icon: Code2, color: '#8B5CF6' },
  free: { icon: MessageCircle, color: '#10B981' },
  resting: { icon: Coffee, color: '#78350F' },
  focus: { icon: Target, color: '#EF4444' },
  offline: { icon: Circle, color: '#94A3B8' },
};

interface PresenceCardProps {
  members: Member[];
  onUpdateStatus: () => void;
  onPressMember: (member: Member) => void;
}

const { width } = Dimensions.get('window');

export const PresenceCard: React.FC<PresenceCardProps> = ({
  members,
  onUpdateStatus,
  onPressMember,
}) => {
  const onlineMembers = members.filter(m => m.live_status !== 'offline');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.liveIndicator} />
          <Text style={styles.title}>Live Now</Text>
        </View>
        <Text style={styles.subtitle}>
          {onlineMembers.length} friend{onlineMembers.length !== 1 ? 's' : ''} active
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.memberList}
      >
        {onlineMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No one else is live right now</Text>
          </View>
        ) : (
          onlineMembers.map((member) => {
            const config = statusConfig[member.live_status] || statusConfig['free'];
            const StatusIcon = config.icon;
            
            return (
              <TouchableOpacity
                key={member.id}
                onPress={() => onPressMember(member)}
                style={styles.memberItem}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: member.avatar_url || 'https://via.placeholder.com/100',
                    }}
                    style={styles.avatar}
                  />
                  <View style={[styles.statusBadge, { borderColor: onlineMembers.length > 1 ? 'white' : 'transparent' }]}>
                    <StatusIcon size={12} color={config.color} strokeWidth={3} />
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.username.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={onUpdateStatus}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10 }}
      >
        <Sparkles size={18} color={Colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.mainButtonText}>Update My Status</Text>
        <ChevronRight size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  memberList: {
    paddingBottom: 24,
    paddingRight: 10,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
    elevation: 2,
  },
  statusEmoji: {
    fontSize: 12,
  },
  memberName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emptyState: {
    height: 60,
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  mainButton: {
    backgroundColor: '#6366F1', // Indigo primary
    borderRadius: 20,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  mainButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    marginRight: 4,
  },
});
