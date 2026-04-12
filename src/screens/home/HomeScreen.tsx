import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { useCircleStore, UserStatus } from '../../store/circleStore';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../../components/PostCard';
import { wsService } from '../../services/websocket';
import { PlusCircle, Sparkles } from 'lucide-react-native';
import { StatusSelector } from '../../components/StatusSelector';
import { AppHeader } from '../../components/AppHeader';
import { CircleSelectorModal } from '../../components/CircleSelectorModal';
import CreatePostSheet from '../../components/CreatePostSheet';
import CreateCircleSheet from '../../components/CreateCircleSheet';
import { StreakCelebrationModal } from '../../components/StreakCelebrationModal';
import { PresenceItem } from '../../components/PresenceItem';

export const HomeScreen: React.FC<any> = ({ navigation, route }) => {
  const { userData } = useAuth();
  const userName = userData?.username || 'My Circles';

  const {
    hasCircle,
    circle,
    members,
    myPresence,
    posts,
    stats,
    allCircles,
    isLoading,
    fetchHomeData,
    fetchCirclePosts,
    fetchAllCircles,
    switchCircle,
    setPresence,
    reactToPost,
    hasPromptedPresence,
    setHasPromptedPresence,
  } = useCircleStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showCircleSelector, setShowCircleSelector] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showPostSheet, setShowPostSheet] = useState(false);
  const [milestoneDays, setMilestoneDays] = useState<number | null>(null);
  const [lastShownMilestone, setLastShownMilestone] = useState<number>(0);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  useEffect(() => {
    if (route?.params?.openPostSheet) {
      setShowPostSheet(true);
      navigation.setParams({ openPostSheet: undefined });
    }
  }, [route?.params?.openPostSheet, navigation]);

  const init = useCallback(async () => {
    if (sessionInitialized || isLoading) return;
    await fetchHomeData();
    setSessionInitialized(true);
  }, [fetchHomeData, sessionInitialized, isLoading]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (hasCircle && sessionInitialized) {
      wsService.connect();
    } else if (!hasCircle) {
      wsService.disconnect();
    }
    return () => wsService.disconnect();
  }, [hasCircle, sessionInitialized]);

  useEffect(() => {
    if (!isLoading && hasCircle && myPresence === 'free' && sessionInitialized && !hasPromptedPresence) {
      setShowStatusSelector(true);
      setHasPromptedPresence(true);
    }
  }, [isLoading, hasCircle, myPresence, sessionInitialized, hasPromptedPresence, setHasPromptedPresence]);

  useEffect(() => {
    if (stats.streak > 0 && 
        [7, 30, 60, 100, 365].includes(stats.streak) && 
        stats.streak !== lastShownMilestone) {
      setMilestoneDays(stats.streak);
      setLastShownMilestone(stats.streak);
    }
  }, [stats.streak, lastShownMilestone]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHomeData(), fetchAllCircles()]);
    setRefreshing(false);
  };

  const handleUpdateStatus = () => {
    setShowStatusSelector(true);
  };

  const handleStatusSelect = async (status: UserStatus) => {
    await setPresence(status);
    wsService.updateStatus(status);
    setShowStatusSelector(false);
  };

  const handleCircleSelect = async (id: string) => {
    await switchCircle(id);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'studying': return '#4F46E5';
      case 'gym': return '#F59E0B';
      case 'coding': return '#06B6D4';
      case 'free': return '#10B981';
      case 'resting': return '#8B5CF6';
      case 'focus': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const renderPresenceHeader = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Currently Circlo</Text>
        <TouchableOpacity onPress={handleUpdateStatus}>
          <Text style={styles.seeAll}>Update Status</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.presenceScroll}
      >
        {members
          .filter(m => !m.username.toLowerCase().includes('official'))
          .map((member) => (
            <PresenceItem 
              key={member.id} 
              member={member} 
              onPress={(name) => console.log('Pressed member:', name)}
              getStatusColor={getStatusColor}
            />
          ))}
      </ScrollView>

      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Circle Moments</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Camera')}
          style={styles.postButton}
        >
          <PlusCircle size={20} color={Colors.white} />
          <Text style={styles.postButtonText}>New Moment</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmptyFeed = () => (
    <View style={styles.emptyFeed}>
      <Text style={styles.emptyFeedText}>No moments shared today yet.</Text>
      <Text style={styles.emptyFeedSubtext}>Be the first to share what you're up to!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {isLoading && !sessionInitialized ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your world...</Text>
        </View>
      ) : !hasCircle ? (
        <View style={styles.emptyContainer}>
          <Sparkles size={80} color="#E0E7FF" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>No Circle Found</Text>
          <Text style={styles.emptySubtitle}>
            You need to join or develop a circle space to start using Circlo.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateSheet(true)}
          >
            <Text style={styles.createButtonText}>Create a Circle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <AppHeader
            showCircleSelector={true}
            circleName={circle?.name || 'Create Circle'}
            onCirclePress={() => setShowCircleSelector(true)}
            onNotificationPress={() => {}}
          />

          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const author = members.find(m => m.id === item.user_id);
              return (
                <PostCard
                  post={item}
                  authorName={author?.username || 'Circle Member'}
                  authorAvatar={author?.avatar_url}
                  onReact={reactToPost}
                />
              );
            }}
            ListHeaderComponent={renderPresenceHeader}
            ListEmptyComponent={renderEmptyFeed}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            contentContainerStyle={styles.scrollContent}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={false} // Adjust based on memory vs crash
          />
        </>
      )}

      <CircleSelectorModal
        visible={showCircleSelector}
        onClose={() => setShowCircleSelector(false)}
        circles={allCircles}
        currentCircleId={circle?.id}
        onSelect={handleCircleSelect}
        onCreateNew={() => {
          setShowCircleSelector(false);
          setShowCreateSheet(true);
        }}
        userName={userName}
      />

      <CreateCircleSheet
        visible={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onCreated={async () => {
          await Promise.all([fetchHomeData(), fetchAllCircles()]);
        }}
      />

      <CreatePostSheet
        visible={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        circles={allCircles}
        defaultCircleId={circle?.id}
        onPosted={async () => {
          if (circle?.id) {
            await fetchCirclePosts(circle.id);
          } else {
            await fetchHomeData();
          }
        }}
      />

      {showStatusSelector && (
        <StatusSelector
          currentStatus={myPresence}
          onSelect={handleStatusSelect}
          onClose={() => setShowStatusSelector(false)}
        />
      )}

      <StreakCelebrationModal
        visible={milestoneDays !== null}
        days={milestoneDays || 0}
        circleName={circle?.name || 'Your Circle'}
        onClose={() => setMilestoneDays(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.softBg,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  presenceScroll: { paddingLeft: 20, paddingRight: 10 },
  presenceItem: { alignItems: 'center', marginRight: 20, width: 64 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  presenceAvatar: { width: 60, height: 60, borderRadius: 22, backgroundColor: Colors.border },
  statusDot: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    borderWidth: 3, 
    borderColor: Colors.white 
  },
  presenceName: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  presenceStatus: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'capitalize' },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    ...Shadows.soft,
  },
  postButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: Sizes.radiusMd,
    ...Shadows.medium,
  },
  createButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  emptyFeed: {
    padding: 40,
    alignItems: 'center',
  },
  emptyFeedText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyFeedSubtext: {
    color: Colors.textTertiary,
    fontSize: 13,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
