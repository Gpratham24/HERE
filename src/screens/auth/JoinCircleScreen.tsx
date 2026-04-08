import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { getCircleByCode, joinCircle } from '../../services/api';
import { useCircleStore } from '../../store/circleStore';
import { useAuth } from '../../context/AuthContext';

const JoinCircleScreen = ({ navigation, route }: any) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const user = route.params?.user;
  const fetchHomeData = useCircleStore(state => state.fetchHomeData);
  const { refreshProfile } = useAuth();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  const handleJoin = async () => {
    if (!inviteCode) return;

    setLoading(true);
    try {
      // 1. Resolve code to circle ID via Supabase
      const circle = await getCircleByCode(inviteCode);

      if (!circle) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      // 2. Call backend to join the circle
      // 3. Trigger instant data refresh
      await fetchHomeData(circle.id);
      await refreshProfile();

      // 4. Navigate to success/invite screen
      navigation.navigate('Invite', {
        user,
        circleName: circle.name,
        inviteCode: inviteCode.toUpperCase(),
        id: circle.id,
        mode: 'joining',
      });
    } catch (error: any) {
      console.error('Join Circle Error:', error);
      Alert.alert(
        'Join Failed',
        error.message || "We couldn't find a circle with that code.",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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
            <Text style={styles.logo}>HERE</Text>
            <View style={styles.line} />
            <Text style={styles.tagline}>Private Social for Real Circles</Text>
          </View>

          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.textBlock}>
              <Text style={styles.headline}>Join a Circle.</Text>
              <Text style={styles.subtext}>
                Enter the 6-digit invite code or link sent by your friend.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Invite Code"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                maxLength={10}
                placeholderTextColor="#94A3B8"
                editable={!loading}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  (!inviteCode || loading) && { opacity: 0.5 },
                ]}
                activeOpacity={0.9}
                disabled={!inviteCode || loading}
                onPress={handleJoin}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Join Circle</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkAction}
                activeOpacity={0.7}
                onPress={() => {}} // Could trigger clipboard check
                disabled={loading}
              >
                <Text style={styles.linkActionText}>Paste invite link</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
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
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 40,
    flex: 1,
  },
  textBlock: {
    marginBottom: 48,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 12,
  },
  formContainer: {
    gap: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 20,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    ...Shadows.soft,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
    ...Shadows.medium,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  linkAction: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkActionText: {
    fontSize: 15,
    color: '#8B5CF6',
    fontWeight: '700',
  },
});

export default JoinCircleScreen;
