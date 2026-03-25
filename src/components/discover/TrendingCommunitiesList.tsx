import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface TrendingCommunitiesListProps {
  communities: any[];
  onCommunityPress: (name: string) => void;
  joinedCommunities: string[];
  handleJoinToggle: (name: string) => void;
}

export default function TrendingCommunitiesList({ communities, onCommunityPress, joinedCommunities, handleJoinToggle }: TrendingCommunitiesListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
         <Text style={styles.title}>Trending Communities</Text>
         <Text style={styles.subtitle}>The most active groups this week.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
         {communities.map((item: any) => {
            const isJoined = joinedCommunities.some(c => c.toLowerCase() === item.name.toLowerCase());
            return (
               <View key={item.id} style={styles.card}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => onCommunityPress(item.name)}>
                     {/* Image Header with Live Badge */}
                     <View style={styles.imageContainer}>
                        <Image 
                          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500' }} 
                          style={styles.bgImage} 
                        />
                        <View style={styles.liveBadge}>
                           <View style={styles.liveDot} />
                           <Text style={styles.liveText}>LIVE</Text>
                        </View>
                     </View>

                     {/* Info Content Title */}
                     <View style={styles.content}>
                        <View style={styles.titleRow}>
                           <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                           </View>
                           <View>
                              <Text style={styles.communityName}>{item.name}</Text>
                              <Text style={styles.memberCount}>{item.membersCount || 204} Members</Text>
                           </View>
                        </View>

                        <Text style={styles.description} numberOfLines={2}>
                           {item.description || 'A sanctuary for perfectionists to share feedback, resources and insights.'}
                        </Text>

                        {/* Actions Row */}
                        <View style={styles.actionRow}>
                           <TouchableOpacity 
                             style={[styles.discussBtn, isJoined && styles.joinedBtn]} 
                             activeOpacity={0.8}
                             onPress={() => onCommunityPress(item.name)}
                           >
                              <Text style={[styles.discussText, isJoined && styles.joinedText]}>{isJoined ? 'Joined' : 'Discuss'}</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.favBtn} activeOpacity={0.8} onPress={() => handleJoinToggle(item.name)}>
                              <Heart size={16} color={isJoined ? '#7C3AED' : '#475569'} fill={isJoined ? '#7C3AED' : 'none'} />
                           </TouchableOpacity>
                        </View>
                     </View>
                  </TouchableOpacity>
               </View>
            );
         })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: 'sans-serif-condensed',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  scroll: {
    paddingLeft: 16,
  },
  card: {
    width: width * 0.72,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f1f1',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#1E293B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '800',
  },
  communityName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  memberCount: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    height: 36, // Force exactly 2 lines height
    marginBottom: 16,
    fontWeight: '400',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discussBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 11,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  discussText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  joinedBtn: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    shadowOpacity: 0,
  },
  joinedText: {
    color: '#7C3AED',
  },
  favBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
