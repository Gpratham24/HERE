import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Clipboard, Alert, Share, Platform, StatusBar } from 'react-native';
import { ChevronLeft, Copy, Share2, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { OrbBackground } from '../../components/common/OrbBackground';

const THEME = {
  purple: '#7F77DD',
  green: '#10B981',
  red: '#EF4444',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};

interface InviteScreenProps {
  circleName: string;
  circleSize: number;
  onBack: () => void;
  onDone: () => void;
}

export default function InviteScreen({ circleName, circleSize, onBack, onDone }: InviteScreenProps) {
  const [inviteCode, setInviteCode] = useState('CIRC-X7K9');
  const [secondsLeft, setSecondsLeft] = useState(86400);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my circle "${circleName}" on Circlo! Use code: ${inviteCode}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <OrbBackground preset="invite" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft color={THEME.text} size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Invite your people</Text>
            <Text style={styles.headerSub}>{circleName || 'The Squad'} · 1 / {circleSize} members</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTIVE INVITE CODE</Text>
            <View style={styles.codeCard}>
              <Text style={styles.displayCode}>{inviteCode}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <Copy size={16} color={THEME.purple} />
                <Text style={styles.copyBtnText}>Copy Code</Text>
              </TouchableOpacity>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: (secondsLeft / 86400) * 100 + '%' }]} />
              </View>
              <Text style={styles.expireText}>Expires in {formatTime(secondsLeft)} · regenerates automatically</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaBox}><Text style={styles.metaLabel}>Max uses</Text><Text style={styles.metaVal}>{circleSize - 1} left</Text></View>
            <View style={styles.metaBox}><Text style={styles.metaLabel}>Joined</Text><Text style={[styles.metaVal, { color: THEME.green }]}>1 member</Text></View>
            <View style={styles.metaBox}><Text style={styles.metaLabel}>Status</Text><Text style={[styles.metaVal, { color: THEME.green }]}>Active</Text></View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 color={THEME.text} size={18} />
              <Text style={styles.shareBtnText}>Share invite link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.revokeBtn} onPress={() => setInviteCode('CIRC-' + Math.random().toString(36).substr(2, 4).toUpperCase())}>
              <AlertCircle color={THEME.red} size={16} />
              <Text style={styles.revokeText}>Revoke & generate new code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <ShieldCheck color={THEME.green} size={18} style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>Codes rotate every 24h. Each code can only be used once per person. Expired or revoked codes are permanently blocked.</Text>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
            <Text style={styles.doneBtnText}>Done — enter my circle →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFF' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20, 
    marginBottom: 24 
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: THEME.text },
  headerSub: { fontSize: 13, color: THEME.textMuted, marginTop: 2, fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: THEME.textMuted, letterSpacing: 2, marginBottom: 16 },
  codeCard: { backgroundColor: THEME.purple + '10', borderRadius: 28, padding: 28, borderWidth: 1, borderColor: THEME.purple + '30', alignItems: 'center' },
  displayCode: { fontSize: 32, fontWeight: '800', letterSpacing: 6, color: THEME.purple, marginBottom: 24 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.purple + '15', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
  copyBtnText: { color: THEME.purple, fontWeight: '700', fontSize: 14 },
  progressTrack: { width: '100%', height: 5, backgroundColor: THEME.border, borderRadius: 3, marginTop: 30, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: THEME.purple },
  expireText: { fontSize: 12, color: THEME.textMuted, marginTop: 14, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  metaBox: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: THEME.border, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  metaLabel: { fontSize: 11, color: THEME.textMuted, marginBottom: 6, fontWeight: '600' },
  metaVal: { fontSize: 15, fontWeight: '700', color: THEME.text },
  actions: { marginTop: 32, gap: 12 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', height: 58, borderRadius: 18, borderWidth: 1, borderColor: THEME.border, gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: THEME.text },
  revokeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, gap: 8 },
  revokeText: { fontSize: 13, color: THEME.red, fontWeight: '700' },
  infoBox: { flexDirection: 'row', backgroundColor: THEME.green + '08', padding: 16, borderRadius: 18, marginTop: 24, gap: 12, borderWidth: 1, borderColor: THEME.green + '15' },
  infoText: { fontSize: 12, color: THEME.textMuted, lineHeight: 18, flex: 1, fontWeight: '500' },
  doneBtn: { backgroundColor: THEME.purple, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 40, shadowColor: THEME.purple, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  doneBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
