import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles, Heart, Eye, Zap, Smile, Lock } from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';

const { width, height } = Dimensions.get('window');

interface AboutCircloPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutCircloPanel: React.FC<AboutCircloPanelProps> = ({
  visible,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      slideAnim.setValue(width);
    }
  }, [visible, slideAnim]);

  const StorySection = ({ icon, title, text, color }: any) => (
    <View style={styles.storySection}>
      <View style={[styles.storyIconBox, { backgroundColor: color + '10' }]}>
        {icon}
      </View>
      <View style={styles.storyContent}>
        <Text style={styles.storyTitle}>{title}</Text>
        <Text style={styles.storyText}>{text}</Text>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <ChevronLeft size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About Circlo</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Hero Brand Section */}
            <View style={styles.heroSection}>
              <View style={styles.brandIconBox}>
                <Sparkles size={44} color={Colors.primary} />
              </View>
              <Text style={styles.heroMainTitle}>Intimate Spaces for{"\n"}Real Friendships</Text>
              <Text style={styles.heroSubText}>
                The world is louder than ever. We built Circlo to give you back the quiet joy 
                of staying connected with the people who actually matter.
              </Text>
            </View>

            {/* Our Story */}
            <View style={styles.narrativeSection}>
              <Text style={styles.sectionLabel}>THE CIRCLO NARRATIVE</Text>
              <Text style={styles.narrativeText}>
                Circlo started as an experiment in digital minimalism. We asked ourselves: 
                "Why does social media feel like a performance?"{"\n\n"}
                We removed the public profiles, the likes, and the global feeds. Instead, 
                we focused on the **Circle**—a private sanctuary for you and your 
                inner world.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Core Pillars */}
            <View style={styles.pillarsContainer}>
              <Text style={styles.sectionLabel}>OUR CORE PILLARS</Text>
              
              <StorySection 
                icon={<Eye size={24} color="#6366F1" />}
                title="Presence over Performance"
                text="Circlo isn't about looking perfect. It's about being seen as you are, updating your vibe in real-time so those close to you know when to reach out."
                color="#6366F1"
              />

              <StorySection 
                icon={<Lock size={24} color="#10B981" />}
                title="Privacy over Publicity"
                text="Everything you share stays within your Circle. No algorithms, no data mining for ads, and no unwanted viewers. Period."
                color="#10B981"
              />

              <StorySection 
                icon={<Zap size={24} color="#F59E0B" />}
                title="Depth over Breadth"
                text="In a world of thousands of 'friends', we focus on the top 10 folks who know your story. We prioritize active, deep conversation over passive scrolling."
                color="#F59E0B"
              />

              <StorySection 
                icon={<Heart size={24} color="#F43F5E" />}
                title="No Toxic Loops"
                text="We intentionally omitted 'likes' and notifications-for-the-sake-of-it. Circlo is designed to be visited when you want, not when we demand your attention."
                color="#F43F5E"
              />
            </View>

            {/* The Promise */}
            <View style={styles.promiseCard}>
              <Smile size={32} color="#4F46E5" />
              <Text style={styles.promiseTitle}>The Circlo Promise</Text>
              <Text style={styles.promiseText}>
                We will never sell your data, never inject ads into your feed, and 
                never use algorithms to manipulate your attention. Circlo is 
                yours to own.
              </Text>
            </View>

            <Text style={styles.versionInfo}>
              Handcrafted with ♥️ for deeper connection.{"\n"}
              Version 1.0.4 (Build 42)
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2500,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  heroSection: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  brandIconBox: {
    width: 88,
    height: 88,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
    marginBottom: 24,
  },
  heroMainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -1,
  },
  heroSubText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  narrativeSection: {
    padding: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  narrativeText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 25,
    fontWeight: '500',
  },
  divider: {
    height: 6,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  pillarsContainer: {
    padding: 32,
  },
  storySection: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 20,
  },
  storyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  storyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '500',
  },
  promiseCard: {
    backgroundColor: '#EEF2FF',
    margin: 32,
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  promiseTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#312E81',
    marginTop: 12,
    marginBottom: 8,
  },
  promiseText: {
    fontSize: 14,
    color: '#4338CA',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  versionInfo: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    paddingVertical: 20,
    lineHeight: 20,
  },
});
