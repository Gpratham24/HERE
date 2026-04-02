import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePresenceStore, UserStatus } from '../store/presenceStore';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme/Theme';

const STATUS_OPTS: { type: UserStatus; label: string }[] = [
  { type: 'free', label: 'Free' },
  { type: 'coding', label: 'Coding' },
  { type: 'gym', label: 'Gym' },
  { type: 'busy', label: 'Busy' },
  { type: 'away', label: 'Away' },
];

export const StatusSelector = () => {
  const { user } = useAuthStore();
  const { currentStatus, setStatus } = usePresenceStore();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.vibeTitle}>What's your current vibe?</Text>
      <Text style={styles.vibeSubtitle}>Share your status with your inner circle.</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
      >
        {STATUS_OPTS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            onPress={() => setStatus(user.id, opt.type)}
            activeOpacity={0.8}
            style={[
              styles.opt,
              currentStatus === opt.type && styles.activeOpt
            ]}
          >
            <Text style={[
              styles.label,
              currentStatus === opt.type && styles.activeLabel
            ]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  vibeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  vibeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 20,
  },
  scroll: {
    paddingRight: 48,
  },
  opt: {
    backgroundColor: '#F3F4F6', // Softer neutral inactive background
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 0, // Removed border for professional look
  },
  activeOpt: {
    backgroundColor: Colors.primary, // Solid active background
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  activeLabel: {
    color: '#FFFFFF', // White text on primary active state
  },
});
