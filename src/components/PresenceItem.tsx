import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../theme/Theme';
import { Member, UserStatus } from '../store/circleStore';

interface PresenceItemProps {
  member: Member;
  onPress: (username: string) => void;
  getStatusColor: (status: string) => string;
}

export const PresenceItem = React.memo(({ member, onPress, getStatusColor }: PresenceItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.presenceItem} 
      activeOpacity={0.7}
      onPress={() => onPress(member.username)}
    >
      <View style={styles.avatarWrapper}>
        <Image 
          source={{ uri: member.avatar_url || 'https://via.placeholder.com/100' }} 
          style={styles.presenceAvatar} 
        />
        {member.live_status && member.live_status !== 'offline' && (
           <View style={[styles.statusDot, { backgroundColor: getStatusColor(member.live_status) }]} />
        )}
      </View>
      <Text style={styles.presenceName} numberOfLines={1}>{member.username.split(' ')[0]}</Text>
      <Text style={styles.presenceStatus}>{member.live_status === 'offline' ? 'Offline' : member.live_status}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  presenceItem: { alignItems: 'center', marginRight: 20, width: 64 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  presenceAvatar: { width: 60, height: 60, borderRadius: 22, backgroundColor: Colors.border },
  statusDot: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    borderWidth: 3, 
    borderColor: Colors.white 
  },
  presenceName: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  presenceStatus: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'capitalize' },
});
