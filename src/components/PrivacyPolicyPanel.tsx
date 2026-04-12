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
import { ChevronLeft, Shield, EyeOff, Lock, Trash2, Mail, ExternalLink, Info } from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';

const { width, height } = Dimensions.get('window');

interface PrivacyPolicyPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyPanel: React.FC<PrivacyPolicyPanelProps> = ({
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

  const PolicySection = ({ title, content, icon }: any) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconCircle}>
          {icon}
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionText}>{content}</Text>
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.introBox}>
              <Shield size={32} color={Colors.primary} />
              <Text style={styles.introTitle}>Your Privacy, Simplified.</Text>
              <Text style={styles.introSubText}>
                At Circlo, privacy isn't a feature—it's the foundation. 
                Last updated: October 24, 2023.
              </Text>
            </View>

            <PolicySection 
              icon={<Info size={20} color="#6366F1" />}
              title="1. Introduction"
              content="Circlo is designed to be a private social space. We believe you should know exactly what happens to your data. This policy explains our commitment to transparency and your control over your digital life."
            />

            <PolicySection 
              icon={<Lock size={20} color="#10B981" />}
              title="2. Data Collection"
              content="We collect only what's necessary: your username, email for account security, and the content you explicitly share within your Circles. We do not track your location in the background or scan your contacts without permission."
            />

            <PolicySection 
              icon={<EyeOff size={20} color="#F59E0B" />}
              title="3. No Ads / No Selling"
              content="We do not sell your data to third parties. We do not use algorithms to profile you for advertisers. Circlo is built on the belief that users are participants, not products."
            />

            <PolicySection 
              icon={<Trash2 size={20} color="#EF4444" />}
              title="4. Your Control"
              content="You own your content. You can delete your posts, leave circles, or close your account at any time. When you delete something, we aim to remove it from our active systems immediately."
            />

            <View style={styles.divider} />

            <View style={styles.cardSection}>
              <Text style={styles.cardHeader}>COOKIE POLICY</Text>
              <Text style={styles.cardText}>
                We use minimal functional cookies to keep you logged in and remember 
                your preferences. No third-party tracking cookies are used.
              </Text>
            </View>

            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkLeft}>
                <ExternalLink size={18} color="#64748B" />
                <Text style={styles.linkText}>View Full Legal Terms</Text>
              </View>
              <ChevronLeft size={18} color="#CBD5E1" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={styles.contactCard}>
              <Mail size={24} color="#4F46E5" />
              <Text style={styles.contactTitle}>Privacy Questions?</Text>
              <Text style={styles.contactText}>
                Reach out to our privacy team at privacy@circlo.app. 
                We usually respond within 24 hours.
              </Text>
            </View>

            <Text style={styles.footerNote}>
              Circlo, Inc. • 123 Digital Way, San Francisco, CA
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
  introBox: {
    padding: 32,
    backgroundColor: '#F8F9FF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  introSubText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 24,
    marginTop: 40,
  },
  cardSection: {
    margin: 24,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 20,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  contactCard: {
    backgroundColor: '#F5F3FF',
    margin: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4C1D95',
    marginTop: 12,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#7C3AED',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    paddingVertical: 20,
  },
});
