import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CircleDetailScreen from './CircleDetailScreen';
import { useCircleStore } from '../../store/circleStore';
import { CircleCard } from '../../components/CircleCard';
import { useMultipleCirclesPresence } from '../../hooks/useMultipleCirclesPresence';
import * as api from '../../services/api';
import {
  Plus,
  Camera,
  Info,
  Sparkles,
  X,
  Users,
} from 'lucide-react-native';
import { Colors, Shadows } from '../../theme/Theme';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppHeader } from '../../components/AppHeader';

const { width } = Dimensions.get('window');

const CirclesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { circle, fetchHomeData, isLoading, stats } = useCircleStore();

  const circleIds = circle ? [circle.id] : [];
  const presenceCounts = useMultipleCirclesPresence(circleIds, user);

  const circles = circle ? [circle] : [];

  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied'
  >('idle');
  const [detectedCity, setDetectedCity] = useState('');

  const handleTabSwitch = (tab: 'private' | 'public') => {
    setActiveTab(tab);
    if (tab === 'public' && locationStatus === 'idle') {
      requestLocation();
    }
  };

  const requestLocation = () => {
    setLocationStatus('requesting');
    Alert.alert(
      'Location Access',
      'HERE uses your location to find public hubs orbiting near you.',
      [
        {
          text: 'Not now',
          onPress: () => setLocationStatus('denied'),
          style: 'cancel',
        },
        {
          text: 'Allow',
          onPress: () => {
            setLocationStatus('granted');
            setDetectedCity('NOIDA');
          },
        },
      ],
    );
  };

  useEffect(() => {
    if (user) fetchHomeData();
  }, [user, fetchHomeData]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }, [user, fetchHomeData]);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert(
          'Picker Error',
          response.errorMessage || 'Failed to select image',
        );
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) {
      Alert.alert('Name Required', 'Please provide a circle name.');
      return;
    }
    setCreating(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await api.uploadImage({
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'upload.jpg',
        });
      }

      await api.createCircle({
        name: newCircleName.trim(),
        description: newCircleDesc.trim(),
        avatar_url: imageUrl,
      });

      setShowCreate(false);
      setNewCircleName('');
      setNewCircleDesc('');
      setSelectedImage(null);
      if (user) await fetchHomeData();
    } catch (err: any) {
      Alert.alert('Process Failed', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCircle = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Code Required', 'Enter a valid invite code.');
      return;
    }
    setJoining(true);
    try {
      const resolved = await api.getCircleByCode(joinCode.trim());
      if (!resolved || !resolved.id) throw new Error('Invalid invite code.');

      await api.joinCircle(resolved.id);

      Alert.alert('Success', `Joined ${resolved.name}!`);
      setShowJoin(false);
      setJoinCode('');
      if (user) await fetchHomeData();
    } catch (err: any) {
      Alert.alert('Join Failed', err.message || 'Could not join circle.');
    } finally {
      setJoining(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <AppHeader
        showCircleSelector={false}
        showSettings={false}
        showNotification={false}
      />

      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'private' && styles.activeTab]}
            onPress={() => handleTabSwitch('private')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'private' && styles.activeTabText,
              ]}
            >
              Private
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'public' && styles.activeTab]}
            onPress={() => handleTabSwitch('public')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'public' && styles.activeTabText,
              ]}
            >
              Public Hub
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'private' && circles.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your People</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{circles.length}</Text>
          </View>
        </View>
      )}

      {activeTab === 'public' && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Find Your People</Text>
          {locationStatus === 'granted' && detectedCity && (
            <View style={styles.situationBadge}>
              <Text style={styles.situationText}>NEW IN {detectedCity}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrapper}>
      <View style={styles.iconCircle}>
        <Plus size={40} color={Colors.primary} strokeWidth={2.5} />
      </View>

      <View style={styles.textStack}>
        <Text style={styles.emptyTitle}>No Circles yet</Text>
        <Text style={styles.emptySubtitle}>
          Start a private space for your closest relationships and shared vibes.
        </Text>
      </View>

      <View style={styles.emptyActionRow}>
        <TouchableOpacity
          style={styles.minimalCta}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={3} />
          <Text style={styles.minimalCtaText}>Create Circle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCta}
          onPress={() => setShowJoin(true)}
          activeOpacity={0.8}
        >
          <Users size={18} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.secondaryCtaText}>Join Circle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {activeTab === 'private' ? (
        <FlatList
          data={circles}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 24, marginBottom: 4 }}>
              <CircleCard
                name={item.name}
                avatarUrl={item.avatar_url}
                memberCount={item.member_count || 0}
                lastActivity={
                  item.last_activity_at
                    ? new Date(item.last_activity_at).toLocaleDateString()
                    : 'never'
                }
                presenceCount={presenceCounts[item.id] || 0}
                streak={item.id === circle?.id ? stats.streak : (item.streak || 0)}
                onPress={() =>
                  navigation.navigate('CircleDetail', {
                    circleId: item.id,
                    circleName: item.name,
                  })
                }
              />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={!isLoading ? renderEmpty : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderHeader()}
          <View style={styles.publicGrid}>
            {locationStatus !== 'granted' ? (
              <View style={styles.permissionBox}>
                <View style={styles.locationIconWrap}>
                  <Info size={30} color={Colors.primary} />
                </View>
                <Text style={styles.permTitle}>Location Hubs</Text>
                <Text style={styles.permSub}>
                  To see public hubs orbiting near you, we need your location.
                </Text>
                <TouchableOpacity
                  style={styles.permBtn}
                  onPress={requestLocation}
                >
                  <Text style={styles.permBtnText}>Enable Location</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addPublicCard}
                activeOpacity={0.7}
              >
                <View style={styles.plusCircle}>
                  <Plus size={20} color={Colors.primary} strokeWidth={3} />
                </View>
                <Text style={styles.addPublicText}>Start Public Hub</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {isLoading && !refreshing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {circles.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreate(true)}
        >
          <Plus size={32} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      )}

      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreate(false)}
      >
        <SafeAreaView style={styles.modalFull}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalBranding}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW COMMUNITY</Text>
              </View>
              <Text style={styles.modalMainTitle}>Create a new Circle</Text>
              <Text style={styles.modalMainSub}>
                Gather your people. Design a space where shared vibes become lasting connections.
              </Text>
            </View>

            <View style={styles.imagePickerWrap}>
              <TouchableOpacity
                style={styles.dashCircle}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.pickerPreview}
                  />
                ) : (
                  <Camera size={32} color={Colors.primary} />
                )}

                <View style={styles.plusOverlay}>
                  {selectedImage ? (
                    <TouchableOpacity onPress={() => setSelectedImage(null)}>
                      <X size={14} color="#FFFFFF" strokeWidth={4} />
                    </TouchableOpacity>
                  ) : (
                    <Plus size={14} color="#FFFFFF" strokeWidth={4} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formLayer}>
              <Text style={styles.fieldLabel}>Circle name</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Saturday Coffee Club"
                placeholderTextColor="#CBD5E1"
                value={newCircleName}
                onChangeText={setNewCircleName}
              />

              <Text style={styles.fieldLabel}>
                What's this circle about? (optional)
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  { height: 120, textAlignVertical: 'top' },
                ]}
                placeholder="Describe the vibe, the purpose, or the mission of this gathering..."
                placeholderTextColor="#CBD5E1"
                value={newCircleDesc}
                onChangeText={setNewCircleDesc}
                multiline
              />

              <TouchableOpacity
                style={[styles.mainActionBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreateCircle}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Sparkles
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.mainActionBtnText}>Create Circle</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowCreate(false)}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.privacyNote}>
              <View style={styles.infoIconBox}>
                <Info size={20} color={Colors.primary} />
              </View>
              <View style={styles.privacyTextCol}>
                <Text style={styles.privacyHeading}>A Note on Privacy</Text>
                <Text style={styles.privacyBody}>
                  Circles are invite-only by default. You can adjust your community's visibility once it's created.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showJoin}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJoin(false)}
      >
        <SafeAreaView style={styles.modalFull}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalBranding}>
              <View style={[styles.newBadge, { backgroundColor: '#F0F9FF' }]}>
                <Text style={[styles.newBadgeText, { color: '#0EA5E9' }]}>
                  INVITATION ONLY
                </Text>
              </View>
              <Text style={styles.modalMainTitle}>Join a Circle</Text>
              <Text style={styles.modalMainSub}>
                Enter the unique invite code shared with you to orbit into a private community.
              </Text>
            </View>

            <View style={styles.formLayer}>
              <Text style={styles.fieldLabel}>Invite code</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    textAlign: 'center',
                    fontSize: 20,
                  },
                ]}
                placeholder="HERE-CODE"
                placeholderTextColor="#CBD5E1"
                value={joinCode}
                onChangeText={setJoinCode}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.mainActionBtn, joining && { opacity: 0.6 }]}
                onPress={handleJoinCircle}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Users
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.mainActionBtnText}>Join Now</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowJoin(false)}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.privacyNote, { backgroundColor: '#F0F9FF' }]}>
              <View
                style={[styles.infoIconBox, { backgroundColor: '#FFFFFF' }]}
              >
                <Info size={20} color="#0EA5E9" />
              </View>
              <View style={styles.privacyTextCol}>
                <Text style={[styles.privacyHeading, { color: '#0C4A6E' }]}>
                  How to find codes?
                </Text>
                <Text style={[styles.privacyBody, { color: '#075985' }]}>
                  Ask the circle owner for an invite code. Each code grants instant membership.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerArea: { paddingBottom: 8 },
  tabWrapper: { paddingHorizontal: 24, marginBottom: 12 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  activeTab: { backgroundColor: '#FFFFFF', ...Shadows.soft },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: Colors.text },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  countBadge: {
    backgroundColor: '#F3F2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  situationBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  situationText: { fontSize: 10, fontWeight: '900', color: '#D97706' },
  listContainer: { paddingBottom: 140 },
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 100,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Shadows.soft,
  },
  textStack: { alignItems: 'center', marginBottom: 32 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  minimalCta: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    ...Shadows.medium,
  },
  minimalCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  secondaryCta: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    marginLeft: 12,
  },
  secondaryCtaText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  emptyActionRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.dark,
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  publicGrid: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  permissionBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    ...Shadows.soft,
  },
  locationIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  permSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  addPublicCard: {
    width: '100%',
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addPublicText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalFull: { flex: 1, backgroundColor: '#FFFFFF' },
  modalScroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 60 },
  modalBranding: { marginBottom: 40 },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  newBadgeText: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 0.5 },
  modalMainTitle: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 12, letterSpacing: -0.5 },
  modalMainSub: { fontSize: 16, color: '#64748B', lineHeight: 24, fontWeight: '500' },
  imagePickerWrap: { alignItems: 'center', marginBottom: 40 },
  dashCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pickerPreview: { width: '100%', height: '100%', borderRadius: 60 },
  plusOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formLayer: { marginBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mainActionBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  mainActionBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  cancelLink: { marginTop: 24, alignItems: 'center' },
  cancelLinkText: { fontSize: 15, fontWeight: '700', color: '#94A3B8' },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  privacyTextCol: { flex: 1 },
  privacyHeading: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  privacyBody: { fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
});

export default CirclesScreen;
