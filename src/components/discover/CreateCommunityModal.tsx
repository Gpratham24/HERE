import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { X } from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../theme/Theme';

interface CreateCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (communityName: string) => void;
}

export default function CreateCommunityModal({ visible, onClose, onSuccess }: CreateCommunityModalProps) {
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreateCommunity = async () => {
    if (newCommunityName.trim().length < 3) {
       setCreateError('Name must be 3+ letters');
       return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
       const nameTrim = newCommunityName.trim();
       const formattedId = nameTrim.toLowerCase().replace(/ /g, '-');
       const docRef = firestore().collection('communities').doc(formattedId);
       
       const snap = await docRef.get();
       if (snap.exists()) {
          setCreateError('Community already exists');
          setCreateLoading(false);
          return;
       }
       
       const uid = auth().currentUser?.uid;
       const batch = firestore().batch();
       
       batch.set(docRef, {
          name: nameTrim,
          description: newCommunityDesc.trim(),
          membersCount: 1,
          createdBy: uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
          iconUrl: ''
       });
       
       if (uid) {
          const userRef = firestore().collection('users').doc(uid);
          batch.update(userRef, { joinedCommunities: firestore.FieldValue.arrayUnion(nameTrim) });
       }
       
       await batch.commit();
       setNewCommunityName('');
       setNewCommunityDesc('');
       onSuccess(nameTrim);
    } catch (e: any) {
       console.error(e);
       setCreateError('Error creating community');
    } finally {
       setCreateLoading(false);
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
           <Text style={styles.headerTitle}>Create Community</Text>
           <View style={{ width: 22 }} />
        </View>

        <Text style={styles.label}>Community Name *</Text>
        <TextInput 
          style={styles.input}
          placeholder="e.g. AI Builders"
          placeholderTextColor="#52525B"
          value={newCommunityName}
          onChangeText={setNewCommunityName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="For AI developers"
          placeholderTextColor="#52525B"
          value={newCommunityDesc}
          onChangeText={setNewCommunityDesc}
          multiline
        />

        {createError ? <Text style={styles.errorText}>{createError}</Text> : null}

        <TouchableOpacity 
          style={styles.createBtn}
          onPress={handleCreateCommunity}
          disabled={createLoading}
          activeOpacity={0.8}
        >
          {createLoading ? (
             <ActivityIndicator size="small" color="#fff" />
          ) : (
             <Text style={styles.createBtnText}>Create Community</Text>
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
    fontSize: 17,
    fontWeight: '800',
  },
  label: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
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
    minHeight: 90,
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
