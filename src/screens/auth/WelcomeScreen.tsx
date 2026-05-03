import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { OrbBackground } from '../../components/common/OrbBackground';

// New Separate Screens
import AuthScreen from './AuthScreen';
import ChoiceScreen from '../onboarding/ChoiceScreen';
import CreateCircleScreen from '../circles/CreateCircleScreen';
import JoinCircleScreen from '../circles/JoinCircleScreen';
import InviteScreen from '../circles/InviteScreen';
import TransitionScreen from '../onboarding/TransitionScreen';

const { height, width } = Dimensions.get('window');

const THEME = {
  purple: '#7F77DD',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  offWhite: '#FDFDFF',
};

type Stage = 
  | 'splash' 
  | 'onboarding' 
  | 'auth' 
  | 'choice' 
  | 'create' 
  | 'join' 
  | 'invite' 
  | 'quote_transition';

interface WelcomeScreenProps {
  onComplete: (isNewUser?: boolean) => void;
}

const LiveRoomVisual = () => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnim = (val: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(val, { toValue: 2, duration: 2000, useNativeDriver: true }),
            Animated.timing(val, { toValue: 1, duration: 0, useNativeDriver: true }), // Reset
          ])
        ])
      );
    };
    
    Animated.parallel([
      createAnim(pulse1, 0),
      createAnim(pulse2, 1000),
    ]).start();
  }, []);

  return (
    <View style={styles.ringContainer}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse1 }], opacity: pulse1.interpolate({ inputRange: [1, 2], outputRange: [0.4, 0] }) }]} />
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse2 }], opacity: pulse2.interpolate({ inputRange: [1, 2], outputRange: [0.4, 0] }) }]} />
      <View style={styles.liveAvStack}>
        <View style={[styles.av, { width: 52, height: 52, backgroundColor: '#EDE9FE', borderWidth: 3 }]}><Text style={styles.avText}>A</Text></View>
        <View style={[styles.av, { width: 52, height: 52, backgroundColor: '#DCFCE7', marginLeft: -16, borderWidth: 3 }]}><Text style={styles.avText}>P</Text></View>
      </View>
    </View>
  );
};

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [stage, setStage] = useState<Stage>('splash');
  const [obStep, setObStep] = useState(0);
  const [circleData, setCircleData] = useState<any>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    triggerTransition();
  }, [stage, obStep]);

  const triggerTransition = () => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  };

  const goTo = (newStage: Stage) => {
    setStage(newStage);
  };

  // --- RENDERING LOGIC ---

  if (stage === 'auth') {
    return <AuthScreen onBack={() => goTo('onboarding')} onSuccess={(isNew) => isNew ? goTo('choice') : onComplete(false)} />;
  }

  if (stage === 'choice') {
    return (
      <ChoiceScreen 
        onCreate={() => goTo('create')} 
        onJoin={() => goTo('join')} 
        onSkip={() => goTo('quote_transition')} 
      />
    );
  }

  if (stage === 'create') {
    return <CreateCircleScreen onBack={() => goTo('choice')} onContinue={(data) => { setCircleData(data); goTo('invite'); }} />;
  }

  if (stage === 'join') {
    return <JoinCircleScreen onBack={() => goTo('choice')} onJoin={() => goTo('quote_transition')} />;
  }

  if (stage === 'invite') {
    return (
      <InviteScreen 
        circleName={circleData?.name} 
        circleSize={circleData?.size} 
        onBack={() => goTo('create')} 
        onDone={() => goTo('quote_transition')} 
      />
    );
  }

  if (stage === 'quote_transition') {
    return <TransitionScreen onEnter={() => onComplete(true)} />;
  }

  const currentOrbPreset = (): any => {
    if (stage === 'splash') return 'splash';
    if (stage === 'onboarding') {
      return `ob${obStep + 1}`;
    }
    return 'auth';
  };

  const renderOnboarding = () => {
    const steps = [
      {
        title: "Not everything\nis meant for\neveryone.",
        sub: "Some moments belong only to your people.",
        accent: THEME.purple,
        visual: (
          <View style={styles.obVisualRow}>
            <View style={[styles.av, { backgroundColor: '#EDE9FE' }]}><Text style={styles.avText}>A</Text></View>
            <View style={[styles.av, { backgroundColor: '#DCFCE7', marginLeft: -14 }]}><Text style={styles.avText}>P</Text></View>
            <View style={[styles.av, { backgroundColor: '#DBEAFE', marginLeft: -14 }]}><Text style={styles.avText}>J</Text></View>
            <View style={[styles.av, { backgroundColor: '#F3F4F6', marginLeft: -14 }]}><Text style={[styles.avText, { fontSize: 12, color: '#9CA3AF' }]}>+5</Text></View>
            <Text style={styles.obVisualTag}>your circle.{"\n"}private. yours.</Text>
          </View>
        )
      },
      {
        title: "A private space\nfor the people\nwho matter.",
        sub: "Not social media. No followers.\nNo algorithm. Just your circle of 5–10.",
        accent: '#1D9E75',
        visual: (
          <View>
            <View style={styles.miniCard}><View style={[styles.miniDot, { backgroundColor: '#EF4444' }]} /><View><Text style={styles.miniLabel}>No followers</Text><Text style={styles.miniSub}>invitation only · max 10</Text></View></View>
            <View style={styles.miniCard}><View style={[styles.miniDot, { backgroundColor: '#EF4444' }]} /><View><Text style={styles.miniLabel}>No algorithm</Text><Text style={styles.miniSub}>you choose the vibe</Text></View></View>
            <View style={styles.miniCard}><View style={[styles.miniDot, { backgroundColor: '#1D9E75' }]} /><View><Text style={styles.miniLabel}>Just your circle</Text><Text style={styles.miniSub}>real connection. no noise.</Text></View></View>
          </View>
        )
      },
      {
        title: "See who's around.\nThen everything\nfollows.",
        sub: "Chat, share moments, jump into a live room — all with people already in your circle.",
        accent: '#D4537E',
        visual: (
          <View>
            <View style={styles.pRow}><View style={styles.pLeft}><View style={[styles.av, { width: 34, height: 34, backgroundColor: '#EDE9FE' }]}><Text style={[styles.avText, { fontSize: 13 }]}>A</Text></View><View><Text style={styles.pName}>Alex</Text><Text style={styles.pNote}>Free to chat</Text></View></View><View style={[styles.pBadge, { backgroundColor: '#DCFCE7' }]}><Text style={[styles.pBadgeText, { color: '#059669' }]}>Free</Text></View></View>
            <View style={styles.pRow}><View style={styles.pLeft}><View style={[styles.av, { width: 34, height: 34, backgroundColor: '#DCFCE7' }]}><Text style={[styles.avText, { fontSize: 13 }]}>P</Text></View><View><Text style={styles.pName}>Priya</Text><Text style={styles.pNote}>Deep work</Text></View></View><View style={[styles.pBadge, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.pBadgeText, { color: '#D97706' }]}>Focus</Text></View></View>
          </View>
        )
      },
      {
        title: "Sometimes your\ncircle is already\nhere.",
        sub: "When 2+ people are active, a Live Room opens automatically.",
        accent: '#3B82F6',
        visual: (
          <View style={{ alignItems: 'center' }}>
            <LiveRoomVisual />
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveBadgeText}>Live now · 2 people</Text></View>
          </View>
        )
      }
    ];

    const current = steps[obStep];

    return (
      <View style={styles.container}>
        <OrbBackground preset={currentOrbPreset()} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.logoSmall}>CIRCLO</Text>
          </View>
          <Animated.View style={[styles.main, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={[styles.accent, { backgroundColor: current.accent }]} />
            <Text style={styles.title}>{current.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.sub}>{current.sub}</Text>
            <View style={styles.visual}>{current.visual}</View>
          </Animated.View>
          
          <View style={styles.foot}>
            <TouchableOpacity 
              onPress={() => obStep > 0 ? setObStep(obStep - 1) : goTo('splash')} 
              style={styles.footBtn}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={styles.footBtnText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.dotRow}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[styles.dot, i === obStep && { width: 22, backgroundColor: THEME.purple }, i !== obStep && { backgroundColor: THEME.border }]} />
              ))}
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (obStep < 3) setObStep(obStep + 1);
                else goTo('auth');
              }} 
              activeOpacity={0.7}
              style={obStep === 3 ? styles.getStartedBtn : styles.footBtn}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={[styles.footBtnText, obStep === 3 ? { color: THEME.purple, fontWeight: '800' } : { color: THEME.purple }]}>
                {obStep === 3 ? 'Get started →' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  const renderSplash = () => (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={() => goTo('onboarding')}>
      <OrbBackground preset="splash" />
      <View style={styles.center}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={styles.quoteText}>Some moments{"\n"}are meant only{"\n"}for your people.</Text>
          <View style={styles.splashDivider} />
          <Text style={styles.splashLogo}>CIRCLO</Text>
        </Animated.View>
      </View>
      <View style={styles.bottomHint}>
        <View style={styles.hintBar} />
        <Text style={styles.hintText}>tap to begin</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />
      {stage === 'splash' ? renderSplash() : renderOnboarding()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1, paddingHorizontal: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  quoteText: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
    lineHeight: 46,
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
  },
  splashDivider: { width: 32, height: 1, backgroundColor: THEME.border, marginVertical: 32 },
  splashLogo: { fontSize: 20, fontWeight: '700', letterSpacing: 6, color: THEME.text, opacity: 0.8 },
  bottomHint: { position: 'absolute', bottom: 60, alignSelf: 'center', alignItems: 'center' },
  hintBar: { width: 40, height: 3, backgroundColor: THEME.border, borderRadius: 2, marginBottom: 10 },
  hintText: { fontSize: 11, letterSpacing: 2, color: THEME.textMuted, textTransform: 'uppercase', fontWeight: '700' },

  // Onboarding Info
  header: { 
    height: 60, 
    justifyContent: 'center', 
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0 
  },
  logoSmall: { 
    fontSize: 13, 
    fontWeight: '800', 
    letterSpacing: 4, 
    color: THEME.text, 
    opacity: 0.8,
    marginTop: 0, 
    textTransform: 'uppercase' 
  },
  main: { flex: 1, justifyContent: 'center' },
  accent: { width: 30, height: 3, borderRadius: 2, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '700', color: THEME.text, lineHeight: 40 },
  divider: { width: 32, height: 1, backgroundColor: THEME.border, marginVertical: 18 },
  sub: { fontSize: 15, color: THEME.textMuted, lineHeight: 24, fontWeight: '500' },
  visual: { marginTop: 40 },
  obVisualRow: { flexDirection: 'row', alignItems: 'center' },
  av: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  avText: { fontSize: 16, fontWeight: '700', color: THEME.text },
  obVisualTag: { fontSize: 12, color: THEME.textMuted, marginLeft: 18, lineHeight: 18, fontWeight: '600' },
  miniCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: THEME.border, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  miniDot: { width: 8, height: 8, borderRadius: 4, marginRight: 14 },
  miniLabel: { fontSize: 14, fontWeight: '700', color: THEME.text },
  miniSub: { fontSize: 12, color: THEME.textMuted, marginTop: 2, fontWeight: '500' },
  pRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 16, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: THEME.border },
  pLeft: { flexDirection: 'row', alignItems: 'center' },
  pName: { fontSize: 15, fontWeight: '700', color: THEME.text, marginLeft: 14 },
  pNote: { fontSize: 12, color: THEME.textMuted, marginLeft: 14, fontWeight: '500' },
  pBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  pBadgeText: { fontSize: 11, fontWeight: '800' },
  ringContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  pulseRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: THEME.purple + '40' },
  liveAvStack: { flexDirection: 'row' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, marginTop: 20, borderWidth: 1, borderColor: '#FEE2E2' },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', marginRight: 10 },
  liveBadgeText: { fontSize: 12, fontWeight: '700', color: '#B91C1C' },
  foot: { 
    height: 120, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'android' ? 12 : 0 
  },
  footBtn: { padding: 10 },
  footBtnText: { fontSize: 15, fontWeight: '700', color: THEME.textMuted },
  dotRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  getStartedBtn: { backgroundColor: THEME.purple + '12', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: THEME.purple + '25' },
});
