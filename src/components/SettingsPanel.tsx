import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Switch,
} from 'react-native';
import { X, ChevronRight, User, Shield, Bell, HelpCircle, Info, LogOut, Fingerprint } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/Theme';
import { useSettingsStore } from '../store/settingsStore';
import { AccountEditPanel } from './AccountEditPanel';
import { AboutCircloPanel } from './AboutCircloPanel';
import { PrivacyPolicyPanel } from './PrivacyPolicyPanel';
import { HelpCenterPanel } from './HelpCenterPanel';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const { width, height } = Dimensions.get('window');

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const { biometricsEnabled, setBiometricsEnabled } = useSettingsStore();
  const [showAccountEdit, setShowAccountEdit] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // Check if any sub-panel is currently open
  const isSubPanelOpen = showAccountEdit || showAbout || showPrivacy || showHelp;

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

  const renderItem = (icon: any, title: string, color: string, onPress?: () => void) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.itemText}>{title}</Text>
      <ChevronRight size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Settings Panel Content */}
        <Animated.View
          pointerEvents={isSubPanelOpen ? 'none' : 'auto'}
          style={[
            styles.panel,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>PREFERENCES</Text>
                {renderItem(<User size={20} color="#4F46E5" />, "Account Info", "#4F46E5", () => setShowAccountEdit(true))}
                {renderItem(<Bell size={20} color="#F59E0B" />, "Notifications", "#F59E0B")}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SECURITY</Text>
                <View style={styles.item}>
                  <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
                    <Fingerprint size={20} color="#10B981" />
                  </View>
                  <Text style={styles.itemText}>Biometric Lock</Text>
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={setBiometricsEnabled}
                    trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                    thumbColor={biometricsEnabled ? '#4F46E5' : '#F8FAFC'}
                  />
                </View>
                {renderItem(<Shield size={20} color="#6366F1" />, "Privacy Policy", "#6366F1", () => setShowPrivacy(true))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SUPPORT</Text>
                {renderItem(<HelpCircle size={20} color="#8B5CF6" />, "Help Center", "#8B5CF6", () => setShowHelp(true))}
                {renderItem(<Info size={20} color="#64748B" />, "About Circlo", "#64748B", () => setShowAbout(true))}
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <LogOut size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Sign Out of Circlo</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>Version 1.0.4 (Build 42)</Text>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>

        {/* Sub-Panels as top-level children of the Modal */}
        <AccountEditPanel
          visible={showAccountEdit}
          onClose={() => setShowAccountEdit(false)}
        />

        <AboutCircloPanel
          visible={showAbout}
          onClose={() => setShowAbout(false)}
        />

        <PrivacyPolicyPanel
          visible={showPrivacy}
          onClose={() => setShowPrivacy(false)}
        />

        <HelpCenterPanel
          visible={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    flex: 1,
    backgroundColor: 'white',
    width: width,
    height: height,
    ...Shadows.dark,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 24,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
    marginLeft: 12,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 40,
    fontWeight: '500',
  },
});
