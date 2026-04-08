import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/Theme';

const { width } = Dimensions.get('window');

const IntroScreen = ({ navigation, route }: any) => {
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
          <Text style={styles.headline}>HERE is your{"\n"}private space.</Text>
          <Text style={styles.subtext}>
            No feeds. No algorithms.{"\n"}Just 5–10 people who matter.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Choice', { user: route.params?.user })}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    marginBottom: 80,
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
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  textBlock: {
    marginTop: 20,
  },
  headline: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 48,
    letterSpacing: -1,
  },
  subtext: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 28,
    marginTop: 24,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    ...Shadows.medium,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default IntroScreen;
