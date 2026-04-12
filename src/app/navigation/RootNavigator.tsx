import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { useAuth } from '../../context/AuthContext';
import { usePresenceStore } from '../../store/presenceStore';
import {
  View,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import PrivacyScreen from '../../screens/profile/PrivacyScreen';
import CircleDetailScreen from '../../screens/circles/CircleDetailScreen';
import BiometricLockScreen from '../../screens/auth/BiometricLockScreen';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator: Central navigation controller.
 * Handles AuthStack, BiometricLock, and Main AppStack routing based on user session and security status.
 */
export const RootNavigator = () => {
  const { user, userData, loading, loadingUserData, biometricUnlocked, profileError } = useAuth();
  const { syncPresence } = usePresenceStore();

  useEffect(() => {
    if (!user) return;

    // Presence synchronization based on app state
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        syncPresence(user.id, nextAppState === 'active');
      },
    );

    return () => {
      subscription.remove();
    };
  }, [user, syncPresence]);

  // Loading state (initial check)
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0f172a',
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {!user || profileError ? (
          // 1. Not Logged In or Error Fetching Profile -> Auth Stack (Login)
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !userData || !userData.onboarding_done ? (
          // 2. Logged In but No Profile or Onboarding Not Done
          <Stack.Screen
            name="Onboarding"
            component={AuthNavigator}
            initialParams={{ screen: 'Intro' }}
          />
        ) : !biometricUnlocked ? (
          // 3. Logged In but Biometric Lock is Active
          <Stack.Screen name="BiometricLock" component={BiometricLockScreen} />
        ) : (
          // 4. Logged In and Secured -> App Stack
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="CircleDetail" component={CircleDetailScreen} />
            <Stack.Screen name="Camera" component={CircleDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
