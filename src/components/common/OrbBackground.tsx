import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const THEME = {
  purple: '#7F77DD',
  teal: '#1D9E75',
  coral: '#D85A30',
  blue: '#3B82F6',
  offWhite: '#FDFDFF',
  bgGradient: ['#FDFDFF', '#F5F5F9'],
};

export type OrbPreset = 'splash' | 'ob1' | 'ob2' | 'ob3' | 'ob4' | 'auth' | 'choice' | 'invite';

interface OrbBackgroundProps {
  preset?: OrbPreset;
}

export const OrbBackground = ({ preset = 'splash' }: OrbBackgroundProps) => {
  // Orb 1 Animations
  const orb1X = useRef(new Animated.Value(-width * 0.2)).current;
  const orb1Y = useRef(new Animated.Value(-height * 0.1)).current;
  const orb1Size = useRef(new Animated.Value(width * 1.1)).current;
  const orb1Color = useRef(new Animated.Value(0)).current; // 0: purple, 1: teal, 2: coral, 3: blue

  // Orb 2 Animations
  const orb2X = useRef(new Animated.Value(width * 0.5)).current;
  const orb2Y = useRef(new Animated.Value(height * 0.6)).current;
  const orb2Size = useRef(new Animated.Value(width * 0.7)).current;
  const orb2Opacity = useRef(new Animated.Value(1)).current;

  // Orb 3 Animations (Splash only)
  const orb3Opacity = useRef(new Animated.Value(preset === 'splash' ? 1 : 0)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 4000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 4000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let config = {
      orb1: { x: -width * 0.2, y: -height * 0.1, size: width * 1.1, color: 0, opacity: 1 },
      orb2: { x: width * 0.5, y: height * 0.6, size: width * 0.7, opacity: 1 },
      orb3: { opacity: 0 }
    };

    switch (preset) {
      case 'splash':
        config = {
          orb1: { x: -width * 0.2, y: -height * 0.1, size: width * 1.1, color: 0, opacity: 1 },
          orb2: { x: width * 0.5, y: height * 0.6, size: width * 0.7, opacity: 1 },
          orb3: { opacity: 1 }
        };
        break;
      case 'ob1':
        config = {
          orb1: { x: width * 0.2, y: -height * 0.1, size: width * 1.0, color: 0, opacity: 1 },
          orb2: { x: width, y: height, size: 1, opacity: 0 },
          orb3: { opacity: 0 }
        };
        break;
      case 'ob2':
        config = {
          orb1: { x: -width * 0.3, y: -height * 0.1, size: width * 0.9, color: 1, opacity: 1 },
          orb2: { x: width, y: height, size: 1, opacity: 0 },
          orb3: { opacity: 0 }
        };
        break;
      case 'ob3':
        config = {
          orb1: { x: width * 0.3, y: -height * 0.05, size: width * 0.95, color: 2, opacity: 1 },
          orb2: { x: width, y: height, size: 1, opacity: 0 },
          orb3: { opacity: 0 }
        };
        break;
      case 'ob4':
        config = {
          orb1: { x: -width * 0.1, y: -height * 0.05, size: width * 1.0, color: 3, opacity: 1 },
          orb2: { x: width, y: height, size: 1, opacity: 0 },
          orb3: { opacity: 0 }
        };
        break;
      case 'auth':
      case 'choice':
      case 'invite':
        config = {
          orb1: { x: width * 0.4, y: -height * 0.1, size: width * 0.8, color: 0, opacity: 1 },
          orb2: { x: -width * 0.1, y: height * 0.7, size: width * 0.5, opacity: 1 },
          orb3: { opacity: 0 }
        };
        break;
    }

    Animated.parallel([
      Animated.spring(orb1X, { toValue: config.orb1.x, useNativeDriver: false, friction: 8 }),
      Animated.spring(orb1Y, { toValue: config.orb1.y, useNativeDriver: false, friction: 8 }),
      Animated.spring(orb1Size, { toValue: config.orb1.size, useNativeDriver: false }),
      Animated.timing(orb1Color, { toValue: config.orb1.color, duration: 800, useNativeDriver: false }),
      Animated.timing(orb2X, { toValue: config.orb2.x, duration: 800, useNativeDriver: false }),
      Animated.timing(orb2Y, { toValue: config.orb2.y, duration: 800, useNativeDriver: false }),
      Animated.timing(orb2Size, { toValue: config.orb2.size, duration: 800, useNativeDriver: false }),
      Animated.timing(orb2Opacity, { toValue: config.orb2.opacity, duration: 800, useNativeDriver: false }),
      Animated.timing(orb3Opacity, { toValue: config.orb3.opacity, duration: 800, useNativeDriver: false }),
    ]).start();
  }, [preset]);

  const interpolatedColor = orb1Color.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [THEME.purple + '15', THEME.teal + '12', THEME.coral + '12', THEME.blue + '12']
  });

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      <LinearGradient colors={THEME.bgGradient} style={StyleSheet.absoluteFill} />
      
      {/* Orb 1 */}
      <Animated.View 
        style={[
          styles.orb, 
          { 
            backgroundColor: interpolatedColor, 
            width: orb1Size, height: orb1Size, 
            left: orb1X, top: orb1Y,
            transform: [{ scale: pulseAnim }]
          }
        ]} 
      />

      {/* Orb 2 */}
      <Animated.View 
        style={[
          styles.orb, 
          { 
            backgroundColor: THEME.purple + '08', 
            width: orb2Size, height: orb2Size, 
            left: orb2X, top: orb2Y,
            opacity: orb2Opacity,
            transform: [{ scale: Animated.multiply(pulseAnim, 0.95) }]
          }
        ]} 
      />

      {/* Orb 3 (Center - Splash Only) */}
      <Animated.View 
        style={[
          styles.orb, 
          { 
            backgroundColor: THEME.purple + '10', 
            width: width * 0.4, height: width * 0.4, 
            left: width * 0.3, top: height * 0.25,
            opacity: orb3Opacity,
            transform: [{ scale: pulseAnim }]
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
});
