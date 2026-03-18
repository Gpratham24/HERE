import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  StatusBar, 
  Image 
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../theme/Theme';

interface EditCommunityModalProps {
  visible: boolean;
  communityName: string;
  initialData: any;
  onClose: () => void;
}

export default function EditCommunityModal({ visible, communityName, initialData, onClose }: EditCommunityModalProps) {
  const [desc, setDesc] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bannerUri, setBannerUri] = useState<string | null>(initialData?.bannerUrl || null);
  const [iconUri, setIconUri] = useState<string | null>(initialData?.iconUrl || null);

  useEffect(() => {
     if (initialData) {
        setDesc(initialData.description || '');
        setBannerUri(initialData.bannerUrl || null);
        setIconUri(initialData.iconUrl || null);
     }
  }, [initialData]);

  const handlePickBanner = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.assets && res.assets.length > 0) {
         setBannerUri(res.assets[0].uri || null);
      }
    });
  };

  const handlePickIcon = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.assets && res.assets.length > 0) {
         setIconUri(res.assets[0].uri || null);
      }
    });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError('');
    try {
       const formattedId = communityName.toLowerCase().replace(/ /g, '-');
       const docRef = firestore().collection('communities').doc(formattedId);
       
       let uploadedBanner = bannerUri;
       let uploadedIcon = iconUri;

       const { uploadToCloudinary } = require('../../utils/cloudinary');

       if (bannerUri && !bannerUri.startsWith('http')) {
          uploadedBanner = await uploadToCloudinary(bannerUri);
       }
       if (iconUri && !iconUri.startsWith('http')) {
          uploadedIcon = await uploadToCloudinary(iconUri);
       }

       await docRef.update({
          description: desc.trim(),
          bannerUrl: uploadedBanner || '',
          iconUrl: uploadedIcon || '',
       });
       
       onClose();
    } catch (e: any) {
       console.error(e);
       setError('Error saving changes');
    } finally {
       setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.header}>
           <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#ffffff" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Edit c/{communityName}</Text>
           <View style={{ width: 22 }} />
        </View>

        {/* 🏙 Banner Pick */}
        <Text style={styles.label}>Community Banner</Text>
        <TouchableOpacity style={styles.bannerContainer} onPress={handlePickBanner}>
           {bannerUri ? (
              <Image source={{ uri: bannerUri }} style={styles.bannerImage} />
           ) : (
              <View style={styles.bannerPlaceholder}>
                 <Camera size={24} color="#A1A1AA" />
                 <Text style={{ color: '#A1A1AA', fontSize: 13, marginTop: 4 }}>Select Banner</Text>
              </View>
           )}
        </TouchableOpacity>

        {/* 📝 Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="For AI developers"
          placeholderTextColor="#52525B"
          value={desc}
          onChangeText={setDesc}
          multiline
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={styles.createBtn}
          onPress={handleSaveChanges}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
             <ActivityIndicator size="small" color="#fff" />
          ) : (
             <Text style={styles.createBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070708',
    padding: 18,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  closeBtn: {
    padding: 2,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  bannerContainer: {
    height: 120,
    backgroundColor: '#16161E',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    backgroundColor: '#16161E',
    color: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    fontSize: 14,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
