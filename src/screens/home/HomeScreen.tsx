import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { useCircleStore, UserStatus } from '../../store/circleStore';
import { useAuth } from '../../context/AuthContext';
import { PresenceCard } from '../../components/PresenceCard';
import { PostCard } from '../../components/PostCard';
import { wsService } from '../../services/websocket';
import { PlusCircle, Sparkles } from 'lucide-react-native';
import { StatusSelector } from '../../components/StatusSelector';
import { AppHeader } from '../../components/AppHeader';
import { CircleSelectorModal } from '../../components/CircleSelectorModal';
import CreatePostSheet from '../../components/CreatePostSheet';
import CreateCircleSheet from '../../components/CreateCircleSheet';
import { StreakCelebrationModal } from '../../components/StreakCelebrationModal';

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
    fetchAllCircles,
    switchCircle,
    setPresence,
    reactToPost,
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
    if (sessionInitialized) return;
    await Promise.all([fetchHomeData(), fetchAllCircles()]);
    setSessionInitialized(true);
  }, [fetchHomeData, fetchAllCircles, sessionInitialized]);

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
    if (!isLoading && hasCircle && myPresence === 'free' && sessionInitialized) {
      setShowStatusSelector(true);
    }
  }, [isLoading, hasCircle, myPresence, sessionInitialized]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {!hasCircle && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Sparkles size={80} color="#E0E7FF" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>No Circle Found</Text>
          <Text style={styles.emptySubtitle}>
            You need to join or develop a circle space to start using HERE.
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            contentContainerStyle={styles.scrollContent}
          >
            <PresenceCard
              members={members.filter(
                m => !m.username.toLowerCase().includes('official'),
              )}
              onUpdateStatus={handleUpdateStatus}
              onPressMember={m => console.log('Pressed member:', m.username)}
            />

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

            {posts.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedText}>
                  No moments shared today yet.
                </Text>
                <Text style={styles.emptyFeedSubtext}>
                  Be the first to share what you're up to!
                </Text>
              </View>
            ) : (
              posts.map((post: any) => {
                const author = members.find(m => m.id === post.user_id);
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    authorName={author?.username || 'Circle Member'}
                    authorAvatar={author?.avatar_url}
                    onReact={reactToPost}
                  />
                );
              })
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
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
          await fetchHomeData();
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
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingVertical: 8,
  },
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
});
