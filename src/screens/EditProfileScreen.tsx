import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, Sizes } from '../theme/Theme';

const { width } = Dimensions.get('window');

interface EditProfileScreenProps {
  userData: any;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

export default function EditProfileScreen({ userData, onClose, onSave }: EditProfileScreenProps) {
  const [loading, setLoading] = useState(false);
  const [newBio, setNewBio] = useState(userData?.bio || '');
  const [newUsername, setNewUsername] = useState(userData?.username || '');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [newCoverUri, setNewCoverUri] = useState<string | null>(null);

  const [showPosts, setShowPosts] = useState(userData?.visibilitySettings?.showPosts ?? true);
  const [showFollowers, setShowFollowers] = useState(userData?.visibilitySettings?.showFollowers ?? true);
  const [showFollowing, setShowFollowing] = useState(userData?.visibilitySettings?.showFollowing ?? true);
  const [showSaved, setShowSaved] = useState(userData?.visibilitySettings?.showSaved ?? true);
  const [showCommunities, setShowCommunities] = useState(userData?.visibilitySettings?.showCommunities ?? true);

  const handlePickAvatar = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) return;
      if (res.assets && res.assets.length > 0) {
        setNewAvatarUri(res.assets[0].uri || null);
      }
    });
  };

  const handlePickCover = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) return;
      if (res.assets && res.assets.length > 0) {
        setNewCoverUri(res.assets[0].uri || null);
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateObj: any = {};
      if (newBio !== (userData?.bio || '')) updateObj.bio = newBio;
      if (newUsername !== (userData?.username || '')) updateObj.username = newUsername;

      const { uploadToCloudinary } = require('../utils/cloudinary');
      const auth = require('@react-native-firebase/auth').default;
      const uid = auth().currentUser?.uid;

      if (newAvatarUri && uid) {
        updateObj.photoURL = await uploadToCloudinary(newAvatarUri);
      }
      if (newCoverUri && uid) {
        updateObj.coverPhotoURL = await uploadToCloudinary(newCoverUri);
      }

      updateObj.visibilitySettings = {
         showPosts,
         showFollowers,
         showFollowing,
         showSaved,
         showCommunities
      };

      await onSave(updateObj);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover Photo Button */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ 
              uri: newCoverUri || userData?.coverPhotoURL || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80' 
            }} 
            style={styles.coverPhoto} 
          />
          <TouchableOpacity style={styles.coverEditBtn} onPress={handlePickCover}>
            <Camera size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ 
                uri: newAvatarUri || userData?.photoURL || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&q=80' 
              }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.avatarEditBtn} onPress={handlePickAvatar}>
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput 
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Username"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={newBio}
            onChangeText={setNewBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Visibility Toggles section */}
          <Text style={[styles.inputLabel, { marginTop: 12, marginBottom: 16 }]}>Profile Visibility Settings</Text>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Posts Count</Text>
            <Switch value={showPosts} onValueChange={setShowPosts} trackColor={{ true: Colors.primary }} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Followers</Text>
            <Switch value={showFollowers} onValueChange={setShowFollowers} trackColor={{ true: Colors.primary }} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Following</Text>
            <Switch value={showFollowing} onValueChange={setShowFollowing} trackColor={{ true: Colors.primary }} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Saved Section</Text>
            <Switch value={showSaved} onValueChange={setShowSaved} trackColor={{ true: Colors.primary }} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Communities</Text>
            <Switch value={showCommunities} onValueChange={setShowCommunities} trackColor={{ true: Colors.primary }} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverEditBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -45,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#F8FAFC',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarEditBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  form: {
    paddingHorizontal: 24,
  },
  inputLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    color: '#0F172A',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginBottom: 20,
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  toggleLabel: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
});
