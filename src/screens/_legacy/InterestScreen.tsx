import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Colors, Sizes } from '../theme/Theme';

interface InterestScreenProps {
  onComplete: (selected: string[]) => void;
}

const INTERESTS = [
  'AI', 'Startups', 'Coding', 'Fitness', 'Gaming',
  'Movies', 'Memes', 'Tech', 'Travel', 'Design', 'Business'
];

export default function InterestScreen({ onComplete }: InterestScreenProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = async () => {
    if (selectedInterests.length < 1) return;
    const uid = auth().currentUser?.uid;
    if (uid) {
      try {
        await firestore().collection('users').doc(uid).set({
          interests: selectedInterests
        }, { merge: true });
      } catch (err) {
        console.error('Error updating interests:', err);
      }
    }
    onComplete(selectedInterests);
  };

  const isContinueEnabled = selectedInterests.length >= 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Floating Logo above sheet */}
      <View style={styles.logoWrapper}>
        <Text style={styles.logoMain}>HERE</Text>
        <Text style={styles.tagline}>Find your people. Share what matters.</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.sheetCard}>
          <Text style={styles.formHeader}>Choose your interests</Text>
          <Text style={styles.formSubtitle}>Select at least 1</Text>

          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {INTERESTS.map(interest => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  activeOpacity={0.8}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.primaryBtn, !isContinueEnabled && styles.primaryBtnDisabled]}
            activeOpacity={0.8}
            disabled={!isContinueEnabled}
            onPress={handleContinue}
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  logoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    top: 60, 
  },
  logoMain: {
    fontSize: 54,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 44,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 180, 
    flex: 1,
  },
  formHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  chipText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#C4B5FD',
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  list: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardMembers: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#8B5CF6' },
  joinedBtn: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  joinBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  joinedBtnText: { color: '#475569', fontWeight: '600' },
  skipBtnRow: { height: 52, backgroundColor: '#ffffff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
});

