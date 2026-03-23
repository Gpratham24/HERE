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
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors } from '../theme/Theme';
import { Heart, MessageSquare, Plus, Bell, UserPlus, Eye } from 'lucide-react-native';
import ProfileScreen from './ProfileScreen';

import { useTheme } from '../context/ThemeContext';

export default function NotificationScreen() {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Modal state triggers setup
  const [selectedProfileUser, setSelectedProfileUser] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('targetUid', '==', uid)
//      .orderBy('createdAt', 'desc') // Need index for this, using client sort for now
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Batch update unread to Read
        const batch = firestore().batch();
        let unreadCount = 0;
        snapshot.docs.forEach(doc => {
           if (doc.data().isRead !== true) {
              batch.update(doc.ref, { isRead: true });
              unreadCount++;
           }
        });
        if (unreadCount > 0) {
           batch.commit().catch(err => console.log('Error marking notifications as read:', err));
        }

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
    let icon = <Bell size={18} color="#64748B" />;
    let text = '';
    
    if (item.type === 'like') {
      icon = <Heart size={18} color="#ef4444" fill="#ef4444" />;
      text = 'liked your post';
    } else if (item.type === 'comment') {
      icon = <MessageSquare size={18} color="#8B5CF6" fill="#8B5CF6" />;
      text = `commented: "${item.commentText || ''}"`;
    } else if (item.type === 'post') {
      icon = <Plus size={18} color="#10B981" />;
      text = `posted in c/${item.communityName || 'Community'}`;
    } else if (item.type === 'follow') {
      icon = <UserPlus size={18} color="#3B82F6" />;
      text = 'started following you';
    } else if (item.type === 'profile_visit') {
      icon = <Eye size={18} color="#64748B" />;
      text = 'visited your profile';
    }

    return (
      <TouchableOpacity 
         style={[styles.card, { backgroundColor: '#ffffff', borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 }]}
         activeOpacity={0.8}
         onPress={() => {
            if (item.actorUid) {
               setSelectedProfileUser(item.actorUid);
               setIsProfileModalOpen(true);
            }
         }}
      >
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.info}>
          <Text style={[styles.mainText, { color: '#334155' }]} numberOfLines={1}>
            <Text style={[styles.username, { color: '#0F172A' }]}>@{item.actorUsername || 'user'}</Text> {text}
          </Text>
          {item.createdAt && (
            <Text style={styles.timeText}>
              {new Date(item.createdAt.seconds * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />
      {/* Top Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top + 10, height: 60 + insets.top, backgroundColor: '#ffffff', borderBottomColor: '#E2E8F0' }]}>
        <Text style={[styles.navTitle, { color: '#0F172A' }]}>Notifications</Text>
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

      {/* Profile Modal */}
      <Modal visible={isProfileModalOpen} transparent={false} animationType="slide" onRequestClose={() => setIsProfileModalOpen(false)}>
        {selectedProfileUser && (
          <ProfileScreen userId={selectedProfileUser} onClose={() => setIsProfileModalOpen(false)} />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  list: {
    paddingVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  mainText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  timeText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
