import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      biometricsEnabled: true,
      setBiometricsEnabled: (biometricsEnabled) => set({ biometricsEnabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
