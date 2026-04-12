import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Brain, Rocket, HeartPulse, Music, Compass, Sparkles, Check, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { Colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pages = [
    { type: 'splash' },
    { type: 'identity' },
    { type: 'value' },
    { type: 'differentiation' },
  ];

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
      },
    }
  );

  React.useEffect(() => {
    // Auto advance from Screen 0 (Splash) to Screen 1 after 2 seconds
    const timer = setTimeout(() => {
      if (currentIndex === 0) {
        handleNext();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Skip Button - Top Right */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={onComplete}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Pages Container */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1 }}
      >
        {/* Screen 0: Splash */}
        <View style={[styles.page, { justifyContent: 'center', alignItems: 'center', paddingTop: 0 }]}>
          <View style={{ transform: [{ translateY: -20 }], alignItems: 'center' }}>
             <Text style={[styles.title, { fontSize: 52, fontWeight: '900', letterSpacing: -2, marginBottom: 4 }]}>Circlo</Text>
             <Text style={styles.subtitle}>Find your people. Share what matters.</Text>
          </View>
        </View>

        {/* Screen 1: Identity */}
        <View style={styles.page}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>“Find your people.”</Text>
            <Text style={styles.subtitle}>Real communities. No noise.</Text>
          </View>
          
          <View style={styles.visualContainer}>
            {/* Overlapping Community Bubbles */}
            <View style={[styles.bubble, { top: height * 0.05, left: width * 0.1, backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
              <Brain size={20} color="#8B5CF6" />
              <Text style={styles.bubbleText}>AI</Text>
            </View>

            <View style={[styles.bubble, { top: height * 0.1, right: width * 0.12, backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Rocket size={18} color="#EF4444" />
              <Text style={[styles.bubbleText, { color: '#B91C1C' }]}>Startups</Text>
            </View>

            <View style={[styles.bubble, { top: height * 0.22, left: width * 0.2, backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
              <HeartPulse size={18} color="#10B981" />
              <Text style={[styles.bubbleText, { color: '#047857' }]}>Health</Text>
            </View>

            <View style={[styles.bubble, { top: height * 0.18, right: width * 0.25, backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}>
              <Music size={18} color="#3B82F6" />
              <Text style={[styles.bubbleText, { color: '#1D4ED8' }]}>Music</Text>
            </View>

            <View style={[styles.bubble, { top: height * 0.02, left: width * 0.42, backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }]}>
              <Compass size={18} color="#EAB308" />
              <Text style={[styles.bubbleText, { color: '#A16207' }]}>Travel</Text>
            </View>
            
            {/* Center Connect lines using Absolute Views */}
            <View style={styles.centerNode}>
              <Sparkles size={24} color="#8B5CF6" />
            </View>
          </View>
        </View>

        {/* Screen 2: Core Value */}
        <View style={styles.page}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Join communities that matter</Text>
            <Text style={styles.subtitle}>Connect through interests, not followers</Text>
          </View>

          <View style={styles.visualContainer}>
            <View style={styles.cardStack}>
              {/* Mock Community Cards */}
              <View style={[styles.card, { transform: [{ rotate: '-2deg' }], marginBottom: -15, zIndex: 1, opacity: 0.8 }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🚀 Startup & Tech</Text>
                  <Check size={16} color="#10B981" />
                </View>
                <Text style={styles.cardSub}>9.4k members active</Text>
              </View>

              <View style={[styles.card, { transform: [{ rotate: '1deg' }], marginBottom: -15, zIndex: 2, borderWidth: 1.5, borderColor: '#8B5CF6' }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: '#8B5CF6' }]}>🤖 AI & Innovation</Text>
                  <Check size={16} color="#10B981" />
                </View>
                <Text style={styles.cardSub}>14.2k members active</Text>
              </View>

              <View style={[styles.card, { transform: [{ rotate: '-1deg' }], zIndex: 1, opacity: 0.9 }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🏥 Health & Wellness</Text>
                  <Check size={16} color="#10B981" />
                </View>
                <Text style={styles.cardSub}>7.8k members active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Screen 3: Differentiation */}
        <View style={styles.page}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>No algorithm. Just relevance.</Text>
            <Text style={styles.subtitle}>See what matters, not what trends</Text>
          </View>

          <View style={styles.visualContainer}>
            <View style={styles.feedMock}>
              <View style={styles.relevanceTag}>
                <Sparkles size={12} color="#8B5CF6" />
                <Text style={styles.relevanceText}>Because you follow AI</Text>
              </View>
              <View style={styles.postMock}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarMock} />
                  <View>
                    <Text style={styles.postUser}>Dr. Alex Carter</Text>
                    <Text style={styles.postCommunity}>From AI & Innovation</Text>
                  </View>
                </View>
                <Text style={styles.postText}>
                  Just published a breakthrough in neural networks. Revisit standard models to see immediate speeds.
                </Text>
                <View style={styles.postImageMock} />
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Animated Dot Indicator */}
        {currentIndex > 0 ? (
          <View style={styles.dotContainer}>
            {pages.map((_, index) => {
              if (index === 0) return null; // Skip dot for splash
              const opacity = scrollX.interpolate({
                inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              const dotWidth = scrollX.interpolate({
                inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                outputRange: [8, 18, 8],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: index === currentIndex ? '#8B5CF6' : '#E2E8F0',
                    },
                  ]}
                />
              );
            })}
          </View>
        ) : <View />}

        {/* Next / Get Started Button */}
        <TouchableOpacity
          style={[styles.nextBtn, currentIndex === pages.length - 1 && styles.nextBtnActive]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextBtnText, currentIndex === pages.length - 1 && { color: '#ffffff' }]}>
            {currentIndex < pages.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          <ArrowRight size={16} color={currentIndex === pages.length - 1 ? '#ffffff' : '#1E293B'} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  page: {
    width: width,
    height: height,
    paddingTop: height * 0.12,
  },
  titleWrapper: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  visualContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D28D9',
  },
  centerNode: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C084FC',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardStack: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '90%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  feedMock: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  relevanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  relevanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  postMock: {
    marginBottom: 0,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  avatarMock: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  postUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  postCommunity: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  postText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 12,
  },
  postImageMock: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  nextBtnActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
});
