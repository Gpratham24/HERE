import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
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
        <View style={styles.iconContainer}>
          <Lock size={60} color="#6366f1" />
        </View>
        
        <Text style={styles.title}>Secure Access</Text>
        <Text style={styles.subtitle}>
          Use your FaceID or Fingerprint to unlock HERE and continue to your circles.
        </Text>

        <TouchableOpacity 
          style={styles.unlockButton} 
          onPress={unlockWithBiometrics}
          activeOpacity={0.8}
        >
          <Fingerprint size={24} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.unlockButtonText}>Unlock with Biometrics</Text>
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
    backgroundColor: '#0f172a', // Premium dark slate background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  unlockButton: {
    flexDirection: 'row',
    width: width - 80,
    height: 56,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    marginTop: 32,
    alignItems: 'center',
    padding: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BiometricLockScreen;
