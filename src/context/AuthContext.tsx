import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, setSessionToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  session: Session | null;
  loading: boolean;
  loadingUserData: boolean;
  biometricUnlocked: boolean;
  setBiometricUnlocked: (state: boolean) => void;
  unlockWithBiometrics: () => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (params: any) => Promise<void>;
  profileError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoadingUserData(true);
    try {
      setProfileError(null);
      const data = await getUserProfile(true); // SKIP CACHE: ensure we get fresh onboarding status
      setUserData(data);
    } catch (error: any) {
      console.warn('Profile fetch failed:', error);
      setUserData(null);
      const msg = error.message?.toLowerCase() || '';
      // If profile is simply not found, it's not a blocking error (it's onboarding)
      if (msg.includes('not found')) {
        setProfileError(null);
      } else {
        setProfileError(error.message || 'Profile fetch failed');
      }
    } finally {
      setLoadingUserData(false);
    }
  }, []);

  useEffect(() => {
    // Initial session and profile check
    const initialize = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Check biometrics setting
        const settingsData = await AsyncStorage.getItem('settings-storage');
        let biometricsEnabled = true;
        if (settingsData) {
          try {
            const parsed = JSON.parse(settingsData);
            if (parsed.state) {
              biometricsEnabled = parsed.state.biometricsEnabled !== false;
            }
          } catch (e) {}
        }

        if (currentSession) {
          setSessionToken(currentSession.access_token);
          await fetchProfile();
          
          // If biometrics are disabled OR we're NOT on a device that supports it, unlock
          if (!biometricsEnabled) {
            setBiometricUnlocked(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Listen for auth changes to keep session, profile and keychain in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setSessionToken(newSession?.access_token ?? null);

      if (newSession) {
        await fetchProfile();
      } else {
        setUserData(null);
        setBiometricUnlocked(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Triggers the system biometric prompt (FaceID/TouchID).
   */
  const unlockWithBiometrics = async (): Promise<boolean> => {
    try {
      // Check if native module is available
      if (!Keychain || typeof Keychain.getGenericPassword !== 'function') {
        console.warn('Keychain native module not available. Skipping biometric check.');
        setBiometricUnlocked(true); // Bypass for dev/simulators without native support
        return true;
      }

      const credentials = await Keychain.getGenericPassword({
        service: 'biometric_gate',
        authenticationPrompt: { title: 'Authenticating', subtitle: 'Use biometrics to unlock Circlo', description: 'FaceID or Fingerprint' },
      });

      if (credentials) {
        setBiometricUnlocked(true);
        return true;
      } else {
        // Create gate on first time match
        await Keychain.setGenericPassword('biometric_user', 'gate_passed', {
          service: 'biometric_gate',
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        });
        setBiometricUnlocked(true);
        return true;
      }
    } catch (error) {
      console.warn('Biometric access denied or failed', error);
      return false;
    }
  };

  const updateProfile = async (params: any) => {
    try {
      const { updateUserProfile } = require('../services/api');
      await updateUserProfile(params);
      await fetchProfile();
    } catch (error) {
      console.error('Update Profile Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (Keychain && typeof Keychain.resetGenericPassword === 'function') {
      await Keychain.resetGenericPassword({ service: 'biometric_gate' });
    }
    setBiometricUnlocked(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      session,
      loading,
      loadingUserData,
      biometricUnlocked,
      setBiometricUnlocked,
      unlockWithBiometrics,
      signOut,
      refreshProfile: fetchProfile,
      updateProfile,
      profileError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
