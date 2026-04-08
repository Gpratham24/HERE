import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Shield, Lock, EyeOff, Server, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../theme/Theme';

const PrivacyScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <Shield size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.heroTitle}>Your Data, Your Circle</Text>
          <Text style={styles.heroSub}>
            Your posts, check-ins, and presence status are strictly isolated.
            Only people you invite to your circle can see them.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our V1 Commitment</Text>

          <View style={styles.infoRow}>
            <View style={styles.miniIcon}>
              <Lock size={20} color="#6366F1" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Encrypted in Transit</Text>
              <Text style={styles.infoDesc}>
                All data is protected by HTTPS/TLS and strict server-side access
                controls (RLS).
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.miniIcon}>
              <EyeOff size={20} color="#10B981" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>No Tracking</Text>
              <Text style={styles.infoDesc}>
                We never sell data, show ads, or share your content with third
                parties.
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.miniIcon}>
              <Server size={20} color="#F59E0B" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Strict Isolation</Text>
              <Text style={styles.infoDesc}>
                Presence and activity are only visible to members of the same
                circle.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            V2 Roadmap: We are rolling out true client-side Zero-Knowledge
            encryption soon for even higher security standards.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  scroll: {
    padding: 24,
  },
  heroCard: {
    backgroundColor: '#F3F2FF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  miniIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default PrivacyScreen;
