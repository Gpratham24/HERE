import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { ArrowLeft, Bell, Film, Globe, LogOut, Trash2, ChevronRight } from 'lucide-react-native';
import { Colors, Sizes } from '../theme/Theme';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { userData } = useAuth();
  const [darkMode, setDarkMode] = useState(userData?.theme !== 'light');

  // 🔔 Notifications State
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  // 🎥 Content & Media State
  const [autoSave, setAutoSave] = useState(false);
  const [uploadQuality, setUploadQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [mobileDataUpload, setMobileDataUpload] = useState(true);

  // 🌐 App Preferences State
  const [language, setLanguage] = useState('English');
  const [dataSaver, setDataSaver] = useState(false);

  const toggleDarkMode = async (val: boolean) => {
    setDarkMode(val);
    const uid = auth().currentUser?.uid;
    if (uid) {
      try {
        const firestore = require('@react-native-firebase/firestore').default;
        await firestore().collection('users').doc(uid).set({
          theme: val ? 'dark' : 'light'
        }, { merge: true });
      } catch (err) { console.error(err); }
    }
  };

  const currentTheme = darkMode ? {
    bg: '#070708',
    card: '#101015',
    text: '#ffffff',
    subText: '#A1A1AA',
    border: 'rgba(255,255,255,0.02)',
    divider: 'rgba(255,255,255,0.03)',
    statusBarStyle: 'light-content' as const,
  } : {
    bg: '#F4F4F5',
    card: '#ffffff',
    text: '#18181B',
    subText: '#71717A',
    border: 'rgba(0,0,0,0.03)',
    divider: 'rgba(0,0,0,0.05)',
    statusBarStyle: 'dark-content' as const,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            auth().signOut();
            onClose();
          } 
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
             // Logic to delete account
             Alert.alert('Info', 'Delete account request sent.');
          } 
        },
      ]
    );
  };

  const cycleQuality = () => {
     const next: Record<'low'|'medium'|'high', 'low'|'medium'|'high'> = {
       'low': 'medium', 'medium': 'high', 'high': 'low'
     };
     setUploadQuality(next[uploadQuality]);
  };

  const renderToggleRow = (label: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: currentTheme.text }]}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: darkMode ? '#1C1C24' : '#E4E4E7', true: Colors.primary }}
        thumbColor={value ? '#ffffff' : darkMode ? '#A1A1AA' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} backgroundColor={currentTheme.bg} />
      
      {/* Header */}
      <View style={[styles.header, { borderColor: currentTheme.divider }]}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <ArrowLeft size={22} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 🔔 Notifications Section */}
        <View style={styles.sectionTitleRow}>
          <Bell size={16} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>1. Notifications</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.subText }]}>Control noise</Text>
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          {renderToggleRow('Likes', notifLikes, setNotifLikes)}
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow('Comments', notifComments, setNotifComments)}
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow('Follows', notifFollows, setNotifFollows)}
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow('Messages', notifMessages, setNotifMessages)}
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow('App Updates', notifUpdates, setNotifUpdates)}
        </View>

        {/* 🎥 Content & Media Section */}
        <View style={styles.sectionTitleRow}>
          <Film size={16} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>2. Content & Media</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: currentTheme.subText }]}>Important for your Cloudinary use</Text>
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          {renderToggleRow('Auto-save uploads', autoSave, setAutoSave)}
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          <TouchableOpacity style={styles.row} onPress={cycleQuality}>
            <Text style={[styles.rowLabel, { color: currentTheme.text }]}>Upload Quality</Text>
            <View style={[styles.badge, { backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
              <Text style={[styles.badgeText, { color: currentTheme.subText }]}>
                {uploadQuality.charAt(0).toUpperCase() + uploadQuality.slice(1)}
              </Text>
              <ChevronRight size={14} color={currentTheme.subText} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow('Allow mobile data upload', mobileDataUpload, setMobileDataUpload)}
        </View>

        {/* 🌐 App Preferences Section */}
        <View style={styles.sectionTitleRow}>
          <Globe size={16} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>3. App Preferences</Text>
        </View>
        <View style={[styles.sectionCard, { marginTop: 12, backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.rowLabel, { color: currentTheme.text }]}>Language</Text>
            <View style={[styles.badge, { backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
              <Text style={[styles.badgeText, { color: currentTheme.subText }]}>{language}</Text>
              <ChevronRight size={14} color={currentTheme.subText} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow(darkMode ? 'Dark Mode' : 'Light Mode', darkMode, toggleDarkMode)}
          <View style={[styles.divider, { backgroundColor: currentTheme.divider }]} />
          {renderToggleRow('Data Saver', dataSaver, setDataSaver)}
        </View>

        {/* 🚪 Logout & Danger Zone Section */}
        <View style={styles.sectionTitleRow}>
          <LogOut size={16} color="#FF453A" style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>4. Logout & Danger Zone</Text>
        </View>
        <View style={[styles.sectionCard, { paddingBottom: 8, marginTop: 12, backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
            <LogOut size={18} color={currentTheme.text} style={{ marginRight: 12 }} />
            <Text style={[styles.actionBtnText, { color: currentTheme.text }]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleDeleteAccount}>
            <Trash2 size={18} color="#FF453A" style={{ marginRight: 12 }} />
            <Text style={[styles.actionBtnText, { color: '#FF453A' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionCard: {
    borderRadius: Sizes.radiusMd,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  row: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  dangerBtn: {
    borderColor: 'transparent',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
