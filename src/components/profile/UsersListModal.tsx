import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

interface UsersListModalProps {
  visible: boolean;
  title: string;
  users: any[];
  onClose: () => void;
}

export const UsersListModal: React.FC<UsersListModalProps> = ({ visible, title, users, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { maxHeight: '75%', width: '100%' }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={18} color="#E4E4E7" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            {users.length === 0 ? (
              <Text style={{ color: '#A1A1AA', fontSize: 13, textAlign: 'center', marginTop: 24, marginBottom: 24 }}>No items found.</Text>
            ) : (
              users.map((usr: any) => (
                <View key={usr.id} style={styles.userItem}>
                  <Image 
                    source={{ uri: usr.photoURL || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&q=80' }} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.username}>@{usr.username || 'user'}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0A0A0E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  title: {
    color: '#E4E4E7',
    fontSize: 16,
    fontWeight: '700',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  username: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
