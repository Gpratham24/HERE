import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Users, Plus, Zap, Bell, Check, ArrowRight, Sparkles, Brain, MessageSquare, BellOff, Moon, Coffee, Dumbbell, UserCircle } from 'lucide-react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface OnboardingFlowProps {
  onComplete: () => void;
}

const STEPS = 12;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { userData, login } = useAuth();

  // State for onboarding data
  const [circleName, setCircleName] = useState('');
  const [presence, setPresence] = useState('Focus');
  const [presenceNote, setPresenceNote] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    triggerTransition();
  }, [currentStep]);

  const triggerTransition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      // Update profile in backend
      await api.post('/user/profile', {
        onboarding_done: true,
        username: userData?.username || circleName.toLowerCase().replace(/\s/g, '_'),
        // Add other gathered data
      });
      
      // Update presence if set
      await api.post('/checkins', {
        type: presence.toLowerCase(),
        note: presenceNote || `Currently in ${presence} mode`,
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      onComplete(); // Still complete locally if backend fails for now? Or show error
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TouchableOpacity activeOpacity={1} style={styles.stepContainer} onPress={handleNext}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <Text style={styles.introText}>Not everything is meant for everyone.</Text>
              <View style={styles.spacer} />
              <Animated.Text style={[styles.introText, { opacity: 1, marginTop: 40 }]}>
                Some moments are meant for your people.
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        );
      case 2:
        return (
          <TouchableOpacity activeOpacity={1} style={styles.stepContainer} onPress={handleNext}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <Text style={styles.headerText}>Circlo is not social media.</Text>
              <Text style={styles.subHeaderText}>
                It’s a private space{"\n"}for the 5–10 people who matter.
              </Text>
              <View style={styles.divider} />
              <Text style={styles.mutedText}>No followers. No noise.</Text>
            </Animated.View>
          </TouchableOpacity>
        );
      case 3:
        return (
          <TouchableOpacity activeOpacity={1} style={styles.stepContainer} onPress={handleNext}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <View style={styles.avatarShowcase}>
                <View style={[styles.avatarCircle, { backgroundColor: '#EDE9FE' }]}>
                  <UserCircle size={40} color="#6C5CE7" />
                </View>
                <View style={[styles.avatarCircle, { backgroundColor: '#DCFCE7', marginLeft: -20 }]}>
                  <UserCircle size={40} color="#10B981" />
                </View>
                <View style={[styles.avatarCircle, { backgroundColor: '#DBEAFE', marginLeft: -20 }]}>
                  <UserCircle size={40} color="#3B82F6" />
                </View>
              </View>
              <Text style={styles.headerText}>You don’t “message” here.</Text>
              <Text style={styles.subHeaderText}>
                You show up.{"\n"}See who’s around.{"\n"}Join when it feels right.
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      case 4:
        return (
          <TouchableOpacity activeOpacity={1} style={styles.stepContainer} onPress={handleNext}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <View style={styles.livePreview}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Priya joined</Text>
                </View>
                <View style={styles.pulseCircle} />
              </View>
              <Text style={styles.headerText}>Sometimes, your circle is already here.</Text>
              <Text style={styles.subHeaderText}>Just enter.</Text>
            </Animated.View>
          </TouchableOpacity>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', width: '100%' }}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.buttonText}>Create your circle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleNext}>
                <Text style={styles.secondaryButtonText}>Join with invite</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', paddingHorizontal: 40 }}>
              <Text style={styles.headerText}>What do you call your people?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Squad"
                placeholderTextColor="#A0A0A0"
                value={circleName}
                onChangeText={setCircleName}
                autoFocus
              />
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext} disabled={!circleName.trim()}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      case 7:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', paddingHorizontal: 40 }}>
              <Text style={styles.headerText}>Add only the people who matter.</Text>
              <Text style={styles.subHeaderText}>Keep it small. 5–10 people works best.</Text>
              
              <View style={styles.inviteBox}>
                <Text style={styles.inviteLink}>circlo.app/j/squad-123</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Send invites</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      case 8:
        return (
          <ScrollView contentContainerStyle={styles.scrollStepContainer} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', paddingHorizontal: 20 }}>
              <Text style={styles.headerText}>How are you showing up right now?</Text>
              
              <View style={styles.presenceGrid}>
                {[
                  { label: 'Focus', emoji: '🧠', color: '#6C5CE7' },
                  { label: 'Free', emoji: '💬', color: '#10B981' },
                  { label: 'Busy', emoji: '🔕', color: '#EF4444' },
                  { label: 'Out', emoji: '🚶', color: '#F59E0B' },
                  { label: 'Resting', emoji: '🌙', color: '#3B82F6' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.presenceCard, presence === item.label && { borderColor: item.color, backgroundColor: item.color + '10' }]}
                    onPress={() => setPresence(item.label)}
                  >
                    <Text style={styles.presenceEmoji}>{item.emoji}</Text>
                    <Text style={[styles.presenceLabel, presence === item.label && { color: item.color }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={styles.presenceInput}
                placeholder="Optional note: 'coding rn', 'at gym'..."
                placeholderTextColor="#A0A0A0"
                value={presenceNote}
                onChangeText={setPresenceNote}
              />
              
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Set presence</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        );
      case 9:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <View style={styles.roomVisual}>
                <View style={styles.centerAvatar}>
                  <UserCircle size={60} color="#6C5CE7" />
                </View>
                <View style={[styles.orbitAvatar, { top: -20, left: -40 }]}>
                  <UserCircle size={30} color="#A0A0A0" />
                </View>
                <View style={[styles.orbitAvatar, { bottom: 20, right: -40 }]}>
                  <UserCircle size={30} color="#A0A0A0" />
                </View>
              </View>
              <Text style={styles.headerText}>This is your circle.</Text>
              <Text style={styles.subHeaderText}>When people join,{"\n"}this space comes alive.</Text>
              
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Enter</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      case 10:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <Text style={styles.headerText}>Your room is ready.</Text>
              <Text style={styles.subHeaderText}>
                Invite your people.{"\n"}Or come back later.
              </Text>
              <Text style={styles.subHeaderText}>It’ll feel different when they’re here.</Text>
              
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      case 11:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', width: '100%', paddingHorizontal: 40 }}>
              <Text style={styles.headerText}>Stay connected.</Text>
              <View style={styles.nudgeBox}>
                <Text style={styles.nudgeText}>Notify me when someone joins</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#767577', true: '#6C5CE7' }}
                  thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
              
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      case 12:
        return (
          <View style={styles.stepContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <Sparkles size={60} color="#6C5CE7" />
              <Text style={[styles.headerText, { marginTop: 24 }]}>You’re in.</Text>
              <Text style={styles.subHeaderText}>This space is yours.</Text>
              
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 40 }]} onPress={handleNext} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Go to Home</Text>}
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#FFFFFF', '#F3E8FF']}
        style={styles.background}
      >
        {renderStep()}
        
        {currentStep > 5 && (
          <View style={styles.progressContainer}>
            {Array.from({ length: STEPS - 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  { backgroundColor: i + 6 <= currentStep ? '#6C5CE7' : '#E2E8F0' },
                ]}
              />
            ))}
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scrollStepContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  introText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 34,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D0D0D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  mutedText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#6C5CE7',
    marginVertical: 24,
    opacity: 0.3,
  },
  spacer: {
    height: 20,
  },
  avatarShowcase: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  livePreview: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    zIndex: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C5CE7',
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  pulseCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    opacity: 0.2,
  },
  primaryButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#6C5CE7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#0D0D0D',
    marginTop: 20,
  },
  inviteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  inviteLink: {
    flex: 1,
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  presenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  presenceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
  },
  presenceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  presenceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  presenceInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    fontSize: 14,
    color: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomVisual: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  centerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 5,
  },
  orbitAvatar: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    opacity: 0.6,
  },
  nudgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    elevation: 2,
  },
  nudgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    paddingHorizontal: 40,
    width: '100%',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
