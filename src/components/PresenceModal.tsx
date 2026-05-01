import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
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
    { label: 'Focus', emoji: '🧠' },
    { label: 'Free', emoji: '💬' },
    { label: 'Busy', emoji: '🔕' },
    { label: 'Out', emoji: '🚶' },
    { label: 'Resting', emoji: '🌙' },
  ];

  const durations = ['1h', '3h', 'Until change'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <GlassCard style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.text }]}>How are you showing up?</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.statusGrid}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.label}
                  style={[
                    styles.statusItem,
                    selectedStatus === status.label && { backgroundColor: Colors.primary },
                  ]}
                  onPress={() => setSelectedStatus(status.label)}
                >
                  <Text style={styles.statusEmoji}>{status.emoji}</Text>
                  <Text style={[styles.statusLabel, { color: Colors.text }]}>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Duration</Text>
              <View style={styles.durationRow}>
                {durations.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.durationPill,
                      duration === d && { borderColor: Colors.primary, backgroundColor: 'rgba(108, 92, 231, 0.1)' },
                    ]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[styles.durationText, { color: duration === d ? Colors.primary : Colors.textSecondary }]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Add a note</Text>
              <View style={[styles.inputContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Edit2 size={16} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Colors.text }]}
                  placeholder="coding rn..."
                  placeholderTextColor={Colors.textMuted}
                  value={note}
                  onChangeText={setNote}
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
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
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  saveBtn: {
    marginTop: 8,
  },
});
