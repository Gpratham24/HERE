import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Mail, Lock, User as UserIcon } from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';

const { width, height } = Dimensions.get('window');

interface AccountEditPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const AccountEditPanel: React.FC<AccountEditPanelProps> = ({
  visible,
  onClose,
}) => {
  const { userData, refreshProfile } = useAuth();
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  const [username, setUsername] = useState(userData?.username || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
      // Sync local state with global data when opened
      setUsername(userData?.username || '');
    } else {
      slideAnim.setValue(width);
    }
  }, [visible, userData, slideAnim]);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    try {
      setLoading(true);
      // Backend only supports username, phone_number, avatar_url at /api/v1/user/profile
      await updateUserProfile({ username });
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Move early return to after all hooks
  if (!visible) return null;

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <ChevronLeft size={28} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Account Info</Text>
              <TouchableOpacity 
                onPress={handleSave} 
                disabled={loading}
                style={[styles.saveBtn, loading && { opacity: 0.5 }]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={20} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Your username"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address (Linked)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: '#F1F5F9', opacity: 0.7 }]}>
                    <Mail size={20} color="#94A3B8" />
                    <TextInput
                      style={[styles.input, { color: '#64748B' }]}
                      value={userData?.email || ''}
                      editable={false}
                      placeholder="Your email"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <Text style={styles.helperText}>Email cannot be changed from the app for security.</Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Lock size={20} color="#64748B" />
                <Text style={styles.infoText}>
                  Your account information is only visible to you. Circlo uses this for 
                  authentication and recovery purposes only.
                </Text>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2500,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 20,
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
});
