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
  ActivityIndicator,
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
  color: string;
  lightBg: string;
}[] = [
  { type: 'studying', label: 'Studying', sub: 'Deep work mode', icon: BookOpen, color: '#4F46E5', lightBg: '#EEEDFF' },
  { type: 'gym', label: 'At the Gym', sub: 'Working out', icon: Dumbbell, color: '#F59E0B', lightBg: '#FEF3C7' },
  { type: 'coding', label: 'Coding', sub: 'Building something', icon: Code2, color: '#06B6D4', lightBg: '#CFFAFE' },
  { type: 'free', label: 'Free', sub: "Let's talk", icon: MessageCircle, color: '#10B981', lightBg: '#D1FAE5' },
  { type: 'resting', label: 'Resting', sub: 'Taking a break', icon: Coffee, color: '#8B5CF6', lightBg: '#EDE9FE' },
];

interface StatusSelectorProps {
  currentStatus: UserStatus;
  onSelect: (status: UserStatus) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onSelect,
  onClose,
  isLoading = false,
}) => {
  const [selected, setSelected] = useState<UserStatus>(currentStatus || 'free');
  const [focusHours, setFocusHours] = useState(2);
  const [localLoading, setLocalLoading] = useState(false);

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
    setLocalLoading(true);
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
            <Text style={styles.title}>What's your vibe today?</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {STATUS_OPTS.map(opt => {
              const Icon = opt.icon;
              const isSelected = selected === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  onPress={() => setSelected(opt.type)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10 }}
                  style={[
                    styles.statusCard,
                    isSelected && { borderColor: opt.color, backgroundColor: opt.lightBg },
                  ]}
                >
                  <View style={styles.statusLeft}>
                    <View style={[styles.iconBox, { backgroundColor: isSelected ? '#FFFFFF' : opt.lightBg }]}>
                      <Icon size={22} color={opt.color} strokeWidth={isSelected ? 2.5 : 2} />
                    </View>
                    <View>
                      <Text style={[styles.statusLabel, isSelected && { color: opt.color }]}>{opt.label}</Text>
                      <Text style={[styles.statusSub, isSelected && { color: opt.color, opacity: 0.8 }]}>{opt.sub}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      isSelected && { borderColor: opt.color },
                    ]}
                  >
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: opt.color }]} />}
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
                selected === 'focus' && { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
              ]}
            >
              <View style={styles.focusHeader}>
                <View style={styles.statusLeft}>
                  <View style={[styles.iconBox, { backgroundColor: selected === 'focus' ? '#FFFFFF' : '#FEE2E2' }]}>
                    <Target size={22} color="#EF4444" strokeWidth={selected === 'focus' ? 2.5 : 2} />
                  </View>
                  <View>
                    <Text style={[styles.statusLabel, selected === 'focus' && { color: '#EF4444' }]}>Focus Mode</Text>
                    <Text style={[styles.statusSub, selected === 'focus' && { color: '#EF4444', opacity: 0.8 }]}>
                      Do not disturb for {focusHours} {focusHours === 1 ? 'hour' : 'hours'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radio,
                    selected === 'focus' && { borderColor: '#EF4444' },
                  ]}
                >
                  {selected === 'focus' && <View style={[styles.radioInner, { backgroundColor: '#EF4444' }]} />}
                </View>
              </View>

              <View style={styles.timeContainer}>
                 <Text style={styles.timeLabel}>For how long?</Text>
                 <View style={styles.stepperControl}>
                    <TouchableOpacity 
                       onPress={() => {
                          setSelected('focus');
                          setFocusHours(Math.max(1, focusHours - 1));
                       }}
                       style={styles.stepperBtn}
                    >
                       <Text style={styles.stepperBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{focusHours} {focusHours === 1 ? 'hr' : 'hrs'}</Text>
                    <TouchableOpacity 
                       onPress={() => {
                          setSelected('focus');
                          setFocusHours(Math.min(12, focusHours + 1));
                       }}
                       style={styles.stepperBtn}
                    >
                       <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                 </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.updateBtn, (isLoading || localLoading) && { opacity: 0.7 }]} 
              onPress={handleUpdate}
              disabled={isLoading || localLoading}
              hitSlop={{ top: 10, bottom: 10 }}
            >
              {(isLoading || localLoading) ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.updateBtnText}>Update My Vibe</Text>
              )}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 32,
  },
  scroll: {
    marginBottom: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  statusSub: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  focusCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presenceSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  presenceScroll: { paddingLeft: 20, paddingRight: 10 },
  presenceItem: { alignItems: 'center', marginRight: 20, width: 64 },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 58,
    paddingRight: 16,
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600'
  },
  stepperControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569'
  },
  stepperValue: {
    width: 48,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  footer: {
    paddingBottom: 40,
    gap: 16,
  },
  updateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
