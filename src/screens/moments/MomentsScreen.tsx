import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, Camera, Image as ImageIcon, Send } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';

const MomentsScreen = ({ navigation }: any) => {
  const { Colors } = useTheme();
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const handlePost = () => {
    // Logic to save moment
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>Create Moment</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity 
          style={[styles.imagePicker, { backgroundColor: Colors.surfaceElevated, borderColor: Colors.glassBorder }]}
          onPress={() => {}}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Camera size={40} color={Colors.textMuted} />
              <Text style={[styles.pickerText, { color: Colors.textMuted }]}>Add a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: Colors.text }]}
          placeholder="What's happening?"
          placeholderTextColor={Colors.textMuted}
          multiline
          value={text}
          onChangeText={setText}
        />

        <View style={styles.footer}>
          <View style={styles.visibilityInfo}>
            <Text style={[styles.visibilityText, { color: Colors.textSecondary }]}>
              Shared with: <Text style={{ fontWeight: '700', color: Colors.primary }}>College Crew</Text>
            </Text>
          </View>
          
          <GradientButton 
            title="Share Moment" 
            onPress={handlePost} 
            style={styles.postBtn}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pickerPlaceholder: {
    alignItems: 'center',
  },
  pickerText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 40,
  },
  footer: {
    marginTop: 'auto',
  },
  visibilityInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 14,
  },
  postBtn: {
    width: '100%',
  },
});

export default MomentsScreen;
