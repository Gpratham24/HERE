import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, Camera, Hash, ChevronLeft } from 'lucide-react-native';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { launchImageLibrary } from 'react-native-image-picker';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { OrbBackground } from '../../components/common/OrbBackground';

const { width } = Dimensions.get('window');

const THEME = {
  purple: '#7F77DD',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  offWhite: '#FDFDFF',
};

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: (isNewUser: boolean) => void;
}

export default function AuthScreen({ onBack, onSuccess }: AuthScreenProps) {
  const { login: authLogin } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const triggerTransition = () => {
    fadeAnim.setValue(1); // Immediate visibility
    slideAnim.setValue(0);
  };

  useEffect(() => {
    triggerTransition();
  }, [authMode, signupStep]);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.assets && res.assets.length > 0) {
        setAvatarUri(res.assets[0].uri || null);
      }
    });
  };

  const handleAuth = async () => {
    console.log(`🚀 [Auth] Attempting ${authMode}...`, { email, username });
    if (authMode === 'signup') {
      if (signupStep === 1) {
        if (!email.trim() || !password.trim()) return Alert.alert('Missing Info', 'Please enter email and password');
        if (password.length < 6) return Alert.alert('Weak Password', 'Password must be at least 6 characters');
        if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
        setSignupStep(2);
        setUsername(email.split('@')[0].toLowerCase());
      } else {
        if (!username.trim()) return Alert.alert('Missing Info', 'Please enter a username');
        setAuthLoading(true);
        try {
          const res = await api.post('/auth/signup', { email, password, username });
          console.log('✅ [Auth] Signup Success:', res);
          if (res.access_token) {
            await authLogin(res.access_token, res.user);
            if (avatarUri) await api.uploadAvatar(avatarUri);
            onSuccess(true);
          } else {
            Alert.alert('Signup Failed', res.message || 'Check your details');
          }
        } catch (e) {
          console.error('❌ [Auth] Signup Error:', e);
          Alert.alert('Error', 'Could not connect to server');
        } finally {
          setAuthLoading(false);
        }
      }
    } else {
      if (!email.trim() || !password.trim()) return Alert.alert('Missing Info', 'Please enter email and password');
      setAuthLoading(true);
      try {
        const res = await api.post('/auth/login', { email, password });
        console.log('✅ [Auth] Login Success:', res);
        if (res.access_token) {
          await authLogin(res.access_token, res.user);
          onSuccess(false);
        } else {
          Alert.alert('Login Failed', res.message || 'Invalid credentials');
        }
      } catch (e) {
        console.error('❌ [Auth] Login Error:', e);
        Alert.alert('Error', 'Could not connect to server');
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      // Backend google auth logic would go here
      // For now simulate success
      onSuccess(true);
    } catch (error) {
      console.error('Google Auth Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <OrbBackground preset="auth" />
      <SafeAreaView style={[styles.safeArea, { zIndex: 1 }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <ChevronLeft color={THEME.text} size={24} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.logo}>CIRCLO</Text>
              <Text style={styles.tagline}>find your people</Text>
            </View>
          </View>

          <View style={styles.card}>
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
              <Text style={styles.heading}>{authMode === 'signup' ? (signupStep === 1 ? 'Welcome.' : 'Your Profile.') : 'Welcome back.'}</Text>
              <Text style={styles.subHeading}>
                {authMode === 'signup'
                  ? (signupStep === 1 ? 'Create your account to enter your circle.' : 'Tell us how you want to be seen.')
                  : 'Your circle has been waiting for you.'}
              </Text>

              {authMode === 'signup' && signupStep === 2 ? (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity style={styles.avatarPicker} onPress={handlePickImage}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Camera color={THEME.textMuted} size={24} />
                        <Text style={styles.avatarLabel}>Add Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TextInput
                    ref={usernameRef}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.simpleInput}
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <>
                  <TextInput
                    ref={emailRef}
                    placeholder="Email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.simpleInput}
                  />

                  <TextInput
                    ref={passwordRef}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.simpleInput}
                  />

                  {authMode === 'signup' && (
                    <TextInput
                      ref={confirmRef}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      style={styles.simpleInput}
                    />
                  )}
                </>
              )}

              {authMode === 'login' && (
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth} disabled={authLoading}>
                {authLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>{authMode === 'signup' ? (signupStep === 1 ? 'Create account' : 'Finish Setup') : 'Log in'}</Text>}
              </TouchableOpacity>

              <View style={styles.orRow}>
                <View style={styles.orLine} /><Text style={styles.orText}>or continue with</Text><View style={styles.orLine} />
              </View>

              <TouchableOpacity style={styles.googleBtn} onPress={onGoogleButtonPress}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.googleIcon} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.switchBox}>
                <Text style={styles.switchText}>
                  {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.switchLink} onPress={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setSignupStep(1); }}>
                    {authMode === 'signup' ? 'Log in' : 'Sign up'}
                  </Text>
                </Text>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  header: { 
    flexDirection: 'row',
    alignItems: 'center', 
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 25, 
    marginBottom: 24,
    gap: 16
  },
  headerText: { flex: 1, alignItems: 'center', marginRight: 44 },
  logo: { fontSize: 26, fontWeight: '900', letterSpacing: 8, color: THEME.text, opacity: 0.95 },
  tagline: { fontSize: 12, color: THEME.text, letterSpacing: 3, marginTop: 6, textTransform: 'uppercase', fontWeight: '700', opacity: 0.6 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: THEME.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 15, elevation: 8, marginBottom: 20 },
  heading: { fontSize: 26, fontWeight: '700', color: THEME.text, marginBottom: 6 },
  subHeading: { fontSize: 14, color: THEME.textMuted, marginBottom: 24, lineHeight: 20 },
  simpleInput: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    fontSize: 16,
    color: '#000'
  },
  input: { flex: 1, fontSize: 16, color: THEME.text, marginLeft: 12, fontWeight: '500' },
  primaryBtn: { backgroundColor: THEME.purple, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: THEME.purple, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  orLine: { flex: 1, height: 1, backgroundColor: THEME.border },
  orText: { paddingHorizontal: 16, fontSize: 13, color: THEME.textMuted, fontWeight: '500' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: THEME.border, height: 56, borderRadius: 18 },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: THEME.text },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, paddingRight: 4 },
  forgotText: { fontSize: 13, fontWeight: '700', color: THEME.purple },
  switchBox: { marginTop: 'auto', paddingVertical: 10, alignItems: 'center' },
  switchText: { fontSize: 14, color: THEME.textMuted, fontWeight: '500' },
  switchLink: { color: THEME.purple, fontWeight: '800' },
  avatarPicker: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderStyle: 'dashed', borderColor: THEME.border, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarPlaceholder: { alignItems: 'center' },
  avatarLabel: { fontSize: 11, color: THEME.textMuted, marginTop: 4, fontWeight: '600' },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
});
