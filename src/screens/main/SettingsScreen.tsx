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
import { Colors } from '../../theme/Theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { userData, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(userData?.theme === 'dark');

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
            logout();
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
          onPress: async () => {
             try {
               await api.delete('/user/account');
               logout();
               onClose();
             } catch (err) {
               Alert.alert('Error', 'Failed to delete account');
             }
          } 
        },
      ]
    );
  };

  const renderToggleRow = (label: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: '#1C1C24', true: '#6C5CE7' }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionTitleRow}>
          <Bell size={16} color="#6C5CE7" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>1. Notifications</Text>
        </View>
        <View style={styles.sectionCard}>
          {renderToggleRow('Likes', true, () => {})}
          <View style={styles.divider} />
          {renderToggleRow('Comments', true, () => {})}
          <View style={styles.divider} />
          {renderToggleRow('Follows', true, () => {})}
        </View>

        <View style={styles.sectionTitleRow}>
          <LogOut size={16} color="#FF453A" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>2. Account</Text>
        </View>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
            <LogOut size={18} color="#FFF" style={{ marginRight: 12 }} />
            <Text style={styles.actionBtnText}>Logout</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionBtn} onPress={handleDeleteAccount}>
            <Trash2 size={18} color="#FF453A" style={{ marginRight: 12 }} />
            <Text style={[styles.actionBtnText, { color: '#FF453A' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  headerBtn: { padding: 8 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sectionCard: { backgroundColor: '#101015', borderRadius: 12, paddingHorizontal: 16, marginBottom: 32, borderWidth: 1, borderColor: '#1A1A1A' },
  row: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#1A1A1A' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
