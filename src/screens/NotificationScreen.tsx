import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors } from '../theme/Theme';
import { Heart, MessageSquare, Plus, Bell, UserPlus } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';

export default function NotificationScreen() {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('targetUid', '==', uid)
//      .orderBy('createdAt', 'desc') // Need index for this, using client sort for now
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort by createdAt desk
        list.sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setNotifications(list);
        setLoading(false);
      }, err => {
        console.log('Error listening notifications:', err.message);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const renderNotification = ({ item }: { item: any }) => {
    let icon = <Bell size={18} color="#A1A1AA" />;
    let text = '';
    
    if (item.type === 'like') {
      icon = <Heart size={18} color="#ff4500" fill="#ff4500" />;
      text = 'liked your post';
    } else if (item.type === 'comment') {
      icon = <MessageSquare size={18} color={Colors.primary} fill={Colors.primary} />;
      text = `commented: "${item.commentText || ''}"`;
    } else if (item.type === 'post') {
      icon = <Plus size={18} color="#10B981" />;
      text = `posted in c/${item.communityName || 'Community'}`;
    } else if (item.type === 'follow') {
      icon = <UserPlus size={18} color="#3863FA" />;
      text = 'started following you';
    }

    return (
      <View style={[styles.card, { backgroundColor: Colors.surface, borderBottomColor: Colors.border }]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.info}>
          <Text style={[styles.mainText, { color: Colors.text === '#ffffff' ? '#E4E4E7' : Colors.text }]}>
            <Text style={[styles.username, { color: Colors.text }]}>@{item.actorUsername || 'user'}</Text> {text}
          </Text>
          {item.createdAt && (
            <Text style={styles.timeText}>
              {new Date(item.createdAt.seconds * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle={Colors.background === '#F4F4F5' ? 'dark-content' : 'light-content'} />
      {/* Top Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top + 10, height: 60 + insets.top, backgroundColor: Colors.surface, borderBottomColor: Colors.border }]}>
        <Text style={[styles.navTitle, { color: Colors.text }]}>Notifications</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070708',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0c0c12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  list: {
    paddingVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101015',
    marginBottom: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.01)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16161E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  mainText: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timeText: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
});
