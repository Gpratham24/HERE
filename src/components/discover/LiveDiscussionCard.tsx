import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Mic, Heart } from 'lucide-react-native';

export default function LiveDiscussionCard() {
  return (
    <View style={styles.card}>
      {/* Avatars Overlay Group */}
      <View style={styles.avatarGroup}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }} style={styles.avatar} />
        <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }} style={[styles.avatar, styles.overlap]} />
        <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }} style={[styles.avatar, styles.overlap]} />
        <View style={[styles.avatar, styles.overlap, styles.plusCount]}>
          <Text style={styles.plusText}>+82</Text>
        </View>
      </View>

      <Text style={styles.title}>Join the live discussion.</Text>
      <Text style={styles.subtitle}>
        "How AI is reshaping creative workflows" happening now in Designer's Lab.
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.enterBtn}
          activeOpacity={0.85}
          onPress={() => {/* Navigate to room or handle entry */ }}
          accessibilityRole="button"
          accessibilityHint="Joins the live discussion room"
        >
          <Mic size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.enterText}>Enter Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favBtn}
          activeOpacity={0.85}
          onPress={() => {/* Handle appreciation action */ }}
          accessibilityRole="button"
          accessibilityHint="Shows appreciation for this discussion"
        >
          <Heart size={16} color="#7C3AED" fill="#7C3AED" style={{ marginRight: 6 }} />
          <Text style={styles.favText}>Appreciate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3E8FF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 40,
  },
  avatarGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F3E8FF',
  },
  overlap: {
    marginLeft: -12,
  },
  plusCount: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  plusText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'sans-serif-condensed',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
    fontWeight: '500',
  },
  actionRow: {
    width: '100%',
    gap: 12,
  },
  enterBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  enterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  favBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  favText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '700',
  },
});
