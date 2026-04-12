import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, PieChart, Plus, TrendingUp, User } from 'lucide-react-native';

import { HomeScreen } from '../../screens/home/HomeScreen';
import CirclesScreen from '../../screens/circles/CirclesScreen';
import ActivityScreen from '../../screens/activity/ActivityScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  bg: '#FFFFFF',
  bgActive: '#F8F7FF',
  border: '#E8E8F0',
  divider: '#F0F0F5',
  iconActive: '#7C3AED',
  iconInactive: '#94A3B8',
  labelActive: '#1F2937',
  labelInactive: '#9CA3AF',
  fab: '#7C3AED',
  fabIcon: '#FFFFFF',
  accentBar: '#7C3AED',
};

const TAB_CONFIG: Record<string, { Icon: React.ComponentType<any>; label: string }> = {
  Home: { Icon: Home, label: 'home' },
  Circles: { Icon: PieChart, label: 'circles' },
  Plus: { Icon: Plus, label: '' },
  Explore: { Icon: TrendingUp, label: 'explore' },
  Profile: { Icon: User, label: 'profile' },
};

const Divider = () => <View style={styles.divider} />;

// ─── Animated FAB ────────────────────────────────────────────────────────────
const FabButton = React.memo(({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }),
      Animated.timing(rotate, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.fabButton,
          { transform: [{ scale }, { rotate: spin }] },
        ]}
      >
        <Plus size={20} color={COLORS.fabIcon} strokeWidth={2.2} />
      </Animated.View>
    </Pressable>
  );
});

// ─── Animated Tab Item ────────────────────────────────────────────────────────
const TabItem = React.memo(({
  name,
  focused,
  onPress,
}: {
  name: string;
  focused: boolean;
  onPress: () => void;
}) => {
  const config = TAB_CONFIG[name];
  if (!config) return null;
  const { Icon, label } = config;

  // Scale animation on press
  const scale = useRef(new Animated.Value(1)).current;
  // Fade for the active background + label
  const activeFade = useRef(new Animated.Value(focused ? 1 : 0)).current;
  // Icon translate-up on activate
  const iconTranslate = useRef(new Animated.Value(focused ? -2 : 0)).current;

  // Sync activeFade & translate when focused changes
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(activeFade, {
        toValue: focused ? 1 : 0,
        useNativeDriver: false, // Color still needs false
        speed: 30,
        bounciness: 0,
      }),
      Animated.spring(iconTranslate, {
        toValue: focused ? -2 : 0,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
    ]).start();
  }, [focused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const accentBarScale = activeFade;

  const accentBarOpacity = activeFade.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 1],
  });

  const labelOpacity = activeFade.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 1],
  });

  const iconColor = focused ? COLORS.iconActive : COLORS.iconInactive;

  return (
    <Pressable
      style={styles.tabSlot}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.tabInner,
          {
            backgroundColor: focused ? COLORS.bgActive : COLORS.bg,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Accent bar */}
        <Animated.View
          style={[
            styles.accentBar,
            {
              opacity: accentBarOpacity,
              transform: [
                { translateY: 10 },
                { scaleY: accentBarScale },
                { translateY: -10 }
              ],
            },
          ]}
        />

        {/* Icon */}
        <Animated.View style={{ transform: [{ translateY: iconTranslate }] }}>
          <Icon
            size={20}
            color={iconColor}
            strokeWidth={focused ? 2 : 1.6}
          />
        </Animated.View>

        {/* Label */}
        <Animated.Text style={[styles.label, { opacity: labelOpacity, color: focused ? COLORS.labelActive : COLORS.labelInactive }]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
});

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.navBar,
        {
          bottom: Platform.OS === 'ios' ? bottom + 16 : 20,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const isCenter = route.name === 'Plus';

        const onPress = () => {
          if (isCenter) {
            navigation.navigate('Home', {
              openPostSheet: true,
              timestamp: Date.now(),
            });
            return;
          }
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <React.Fragment key={route.key}>
            {index > 0 && <Divider />}
            {isCenter ? (
              <View style={styles.tabSlot}>
                <FabButton onPress={onPress} />
              </View>
            ) : (
              <TabItem name={route.name} focused={focused} onPress={onPress} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────
export const MainTabs = () => (
  <View style={styles.root}>
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Circles" component={CirclesScreen} />
      <Tab.Screen name="Plus" component={ActivityScreen} />
      <Tab.Screen name="Explore" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 19,
    left: 8,
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#C8B8FF',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.divider,
    flexShrink: 0,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#C8B8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});