import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationService } from './src/services/notificationService';

export default function App() {
  React.useEffect(() => {
    // NotificationService.init(); // COMMENTED OUT: Firebase initialization fix
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
