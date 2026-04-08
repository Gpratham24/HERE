import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Camera,
  Plus,
  GraduationCap,
  Home,
  Briefcase,
  Globe,
  Sparkles,
  Lock,
} from 'lucide-react-native';
import { Colors } from '../../theme/Theme';

const { width } = Dimensions.get('window');

interface CreateCircleScreenProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const CATEGORIES = [
  { id: '12th-grade', label: '12th Grade Friends', icon: GraduationCap },
  { id: 'hostel-college', label: 'Hostel / College', icon: Home },
  { id: 'work-internship', label: 'Work / Internship', icon: Briefcase },
  { id: 'long-distance', label: 'Long Distance Friends', icon: Globe },
  { id: 'other', label: 'Other', icon: Sparkles },
];

export default function CreateCircleScreen({
  onComplete,
  onBack,
}: CreateCircleScreenProps) {
  const [circleName, setCircleName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('hostel-college');
  const [privacy, setPrivacy] = useState<'private' | 'public'>('private');

  const maxChars = 20;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '40%' }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title & Subtitle */}
        <Text style={styles.title}>Create your{'\n'}circle</Text>
        <Text style={styles.subtitle}>
          This is your private space. Only people you invite can see what
          happens here.
        </Text>

        {/* Circle Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoPicker}>
            <View style={styles.dashedCircle}>
              <Camera size={24} color="#94A3B8" />
              <View style={styles.plusOverlay}>
                <Plus size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.photoLabel}>Set Circle Photo</Text>
        </View>

        {/* Circle Name Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>CIRCLE NAME</Text>
            <Text style={styles.inputCount}>
              {circleName.length}/{maxChars}
            </Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Hostel Crew"
            placeholderTextColor="#94A3B8"
            value={circleName}
            onChangeText={text => setCircleName(text.slice(0, maxChars))}
          />
          <Text style={styles.inputHint}>
            Pick a name that feels like your group
          </Text>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's this circle for?</Text>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View style={styles.categoryIconContainer}>
                <cat.icon size={20} color="#0F172A" />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              <View
                style={[
                  styles.radioButton,
                  selectedCategory === cat.id && styles.radioButtonActive,
                ]}
              >
                {selectedCategory === cat.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Setting</Text>

          {/* Private Option */}
          <TouchableOpacity
            style={[
              styles.privacyCard,
              privacy === 'private' && styles.privacyCardActive,
            ]}
            onPress={() => setPrivacy('private')}
          >
            <View style={styles.categoryIconContainer}>
              <Lock
                size={20}
                color={privacy === 'private' ? Colors.primary : '#0F172A'}
              />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>Private</Text>
              <Text style={styles.privacyHint}>
                Only members can see content
              </Text>
            </View>
            <View
              style={[
                styles.radioButton,
                privacy === 'private' && styles.radioButtonActive,
              ]}
            >
              {privacy === 'private' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* Public Option */}
          <TouchableOpacity
            style={[
              styles.privacyCard,
              privacy === 'public' && styles.privacyCardActive,
            ]}
            onPress={() => setPrivacy('public')}
          >
            <View style={styles.categoryIconContainer}>
              <Globe
                size={20}
                color={privacy === 'public' ? Colors.primary : '#0F172A'}
              />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>Public</Text>
              <Text style={styles.privacyHint}>Anyone can find and join</Text>
            </View>
            <View
              style={[
                styles.radioButton,
                privacy === 'public' && styles.radioButtonActive,
              ]}
            >
              {privacy === 'public' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacer for button visibility */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={onComplete}>
          <Text style={styles.createButtonText}>Create Circle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginLeft: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 52,
    letterSpacing: -1.5,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoPicker: {
    marginBottom: 12,
  },
  dashedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  inputCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    // Minimal shadow for white cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  privacyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F3FF', // Very light purple
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  privacyHint: {
    fontSize: 13,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingBottom: 40,
  },
  createButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
