import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { Sparkles, Plus, ChevronRight, Zap, Target, Coffee, User, Activity } from 'lucide-react-native';
import { CheckInModal } from '../../components/CheckInModal'; 

const { width } = Dimensions.get('window');

const PRESENCE_DATA = [
  { id: '1', name: 'Aarav', status: 'Studying', color: '#6366F1', avatar: 'https://i.pravatar.cc/100?u=aarav' },
  { id: '2', name: 'Ishita', status: 'At the gym', color: '#10B981', avatar: 'https://i.pravatar.cc/100?u=ishita' },
  { id: '3', name: 'Priya', status: 'Coding', color: '#F59E0B', avatar: 'https://i.pravatar.cc/100?u=priya' },
  { id: '4', name: 'Rahul', status: 'Commuting', color: '#6B7280', avatar: 'https://i.pravatar.cc/100?u=rahul' },
  { id: '5', name: 'Simran', status: 'Free', color: '#2DD4BF', avatar: 'https://i.pravatar.cc/100?u=simran' },
];

const ActivityScreen = () => {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.topHeader}>
          <View style={styles.logoRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>HERE</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/100?u=me' }} 
              style={styles.headerAvatar} 
            />
          </TouchableOpacity>
        </View>

        {/* 1. THE DAILY CHECK-IN (Mission Critical) */}
        <View style={styles.checkInContainer}>
          <TouchableOpacity 
            style={[styles.checkInCard, hasCheckedIn && styles.checkInCardDone]} 
            onPress={() => setShowCheckIn(true)}
            activeOpacity={0.9}
          >
            <View style={styles.checkInLeft}>
              <View style={[styles.iconBox, hasCheckedIn && { backgroundColor: '#FFFFFF' }]}>
                {hasCheckedIn ? (
                  <Zap size={24} color={Colors.primary} fill={Colors.primary} />
                ) : (
                  <Target size={24} color={Colors.primary} />
                )}
              </View>
              <View style={styles.checkInTextCol}>
                <Text style={[styles.checkInTitle, hasCheckedIn && { color: '#FFF' }]}>
                  {hasCheckedIn ? "You're showing up!" : "How are you showing up?"}
                </Text>
                <Text style={[styles.checkInSub, hasCheckedIn && { color: 'rgba(255,255,255,0.8)' }]}>
                  {hasCheckedIn ? "Streak: 4 days alive" : "One tap to keep the promise alive."}
                </Text>
              </View>
            </View>
            {!hasCheckedIn && <ChevronRight size={20} color={Colors.primary} />}
          </TouchableOpacity>
        </View>

        {/* 2. THE PRESENCE LAYER (Ambient Awareness) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Currently HERE</Text>
          <TouchableOpacity>
             <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.presenceScroll}
        >
          {PRESENCE_DATA.map((item) => (
            <TouchableOpacity key={item.id} style={styles.presenceItem} activeOpacity={0.7}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: item.avatar }} style={styles.presenceAvatar} />
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
              </View>
              <Text style={styles.presenceName}>{item.name}</Text>
              <Text style={styles.presenceStatus}>{item.status}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.presenceItem} activeOpacity={0.7}>
            <View style={[styles.avatarWrapper, styles.addPresence]}>
              <Plus size={24} color={Colors.primary} />
            </View>
            <Text style={styles.presenceName}>Invite</Text>
            <Text style={styles.presenceStatus}>Grow Circle</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 3. ACTIVITY FEED (Proprietary Interactions) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shared History</Text>
          <Text style={styles.sectionBadge}>3 NEW</Text>
        </View>

        {/* Activity Card: Rahul Milestone */}
        <TouchableOpacity style={styles.activityCard} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
             <View style={styles.userMeta}>
                <Image source={{ uri: 'https://i.pravatar.cc/100?u=rahul' }} style={styles.miniAvatar} />
                <Text style={styles.userName}>Rahul</Text>
                <Text style={styles.timeTag}> • 2h ago</Text>
             </View>
             <View style={styles.circleTag}>
                <Text style={styles.circleTagName}>Hostel 11</Text>
             </View>
          </View>
          <Text style={styles.cardContext}>
            Shared a new moment from <Text style={{ fontWeight: '800' }}>Pune Junction</Text>. 
            The journey begins! 🚆
          </Text>
          <View style={styles.interactionRow}>
             <View style={styles.reactionPills}>
                <TouchableOpacity style={styles.reactionBtn}><Text>❤️ 12</Text></TouchableOpacity>
                <TouchableOpacity style={styles.reactionBtn}><Text>🔥 4</Text></TouchableOpacity>
             </View>
             <TouchableOpacity style={styles.voiceNoteBtn}>
                <Zap size={14} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.voiceNoteText}>Voice Note</Text>
             </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Activity Card: Circle Streak */}
        <View style={[styles.activityCard, styles.streakCard]}>
           <View style={styles.streakIcon}>
              <Zap size={32} color="#FFFFFF" fill="#FFFFFF" />
           </View>
           <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Unstoppable.</Text>
              <Text style={styles.streakText}>
                Your <Text style={{ fontWeight: '800' }}>12th Gang</Text> circle has been active for 14 days straight. 
                Keep the promise alive!
              </Text>
           </View>
        </View>

        {/* Vibe Check Card: Now more premium */}
        <TouchableOpacity style={styles.vibeCard} activeOpacity={0.8}>
           <View style={styles.vibeIconWrap}>
              <Sparkles size={24} color="#7C3AED" />
           </View>
           <View style={styles.vibeContent}>
              <Text style={styles.vibeTitle}>Circle Memory</Text>
              <Text style={styles.vibeSubText}>Recap: This time last year in the hostel...</Text>
           </View>
           <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>

      </ScrollView>

      <CheckInModal 
        visible={showCheckIn} 
        onClose={(checkedIn) => { 
          setShowCheckIn(false); 
          if (checkedIn) setHasCheckedIn(true); 
        }} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 140 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, marginRight: 10 },
  brandText: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1.2 },
  profileBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  headerAvatar: { width: '100%', height: '100%' },

  // Check-In Section
  checkInContainer: { paddingHorizontal: 20, marginTop: 8 },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lavender,
    padding: 20,
    borderRadius: Sizes.radiusLg,
    borderWidth: 1,
    borderColor: 'rgba(91, 79, 225, 0.1)',
    ...Shadows.soft,
  },
  checkInCardDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.medium,
  },
  checkInLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Shadows.soft,
  },
  checkInTextCol: { flex: 1 },
  checkInTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginBottom: 2 },
  checkInSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  // Section Styling
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  sectionBadge: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: '#FFF', 
    backgroundColor: Colors.danger, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },

  // Presence Layer
  presenceScroll: { paddingLeft: 24, paddingRight: 12 },
  presenceItem: { alignItems: 'center', marginRight: 24, width: 70 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  presenceAvatar: { width: 64, height: 64, borderRadius: 24 },
  statusDot: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    borderWidth: 3, 
    borderColor: '#FFF' 
  },
  addPresence: { 
    width: 64, 
    height: 64, 
    borderRadius: 24, 
    backgroundColor: Colors.border, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  presenceName: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  presenceStatus: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary },

  // Activity Cards
  activityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: Sizes.radiusLg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userMeta: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 28, height: 28, borderRadius: 10, marginRight: 8 },
  userName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  timeTag: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },
  circleTag: { backgroundColor: Colors.lavender, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  circleTagName: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  cardContext: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, fontWeight: '500', marginBottom: 16 },
  interactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reactionPills: { flexDirection: 'row', gap: 8 },
  reactionBtn: { backgroundColor: Colors.softBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  voiceNoteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primaryLight, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  voiceNoteText: { fontSize: 12, fontWeight: '800', color: Colors.primary, marginLeft: 6 },

  // Streak Card
  streakCard: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  streakIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  streakText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500', lineHeight: 20 },

  // Vibe/Memory card
  vibeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: '#FDF2F8',
    padding: 20,
    borderRadius: Sizes.radiusLg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
  },
  vibeIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, ...Shadows.soft },
  vibeContent: { flex: 1 },
  vibeTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  vibeSubText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});

export default ActivityScreen;
