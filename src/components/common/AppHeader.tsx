import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Bell, ChevronDown, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_CIRCLE_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&q=80';

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const { Colors } = useTheme();
  const { userData, circles, activeCircle, setActiveCircle } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleCircleSelect = (id: string) => {
    setActiveCircle(id);
    setDropdownVisible(false);
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderColor: Colors.border || 'rgba(0,0,0,0.05)'
      }
    ]}>
      <View style={styles.content}>
        {/* Left: App Name */}
        <View style={styles.leftSection}>
          <Text style={[styles.appName, { color: Colors.primary }]}>Circlo</Text>
        </View>

        {/* Middle: Circle Dropdown */}
        <TouchableOpacity
          style={styles.middleSection}
          activeOpacity={0.7}
          onPress={() => setDropdownVisible(true)}
        >
          <View style={styles.dropdownContainer}>
            {activeCircle?.id === 'all' ? (
              <View style={[styles.circleAvatar, { backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>∞</Text>
              </View>
            ) : (
              <Image
                source={{ uri: activeCircle?.avatar_url || `https://ui-avatars.com/api/?name=${activeCircle?.name || 'C'}&background=random` }}
                style={styles.circleAvatar}
              />
            )}
            <Text style={[styles.circleName, { color: Colors.text }]} numberOfLines={1}>
              {activeCircle?.name || 'All Circles'}
            </Text>
            <ChevronDown size={18} color={Colors.textSecondary} style={styles.chevron} />
          </View>
        </TouchableOpacity>

        {/* Right: Notifications */}
        <TouchableOpacity style={styles.rightSection} activeOpacity={0.7}>
          <View style={styles.bellContainer}>
            <Bell size={24} color={Colors.text} />
            <View style={styles.unreadDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Circle Switcher Bottom Sheet */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.bottomSheet, { backgroundColor: Colors.surface, paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.sheetHandle} />
                <Text style={[styles.sheetTitle, { color: Colors.text }]}>Your Circles</Text>

                <FlatList
                  data={[{ id: 'all', name: 'All Circles', avatar_url: null }, ...circles]}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[
                        styles.circleOption,
                        activeCircle?.id === item.id && { backgroundColor: 'rgba(139, 92, 246, 0.05)' }
                      ]}
                      onPress={() => handleCircleSelect(item.id)}
                    >
                      <View style={[styles.optionAvatar, { backgroundColor: item.id === 'all' ? '#8B5CF6' : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                        {item.id === 'all' ? (
                          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>∞</Text>
                        ) : (
                          <Image 
                            source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${item.name || 'C'}&background=random` }} 
                            style={styles.fillImage} 
                          />
                        )}
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionName, { color: Colors.text }]}>{item.name}</Text>
                        <Text style={[styles.optionMeta, { color: Colors.textSecondary }]}>
                          {item.id === 'all' ? 'All moments' : `${item.member_count || 0} members`}
                        </Text>
                      </View>
                      {activeCircle?.id === item.id && (
                        <View style={styles.checkCircle}>
                          <Check size={14} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  content: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  middleSection: {
    flex: 2,
    alignItems: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '100%',
  },
  circleName: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 90,
  },
  circleAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#E2E8F0',
  },
  chevron: {
    marginLeft: 6,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bellContainer: {
    padding: 4,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  circleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
