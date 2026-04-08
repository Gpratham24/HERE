import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Shadows } from '../theme/Theme';
import { CheckIn } from '../store/circleStore';
import { Check, X, Target, Moon, Flame } from 'lucide-react-native';

interface CheckInStripProps {
  currentCheckIn: CheckIn | null;
  streak: number;
  onCheckIn: (type: CheckIn['type']) => void;
  onMilestoneReached?: (days: number) => void;
}

export const CheckInStrip: React.FC<CheckInStripProps> = ({
  currentCheckIn,
  streak,
  onCheckIn,
  onMilestoneReached,
}) => {
  const [scale] = useState(new Animated.Value(1));
  const [prevStreak, setPrevStreak] = useState(streak);

  useEffect(() => {
    if (streak > prevStreak) {
      if (streak === 7 || streak === 30 || streak === 100) {
        onMilestoneReached?.(streak);
      }
    }
    setPrevStreak(streak);
  }, [streak]);

  const handlePress = (type: CheckIn['type']) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onCheckIn(type);
  };

  const checkInOptions: {
    type: CheckIn['type'];
    label: string;
    icon: any;
    activeColor: string;
  }[] = [
    { type: 'done', label: 'DONE', icon: Check, activeColor: '#10B981' },
    { type: 'missed', label: 'MISSED', icon: X, activeColor: '#EF4444' },
    { type: 'focus', label: 'FOCUS', icon: Target, activeColor: '#8B5CF6' },
    { type: 'resting', label: 'RESTING', icon: Moon, activeColor: '#F59E0B' },
  ];

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>How are you</Text>
            <Text style={styles.title}>showing up today?</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          {checkInOptions.map(option => {
            const isSelected = currentCheckIn?.type === option.type;
            const Icon = option.icon;

            return (
              <View key={option.type} style={styles.buttonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handlePress(option.type)}
                  hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
                  style={[
                    styles.button,
                    isSelected
                      ? { backgroundColor: 'white' }
                      : { backgroundColor: 'rgba(255,255,255,0.1)' },
                  ]}
                >
                  <Icon
                    size={22}
                    color={isSelected ? '#701A2E' : 'white'}
                    strokeWidth={2.5}
                  />
                </TouchableOpacity>
                <Text style={[
                  styles.buttonLabel,
                  isSelected && { color: 'white', opacity: 1 }
                ]}>
                  {option.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  container: {
    backgroundColor: '#701A2E', // Deep burgundy
    borderRadius: 32,
    padding: 24,
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    lineHeight: 25,
    letterSpacing: -0.5,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'white',
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    alignItems: 'center',
    width: 62,
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
});
