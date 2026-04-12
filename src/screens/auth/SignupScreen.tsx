import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { Colors, Shadows } from '../../theme/Theme';
import { Lock } from 'lucide-react-native';
import * as api from '../../services/api';
import { setSessionToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SignupScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setBiometricUnlocked } = useAuth();

  // Handover Animations
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentMoveAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(contentMoveAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentFadeAnim, contentMoveAnim]);

  const handleSignup = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword || !cleanUsername) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const data = await api.signup(cleanEmail, cleanPassword, cleanUsername);

      if (data) {
        if (data.access_token || data.session) {
          const access_token = data.access_token || data.session?.access_token;
          const refresh_token = data.refresh_token || data.session?.refresh_token;

          if (access_token) {
            setSessionToken(access_token);
            await supabase.auth.setSession({
              access_token,
              refresh_token: refresh_token || '',
            });
            setBiometricUnlocked(true);
          }
        } else {
          Alert.alert(
            'Verify Your Account',
            `Verify your account and login with your credentials. We've sent a confirmation link to ${cleanEmail}.`,
            [
              {
                text: 'Got it',
                onPress: () => navigation.navigate('Login', { email: cleanEmail }),
              },
            ],
          );
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('EMAIL_ALREADY_EXISTS') || msg.toLowerCase().includes('already registered')) {
        Alert.alert(
          'Account Exists',
          `${cleanEmail} already exist. Please log in with your credentials.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log In',
              onPress: () => navigation.navigate('Login', { email: cleanEmail }),
            },
          ],
        );
      } else {
        Alert.alert('Signup Problem', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>Circlo</Text>
            <View style={styles.line} />
            <Text style={styles.tagline}>Private Social for Real Circles</Text>
          </View>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: contentFadeAnim,
                transform: [{ translateY: contentMoveAnim }],
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={styles.signupBtn}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginLinkText}>
                Have an account?{' '}
                <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                  Log In
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.footer,
              {
                opacity: contentFadeAnim,
                transform: [{ translateY: contentMoveAnim }],
              },
            ]}
          >
            <View style={styles.footerDivider} />
            <View style={styles.securityRow}>
              <Lock size={12} color="#94A3B8" />
              <Text style={styles.securityText}>End-to-End Encrypted</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1.5,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginVertical: 16,
  },
  tagline: {
    fontSize: 16.5,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 24,
  },
  form: { width: '100%' },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 12,
  },
  signupBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...Shadows.medium,
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loginLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default SignupScreen;
