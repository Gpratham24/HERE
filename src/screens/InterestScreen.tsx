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
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.header}>Choose your interests</Text>
        <Text style={styles.subheader}>Select at least 1</Text>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {INTERESTS.map(interest => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected
                ]}
                activeOpacity={0.8}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            !isContinueEnabled && styles.primaryBtnDisabled
          ]}
          activeOpacity={0.8}
          disabled={!isContinueEnabled}
          onPress={handleContinue}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  content: {
    flex: 1,
    padding: Sizes.padding * 1.5,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  subheader: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
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
    backgroundColor: '#16161E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: '#E4E4E7',
    fontSize: 15,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Sizes.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(56, 99, 250, 0.4)', // Faded primary
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
