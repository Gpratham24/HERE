import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {
  Camera,
  Plus,
  GraduationCap,
  Home,
  Briefcase,
  Globe,
  Sparkles,
  Lock,
  X,
} from 'lucide-react-native';
import { Colors } from '../theme/Theme';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImage, createCircle } from '../services/api';
import { useCircleStore } from '../store/circleStore';

const { height } = Dimensions.get('window');

const CATEGORIES = [
  { id: '12th-grade', label: '12th Grade Friends', icon: GraduationCap },
  { id: 'hostel-college', label: 'Hostel / College', icon: Home },
  { id: 'work-internship', label: 'Work / Internship', icon: Briefcase },
  { id: 'long-distance', label: 'Long Distance Friends', icon: Globe },
  { id: 'other', label: 'Other', icon: Sparkles },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated?: (circle: any) => void;
}

const CreateCircleSheet: React.FC<Props> = ({
  visible,
  onClose,
  onCreated,
}) => {
  const [circleName, setCircleName] = useState('');
  const [avatar, setAvatar] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('hostel-college');
  const [privacy, setPrivacy] = useState<'private' | 'public'>('private');

  const slideAnim = useRef(new Animated.Value(height)).current;
  const maxChars = 20;

  useEffect(() => {
    if (visible) {
      // Reset state on open
      setCircleName('');
      setAvatar(null);
      setAvatarUrl('');
      setSelectedCategory('hostel-college');
      setPrivacy('private');

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    });
    if (result.assets && result.assets[0]) {
      const selected = result.assets[0];
      if (!selected.uri) return;
      setAvatar(selected);
      setUploadingImage(true);
      try {
        const url = await uploadImage({
          uri: selected.uri,
          type: selected.type || 'image/jpeg',
          name: selected.fileName || `avatar_${Date.now()}.jpg`,
        });
        setAvatarUrl(url);
      } catch {
        setAvatar(null);
        Alert.alert(
          'Upload Error',
          'Failed to upload image. Please try again.',
        );
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!circleName.trim()) return;
    if (uploadingImage) {
      Alert.alert('Uploading', 'Please wait while your photo is uploading.');
      return;
    }
    setLoading(true);
    try {
      const res = await createCircle({
        name: circleName.trim(),
        avatar_url: avatarUrl,
        reason: selectedCategory,
        circle_type: privacy,
      });
      
      // Refresh home data instantly
      await useCircleStore.getState().fetchHomeData(res.id);

      onCreated?.(res);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Dark backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sliding sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={22} color="#64748B" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title */}
            <Text style={styles.title}>Create your{'\n'}circle</Text>
            <Text style={styles.subtitle}>
              This is your private space. Only people you invite can see what
              happens here.
            </Text>

            {/* Avatar Picker */}
            <View style={styles.photoContainer}>
              <TouchableOpacity
                style={styles.dashedCircle}
                onPress={pickImage}
                disabled={uploadingImage}
                activeOpacity={0.8}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : avatar ? (
                  <Image
                    source={{ uri: avatar.uri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Camera size={28} color="#94A3B8" />
                )}
                <View style={styles.plusOverlay}>
                  <Plus size={14} color="#fff" strokeWidth={3} />
                </View>
              </TouchableOpacity>
              <Text style={styles.photoLabel}>Set Circle Photo</Text>
            </View>

            {/* Circle Name */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>CIRCLE NAME</Text>
                <Text style={styles.inputCount}>
                  {circleName.length}/{maxChars}
                </Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Hostel Crew"
                placeholderTextColor="#94A3B8"
                value={circleName}
                onChangeText={t => setCircleName(t.slice(0, maxChars))}
                editable={!loading}
              />
              <Text style={styles.inputHint}>
                Pick a name that feels like your group
              </Text>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's this circle for?</Text>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === cat.id && styles.categoryCardActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconWrap}>
                    <cat.icon
                      size={20}
                      color={
                        selectedCategory === cat.id ? Colors.primary : '#0F172A'
                      }
                    />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <View
                    style={[
                      styles.radio,
                      selectedCategory === cat.id && styles.radioActive,
                    ]}
                  >
                    {selectedCategory === cat.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Privacy */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Setting</Text>

              {[
                {
                  key: 'private',
                  label: 'Private',
                  hint: 'Only members can see content',
                  Icon: Lock,
                },
                {
                  key: 'public',
                  label: 'Public',
                  hint: 'Anyone can find and join',
                  Icon: Globe,
                },
              ].map(({ key, label, hint, Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.privacyCard,
                    privacy === key && styles.privacyCardActive,
                  ]}
                  onPress={() => setPrivacy(key as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconWrap}>
                    <Icon
                      size={20}
                      color={privacy === key ? Colors.primary : '#0F172A'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.privacyLabel}>{label}</Text>
                    <Text style={styles.privacyHint}>{hint}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      privacy === key && styles.radioActive,
                    ]}
                  >
                    {privacy === key && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Sticky footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createBtn,
              (!circleName.trim() || loading) && { opacity: 0.55 },
            ]}
            onPress={handleCreate}
            disabled={!circleName.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createBtnText}>✦ Create Circle</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 15 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CreateCircleSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.92,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 48,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 36,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  dashedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: { width: '100%', height: '100%' },
  plusOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  photoLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  inputSection: { marginBottom: 28 },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  inputCount: { fontSize: 12, color: '#94A3B8' },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputHint: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F3FF',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  privacyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F3FF',
  },
  privacyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  privacyHint: { fontSize: 13, color: '#64748B' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  createBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
