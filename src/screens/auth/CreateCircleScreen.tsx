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
  ScrollView
} from 'react-native';
import { Colors, Shadows, Sizes } from '../../theme/Theme';

const EMOJIS = ['🤝', '🏠', '💎', '🔥', '✨', '🌊', '🌲', '🚀'];

const CreateCircleScreen = ({ navigation, route }: any) => {
  const [circleName, setCircleName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🤝');
  
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>HERE</Text>
            <View style={styles.line} />
            <Text style={styles.tagline}>Private Social for Real Circles</Text>
          </View>

          <Animated.View style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Text style={styles.headline}>Create your{"\n"}first Circle.</Text>
            
            <View style={styles.formContainer}>
              <View style={styles.emojiContainer}>
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity 
                    key={emoji}
                    style={[
                      styles.emojiBtn,
                      selectedEmoji === emoji && styles.selectedEmojiBtn
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Circle Name (e.g. Inner Circle)"
                value={circleName}
                onChangeText={setCircleName}
                placeholderTextColor="#94A3B8"
              />
              
              <Text style={styles.infoText}>Max 10 people. Keep it close.</Text>

              <TouchableOpacity 
                style={[
                  styles.button,
                  !circleName && { opacity: 0.5 }
                ]}
                activeOpacity={0.9}
                disabled={!circleName}
                onPress={() => navigation.navigate('Invite', { user, circleName, emoji: selectedEmoji })}
              >
                <Text style={styles.buttonText}>Create Circle</Text>
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
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 40,
  },
  formContainer: {
    gap: 24,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  selectedEmojiBtn: {
    backgroundColor: '#EEEDFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  emojiText: {
    fontSize: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 20,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '600',
    ...Shadows.soft,
  },
  infoText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -8,
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
});

export default CreateCircleScreen;
