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
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { Camera, Mic, Lock, Check, ChevronDown, X } from 'lucide-react-native';
import { Colors } from '../theme/Theme';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImage, createPost } from '../services/api';

const { height } = Dimensions.get('window');
const MAX_CAPTION = 300;

interface Props {
  visible: boolean;
  onClose: () => void;
  circles: any[]; // all joined circles
  defaultCircleId?: string; // pre-select from home screen
  onPosted?: () => void;
}

const CreatePostSheet: React.FC<Props> = ({
  visible,
  onClose,
  circles,
  defaultCircleId,
  onPosted,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [image, setImage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  // multi-circle selector
  const [selectedCircleIds, setSelectedCircleIds] = useState<Set<string>>(
    new Set(),
  );
  const [showCirclePicker, setShowCirclePicker] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;

  // ── Animation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      // reset state
      setImage(null);
      setImageUrl('');
      setCaption('');
      setPosting(false);
      const init = new Set<string>();
      if (defaultCircleId) init.add(defaultCircleId);
      setSelectedCircleIds(init);

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.85,
      includeBase64: true,
    });
    if (result.assets?.[0]) {
      const sel = result.assets[0];
      if (!sel.uri) return;
      setImage(sel);
      setUploading(true);
      try {
        const url = await uploadImage({
          uri: sel.uri,
          type: sel.type || 'image/jpeg',
          name: sel.fileName || `post_${Date.now()}.jpg`,
          base64: sel.base64,
        });
        setImageUrl(url);
      } catch {
        setImage(null);
        Alert.alert('Upload Error', 'Failed to upload photo. Try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const toggleCircle = (id: string) => {
    setSelectedCircleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePost = async () => {
    if (selectedCircleIds.size === 0) {
      Alert.alert(
        'Select a Circle',
        'Please choose at least one circle to post to.',
      );
      return;
    }
    if (!imageUrl && !caption.trim()) {
      Alert.alert('Empty Post', 'Add a photo or write something first.');
      return;
    }
    setPosting(true);
    try {
      // Post to each selected circle
      await Promise.all(
        Array.from(selectedCircleIds).map(circleId =>
          createPost({
            circle_id: circleId,
            content_url: imageUrl || '',
            caption: caption.trim(),
            type: imageUrl ? 'image' : 'text',
          }),
        ),
      );
      onPosted?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // Derive label for the circle selector button
  const circleLabel = () => {
    if (selectedCircleIds.size === 0) return 'Select Circle';
    if (selectedCircleIds.size === 1) {
      const c = circles.find(c => c.id === [...selectedCircleIds][0]);
      return c?.name || 'Circle';
    }
    return `${selectedCircleIds.size} Circles`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.topBarSide}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Create Post</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={posting || uploading}
            style={styles.topBarSide}
          >
            {posting ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.postText, uploading && { opacity: 0.4 }]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── Photo Area ── */}
            <TouchableOpacity
              style={styles.photoArea}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {uploading ? (
                <View style={styles.photoInner}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.photoHint}>Uploading…</Text>
                </View>
              ) : image ? (
                <Image
                  source={{ uri: image.uri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoInner}>
                  <View style={styles.cameraCircle}>
                    <Camera size={28} color="#94A3B8" />
                  </View>
                  <Text style={styles.photoTitle}>Add Photo</Text>
                  <Text style={styles.photoHint}>
                    Capture a moment to share
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ── Caption ── */}
            <View style={styles.captionBox}>
              <TextInput
                style={styles.captionInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#94A3B8"
                multiline
                value={caption}
                onChangeText={t => setCaption(t.slice(0, MAX_CAPTION))}
              />
              <Text style={styles.captionCount}>
                {caption.length}/{MAX_CAPTION}
              </Text>
            </View>

            {/* ── Voice Note (UI only decorative) ── */}
            <TouchableOpacity style={styles.voiceRow} activeOpacity={0.7}>
              <View style={styles.voiceIcon}>
                <Mic size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.voiceTitle}>Record Voice Note</Text>
                <Text style={styles.voiceHint}>
                  Add a personal touch with audio
                </Text>
              </View>
            </TouchableOpacity>

            {/* ── Circle Selector ── */}
            <View style={styles.circleSelectorSection}>
              <Text style={styles.sectionLabel}>Post to Circle</Text>
              <TouchableOpacity
                style={styles.circleSelectorBtn}
                onPress={() => setShowCirclePicker(!showCirclePicker)}
                activeOpacity={0.8}
              >
                <Lock size={16} color="#64748B" style={{ marginRight: 8 }} />
                <Text style={styles.circleSelectorText}>
                  Visible only to{' '}
                  <Text style={{ fontWeight: '700', color: Colors.primary }}>
                    {circleLabel()}
                  </Text>
                </Text>
                <ChevronDown
                  size={18}
                  color="#64748B"
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>

              {showCirclePicker && (
                <View style={styles.circlePickerDropdown}>
                  {circles.length === 0 ? (
                    <Text style={styles.noCirclesText}>
                      You haven't joined any circles yet.
                    </Text>
                  ) : (
                    circles.map(c => {
                      const isSelected = selectedCircleIds.has(c.id);
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.circlePickerRow,
                            isSelected && styles.circlePickerRowActive,
                          ]}
                          onPress={() => toggleCircle(c.id)}
                          activeOpacity={0.75}
                        >
                          <View style={styles.circlePickerAvatar}>
                            {c.avatar_url ? (
                              <Image
                                source={{ uri: c.avatar_url }}
                                style={styles.circlePickerAvatarImg}
                              />
                            ) : (
                              <Text style={styles.circlePickerAvatarLetter}>
                                {(c.name || 'C').charAt(0).toUpperCase()}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.circlePickerName,
                              isSelected && {
                                color: Colors.primary,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            {c.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkWrap}>
                              <Check size={13} color="#fff" strokeWidth={3.5} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Sticky Post button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.postBtn,
              (posting || uploading || selectedCircleIds.size === 0) && {
                opacity: 0.5,
              },
            ]}
            onPress={handlePost}
            disabled={posting || uploading || selectedCircleIds.size === 0}
            activeOpacity={0.85}
          >
            {posting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post to Circle ➔</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CreatePostSheet;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 52 : 56,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBarSide: { minWidth: 60 },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cancelText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  postText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '800',
    textAlign: 'right',
  },

  scrollContent: { padding: 16 },

  // Photo area
  photoArea: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 200,
  },
  photoInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  photoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  photoHint: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  photoPreview: { width: '100%', height: 260 },

  // Caption
  captionBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  captionInput: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
    flex: 1,
    textAlignVertical: 'top',
  },
  captionCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 8,
  },

  // Voice note
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  voiceTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  voiceHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // Circle selector
  circleSelectorSection: { marginBottom: 12 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  circleSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  circleSelectorText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },

  circlePickerDropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  circlePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  circlePickerRowActive: { backgroundColor: '#EEF2FF' },
  circlePickerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  circlePickerAvatarImg: { width: 36, height: 36 },
  circlePickerAvatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  circlePickerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCirclesText: {
    padding: 16,
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    backgroundColor: 'rgba(248,249,250,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  postBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
