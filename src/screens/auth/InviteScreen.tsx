import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated,
  Clipboard,
  Share
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { Copy, Share as ShareIcon, Check } from 'lucide-react-native';

const InviteScreen = ({ navigation, route }: any) => {
  const [copied, setCopied] = React.useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  
  const user = route.params?.user;
  const circleName = route.params?.circleName || 'Your Circle';
  const inviteCode = route.params?.inviteCode || 'HERE2024'; // Dummy or generated

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
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my private circle "${circleName}" on HERE. Use code: ${inviteCode}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFinish = () => {
    if (user) {
      setUser(user);
    } else {
      // Fallback for demo or invited users
      navigation.replace('Signup'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>HERE</Text>
        <View style={styles.line} />
        <Text style={styles.tagline}>Private Social for Real Circles</Text>
      </View>

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <View style={styles.textBlock}>
          <Text style={styles.headline}>Invite your{"\n"}people.</Text>
          <Text style={styles.subtext}>Your circle is ready. Send this code to those who matter most.</Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Invite Code</Text>
          <TouchableOpacity 
            style={styles.codeBox}
            activeOpacity={0.8}
            onPress={handleCopy}
          >
            <Text style={styles.codeText}>{inviteCode}</Text>
            {copied ? <Check color="#10B981" size={20} /> : <Copy color="#64748B" size={20} />}
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={handleFinish}
          >
            <Text style={styles.primaryBtnText}>Enter Circle</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareBtn}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <ShareIcon color="#0F172A" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.shareBtnText}>Share Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipLink}
            activeOpacity={0.7}
            onPress={handleFinish}
          >
            <Text style={styles.skipLinkText}>Skip for now</Text>
          </TouchableOpacity>
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
    marginBottom: 40,
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
  codeContainer: {
    marginBottom: 48,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 4,
    marginRight: 16,
  },
  actionContainer: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    ...Shadows.medium,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  shareBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  shareBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  skipLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipLinkText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  }
});

export default InviteScreen;
