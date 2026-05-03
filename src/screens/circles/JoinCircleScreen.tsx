import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { OrbBackground } from '../../components/common/OrbBackground';

const THEME = {
  purple: '#7F77DD',
  green: '#10B981',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};

interface JoinCircleScreenProps {
  onBack: () => void;
  onJoin: (code: string) => void;
}

export default function JoinCircleScreen({ onBack, onJoin }: JoinCircleScreenProps) {
  const [code, setCode] = useState('');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <OrbBackground preset="ob2" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft color={THEME.text} size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Join a circle</Text>
            <Text style={styles.headerSub}>enter your invite code</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.desc}>Someone shared an invite code with you. Enter it below — codes expire after 24h and can only be used once.</Text>
          
          <View style={styles.codeField}>
            <TextInput
              placeholder="XXXX-XXXX"
              placeholderTextColor={THEME.textMuted}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              style={styles.codeInput}
              maxLength={9}
              autoCapitalize="characters"
              autoFocus
            />
          </View>

          <View style={styles.hintBox}>
            <ShieldCheck color={THEME.green} size={16} />
            <Text style={styles.hintText}>Codes are verified server-side. Expired or used codes are rejected.</Text>
          </View>

          <TouchableOpacity 
            style={[styles.cta, !code.trim() && { opacity: 0.6 }]} 
            onPress={() => code.trim() && onJoin(code)}
            disabled={!code.trim()}
          >
            <Text style={styles.ctaText}>Verify & join</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFF' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20, 
    marginBottom: 40 
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: THEME.text },
  headerSub: { fontSize: 13, color: THEME.textMuted, marginTop: 2, fontWeight: '500' },
  content: { flex: 1, justifyContent: 'center', paddingBottom: 100 },
  desc: { fontSize: 15, color: THEME.textMuted, lineHeight: 24, marginBottom: 40, fontWeight: '500' },
  codeField: { backgroundColor: '#F3F4F6', height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  codeInput: { fontSize: 28, fontWeight: '800', letterSpacing: 6, color: THEME.text, textAlign: 'center', width: '100%' },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 40 },
  hintText: { fontSize: 12, color: THEME.green, flex: 1, fontWeight: '600' },
  cta: { backgroundColor: THEME.green, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.green, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  ctaText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
