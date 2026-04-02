import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { useAuthStore } from '../../store/authStore';
import { usePresenceStore } from '../../store/presenceStore';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { Colors } from '../../theme/Theme';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, isLoading, initialize } = useAuthStore();
  const { syncPresence } = usePresenceStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!user) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      syncPresence(user.id, nextAppState === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
