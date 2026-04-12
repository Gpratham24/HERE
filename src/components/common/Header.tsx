import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function Header({ onNotificationPress, onProfilePress }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();

  return (
    <View style={[styles.navbar, { paddingTop: insets.top + 10, height: 60 + insets.top }]}>
      <View style={styles.logoContainer}>
         {/* Logo Bubbles (Simulated) */}
         <View style={styles.bubbleGroup}>
            <View style={styles.bubble1} />
            <View style={styles.bubble2} />
            <View style={styles.bubble3} />
         </View>
         <Text style={styles.logoText}>Circlo</Text>
      </View>

      <View style={styles.actionContainer}>
         <TouchableOpacity activeOpacity={0.7} onPress={onNotificationPress} style={styles.actionBtn}>
            <Bell size={22} color="#475569" />
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bubbleGroup: {
    flexDirection: 'row',
    gap: 2,
    position: 'relative',
  },
  bubble1: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },
  bubble2: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    marginTop: 8,
  },
  bubble3: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c084fc',
    marginLeft: -2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#8B5CF6',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  fallbackText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
