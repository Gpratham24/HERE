import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Fingerprint, LogOut, Lock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/**
 * BiometricLockScreen: A high-security gating screen that appears when 
 * a session exists but the app has not yet been biometrically unlocked.
 */
const BiometricLockScreen: React.FC = () => {
  const { unlockWithBiometrics, signOut } = useAuth();

  useEffect(() => {
    // Attempt biometric unlock on mount automatically
    unlockWithBiometrics();
  }, [unlockWithBiometrics]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6366f1" style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Unlocking...</Text>
        
        <TouchableOpacity 
          style={styles.unlockButton} 
          onPress={unlockWithBiometrics}
          activeOpacity={0.8}
        >
          <Fingerprint size={24} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.unlockButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={signOut}
        >
          <LogOut size={20} color="#ef4444" style={styles.buttonIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', 
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  unlockButton: {
    flexDirection: 'row',
    width: width - 120,
    height: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
    padding: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default BiometricLockScreen;
