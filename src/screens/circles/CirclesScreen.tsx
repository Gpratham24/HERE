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
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useCircleStore } from '../../store/circleStore';
import { CircleCard } from '../../components/CircleCard';
import { StatusSelector } from '../../components/StatusSelector';
import { useMultipleCirclesPresence } from '../../hooks/useMultipleCirclesPresence';
import * as api from '../../services/api';
import { Plus, Settings, Camera, Info, Sparkles, X } from 'lucide-react-native';
import { Colors, Shadows } from '../../theme/Theme';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const CirclesScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { circles, fetchUserCircles, isLoading } = useCircleStore();
  
  const circleIds = circles.map((c) => c.id);
  const presenceCounts = useMultipleCirclesPresence(circleIds, user);

  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  
  // High-level UI state (moved lower to maintain hook consistency during HMR)
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');

  useEffect(() => {
    if (user) fetchUserCircles(user.id);
  }, [user]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchUserCircles(user.id);
    setRefreshing(false);
  }, [user]);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Picker Error', response.errorMessage || 'Failed to select image');
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

      await api.createCircle(newCircleName.trim(), newCircleDesc.trim(), imageUrl);
      
      setShowCreate(false);
      setNewCircleName('');
      setNewCircleDesc('');
      setSelectedImage(null);
      if (user) await fetchUserCircles(user.id);
    } catch (err: any) {
      Alert.alert('Process Failed', err.message);
    } finally {
      setCreating(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>HERE</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')} 
          style={styles.settingsIcon}
          activeOpacity={0.7}
        >
          <Settings size={24} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <StatusSelector />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'private' && styles.activeTab]} 
          onPress={() => setActiveTab('private')}
        >
          <Text style={[styles.tabText, activeTab === 'private' && styles.activeTabText]}>Private</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'public' && styles.activeTab]} 
          onPress={() => setActiveTab('public')}
        >
          <Text style={[styles.tabText, activeTab === 'public' && styles.activeTabText]}>Public Hub</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'private' && circles.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your People</Text>
          <Text style={styles.sectionCount}>{circles.length} Circles</Text>
        </View>
      )}

      {activeTab === 'public' && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Find Your People</Text>
          <View style={styles.situationBadge}>
            <Text style={styles.situationText}>NEW IN DELHI</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.illuWrapper}>
        <Image 
          source={require('../../../assets/images/circle_community.png')} 
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.textStack}>
        <Text style={styles.emptyTitle}>Privacy by design,{"\n"}connections by heart.</Text>
        <Text style={styles.emptyText}>
          No private circles yet. Start a secure space for your closest relationships.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.ctaButton} 
        onPress={() => setShowCreate(true)}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaText}>Create your first circle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {activeTab === 'private' ? (
        <FlatList
          data={circles}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 24 }}>
              <CircleCard
                name={item.name}
                memberCount={item.member_count || 0}
                lastActivity={
                  item.last_activity_at
                    ? new Date(item.last_activity_at).toLocaleDateString()
                    : 'never'
                }
                presenceCount={presenceCounts[item.id] || 0}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderHeader()}
          <View style={styles.publicGrid}>
            <TouchableOpacity style={styles.publicCard} activeOpacity={0.8}>
               <View style={[styles.publicIcon, { backgroundColor: '#F0FDFA' }]}>
                  <Text style={{ fontSize: 24 }}>🎓</Text>
               </View>
               <Text style={styles.publicTitle}>Delhi College Students</Text>
               <Text style={styles.publicMeta}>12 members • 5 online</Text>
               <View style={styles.joinBtn}>
                  <Text style={styles.joinText}>Join Circle</Text>
               </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.publicCard} activeOpacity={0.8}>
               <View style={[styles.publicIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={{ fontSize: 24 }}>🚀</Text>
               </View>
               <Text style={styles.publicTitle}>Bangalore Builders</Text>
               <Text style={styles.publicMeta}>18 members • 2 online</Text>
               <View style={styles.joinBtn}>
                  <Text style={styles.joinText}>Join Circle</Text>
               </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.publicCard} activeOpacity={0.8}>
               <View style={[styles.publicIcon, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={{ fontSize: 24 }}>💻</Text>
               </View>
               <Text style={styles.publicTitle}>JEE 2026 Batch</Text>
               <Text style={styles.publicMeta}>9 members • 7 online</Text>
               <View style={styles.joinBtn}>
                  <Text style={styles.joinText}>Join Circle</Text>
               </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addPublicCard} activeOpacity={0.7}>
               <Plus size={24} color={Colors.primary} />
               <Text style={styles.addPublicText}>Start Public Hub</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {isLoading && !refreshing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* FAB: Create Circle */}
      {circles.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
          <Plus size={32} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      )}

      {/* High-Fidelity Create Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCreate(false)}>
        <SafeAreaView style={styles.modalFull}>
          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Design-led Header */}
            <View style={styles.modalBranding}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW COMMUNITY</Text>
              </View>
              <Text style={styles.modalMainTitle}>Create a new Circle</Text>
              <Text style={styles.modalMainSub}>
                Gather your people. Design a space where shared vibes become lasting connections.
              </Text>
            </View>

            {/* Photo Picker Placeholder */}
            <View style={styles.imagePickerWrap}>
              <TouchableOpacity style={styles.dashCircle} onPress={handlePickImage} activeOpacity={0.7}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage.uri }} style={styles.pickerPreview} />
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

            {/* Form Fields */}
            <View style={styles.formLayer}>
              <Text style={styles.fieldLabel}>Circle name</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Saturday Coffee Club"
                placeholderTextColor="#CBD5E1"
                value={newCircleName}
                onChangeText={setNewCircleName}
              />

              <Text style={styles.fieldLabel}>What's this circle about? (optional)</Text>
              <TextInput
                style={[styles.fieldInput, { height: 120, textAlignVertical: 'top' }]}
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
                    <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
                    <Text style={styles.mainActionBtnText}>Create Circle</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowCreate(false)} style={styles.cancelLink}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Privacy Note */}
            <View style={styles.privacyNote}>
               <View style={styles.infoIconBox}>
                  <Info size={20} color={Colors.primary} />
               </View>
               <View style={styles.privacyTextCol}>
                 <Text style={styles.privacyHeading}>A Note on Privacy</Text>
                 <Text style={styles.privacyBody}>
                    Circles are invite-only by default. You can adjust your community's visibility and membership rules once the space is created.
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, marginRight: 10 },
  brandText: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1.2 },
  settingsIcon: { padding: 2 },
  
  // Tab Switcher
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: Colors.lavender, 
    marginHorizontal: 24, 
    borderRadius: 16, 
    padding: 4,
    marginBottom: 8,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#FFFFFF', ...Shadows.soft },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.textTertiary },
  activeTabText: { color: Colors.primary },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  sectionCount: { fontSize: 13, color: Colors.textSecondary, marginLeft: 10, fontWeight: '600', backgroundColor: Colors.lavender, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  situationBadge: { marginLeft: 'auto', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  situationText: { fontSize: 10, fontWeight: '900', color: '#D97706' },

  listContainer: { paddingBottom: 140 },
  emptyContainer: { flex: 1, paddingHorizontal: 32, paddingTop: 40, alignItems: 'center' },
  illuWrapper: { width: width * 0.7, height: width * 0.7, borderRadius: 99, backgroundColor: '#F8F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  illustration: { width: width * 0.55, height: width * 0.55 },
  textStack: { alignItems: 'center', marginBottom: 60 },
  emptyTitle: { fontSize: 26, fontWeight: '900', color: Colors.text, textAlign: 'center', lineHeight: 32, letterSpacing: -0.8, marginBottom: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  ctaButton: { backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', ...Shadows.medium },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  fab: { position: 'absolute', bottom: 120, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.medium },
  loadingBox: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)' },
  
  // Public Hub Styling
  publicGrid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  publicCard: { 
    width: (width - 60) / 2, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  publicIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  publicTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  publicMeta: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, marginBottom: 16 },
  joinBtn: { backgroundColor: Colors.primaryLight, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  joinText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  
  addPublicCard: { 
     width: (width - 60) / 2, 
     height: 180, 
     borderRadius: 24, 
     borderWidth: 2, 
     borderColor: Colors.primary, 
     borderStyle: 'dashed', 
     justifyContent: 'center', 
     alignItems: 'center', 
     backgroundColor: Colors.lavender,
     marginBottom: 20,
  },
  addPublicText: { marginTop: 12, fontSize: 13, fontWeight: '800', color: Colors.primary },

  // Modal Overhaul
  modalFull: { flex: 1, backgroundColor: '#FDFCFE' },
  modalScroll: { paddingBottom: 60 },
  modalBranding: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 40, marginBottom: 40 },
  newBadge: { backgroundColor: '#F3F2FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14, marginBottom: 20 },
  newBadgeText: { fontSize: 11, fontWeight: '900', color: Colors.primary, letterSpacing: 0.8 },
  modalMainTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 16, letterSpacing: -0.8 },
  modalMainSub: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  imagePickerWrap: { alignItems: 'center', marginBottom: 40 },
  dashCircle: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 1.5, 
    borderColor: Colors.primary, 
    borderStyle: 'dashed', 
    backgroundColor: '#F3F2FF', 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
  },
  plusOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: Colors.primary, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FDFCFE',
  },
  pickerPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  formLayer: { paddingHorizontal: 24 },
  fieldLabel: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 12, marginLeft: 16 },
  fieldInput: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 30, 
    fontSize: 16, 
    color: Colors.text, 
    marginBottom: 24,
    ...Shadows.soft,
  },
  mainActionBtn: { 
    flexDirection: 'row', 
    backgroundColor: Colors.primary, 
    paddingVertical: 18, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    ...Shadows.medium,
  },
  mainActionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  cancelLink: { paddingVertical: 20, alignItems: 'center' },
  cancelLinkText: { fontSize: 16, color: '#64748B', fontWeight: '700' },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 24,
    borderRadius: 32,
  },
  infoIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, ...Shadows.soft },
  privacyTextCol: { flex: 1 },
  privacyHeading: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  privacyBody: { fontSize: 13, color: '#64748B', lineHeight: 18, fontWeight: '500' },
});

export default CirclesScreen;
