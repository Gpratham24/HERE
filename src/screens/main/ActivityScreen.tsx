import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/common/GlassCard';

const ActivityScreen = () => {
  const { Colors } = useTheme();

  const activities = [
    { id: '1', type: 'room', user: 'Priya', action: 'joined the Live Room', time: '2m ago' },
    { id: '2', type: 'presence', user: 'Alex', action: 'is now in Focus mode', time: '15m ago' },
    { id: '3', type: 'moment', user: 'Maya', action: 'posted a new moment', time: '1h ago' },
    { id: '4', type: 'room', user: 'Ishan', action: 'started a new session', time: '2h ago' },
    { id: '5', type: 'presence', user: 'Zoe', action: 'is now Free to chat', time: '3h ago' },
  ];

  const renderActivity = ({ item }: { item: any }) => (
    <View style={styles.activityRow}>
      <View style={[styles.dot, { backgroundColor: item.type === 'room' ? '#FF3860' : Colors.primary }]} />
      <View style={styles.content}>
        <Text style={[styles.activityText, { color: Colors.textSecondary }]}>
          <Text style={[styles.userName, { color: Colors.text }]}>{item.user}</Text> {item.action}
        </Text>
        <Text style={[styles.time, { color: Colors.textMuted }]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Activity</Text>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userName: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ActivityScreen;
