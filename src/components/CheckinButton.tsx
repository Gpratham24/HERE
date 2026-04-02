import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../theme/Theme';

interface CheckinButtonProps {
  type: 'Done' | 'Missed' | 'Focus' | 'Rest';
  onPress: () => void;
  selected?: boolean;
}

const config = {
  Done: { emoji: '✅', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  Missed: { emoji: '❌', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  Focus: { emoji: '🔥', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  Rest: { emoji: '😴', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
};

export const CheckinButton = ({ type, onPress, selected }: CheckinButtonProps) => {
  const { emoji, color, bg } = config[type];
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.button, 
        { borderColor: selected ? color : 'transparent' },
        { backgroundColor: selected ? bg : '#F8FAFC' }
      ]}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.text, { color: selected ? color : '#64748B' }]}>{type}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  }
});
