import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Colors, Shadows, Sizes } from '../../theme/Theme';
import { ChevronLeft, Calendar, Award, MapPin, Users, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MEMORY_DATA = [
  {
    id: '1',
    type: 'milestone',
    title: 'Circle Born',
    date: 'April 1, 2026',
    description: 'The "12th Gang" was created by Aarav. The promise began.',
    icon: <Users size={20} color="#6366F1" />,
    color: '#EEEDFF',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Perfect Week',
    date: 'April 8, 2026',
    description: 'All 8 members checked in every single day. Unstoppable.',
    icon: <Award size={20} color="#F59E0B" />,
    color: '#FEF3C7',
  },
  {
    id: '3',
    type: 'moment',
    title: 'Moving Day',
    date: 'April 15, 2026',
    description: 'Rahul moved to Pune for his first job. "Pune Junction" moment.',
    icon: <MapPin size={20} color="#EF4444" />,
    color: '#FEE2E2',
  },
  {
    id: '4',
    type: 'milestone',
    title: '1 Month Strong',
    date: 'May 1, 2026',
    description: '30 days of staying close. 420 check-ins shared.',
    icon: <Heart size={20} color="#EC4899" />,
    color: '#FCE7F3',
  },
];

const CircleMemoryScreen = ({ route, navigation }: any) => {
  const { circleName } = route?.params || { circleName: '12th Gang' };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Circle Memory</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroTitle}>{circleName}</Text>
          <Text style={styles.heroSubtitle}>A shared history of showing up.</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>420</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLabel}>Milestones</Text>
            </View>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          {MEMORY_DATA.map((item, index) => (
            <View key={item.id} style={styles.memoryCardWrap}>
              <View style={[styles.timelineDot, { backgroundColor: item.color, borderColor: Colors.primary }]} />
              <TouchableOpacity style={styles.memoryCard} activeOpacity={0.9}>
                <View style={styles.memoryHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
                    {item.icon}
                  </View>
                  <View style={styles.memoryTitleCol}>
                    <Text style={styles.memoryTitle}>{item.title}</Text>
                    <Text style={styles.memoryDate}>{item.date}</Text>
                  </View>
                </View>
                <Text style={styles.memoryDesc}>{item.description}</Text>
                {index === 2 && (
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&q=80&w=400' }} 
                    style={styles.memoryImage}
                  />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.exportBtn}>
           <Text style={styles.exportText}>Export Scrapbook</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  scroll: { paddingBottom: 60 },
  
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: 20,
    width: width * 0.8,
    height: 150,
    backgroundColor: Colors.lavender,
    borderRadius: 100,
    opacity: 0.5,
    filter: 'blur(40px)',
  },
  heroTitle: { fontSize: 36, fontWeight: '900', color: Colors.text, marginBottom: 8, letterSpacing: -1 },
  heroSubtitle: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600', marginBottom: 32 },
  
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 24,
    ...Shadows.soft,
    width: width - 48,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },

  timeline: { paddingHorizontal: 24, marginTop: 40, paddingLeft: 40 },
  timelineLine: {
    position: 'absolute',
    left: 45,
    top: 10,
    bottom: 20,
    width: 2,
    backgroundColor: Colors.border,
    borderStyle: 'dashed',
  },
  memoryCardWrap: { marginBottom: 32, position: 'relative' },
  timelineDot: {
    position: 'absolute',
    left: -11,
    top: 25,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: '#FFF',
    zIndex: 10,
  },
  memoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  memoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  memoryTitleCol: { flex: 1 },
  memoryTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  memoryDate: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary, marginTop: 2 },
  memoryDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontWeight: '500' },
  memoryImage: { width: '100%', height: 180, borderRadius: 16, marginTop: 16 },

  exportBtn: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.lavender,
    alignItems: 'center',
  },
  exportText: { fontSize: 15, fontWeight: '800', color: Colors.primary },
});

export default CircleMemoryScreen;
