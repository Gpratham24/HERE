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
}

export default function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const { userData, user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);

  const communities = userData?.joinedCommunities || [];

  useEffect(() => {
    if (communities.length === 1 && !selectedCommunity) {
      setSelectedCommunity(communities[0]);
    }
  }, [communities]);

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
    if (!selectedCommunity || (!content.trim() && !mediaUri)) return;
    setIsPosting(true);

    try {
      let uploadedUrl = '';
      if (mediaUri && user?.uid) {
        const { uploadToCloudinary } = require('../../utils/cloudinary');
        uploadedUrl = await uploadToCloudinary(mediaUri);
      }

      const postRef = await firestore().collection('posts').add({
        userId: user?.uid,
        username: userData?.username || 'user',
        communityId: selectedCommunity,
        communityName: mapIdToName(selectedCommunity),
        content: content.trim(),
        mediaUrl: uploadedUrl,
        mediaType: mediaUri ? (['mp4', 'mov', 'avi', 'mkv'].includes(mediaUri.split('.').pop()?.toLowerCase() || '') ? 'video' : 'image') : null,
        likesCount: 0,
        commentsCount: 0,
        likedBy: [],
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // Notify Followers
      if (user?.uid) {
        const followersSnap = await firestore()
          .collection('followers')
          .where('followedUid', '==', user.uid)
          .get();

        const batch = firestore().batch();
        followersSnap.docs.forEach(doc => {
          const followerUid = doc.data().followerUid;
          const notifRef = firestore().collection('notifications').doc();
          batch.set(notifRef, {
            type: 'post',
            actorUid: user.uid,
            actorUsername: userData?.username || 'user',
            targetUid: followerUid,
            postId: postRef.id,
            communityName: mapIdToName(selectedCommunity),
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // Clear & Close
      setContent('');
      setMediaUri(null);
      setSelectedCommunity(communities.length === 1 ? communities[0] : null);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const isButtonDisabled = !selectedCommunity || (!content.trim() && !mediaUri) || isPosting;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.sheetContainer}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                <View style={styles.content}>
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
                      <Text style={styles.selectorValue}>
                        {selectedCommunity ? mapIdToName(selectedCommunity) : 'Select Community'}
                      </Text>
                      <ChevronDown size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>

                    {showDropdown && (
                      <View style={styles.dropdown}>
                        {communities.map((id: string) => (
                          <TouchableOpacity 
                            key={id} 
                            style={styles.dropdownItem} 
                            onPress={() => {
                              setSelectedCommunity(id);
                              setShowDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownText}>{mapIdToName(id)}</Text>
                            {selectedCommunity === id && (
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
                      placeholderTextColor="rgba(255,255,255,0.4)"
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
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '65%', // Slide up height
    backgroundColor: '#101015',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  headerBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#E4E4E7',
    fontSize: 15,
  },
  headerTitle: {
    color: '#ffffff',
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
    backgroundColor: 'rgba(56, 99, 250, 0.5)',
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
    backgroundColor: '#16161E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'flex-start',
  },
  selectorLabel: {
    color: '#A1A1AA',
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
    backgroundColor: '#1C1C24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 14,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#16161E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  charCount: {
    color: '#A1A1AA',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  previewWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionText: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '600',
  },
});
