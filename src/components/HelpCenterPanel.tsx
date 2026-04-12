import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Users, Shield, Zap, HelpCircle, ChevronRight, MessageSquare, Heart, ChevronDown } from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width, height } = Dimensions.get('window');

interface HelpCenterPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpCenterPanel: React.FC<HelpCenterPanelProps> = ({
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

  const handleContactSupport = () => {
    Linking.openURL('mailto:prathambook.bay@gmail.com');
  };

  const HelpCategory = ({ icon, title, count }: any) => (
    <TouchableOpacity style={styles.categoryCard} activeOpacity={0.7}>
      <View style={styles.categoryIconBox}>{icon}</View>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryCount}>{count} Articles</Text>
    </TouchableOpacity>
  );

  const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    };

    return (
      <View style={styles.faqItemWrapper}>
        <TouchableOpacity 
          style={styles.faqItem} 
          activeOpacity={0.6}
          onPress={toggleExpand}
        >
          <Text style={styles.faqQuestion}>{question}</Text>
          {expanded ? (
            <ChevronDown size={18} color={Colors.primary} />
          ) : (
            <ChevronRight size={18} color="#CBD5E1" />
          )}
        </TouchableOpacity>
        {expanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswerText}>{answer}</Text>
          </View>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <ChevronLeft size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help Center</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Search Header */}
            <View style={styles.searchSection}>
              <Text style={styles.searchTitle}>How can we help?</Text>
              <View style={styles.searchBar}>
                <Search size={20} color="#94A3B8" />
                <TextInput 
                  placeholder="Search for articles..." 
                  style={styles.searchInput}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Categories Grid */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionLabel}>BROWSE CATEGORIES</Text>
              <View style={styles.gridRow}>
                <HelpCategory 
                  icon={<Zap size={22} color="#F59E0B" />} 
                  title="Getting Started" 
                  count={12} 
                />
                <HelpCategory 
                  icon={<Users size={22} color="#6366F1" />} 
                  title="Circles & People" 
                  count={8} 
                />
              </View>
              <View style={styles.gridRow}>
                <HelpCategory 
                  icon={<Shield size={22} color="#10B981" />} 
                  title="Safety & Privacy" 
                  count={15} 
                />
                <HelpCategory 
                  icon={<MessageSquare size={22} color="#EC4899" />} 
                  title="Moments & Chat" 
                  count={6} 
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Popular Questions */}
            <View style={styles.faqSection}>
              <Text style={styles.sectionLabel}>POPULAR QUESTIONS</Text>
              <FAQItem 
                question="How do I invite friends?" 
                answer="You can invite friends by sharing your unique Circle Invite Code. Tap on the circle name at the top of your home screen, then tap 'Invite Members' to find your code."
              />
              <FAQItem 
                question="Who can see my presence vibe?" 
                answer="Your presence and 'vibe' are exclusively visible to members of the circle you are currently joined in. Users in other circles or outside Circlo cannot see this information."
              />
              <FAQItem 
                question="Can I delete my account permanently?" 
                answer="Yes. Go to Settings > Account Info and you will find the 'Delete Account' option at the bottom. Please note that this action is permanent and deletes all your data."
              />
              <FAQItem 
                question="What are Circle Streaks?" 
                answer="Circle Streaks represent consistent daily engagement with your circle members. They grow when you share moments or update your status daily."
              />
              <FAQItem 
                question="How do I change my circle members?" 
                answer="If you are the creator of a circle, you can manage members by tapping the Circle Name > Settings > Manage Members. From there, you can remove members if needed."
              />
            </View>

            {/* Support Footer */}
            <View style={styles.supportCard}>
              <View style={styles.supportInfo}>
                <HelpCircle size={32} color="#FFF" />
                <View>
                  <Text style={styles.supportTitle}>Still need help?</Text>
                  <Text style={styles.supportSub}>Our team is here for you.</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.supportBtn}
                onPress={handleContactSupport}
              >
                <Text style={styles.supportBtnText}>Contact Support</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.guidelinesBtn}>
              <Heart size={18} color="#94A3B8" />
              <Text style={styles.guidelinesText}>Community Guidelines</Text>
            </TouchableOpacity>

            <Text style={styles.footerVersion}>
              Handcrafted help for our global community.{"\n"}
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
    paddingBottom: 60,
    flexGrow: 1,
  },
  searchSection: {
    padding: 32,
    backgroundColor: '#F8FAFF',
  },
  searchTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  categoriesSection: {
    padding: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 20,
    marginLeft: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Shadows.soft,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  categoryCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 24,
    marginVertical: 10,
  },
  faqSection: {
    paddingX: 24,
  },
  faqItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    marginRight: 16,
  },
  faqAnswerContainer: {
    paddingHorizontal: 8,
    paddingBottom: 18,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '500',
  },
  supportCard: {
    backgroundColor: '#1E293B',
    margin: 24,
    padding: 24,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.dark,
  },
  supportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  supportTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  supportSub: {
    color: '#CBD5E1', // Improved readability
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  supportBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  supportBtnText: {
    color: '#1E293B',
    fontWeight: '800',
    fontSize: 14,
  },
  guidelinesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  guidelinesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    paddingVertical: 32,
    lineHeight: 18,
  },
});
