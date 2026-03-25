import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, Text, View, Animated, StyleSheet, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Plus, Bell, User, Search, Users } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import WelcomeScreen from './src/screens/WelcomeScreen';
import InterestScreen from './src/screens/InterestScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DiscoverScreen from './src/screens/DiscoverScreen'; // Add this
import { Colors } from './src/theme/Theme';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const SuccessScreen = ({ onComplete }: { onComplete: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true })
    ]).start(() => {
      setTimeout(onComplete, 2200);
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Text style={{ fontSize: 34, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginBottom: 12 }}>
          Welcome to HERE
        </Text>
        <Text style={{ fontSize: 15, fontStyle: 'italic', color: '#64748B', textAlign: 'center', paddingHorizontal: 36, lineHeight: 22 }}>
          "Find your people. Share what matters."
        </Text>
      </Animated.View>
    </View>
  );
};

import CreatePostModal from './src/components/home/CreatePostModal';

import NotificationScreen from './src/screens/NotificationScreen'; // Add this

const currentScreenColor = (isActive: boolean) => (isActive ? Colors.primary : '#8E8E93');

const MainApp = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'discover' | 'create' | 'notifications' | 'profile'>('home');
  const [navHistory, setNavHistory] = useState<string[]>(['home']);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('targetUid', '==', uid)
      .where('isRead', '==', false)
      .onSnapshot(snapshot => {
         setHasUnread(snapshot && !snapshot.empty);
      }, err => console.log('App Notification Error:', err));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
     const backAction = () => {
        if (isCreateOpen) {
           setIsCreateOpen(false);
           return true;
        }
        if (navHistory.length > 1) {
           const newHist = [...navHistory];
           newHist.pop(); // remove current tab
           const prevTab = newHist[newHist.length - 1];
           setNavHistory(newHist);
           setCurrentTab(prevTab as any);
           return true;
        }
        return false; // let app exit default
     };
     const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
     return () => backHandler.remove();
  }, [navHistory, isCreateOpen]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCreatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true })
    ]).start(() => {
      setIsCreateOpen(true);
    });
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen 
          onExploreCommunities={() => { setCurrentTab('discover'); setNavHistory(p => [...p, 'discover']); }} 
          onCreatePost={() => setIsCreateOpen(true)} 
          onNotificationPress={() => { setCurrentTab('notifications'); setNavHistory(p => [...p, 'notifications']); }}
          onProfilePress={() => { setCurrentTab('profile'); setNavHistory(p => [...p, 'profile']); }}
        />;
      case 'discover':
        return <DiscoverScreen 
          onNotificationPress={() => { setCurrentTab('notifications'); setNavHistory(p => [...p, 'notifications']); }}
          onProfilePress={() => { setCurrentTab('profile'); setNavHistory(p => [...p, 'profile']); }}
        />;
      case 'notifications':
        return <NotificationScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen 
          onExploreCommunities={() => { setCurrentTab('discover'); setNavHistory(p => [...p, 'discover']); }} 
          onCreatePost={() => setIsCreateOpen(true)} 
          onNotificationPress={() => { setCurrentTab('notifications'); setNavHistory(p => [...p, 'notifications']); }}
          onProfilePress={() => { setCurrentTab('profile'); setNavHistory(p => [...p, 'profile']); }}
        />;
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {renderTabContent()}

      <View style={[styles.floatingNav, { bottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => { setCurrentTab('home'); setNavHistory(p => [...p, 'home']); }} activeOpacity={0.7}>
          <View style={currentTab === 'home' ? { backgroundColor: 'rgba(139, 92, 246, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 } : { paddingHorizontal: 12, paddingVertical: 6 }}>
            <Home size={22} color={currentScreenColor(currentTab === 'home')} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { setCurrentTab('discover'); setNavHistory(p => [...p, 'discover']); }} activeOpacity={0.7}>
          <View style={currentTab === 'discover' ? { backgroundColor: 'rgba(139, 92, 246, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 } : { paddingHorizontal: 12, paddingVertical: 6 }}>
            <Search size={22} color={currentScreenColor(currentTab === 'discover')} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createBtn} activeOpacity={0.85} onPress={handleCreatePress}>
          <Animated.View style={[styles.createBtnInner, { transform: [{ scale: scaleAnim }] }]}>
            <Plus size={24} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <CreatePostModal visible={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </View>
  );
};

import { useTheme } from './src/context/ThemeContext';

const AppContent = () => {
  const { user, userData, isLoading, isLoadingUserData } = useAuth();
  const { Colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'interests' | 'communities' | 'success' | 'home' | 'loading'>('loading');
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoadingUserData) {
      if (user) {
        if (userData?.username) {
          if (currentScreen === 'loading') {
            setCurrentScreen('home');
          }
        } else if (currentScreen === 'loading') {
          setCurrentScreen('welcome');
        }
      } else {
        setCurrentScreen('welcome');
      }
    }
  }, [user, userData, isLoading, isLoadingUserData, currentScreen]);

  return (
    <View style={{ flex: 1, backgroundColor: (currentScreen === 'loading' || currentScreen === 'welcome') ? '#F8FAFC' : Colors.background }}>
      {currentScreen === 'loading' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onComplete={async (isNew) => {
            if (isNew === true) {
              setCurrentScreen('interests');
            } else {
              const uid = auth().currentUser?.uid;
              if (uid) {
                try {
                  const doc = await firestore().collection('users').doc(uid).get();
                  if (doc.exists() && doc.data()?.username) {
                    setCurrentScreen('home');
                  } else {
                    // Do nothing, they will stay on Welcome Screen setup stage 2 to create username
                  }
                } catch (e) {
                  console.error('Error fetching user for setup:', e);
                }
              }
            }
          }}
        />
      )}
      {currentScreen === 'interests' && <InterestScreen onComplete={() => setCurrentScreen('communities')} />}
      {currentScreen === 'communities' && <CommunityScreen onComplete={() => setCurrentScreen('success')} />}
      {currentScreen === 'success' && <SuccessScreen onComplete={() => setCurrentScreen('home')} />}
      {currentScreen === 'home' && <MainApp />}
    </View>
  );
};

import { ThemeProvider } from './src/context/ThemeContext';

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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
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
