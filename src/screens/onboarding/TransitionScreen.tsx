import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions, Platform } from 'react-native';
import { OrbBackground } from '../../components/common/OrbBackground';

const { width } = Dimensions.get('window');

const THEME = {
  purple: '#7F77DD',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  offWhite: '#FDFDFF',
};

interface TransitionScreenProps {
  onEnter: () => void;
}

export default function TransitionScreen({ onEnter }: TransitionScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <OrbBackground preset="splash" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.eyebrow}>YOUR CIRCLE AWAITS</Text>
          <Text style={styles.quote}>"The people who{"\n"}matter don't need{"\n"}a stage. They just{"\n"}need a space."</Text>
          <View style={styles.divider} />
          <Text style={styles.byline}>Circlo — built for the few{"\n"}who mean the most</Text>
          <TouchableOpacity style={styles.enterBtn} onPress={onEnter}>
            <Text style={styles.enterBtnText}>tap to enter →</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.offWhite },
  safeArea: { flex: 1, paddingHorizontal: 40 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 3, color: THEME.textMuted, fontWeight: '800', marginBottom: 32, textTransform: 'uppercase' },
  quote: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: THEME.text, 
    textAlign: 'center', 
    lineHeight: 46, 
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif' 
  },
  divider: { width: 32, height: 1, backgroundColor: THEME.textMuted, opacity: 0.3, marginVertical: 32 },
  byline: { fontSize: 14, color: THEME.textMuted, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  enterBtn: { marginTop: 60, paddingVertical: 12 },
  enterBtnText: { fontSize: 14, letterSpacing: 2, color: THEME.purple, fontWeight: '800', textTransform: 'uppercase' },
});
