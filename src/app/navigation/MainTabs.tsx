import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Users, Bell, User } from 'lucide-react-native';

import CirclesScreen from '../../screens/circles/CirclesScreen';
import CircleDetailScreen from '../../screens/circles/CircleDetailScreen';
import ActivityScreen from '../../screens/activity/ActivityScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import { Colors } from '../../theme/Theme';

const Tab = createBottomTabNavigator();
const CirclesStack = createNativeStackNavigator();

const CirclesNavigator = () => (
  <CirclesStack.Navigator screenOptions={{ headerShown: false }}>
    <CirclesStack.Screen name="CirclesList" component={CirclesScreen} />
    <CirclesStack.Screen name="CircleDetail" component={CircleDetailScreen} />
  </CirclesStack.Navigator>
);

const TabIcon = ({ name, color, size, focused }: { name: string, color: string, size: number, focused: boolean }) => {
  const Icon = name === 'Circles' ? Users : name === 'Activity' ? Bell : User;

  return (
    <View style={[
      styles.iconWrapper,
      focused && styles.activeIconWrapper
    ]}>
      <Icon
        size={size}
        color={focused ? Colors.primary : '#94A3B8'}
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );
};

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Cleaner, premium look (removes overlap)
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 24,
          right: 24,
          height: 80, // Taller bar for premium feel
          borderRadius: 40,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          paddingBottom: 0,
        },
        tabBarIcon: (props) => <TabIcon name={route.name} {...props} />,
      })}
    >
      <Tab.Screen
        name="Circles"
        component={CirclesNavigator}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: 64,
    height: 48, // Pill-like ratio
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  activeIconWrapper: {
    backgroundColor: '#F3F2FF', // Even softer lavender for that premium blend
  },
});
