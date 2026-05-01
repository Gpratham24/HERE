import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Plus, Users, Zap } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Image } from 'react-native';

const CirclesScreen = ({ onOpenThread }: { onOpenThread?: (circle: any) => void }) => {
  const { Colors } = useTheme();
  const { circles, fetchCircles } = useAuth();

  React.useEffect(() => {
    fetchCircles();
  }, []);

  const renderCircle = ({ item }: { item: any }) => {
    // Determine last activity text. If not provided by backend, show a placeholder or format created_at
    const lastActivityText = item.last_activity || item.lastActivity || 'No recent activity';
    const onlineCount = item.online_count || 0;

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onOpenThread?.(item)}>
        <GlassCard style={styles.circleCard}>
          <View style={styles.circleHeader}>
            {item.avatar_url && (
              <Image source={{ uri: item.avatar_url }} style={styles.listAvatar} />
            )}
            <View style={styles.circleInfo}>
              <Text style={[styles.circleName, { color: Colors.text }]}>{item.name}</Text>
              <View style={styles.metaRow}>
                <Users size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.metaText, { color: Colors.textSecondary }]}>
                  {item.member_count || 0} members {onlineCount > 0 ? `• ${onlineCount} online` : ''}
                </Text>
              </View>
            </View>
            {item.live && (
              <View style={[styles.liveBadge, { backgroundColor: 'rgba(255, 56, 96, 0.1)' }]}>
                <Zap size={12} color="#FF3860" fill="#FF3860" />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          <Text style={[styles.lastActivity, { color: Colors.textMuted }]}>
            Last activity: {lastActivityText}
          </Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Your Circles</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.primary }]}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={circles}
        renderItem={renderCircle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.joinViaLink}>
        <Text style={[styles.joinText, { color: Colors.primary }]}>Join via link</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  circleCard: {
    marginBottom: 16,
    padding: 20,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  circleInfo: {
    flex: 1,
  },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
  },
  circleName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveText: {
    color: '#FF3860',
    fontWeight: '800',
    fontSize: 10,
    marginLeft: 4,
  },
  lastActivity: {
    fontSize: 12,
  },
  joinViaLink: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  joinText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CirclesScreen;
