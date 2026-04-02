import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes } from '../../theme/Theme';
import { ChevronDown, Check, Camera, X } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';

const mapIdToName = (id: string) => {
  const dict: Record<string, string> = {
    '1': 'AI Builders', '2': 'Startup Founders', '3': 'Coding Tips', '4': 'Fitness Club', '5': 'Memes Hub'
  };
  if (dict[id]) return dict[id];
  if (!isNaN(Number(id))) return 'Community ' + id;
  return id; 
};

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  initialCommunity?: string;
}

export default function CreatePostModal({ visible, onClose, initialCommunity }: CreatePostModalProps) {
  const { userData, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);

  const communities = userData?.joinedCommunities || [];
  const displayCommunities = initialCommunity && !communities.includes(initialCommunity) 
    ? [initialCommunity, ...communities] 
    : communities;

  useEffect(() => {
    if (visible) {
      if (initialCommunity) {
        setSelectedCommunities([initialCommunity]);
      } else if (communities.length > 0 && selectedCommunities.length === 0) {
        setSelectedCommunities([communities[0]]);
      }
    }
  }, [visible, initialCommunity, communities]);

  const handlePickMedia = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) return;
      if (res.assets && res.assets.length > 0) {
        setMediaUri(res.assets[0].uri || null);
      }
    });
  };

  const handlePost = async () => {
    if (selectedCommunities.length === 0 || (!content.trim() && !mediaUri)) return;
    setIsPosting(true);

    try {
      let uploadedUrl = '';
      if (mediaUri && user?.uid) {
        const { uploadToCloudinary } = require('../../utils/cloudinary');
        uploadedUrl = await uploadToCloudinary(mediaUri);
      }

      const batch = firestore().batch();
      let primaryPostId = '';
      
      selectedCommunities.forEach((cid, index) => {
         const postRef = firestore().collection('posts').doc();
         if (index === 0) primaryPostId = postRef.id;

         batch.set(postRef, {
            userId: user?.uid,
            username: userData?.username || 'user',
            communityId: cid,
            communityName: mapIdToName(cid),
            content: content.trim(),
            mediaUrl: uploadedUrl,
            mediaType: mediaUri ? (['mp4', 'mov', 'avi', 'mkv'].includes(mediaUri.split('.').pop()?.toLowerCase() || '') ? 'video' : 'image') : null,
            likesCount: 0,
            commentsCount: 0,
            likedBy: [],
            createdAt: firestore.FieldValue.serverTimestamp(),
         });
      });

      // Notify Followers (using primaryPostId for reference)
      if (user?.uid && primaryPostId) {
        const followersSnap = await firestore()
          .collection('followers')
          .where('followedUid', '==', user.uid)
          .get();

        followersSnap.docs.forEach(doc => {
          const followerUid = doc.data().followerUid;
          const notifRef = firestore().collection('notifications').doc();
          batch.set(notifRef, {
            type: 'post',
            actorUid: user.uid,
            actorUsername: userData?.username || 'user',
            targetUid: followerUid,
            postId: primaryPostId,
            communityName: mapIdToName(selectedCommunities[0]),
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        });
      }

      await batch.commit();

      // Clear & Close
      setContent('');
      setMediaUri(null);
      setSelectedCommunities(communities.length > 0 ? [communities[0]] : []);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const isButtonDisabled = selectedCommunities.length === 0 || (!content.trim() && !mediaUri) || isPosting;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.sheetContainer}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
                  {/* Header */}
                  <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Post</Text>
                    <TouchableOpacity 
                      onPress={handlePost} 
                      disabled={isButtonDisabled} 
                      style={[styles.postBtn, isButtonDisabled && styles.postBtnDisabled]}
                    >
                      {isPosting ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.postBtnText}>Post</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Dropdown Selector */}
                  <View style={styles.selectorWrapper}>
                    <TouchableOpacity 
                      style={styles.selector} 
                      onPress={() => setShowDropdown(!showDropdown)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectorLabel}>Post in: </Text>
                      <Text style={styles.selectorValue} numberOfLines={1}>
                        {!Array.isArray(selectedCommunities) 
                           ? mapIdToName(selectedCommunities as any) 
                           : (selectedCommunities.length === 0 
                              ? 'Select Community' 
                              : selectedCommunities.map(c => mapIdToName(c)).join(', '))}
                      </Text>
                      <ChevronDown size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>

                    {showDropdown && (
                      <View style={styles.dropdown}>
                        {displayCommunities.map((id: string) => (
                          <TouchableOpacity 
                            key={id} 
                            style={styles.dropdownItem} 
                            onPress={() => {
                              setSelectedCommunities(prev => {
                                 const current = Array.isArray(prev) ? prev : [];
                                 return current.includes(id) 
                                    ? current.filter(c => c !== id) 
                                    : [...current, id];
                              });
                            }}
                          >
                            <Text style={styles.dropdownText}>{mapIdToName(id)}</Text>
                            {Array.isArray(selectedCommunities) && selectedCommunities.includes(id) && (
                              <Check size={16} color={Colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Text Input */}
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="What's on your mind?"
                      placeholderTextColor="#94A3B8"
                      multiline
                      maxLength={300}
                      value={content}
                      onChangeText={setContent}
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{content.length}/300</Text>
                  </View>

                  {/* Media Preview */}
                  {mediaUri && (
                    <View style={styles.previewWrapper}>
                      <Image source={{ uri: mediaUri }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.clearBtn} 
                        onPress={() => setMediaUri(null)}
                      >
                        <X size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Actions Row */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handlePickMedia}>
                      <Camera size={20} color="#A1A1AA" />
                      <Text style={styles.actionText}>Add Photo</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker backdrop
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '68%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  headerBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  postBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 65,
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: '#C4B5FD',
    opacity: 0.6,
  },
  postBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorWrapper: {
    zIndex: 10, // Ensure dropdown overlays input
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 180,
    maxWidth: '100%',
  },
  selectorLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  selectorValue: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownText: {
    color: '#0F172A',
    fontSize: 14,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 16,
    lineHeight: 22,
  },
  charCount: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  previewWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
