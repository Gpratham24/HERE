import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { UserStatus } from '../store/circleStore';
import { Colors, Shadows } from '../theme/Theme';
import { 
  BookOpen, 
  Dumbbell, 
  Code2, 
  MessageCircle, 
  Coffee, 
  Target,
  ChevronRight
} from 'lucide-react-native';

const { height } = Dimensions.get('window');

const STATUS_OPTS: {
  type: UserStatus;
  label: string;
  sub: string;
  icon: any;
  iconColor: string;
  bgColor: string;
}[] = [
  { type: 'studying', label: 'Studying', sub: 'Deep work mode', icon: BookOpen, iconColor: '#3B82F6', bgColor: '#EFF6FF' },
  { type: 'gym', label: 'At the Gym', sub: 'Working out', icon: Dumbbell, iconColor: '#F59E0B', bgColor: '#FFF7ED' },
  { type: 'coding', label: 'Coding', sub: 'Building something', icon: Code2, iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
  { type: 'free', label: 'Free', sub: "Let's talk", icon: MessageCircle, iconColor: '#10B981', bgColor: '#ECFDF5' },
  { type: 'resting', label: 'Resting', sub: 'Taking a break', icon: Coffee, iconColor: '#78350F', bgColor: '#FFFBEB' },
];

const FOCUS_TIMES = ['6 PM', '7 PM', '8 PM', '9 PM'];

interface StatusSelectorProps {
  currentStatus: UserStatus;
  onSelect: (status: UserStatus) => void;
  onClose: () => void;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onSelect,
  onClose,
}) => {
  const [selected, setSelected] = useState<UserStatus>(currentStatus || 'free');
  const [focusTime, setFocusTime] = useState('6 PM');

  const bottomAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.back(0.8)),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpdate = () => {
    onSelect(selected);
  };

  const handleClose = () => {
    Animated.timing(bottomAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[styles.content, { transform: [{ translateY: bottomAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>What's your{'\n'}vibe today?</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {STATUS_OPTS.map(opt => {
              const Icon = opt.icon;
              return (
                <TouchableOpacity
                  key={opt.type}
                  onPress={() => setSelected(opt.type)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10 }}
                  style={[
                    styles.statusCard,
                    selected === opt.type && styles.statusCardSelected,
                  ]}
                >
                  <View style={styles.statusLeft}>
                    <View style={[styles.iconBox, { backgroundColor: opt.bgColor }]}>
                      <Icon size={24} color={opt.iconColor} strokeWidth={2.5} />
                    </View>
                    <View>
                      <Text style={styles.statusLabel}>{opt.label}</Text>
                      <Text style={styles.statusSub}>{opt.sub}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selected === opt.type && { borderColor: opt.iconColor, backgroundColor: opt.bgColor },
                    ]}
                  >
                    {selected === opt.type && <View style={[styles.radioInner, { backgroundColor: opt.iconColor }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Focus Mode Custom UI */}
            <TouchableOpacity
              onPress={() => setSelected('focus')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10 }}
              style={[
                styles.focusCard,
                selected === 'focus' && styles.statusCardSelected,
              ]}
            >
              <View style={styles.focusHeader}>
                <View style={styles.statusLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Target size={24} color="#EF4444" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={styles.statusLabel}>Focus Mode</Text>
                    <Text style={styles.statusSub}>
                      Do not disturb until {focusTime}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radio,
                    selected === 'focus' && { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
                  ]}
                >
                  {selected === 'focus' && <View style={[styles.radioInner, { backgroundColor: '#EF4444' }]} />}
                </View>
              </View>

              <View style={styles.timeContainer}>
                {FOCUS_TIMES.map(time => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => {
                      setSelected('focus');
                      setFocusTime(time);
                    }}
                    style={[
                      styles.timeChip,
                      focusTime === time &&
                        selected === 'focus' &&
                        styles.timeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        focusTime === time &&
                          selected === 'focus' &&
                          styles.timeTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.updateBtn} 
              onPress={handleUpdate}
              hitSlop={{ top: 10, bottom: 10 }}
            >
              <Text style={styles.updateBtnText}>Set and Shine</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10 }}
            >
              <Text style={styles.cancelBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: height * 0.85,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  headerRow: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
  },
  scroll: {
    marginBottom: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  statusCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
    ...Shadows.medium,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 24,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#4F46E5',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },
  focusCard: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 40,
  },
  timeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: '#4F46E5',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingBottom: 40,
    gap: 16,
  },
  updateBtn: {
    backgroundColor: '#4338CA',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
});
