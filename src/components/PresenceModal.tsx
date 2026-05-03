import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Clock, Edit2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from './common/GlassCard';
import { GradientButton } from './common/GradientButton';

interface PresenceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (presence: any) => void;
}

export const PresenceModal: React.FC<PresenceModalProps> = ({ visible, onClose, onSave }) => {
  const { Colors } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState('Focus');
  const [duration, setDuration] = useState('1h');
  const [note, setNote] = useState('');

  const statuses = [
    { label: 'Focus' },
    { label: 'Free' },
    { label: 'Busy' },
    { label: 'Coding' },
    { label: 'Resting' },
    { label: 'Out' },
  ];

  const durations = ['1h', '3h', 'Until change'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <GlassCard style={[styles.content, { backgroundColor: Colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.text }]}>
              How are you showing up?
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
            <View style={styles.statusGrid}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.label}
                  style={[
                    styles.statusItem,
                    { backgroundColor: Colors.surface, borderColor: 'rgba(0,0,0,0.05)' },
                    selectedStatus === status.label && {
                      backgroundColor: Colors.primary,
                      borderColor: Colors.primary,
                      shadowColor: Colors.primary,
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      elevation: 5,
                    },
                  ]}
                  onPress={() => setSelectedStatus(status.label)}
                >
                  <Text style={[
                    styles.statusLabel,
                    {
                      color: selectedStatus === status.label ? '#FFF' : Colors.text,
                      textAlign: 'center',
                      width: '100%'
                    }
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textMuted }]}>Duration</Text>
              <View style={styles.durationRow}>
                {durations.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.durationPill,
                      { backgroundColor: Colors.surface, borderColor: 'rgba(0,0,0,0.05)' },
                      duration === d && {
                        borderColor: Colors.primary,
                        backgroundColor: 'rgba(108, 92, 231, 0.05)'
                      },
                    ]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[
                      styles.durationText,
                      { color: duration === d ? Colors.primary : Colors.textSecondary }
                    ]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textMuted }]}>Add a note</Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: Colors.surface, borderColor: 'rgba(0,0,0,0.05)' }
              ]}>
                <Edit2 size={16} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Colors.text, fontWeight: '600' }]}
                  placeholder="coding rn..."
                  placeholderTextColor={Colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                  maxLength={50}
                />
              </View>
            </View>

            <GradientButton
              title="Set Presence"
              onPress={() => onSave({ selectedStatus, duration, note })}
              style={styles.saveBtn}
            />
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
    borderWidth: 0,
  },
  scrollPadding: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
    paddingLeft: 4,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '800',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  saveBtn: {
    marginTop: 10,
    height: 56,
    borderRadius: 18,
  },
});
