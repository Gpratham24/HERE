import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/Theme';

interface TypingIndicatorProps {
  usernames: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ usernames }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anims = [
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ];

    anims.forEach(a => a.start());

    return () => anims.forEach(a => a.stop());
  }, [dot1, dot2, dot3]);

  if (usernames.length === 0) return null;

  const displayText = usernames.length === 1 
    ? `${usernames[0]} is typing...`
    : `${usernames.length} people are typing...`;

  const renderDot = (anim: Animated.Value) => (
    <Animated.View 
      style={[
        styles.dot, 
        { 
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }]
        }
      ]} 
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {renderDot(dot1)}
        {renderDot(dot2)}
        {renderDot(dot3)}
      </View>
      <Text style={styles.text}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    marginRight: 10,
    width: 20,
    justifyContent: 'space-between',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
