import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { Colors, Shadows, Sizes } from '../theme/Theme';
import { X, Zap, Target, BookOpen, Coffee, Moon } from 'lucide-react-native';
import { CheckinButton } from './CheckinButton';

const { height, width } = Dimensions.get('window');

interface CheckInModalProps {
  visible: boolean;
  onClose: (checkedIn: boolean) => void;
}

export const CheckInModal = ({ visible, onClose }: CheckInModalProps) => {
  const [selectedType, setSelectedType] = useState<'Done' | 'Missed' | 'Focus' | 'Rest' | null>(null);

  const handleConfirm = () => {
    if (selectedType) {
      onClose(true);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => onClose(false)}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.pill} />
            <TouchableOpacity onPress={() => onClose(false)} style={styles.closeBtn}>
              <X size={24} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <Target size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>How are you showing up today?</Text>
            <Text style={styles.subtitle}>One tap to keep the promise alive with your inner circle.</Text>

            <View style={styles.buttonGrid}>
              <View style={styles.row}>
                <CheckinButton 
                  type="Done" 
                  selected={selectedType === 'Done'} 
                  onPress={() => setSelectedType('Done')} 
                />
                <CheckinButton 
                  type="Missed" 
                  selected={selectedType === 'Missed'} 
                  onPress={() => setSelectedType('Missed')} 
                />
              </View>
              <View style={styles.row}>
                <CheckinButton 
                  type="Focus" 
                  selected={selectedType === 'Focus'} 
                  onPress={() => setSelectedType('Focus')} 
                />
                <CheckinButton 
                  type="Rest" 
                  selected={selectedType === 'Rest'} 
                  onPress={() => setSelectedType('Rest')} 
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.confirmBtn, !selectedType && styles.disabledBtn]} 
              onPress={handleConfirm}
              disabled={!selectedType}
              activeOpacity={0.8}
            >
              <Zap size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.confirmText}>Confirm Check-In</Text>
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              Encrypted. Only visible to your circles.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 40,
    minHeight: height * 0.55,
    ...Shadows.premium,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  pill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  closeBtn: {
    position: 'absolute',
    right: 24,
    top: 20,
    padding: 4,
  },
  body: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.lavender,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Shadows.soft,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  buttonGrid: {
    width: '100%',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: Sizes.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  disabledBtn: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  privacyNote: {
    marginTop: 20,
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
});
