import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Mic, MicOff, MessageCircle, Heart, UserPlus } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const LiveRoomScreen = ({ navigation }: any) => {
  const { Colors } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const members = [
    { id: '1', name: 'Alex', initial: 'A', speaking: true, top: '10%', left: '45%' },
    { id: '2', name: 'Priya', initial: 'P', speaking: false, top: '40%', left: '10%' },
    { id: '3', name: 'Ishan', initial: 'I', speaking: false, top: '40%', left: '80%' },
    { id: '4', name: 'You', initial: 'Y', speaking: !isMuted, top: '75%', left: '45%' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: Colors.text }]}>Live Room</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>4 people here</Text>
        </View>
        <TouchableOpacity 
          style={[styles.leaveBtn, { backgroundColor: 'rgba(255, 56, 96, 0.1)' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Main Area: Circular Layout */}
      <View style={styles.mainArea}>
        {members.map((member) => (
          <View 
            key={member.id} 
            style={[styles.avatarContainer, { top: member.top as any, left: member.left as any }]}
          >
            {member.speaking && (
              <Animated.View 
                style={[
                  styles.pulseRing, 
                  { borderColor: Colors.primary, transform: [{ scale: pulseAnim }] }
                ]} 
              />
            )}
            <View style={[styles.avatar, { borderColor: member.speaking ? Colors.primary : Colors.border }]}>
              <Text style={styles.avatarText}>{member.initial}</Text>
            </View>
            <Text style={[styles.memberName, { color: Colors.text }]}>{member.name}</Text>
          </View>
        ))}
      </View>

      {/* System Messages */}
      <View style={styles.systemMessages}>
        <Text style={[styles.systemText, { color: Colors.textSecondary }]}>3 people active</Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isMuted ? 'rgba(255, 56, 96, 0.2)' : 'rgba(255,255,255,0.05)' }]}
          onPress={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff size={24} color="#FF3860" /> : <Mic size={24} color={Colors.text} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Heart size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <UserPlus size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  leaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  leaveText: {
    color: '#FF3860',
    fontWeight: '600',
  },
  mainArea: {
    flex: 1,
    position: 'relative',
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  pulseRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    top: -10,
    left: -5,
    opacity: 0.5,
  },
  memberName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  systemMessages: {
    alignItems: 'center',
    marginBottom: 20,
  },
  systemText: {
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiveRoomScreen;
