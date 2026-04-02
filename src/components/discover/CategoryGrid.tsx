import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TerminalSquare, Palette, PenTool, Activity } from 'lucide-react-native';

const CATEGORIES = [
  { id: '1', title: 'Tech', count: '4.2k Active Here', icon: TerminalSquare, color: '#8B5CF6' },
  { id: '2', title: 'Design', count: '2.8k Active Here', icon: Palette, color: '#EC4899' },
  { id: '3', title: 'Art', count: '1.5k Active Here', icon: PenTool, color: '#F59E0B' },
  { id: '4', title: 'Wellness', count: '3.1k Active Here', icon: Activity, color: '#10B981' },
];

export default function CategoryGrid() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Browse Categories</Text>
          <Text style={styles.subtitle}>What are you passionate about today?</Text>
        </View>
        <TouchableOpacity style={styles.viewAll}>
          <Text style={styles.viewAllText}>View all</Text>
          <View style={{ marginLeft: 4, transform: [{ scale: 0.8 }] }}>
            <TerminalSquare size={14} color="#8B5CF6" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map(item => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => { /* TODO: Navigate to category */ }}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} category, ${item.count}`}
            >
              <View style={styles.iconContainer}>
                <IconComponent size={24} color={item.color} />
                <View style={[styles.bgCircle, { backgroundColor: item.color, opacity: 0.05 }]} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardCount}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: 'sans-serif-condensed',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'column',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bgCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    right: -20,
    bottom: -20,
  },
  textContainer: {
    gap: 4,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  cardCount: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
});
