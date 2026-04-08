import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Plus, Check, X } from 'lucide-react-native';
import { Colors } from '../theme/Theme';

interface CircleSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  circles: any[];
  currentCircleId?: string;
  onSelect: (circleId: string) => void;
  onCreateNew: () => void;
  userName?: string;
}

const { height } = Dimensions.get('window');

export const CircleSelectorModal: React.FC<CircleSelectorModalProps> = ({
  visible,
  onClose,
  circles,
  currentCircleId,
  onSelect,
  onCreateNew,
  userName = 'My Circles',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Stop touch propagation inside the card */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.card}>
              {/* ── Header ── */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerLabel}>SWITCHING CIRCLES</Text>
                  <Text style={styles.headerTitle}>{userName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* ── Circle List ── */}
              <FlatList
                data={circles}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: height * 0.45 }}
                renderItem={({ item }) => {
                  const isActive = item.id === currentCircleId;
                  return (
                    <TouchableOpacity
                      style={[styles.row, isActive && styles.rowActive]}
                      onPress={() => {
                        onSelect(item.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      {/* Avatar */}
                      {item.avatar_url ? (
                        <Image
                          source={{ uri: item.avatar_url }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarLetter}>
                            {(item.name || 'C').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      {/* Name */}
                      <Text
                        style={[
                          styles.circleName,
                          isActive && styles.circleNameActive,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {/* Right – badge or checkmark */}
                      <View style={styles.rowRight}>
                        {(item.unread_count || 0) > 0 && !isActive && (
                          <View style={styles.badge}>
                            <View style={styles.badgeDot} />
                            <Text style={styles.badgeText}>
                              {item.unread_count} NEW
                            </Text>
                          </View>
                        )}
                        {isActive && (
                          <View style={styles.checkCircle}>
                            <Check size={13} color="#fff" strokeWidth={3.5} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      You haven't joined any circles yet.
                    </Text>
                  </View>
                }
              />

              {/* ── Add New Circle Row ── */}
              <TouchableOpacity
                style={styles.addRow}
                onPress={() => {
                  onClose();
                  onCreateNew();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.addIconWrap}>
                  <Plus size={20} color={Colors.primary} strokeWidth={3} />
                </View>
                <Text style={styles.addText}>Add New Circle</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    marginTop: 4,
  },

  // Circle Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 4,
  },
  rowActive: {
    backgroundColor: '#EEF2FF',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: '#475569',
  },
  circleName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 14,
  },
  circleNameActive: {
    fontWeight: '700',
    color: '#0F172A',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B91C1C',
  },

  // Empty
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Add New Row
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 14,
  },
});
