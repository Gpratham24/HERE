import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Colors } from '../../theme/Theme';

const { width, height } = Dimensions.get('window');

interface FeedItemProps {
  post: {
    id: string;
    user: { name: string; avatar: string };
    image: string;
    caption: string;
    likes: string;
    premium: boolean;
  };
  safeAreaInsets: { top: number; bottom: number };
}

export default function FeedItem({ post, safeAreaInsets }: FeedItemProps) {
  return (
    <View style={[styles.container, { height: height - 60 }]}>
      {/* Immersive Image/Video Post background background */}
      <Image source={{ uri: post.image }} style={styles.postMedia} />
      <View style={styles.overlay} />

      {/* Top Floating Header */}
      <View style={[styles.topHeader, { paddingTop: safeAreaInsets.top + 10 }]}>
        <Text style={styles.appTitle}>HERE</Text>
        <Text style={styles.tabText}>For You</Text>
      </View>

      {/* Right Interaction Sidebar */}
      <View style={[styles.sidebar, { bottom: safeAreaInsets.bottom + 120 }]}>
        <TouchableOpacity style={styles.sidebarItem}>
          <View style={styles.sidebarIconBox}>
            <Text style={styles.sidebarIcon}>❤️</Text>
          </View>
          <Text style={styles.sidebarCount}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem}>
          <View style={styles.sidebarIconBox}>
            <Text style={styles.sidebarIcon}>💬</Text>
          </View>
          <Text style={styles.sidebarCount}>142</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem}>
          <View style={styles.sidebarIconBox}>
            <Text style={styles.sidebarIcon}>✈️</Text>
          </View>
          <Text style={styles.sidebarCount}>Share</Text>
        </TouchableOpacity>

        {post.premium && (
          <TouchableOpacity style={styles.sidebarItem}>
            <View style={[styles.sidebarIconBox, styles.premiumIconBox]}>
              <Text style={styles.sidebarIcon}>🌟</Text>
            </View>
            <Text style={styles.sidebarCount}>Unlock</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Information Details Overlay */}
      <View style={[styles.bottomDetails, { paddingBottom: safeAreaInsets.bottom + 80 }]}>
        <View style={styles.userRow}>
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>@{post.user.name}</Text>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.caption} numberOfLines={2}>
          {post.caption}
        </Text>

        {post.premium && (
          <TouchableOpacity style={styles.monetizeBanner}>
            <Text style={styles.monetizeText}>🔒 Unlock Full Creator Video - Subscribe $5/mo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.soundRow}>
          <Text style={styles.soundText}>🎵 original sound - @{post.user.name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: '#000000',
  },
  postMedia: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slight dim to read text
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    opacity: 0.8,
  },
  tabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    paddingBottom: 4,
  },
  sidebar: {
    position: 'absolute',
    right: 12,
    gap: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  sidebarItem: {
    alignItems: 'center',
  },
  sidebarIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  premiumIconBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    borderColor: '#facc15',
  },
  sidebarIcon: {
    fontSize: 22,
  },
  sidebarCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  bottomDetails: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 64, // Leave space for sidebar
    zIndex: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  userName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  followBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  caption: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  monetizeBanner: {
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  monetizeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  soundText: {
    color: '#e5e7eb',
    fontSize: 12,
    opacity: 0.9,
  },
});
