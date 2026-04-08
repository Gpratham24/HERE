import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, User, Compass, Plus } from 'lucide-react-native';

import { HomeScreen } from '../../screens/home/HomeScreen';
import CirclesScreen from '../../screens/circles/CirclesScreen';
import ActivityScreen from '../../screens/activity/ActivityScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import { Colors, Shadows } from '../../theme/Theme';

const Tab = createBottomTabNavigator();

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home: Home,
  Circles: Users,
  Profile: User,
  Explore: Compass,
  Plus: Plus,
};

const TabIcon = React.memo(({ name, focused }: { name: string; focused: boolean }) => {
  const Icon = ICON_MAP[name] ?? Home;
  const isPlus = name === 'Plus';
  const isCircles = name === 'Circles';

  return (
    <View style={[styles.iconWrapper, isPlus && { overflow: 'visible', zIndex: 10 }]}>
      <View
        style={[
          styles.iconContainer,
          isPlus && styles.plusContainer,
          focused && !isPlus && styles.activeIconWrap,
        ]}
      >
        <Icon
          size={isPlus ? 32 : 24}
          color={isPlus ? '#FFFFFF' : focused ? Colors.primary : Colors.textTertiary}
          strokeWidth={focused || isPlus ? 2.5 : 2}
        />
        {isCircles && <View style={styles.badge} />}
      </View>
      {focused && !isPlus && <View style={styles.activeDot} />}
    </View>
  );
});

export const MainTabs = () => {
  const { bottom } = useSafeAreaInsets();

  const screenOptions = useCallback(
    ({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? bottom : 20,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 35,
        borderTopWidth: 0,
        ...Shadows.premium,
        // Critical for floating elements
        overflow: 'visible',
      },
      tabBarIcon: (props) => (
        <TabIcon name={route.name} focused={props.focused} />
      ),
      tabBarHideOnKeyboard: true,
    }),
    [bottom]
  );

  return (
    <View style={styles.root}>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Circles" component={CirclesScreen} />
        <Tab.Screen
          name="Plus"
          component={ActivityScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              // Use navigate with a key or specific reset if needed, 
              // but standard navigate should work if params are handled.
              navigation.navigate('Home', {
                openPostSheet: true,
                timestamp: Date.now() // Force update even if already on home
              });
            },
          })}
        />
        <Tab.Screen name="Explore" component={ActivityScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    width: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  activeIconWrap: {
    backgroundColor: Colors.primaryLight,
  },
  plusContainer: {
    backgroundColor: Colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    transform: [{ translateY: -20 }],
    borderWidth: 6,
    borderColor: '#FFFFFF',
    ...Shadows.medium,
    zIndex: 999,
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
});
