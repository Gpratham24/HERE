import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

/**
 * KeychainStorage: A secure storage adapter for Supabase.
 * It uses react-native-keychain when available (native devices)
 * and falls back to AsyncStorage for environments where native modules are missing.
 */

// Defensive check for the native module
const isKeychainAvailable = !!NativeModules.RNKeychain;

export const KeychainStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isKeychainAvailable) {
        // Double check the method exists to be extra safe
        if (typeof Keychain.getGenericPassword === 'function') {
          const credentials = await Keychain.getGenericPassword({ service: key });
          if (credentials && credentials.password) {
            return credentials.password;
          }
        }
      }
    } catch (e) {
      console.warn('[KeychainStorage] getItem failed, falling back to AsyncStorage', e);
    }
    
    // Fallback to AsyncStorage
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isKeychainAvailable) {
        if (typeof Keychain.setGenericPassword === 'function') {
          await Keychain.setGenericPassword('supabase_session', value, { service: key });
        }
      }
    } catch (e) {
      console.warn('[KeychainStorage] setItem failed', e);
    }
    
    // Always mirror to AsyncStorage as a fallback/backup
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Ignore
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (isKeychainAvailable) {
        if (typeof Keychain.resetGenericPassword === 'function') {
          await Keychain.resetGenericPassword({ service: key });
        }
      }
    } catch (e) {
      console.warn('[KeychainStorage] removeItem failed', e);
    }
    
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // Ignore
    }
  },
};
