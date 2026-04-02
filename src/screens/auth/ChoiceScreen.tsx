import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated,
  Dimensions
} from 'react-native';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { Plus, Users } from 'lucide-react-native';

const ChoiceScreen = ({ navigation, route }: any) => {
  const user = route.params?.user;
  
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
        <Text style={styles.headline}>How do you{"\n"}want to start?</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CreateCircle', { user })}
          >
            <View style={styles.iconBox}>
              <Plus color="#8B5CF6" size={28} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Create a Circle</Text>
              <Text style={styles.cardSubtext}>Start your own private space</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('JoinCircle', { user })}
          >
            <View style={styles.iconBox}>
              <Users color="#64748B" size={28} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Join a Circle</Text>
              <Text style={styles.cardSubtext}>Enter an invite code or link</Text>
            </View>
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
    marginBottom: 60,
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
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 48,
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.soft,
  },
  iconBox: {
    backgroundColor: '#FFFFFF',
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    ...Shadows.soft,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtext: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default ChoiceScreen;
