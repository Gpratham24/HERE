import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { OrbBackground } from '../../components/common/OrbBackground';

const THEME = {
  purple: '#7F77DD',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};

interface CreateCircleScreenProps {
  onBack: () => void;
  onContinue: (data: any) => void;
}

export default function CreateCircleScreen({ onBack, onContinue }: CreateCircleScreenProps) {
  const [circleName, setCircleName] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('School friends');
  const [circleSize, setCircleSize] = useState(8);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.assets && res.assets.length > 0) {
        setAvatarUri(res.assets[0].uri || null);
      }
    });
  };

  const VIBES = [
    { label: 'School friends', emoji: '🎓' },
    { label: 'Cloud friends', emoji: '☁️' },
    { label: 'Workplace', emoji: '💼' },
    { label: 'Interns', emoji: '🏢' },
    { label: 'Family', emoji: '🏠' },
    { label: 'Other', emoji: '✨' },
  ];

  return (
    <View style={styles.container}>
      <OrbBackground preset="invite" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft color={THEME.text} size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Create your circle</Text>
            <Text style={styles.headerSub}>make it yours</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CIRCLE IDENTITY</Text>
            <View style={styles.idRow}>
              <TouchableOpacity style={styles.avatarBox} onPress={handlePickImage}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <>
                    <Camera color={THEME.textMuted} size={22} />
                    <Text style={styles.avatarLabel}>Photo</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <View style={styles.field}>
                  <TextInput
                    placeholder="Circle name e.g. The Squad"
                    placeholderTextColor={THEME.textMuted}
                    value={circleName}
                    onChangeText={setCircleName}
                    style={styles.input}
                  />
                </View>
                <Text style={styles.fieldHint}>e.g. Inner Circle, The Crew, 10th Grade</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHAT KIND OF CIRCLE IS THIS?</Text>
            <View style={styles.vibeGrid}>
              {VIBES.map((v) => (
                <TouchableOpacity
                  key={v.label}
                  style={[styles.vibeChip, selectedVibe === v.label && styles.vibeChipSelected]}
                  onPress={() => setSelectedVibe(v.label)}
                >
                  <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vibeText, selectedVibe === v.label && styles.vibeTextSelected]}>{v.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SIZE LIMIT</Text>
            <View style={styles.sizeRow}>
              {[5, 8, 10].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeBtn, circleSize === s && styles.sizeBtnSelected]}
                  onPress={() => setCircleSize(s)}
                >
                  <Text style={[styles.sizeVal, circleSize === s && styles.sizeValSelected]}>{s}</Text>
                  <Text style={[styles.sizeLabel, circleSize === s && styles.sizeLabelSelected]}>
                    {s === 5 ? 'intimate' : s === 8 ? 'recommended' : 'max'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.cta, !circleName.trim() && { opacity: 0.6 }]}
            onPress={() => circleName.trim() && onContinue({ name: circleName, vibe: selectedVibe, size: circleSize, avatar: avatarUri })}
            disabled={!circleName.trim()}
          >
            <Text style={styles.ctaText}>Create circle & invite →</Text>
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
    marginBottom: 32 
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: THEME.text },
  headerSub: { fontSize: 13, color: THEME.textMuted, marginTop: 2, fontWeight: '500' },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: THEME.textMuted, letterSpacing: 2, marginBottom: 16 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1.5, borderStyle: 'dashed', borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  avatarLabel: { fontSize: 11, color: THEME.textMuted, marginTop: 4, fontWeight: '600' },
  avatarImg: { width: 77, height: 77, borderRadius: 22 },
  field: { height: 56, backgroundColor: '#FFF', borderWidth: 1, borderColor: THEME.border, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  input: { fontSize: 16, color: THEME.text, fontWeight: '600' },
  fieldHint: { fontSize: 11, color: THEME.textMuted, marginTop: 8, marginLeft: 4, fontWeight: '500' },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vibeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: THEME.border, gap: 8 },
  vibeChipSelected: { backgroundColor: THEME.purple + '10', borderColor: THEME.purple },
  vibeEmoji: { fontSize: 18 },
  vibeText: { fontSize: 14, fontWeight: '600', color: THEME.textMuted },
  vibeTextSelected: { color: THEME.purple },
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeBtn: { flex: 1, padding: 18, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  sizeBtnSelected: { borderColor: THEME.purple, backgroundColor: THEME.purple + '10' },
  sizeVal: { fontSize: 20, fontWeight: '800', color: THEME.textMuted },
  sizeValSelected: { color: THEME.purple },
  sizeLabel: { fontSize: 11, color: THEME.textMuted, marginTop: 6, fontWeight: '600' },
  sizeLabelSelected: { color: THEME.purple },
  cta: { backgroundColor: THEME.purple, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: THEME.purple, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  ctaText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
