import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  StatusBar,
  Dimensions
} from 'react-native';

const { height } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stage 1: Initial Reveal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        useNativeDriver: true,
      })
    ]).start();

    // Stage 2: Move Full Header UP (Logo + Line + Tagline)
    const moveTimer = setTimeout(() => {
      Animated.timing(moveAnim, {
        toValue: -(height / 2 - 140), // Adjusted target for full header block
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Handover immediately
        navigation.replace('Signup');
      });
    }, 1400);

    return () => clearTimeout(moveTimer);
  }, [fadeAnim, scaleAnim, moveAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: moveAnim }
            ]
          }
        ]}
      >
        <Text style={styles.logo}>HERE</Text>
        <View style={styles.line} />
        <Text style={styles.tagline}>Private Social for Real Circles</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1.5,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginVertical: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
