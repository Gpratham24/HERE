import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { OrbBackground } from '../../components/common/OrbBackground';

const { width } = Dimensions.get('window');

const THEME = {
  purple: '#7F77DD',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  offWhite: '#FDFDFF',
};

interface ChoiceScreenProps {
  onCreate: () => void;
  onJoin: () => void;
  onSkip: () => void;
}

export default function ChoiceScreen({ onCreate, onJoin, onSkip }: ChoiceScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <OrbBackground preset="choice" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.top, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.eyebrow}>ONE LAST STEP</Text>
          <Text style={styles.heading}>What would you{"\n"}like to do first?</Text>
          <View style={styles.divider} />
          <Text style={styles.subHeading}>You can always do both later.</Text>
        </Animated.View>

        <View style={styles.cards}>
          <TouchableOpacity style={[styles.card, styles.cardPrimary]} onPress={onCreate}>
            <View style={[styles.iconBox, { backgroundColor: THEME.purple + '15' }]}><Text style={{ fontSize: 24 }}>🌀</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Create a circle</Text>
              <Text style={styles.cardSub}>Start fresh. Name your circle, add a vibe, and invite your people.</Text>
            </View>
            <ChevronRight color={THEME.border} size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={onJoin}>
            <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}><Text style={{ fontSize: 24 }}>🔗</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Join a circle</Text>
              <Text style={styles.cardSub}>Have an invite code? Enter it and step right in.</Text>
            </View>
            <ChevronRight color={THEME.border} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.offWhite },
  safeArea: { flex: 1, paddingHorizontal: 24 },
  top: { marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 40 : 60 },
  eyebrow: { fontSize: 10, letterSpacing: 2.5, color: THEME.textMuted, fontWeight: '800', textTransform: 'uppercase' },
  heading: { fontSize: 30, fontWeight: '700', color: THEME.text, lineHeight: 40, marginTop: 8 },
  divider: { width: 32, height: 1, backgroundColor: THEME.border, marginVertical: 20 },
  subHeading: { fontSize: 15, color: THEME.textMuted, lineHeight: 24, fontWeight: '500' },
  cards: { flex: 1, justifyContent: 'center', gap: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: THEME.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 4 },
  cardPrimary: { borderColor: THEME.purple + '40' },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: THEME.text },
  cardSub: { fontSize: 13, color: THEME.textMuted, marginTop: 6, lineHeight: 20, fontWeight: '500' },
  skipBtn: { paddingVertical: 40, alignItems: 'center' },
  skipText: { fontSize: 14, color: THEME.textMuted, fontWeight: '600', textDecorationLine: 'underline' },
});
