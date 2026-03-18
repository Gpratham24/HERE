import React, { useEffect, useRef, useState } from 'react';
import { GoogleSignin } from "@react-native-google-signin/google-signin";import {
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
import { launchImageLibrary } from 'react-native-image-picker';
import { Check, X, Mail, Lock, Eye, EyeOff, MapPin, Headphones } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Colors, Sizes } from '../theme/Theme';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onComplete: (isNewUser?: boolean) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { Colors } = useTheme();
  const [stage, setStage] = useState<'splash' | 'form'>('splash');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Animation Refs
  const logoY = useRef(new Animated.Value(height / 2 - 40)).current; // Start centered
  const contentAlpha = useRef(new Animated.Value(0)).current;
  const skipBtnAlpha = useRef(new Animated.Value(1)).current;

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnWidth = useRef(new Animated.Value(48)).current;
  const googleTextAlpha = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    if (typeof GoogleSignin !== 'undefined') {
      GoogleSignin.configure({
        webClientId: '933732005431-ihncm3bjh4d4s3bpepafumqq43pn9mv7.apps.googleusercontent.com',
      });
    }

    if (auth().currentUser && signupStep === 1) {
      setSignupStep(2);
    }
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
      
      const uid = auth().currentUser?.uid;
      if (uid) {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists() && userDoc.data()?.username) {
           if (onComplete) onComplete(false);
        } else {
           setSignupStep(2);
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Auth Fail', error instanceof Error ? error.message : 'Login Cancelled');
    }
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Unknown Error');
        return;
      }
      if (res.assets && res.assets.length > 0) {
        setAvatarUri(res.assets[0].uri || null);
      }
    });
  };

  const debounceRef = useRef<any>(null);

  useEffect(() => {
    // Initial delay hold for splash feel
    const timer = setTimeout(() => {
      if (stage === 'splash') {
        triggerTransition();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkUsername = (val: string) => {
    setUsername(val);
    const cleaned = val.trim();
    if (!cleaned) {
      setIsUsernameAvailable(null);
    } else {
      setIsUsernameAvailable(true);
    }
  };

  useEffect(() => {
    if (stage === 'form') {
      const targetY = 180;
      Animated.timing(logoY, {
        toValue: targetY,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [authMode, signupStep]);

  const triggerTransition = () => {
    setStage('form');
    const targetY = 180;
    Animated.parallel([
      Animated.timing(logoY, {
        toValue: targetY, // Top aligned position based on cards height
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(contentAlpha, {
        toValue: 1,
        duration: 800,
        delay: 200, // Slight delay for cleaner transition
        useNativeDriver: true,
      }),
      Animated.timing(googleBtnWidth, {
        toValue: 280,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(googleTextAlpha, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(skipBtnAlpha, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signup' ? 'login' : 'signup');
    setConfirmPassword(''); // Reset confirm password
    setIsUsernameAvailable(null); // Reset for clean toggles
    setSignupStep(1); // Reset step index
  };

  const handleAuth = () => {
    if (authMode === 'signup') {
      if (signupStep === 1) {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
          Alert.alert('Error', 'Please fill in Email, Password, and Confirm Password.');
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match.');
          return;
        }
        auth()
          .createUserWithEmailAndPassword(email, password)
          .then(() => {
            // Trigger layout expansion smoother transitions
            const { LayoutAnimation, Platform, UIManager } = require('react-native');
            if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
              UIManager.setLayoutAnimationEnabledExperimental(true);
            }
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            setSignupStep(2); // Expand forms
            const handle = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            setUsername(handle);
            checkUsername(handle);
            setSignupStep(2);
          })
          .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
              Alert.alert(
                'Account Exists',
                'This email is already registered. Redirecting you to Log In.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setAuthMode('login');
                      setSignupStep(1);
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Signup Error', error.message);
            }
          });
      } else {
        if (!username.trim()) {
          Alert.alert('Error', 'Please enter a username.');
          return;
        }
        if (isUsernameAvailable === false) {
          Alert.alert('Error', 'Username is not available.');
          return;
        }

        const uid = auth().currentUser?.uid;
        const saveProfile = async () => {
          let uploadedUrl = '';
          if (avatarUri && uid) {
            const { uploadToCloudinary } = require('../utils/cloudinary');
            uploadedUrl = await uploadToCloudinary(avatarUri);
          }

          await firestore().collection('users').doc(uid).set({
            username: username.trim(),
            email: email.trim(),
            photoURL: uploadedUrl,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          await firestore().collection('usernames').doc(username.toLowerCase().trim()).set({ uid });
          onComplete(true);
        };

        const { ActivityIndicator } = require('react-native');
        saveProfile();
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Please enter your email and password.');
        return;
      }
      auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => onComplete(false))
        .catch(error => Alert.alert('Login Error', error.message));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Animated Logo Section */}
        <Animated.View
          style={[
            styles.logoWrapper,
            { transform: [{ translateY: logoY }] },
          ]}
        >
          <Text style={styles.logoMain}>HERE</Text>
          <Animated.Text style={[styles.tagline, { opacity: skipBtnAlpha }]}>
            Find your people. Share what matters.
          </Animated.Text>
        </Animated.View>

        {/* Lower Content containing taglines and login/signup forms */}
        <Animated.View style={[styles.contentWrapper, { opacity: contentAlpha }]}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {/* White Sheet Bottom Card */}
            <View style={styles.sheetCard}>
              <Text style={styles.formHeader}>
                {authMode === 'signup'
                  ? (signupStep === 1 ? 'Welcome' : 'Set your Profile')
                  : 'Welcome back'}
              </Text>

              <Text style={styles.formSubtitle}>
                {authMode === 'signup'
                  ? 'Sign up to get started.'
                  : "Let's pick up where the spark left off."}
              </Text>

              {/* Profile Setup Step 2 inside Signup */}
              {authMode === 'signup' && signupStep === 2 && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 22 }}>
                    <TouchableOpacity style={styles.avatarPlaceholder} activeOpacity={0.8} onPress={handlePickImage}>
                      {avatarUri ? (
                        <Image source={{ uri: avatarUri as string }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                      ) : (
                        <Text style={{ fontSize: 32, color: '#64748B' }}>👤</Text>
                      )}
                      <View style={styles.avatarPlusBadge}>
                        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>+</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Username"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      value={username}
                      onChangeText={checkUsername}
                    />
                  </View>
                </>
              )}

              {/* Step 1 Forms for Log-In or Setup */}
              {(authMode === 'login' || (authMode === 'signup' && signupStep === 1)) && (
                <>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Email address"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <Eye size={18} color="#94A3B8" />
                      ) : (
                        <EyeOff size={18} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {authMode === 'signup' && (
                    <View style={[styles.inputWrapper, {
                      borderColor: confirmPassword ? (password === confirmPassword ? '#10B981' : '#EF4444') : '#E2E8F0'
                    }]}>
                      <Lock size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Confirm Password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      {confirmPassword.length > 0 && (
                        password === confirmPassword ? (
                          <Check size={18} color="#10B981" />
                        ) : (
                          <X size={18} color="#EF4444" />
                        )
                      )}
                    </View>
                  )}

                  {authMode === 'login' && (
                    <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
                      <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '500' }}>Forgot password?</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleAuth}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>
                  {authMode === 'signup'
                    ? (signupStep === 1 ? 'Sign Up' : 'Next')
                    : 'Login'}
                </Text>
              </TouchableOpacity>

              {!(authMode === 'signup' && signupStep === 2) && (
                <>
                  {/* Or Sign In With Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or Sign In With</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Icons row */}
                  <View style={styles.socialRow}>
                    <TouchableOpacity activeOpacity={0.8} onPress={onGoogleButtonPress}>
                      <Animated.View style={[styles.socialBtnAnimated, { width: googleBtnWidth }]}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000', position: 'absolute', left: 15 }}>G</Text>
                        <Animated.Text style={{ opacity: googleTextAlpha, fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 22 }}>
                          Continue with Google
                        </Animated.Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.switchBtn}
                    onPress={toggleAuthMode}
                  >
                    <Text style={styles.switchTextPre}>
                      {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                      <Text style={styles.switchTextLink}>
                        {authMode === 'signup' ? 'Log In' : 'Sign Up'}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {authMode === 'signup' && signupStep === 2 && (
                <TouchableOpacity
                  style={{ marginTop: 22, alignItems: 'center' }}
                  onPress={async () => {
                    await auth().signOut();
                    setSignupStep(1);
                  }}
                >
                  <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>
                    Sign Out / Start over ➔
                  </Text>
                </TouchableOpacity>
              )}
              {/* Bottom bleed filler to cover safe area gap cutoff */}
              <View style={{ height: 1000, backgroundColor: '#ffffff', position: 'absolute', bottom: -1000, left: 0, right: 0 }} />
            </View>
          </ScrollView>
        </Animated.View>

        {/* Floating Skip button visible only in splash loading */}
        <Animated.View
          style={[
            styles.skipWrapper,
            { opacity: skipBtnAlpha },
          ]}
          pointerEvents={stage === 'splash' ? 'auto' : 'none'}
        >
          <TouchableOpacity onPress={triggerTransition} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip ➔</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  logoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.15)',
  },
  logoInnerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
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
  contentWrapper: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 180, // Allow space above for animated logo
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: '#8B5CF6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialBtnAnimated: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
  },
  switchBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  switchTextPre: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  switchTextLink: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  skipWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 24,
  },
  skipText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
});
