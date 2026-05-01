import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, Text, View, Animated, StyleSheet, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Plus, Bell, User, Search, Users } from 'lucide-react-native';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import { Colors } from './src/theme/Theme';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const currentScreenColor = (isActive: boolean) => (isActive ? Colors.primary : '#8E8E93');

import CirclesScreen from './src/screens/circles/CirclesScreen';
import ActivityScreen from './src/screens/main/ActivityScreen';
import LiveRoomScreen from './src/screens/main/LiveRoomScreen';
import MomentsScreen from './src/screens/moments/MomentsScreen';
import ScrapbookScreen from './src/screens/moments/ScrapbookScreen';
import ThreadScreen from './src/screens/circles/ThreadScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import OnboardingFlow from './src/screens/onboarding/OnboardingFlow';
import AppHeader from './src/components/common/AppHeader';

const MainApp = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'circles' | 'activity' | 'profile'>('home');
  const [isInLiveRoom, setIsInLiveRoom] = useState(false);
  const [currentThread, setCurrentThread] = useState<any>(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { Colors } = useTheme();

  if (isInLiveRoom) {
    return <LiveRoomScreen navigation={{ goBack: () => setIsInLiveRoom(false) }} />;
  }

  if (currentThread) {
    return <ThreadScreen navigation={{ goBack: () => setCurrentThread(null) }} circle={currentThread} />;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen />;
      case 'circles':
        return <CirclesScreen onOpenThread={setCurrentThread} />;
      case 'activity':
        return <ActivityScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <AppHeader />
      {renderTabContent()}

      <View style={[styles.floatingNav, { bottom: insets.bottom + 12, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('home')}>
          <Home size={22} color={currentTab === 'home' ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('circles')}>
          <Users size={22} color={currentTab === 'circles' ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.createBtn, { backgroundColor: Colors.primary, shadowColor: Colors.primary }]} 
          onPress={() => setIsInLiveRoom(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('activity')}>
          <Bell size={22} color={currentTab === 'activity' ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('profile')}>
          <User size={22} color={currentTab === 'profile' ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AppContent = () => {
  const { user, userData, isLoading, isLoadingUserData } = useAuth();
  const { Colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding' | 'home' | 'loading'>('loading');

  useEffect(() => {
    if (!isLoading && !isLoadingUserData) {
      if (user && userData?.username) {
        if (userData.onboarding_done === false) {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('home');
        }
      } else {
        setCurrentScreen('welcome');
      }
    }
  }, [user, userData, isLoading, isLoadingUserData]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {currentScreen === 'loading' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen onComplete={() => {}} />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingFlow onComplete={() => setCurrentScreen('home')} />
      )}
      
      {currentScreen === 'home' && <MainApp />}
    </View>
  );
};


export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabContentCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070708',
  },
  tabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingNav: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    top: -12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  createBtnInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff4500',
  }
});
