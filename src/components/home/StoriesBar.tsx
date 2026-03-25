import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

interface StoriesBarProps {
  onCreatePost: () => void;
}

export default function StoriesBar({ onCreatePost }: StoriesBarProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
       {/* Post Story Item */}
       <View style={styles.storyItem}>
          <TouchableOpacity onPress={onCreatePost} style={styles.createBtn} activeOpacity={0.8}>
             <Plus size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.storyText}>Post</Text>
       </View>

       {/* Static Placeholders matching screenshot design */}
       {/* Story 1 (Sarah) */}
       <View style={styles.storyItem}>
          <View style={styles.avatarWrapper}>
             <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' }} style={styles.avatar} />
             <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
             </View>
          </View>
          <Text style={styles.username}>Sarah</Text>
       </View>

       {/* Story 2 (Marcus) */}
       <View style={styles.storyItem}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' }} style={styles.avatarStatic} />
          <Text style={styles.username}>Marcus</Text>
       </View>

       {/* Story 3 (Elena) */}
       <View style={styles.storyItem}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }} style={styles.avatarStatic} />
          <Text style={styles.username}>Elena</Text>
       </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16,
    flexDirection: 'row',
  },
  storyItem: {
    alignItems: 'center',
    gap: 6,
  },
  createBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  storyText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    padding: 2,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  avatarStatic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  username: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
});
