import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Clipboard,
  Share,
  StatusBar,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCircleStore } from '../../store/circleStore';
import { Shadows } from '../../theme/Theme';
import {
  Copy,
  Check,
  ChevronRight,
  MessageCircle,
  Plus,
  Link as LinkIcon,
  Users as UsersIcon,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const InviteScreen = ({ navigation, route }: any) => {
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { refreshProfile, user: authUser } = useAuth();
  const fetchHomeData = useCircleStore(state => state.fetchHomeData);

  const user = route.params?.user || authUser;
  const circleName = route.params?.circleName || 'Your Circle';
  const inviteCode = route.params?.inviteCode || 'HERE2024';
  const privacy = route.params?.privacy || 'private';

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

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

  const handleCopy = () => {
    try {
      Clipboard.setString(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      Share.share({ message: inviteCode });
    }
  };

  const handleWhatsApp = async () => {
    const message = `Join my private circle "${circleName}" on HERE. Use code: ${inviteCode}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      await Share.share({ message });
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Refresh profile to trigger the UI switch (userData will become non-null)
      await refreshProfile();
      // Fetch home data for the circle
      await fetchHomeData();
    } catch (error) {
      console.error('Finalize Onboarding Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.successIconContainer}>
          <View style={styles.successCircle}>
            <Check color="#FFFFFF" size={32} strokeWidth={3} />
          </View>
        </View>

        <Text style={styles.title}>Your circle is ready!</Text>
        <Text style={styles.subtitle}>
          Invite your friends to join '{circleName}'
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardName}>{circleName}</Text>
              <Text style={styles.cardMembers}>You + 0 members</Text>
            </View>
            <View
              style={[
                styles.tag,
                {
                  backgroundColor:
                    privacy === 'private' ? '#FFE4E6' : '#DCFCE7',
                },
              ]}
            >
              <View
                style={[
                  styles.tagDot,
                  {
                    backgroundColor:
                      privacy === 'private' ? '#E11D48' : '#10B981',
                  },
                ]}
              />
              <Text
                style={[
                  styles.tagText,
                  { color: privacy === 'private' ? '#9F1239' : '#065F46' },
                ]}
              >
                {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarStack}>
              <View style={[styles.avatar, styles.avatar1]}>
                <Image
                  source={{
                    uri:
                      user?.user_metadata?.avatar_url ||
                      'https://i.pravatar.cc/100?u=me',
                  }}
                  style={styles.avatarImg}
                />
              </View>
              <View
                style={[
                  styles.avatar,
                  styles.avatar2,
                  { backgroundColor: '#C7D2FE' },
                ]}
              >
                <UsersIcon size={16} color="#4F46E5" />
              </View>
              <View
                style={[
                  styles.avatar,
                  styles.avatar3,
                  { backgroundColor: '#818CF8' },
                ]}
              >
                <Plus size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.joiningText}>Joining...</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsApp}
          >
            <View style={styles.buttonLeft}>
              <View style={styles.whiteIconBox}>
                <MessageCircle size={20} color="#22C55E" fill="#22C55E" />
              </View>
              <Text style={styles.buttonTextWhite}>Invite via WhatsApp</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <View style={styles.buttonLeft}>
              <LinkIcon size={20} color="#4F46E5" />
              <Text style={styles.buttonTextBlue}>Copy Invite Link</Text>
            </View>
            <Copy size={18} color={copied ? '#10B981' : '#4F46E5'} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleFinish}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
          <Text style={styles.footerSubtext}>
            You can invite later from settings
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardMembers: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar1: { zIndex: 3 },
  avatar2: { zIndex: 2, marginLeft: -12 },
  avatar3: { zIndex: 1, marginLeft: -12 },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  joiningText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  whatsappButton: {
    backgroundColor: '#22C55E',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.soft,
  },
  copyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  whiteIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextWhite: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  buttonTextBlue: {
    color: '#4F46E5',
    fontSize: 17,
    fontWeight: '800',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 40,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default InviteScreen;
