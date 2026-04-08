import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { X, ChevronRight, User, Shield, Bell, HelpCircle, Info, LogOut } from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const { width } = Dimensions.get('window');

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  onClose,
  onLogout,
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
  }, [visible]);

  if (!visible) return null;

  const renderItem = (icon: any, title: string, color: string) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.itemText}>{title}</Text>
      <ChevronRight size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.panel,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>PREFERENCES</Text>
                {renderItem(<User size={20} color="#4F46E5" />, "Account Info", "#4F46E5")}
                {renderItem(<Shield size={20} color="#10B981" />, "Privacy", "#10B981")}
                {renderItem(<Bell size={20} color="#F59E0B" />, "Notifications", "#F59E0B")}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SUPPORT</Text>
                {renderItem(<HelpCircle size={20} color="#8B5CF6" />, "Help Center", "#8B5CF6")}
                {renderItem(<Info size={20} color="#64748B" />, "About HERE", "#64748B")}
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <LogOut size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Sign Out of HERE</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>Version 1.0.4 (Build 42)</Text>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    flex: 1,
    backgroundColor: 'white',
    width: width,
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
