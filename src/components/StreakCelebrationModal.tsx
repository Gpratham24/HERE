import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { PartyPopper, Flame, Sparkles, Share2 } from 'lucide-react-native';
import { Shadows } from '../theme/Theme';

interface StreakCelebrationModalProps {
  visible: boolean;
  days: number;
  circleName: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  visible,
  days,
  circleName,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just hit a ${days}-day streak at "${circleName}"! 🚀 Building better habits with Circlo.`,
      });
    } catch (error) {
      console.log('Share Error:', error);
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.topDecoration}>
             <Sparkles size={40} color="#F59E0B" style={styles.sparkleLeft} />
             <Sparkles size={30} color="#F59E0B" style={styles.sparkleRight} />
          </View>

          <View style={styles.iconWrapper}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <PartyPopper size={80} color="#F59E0B" />
            </Animated.View>
            <View style={styles.fireBadge}>
                <Flame size={28} color="white" fill="white" />
                <Text style={styles.fireBadgeText}>{days}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.congratsLabel}>STREAK MILESTONE</Text>
            <Text style={styles.mainTitle}>
              congratulations you compelete your <Text style={styles.highlightText}>{days} days</Text> at <Text style={styles.circleHighlight}>"{circleName}"</Text>
            </Text>
            
            <Text style={styles.description}>
              you're building an incredible hbit keep showing upo every day !
            </Text>
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={onClose} activeOpacity={0.9}>
            <Sparkles size={22} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.ctaButtonText}>Keep the fire burning!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.7}>
            <Share2 size={18} color="#64748B" style={{ marginRight: 8 }} />
            <Text style={styles.shareButtonText}>Share Achievement</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)', // Deep slate overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 48,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    ...Shadows.dark,
    overflow: 'visible',
  },
  topDecoration: {
    position: 'absolute',
    top: -20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
  sparkleLeft: { transform: [{ rotate: '-15deg' }] },
  sparkleRight: { transform: [{ rotate: '15deg' }] },
  iconWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  fireBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#701A2E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'white',
    ...Shadows.soft,
  },
  fireBadgeText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 20,
    marginLeft: 6,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  congratsLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 2.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  highlightText: {
    color: '#701A2E',
  },
  circleHighlight: {
    color: '#6358E1', // Circlo Purple
    fontStyle: 'italic',
  },
  description: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 25,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: '#701A2E',
    width: '100%',
    height: 68,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shareButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
});
