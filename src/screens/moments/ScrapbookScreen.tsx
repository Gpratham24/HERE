import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Download, Sparkles, FileText, Calendar } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';

const ScrapbookScreen = () => {
  const { Colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Scrapbook</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Calendar size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.monthHeader}>
          <Text style={[styles.monthLabel, { color: Colors.text }]}>April 2026</Text>
          <Sparkles size={20} color={Colors.accent} />
        </View>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>312</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Messages</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>14</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Live Rooms</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.highlightCard}>
          <Text style={[styles.highlightTitle, { color: Colors.text }]}>✨ Monthly Highlight</Text>
          <Text style={[styles.highlightText, { color: Colors.textSecondary }]}>
            “Rohan finished his assignment after 4 hours in the Focus room. The squad cheered him on with 45 reactions!”
          </Text>
        </GlassCard>

        <View style={styles.actionSection}>
          <TouchableOpacity style={[styles.actionRow, { backgroundColor: Colors.surfaceElevated }]}>
            <View style={styles.actionIcon}>
              <FileText size={20} color={Colors.text} />
            </View>
            <Text style={[styles.actionText, { color: Colors.text }]}>View Full Scrapbook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { backgroundColor: Colors.surfaceElevated }]}>
            <View style={styles.actionIcon}>
              <Download size={20} color={Colors.text} />
            </View>
            <Text style={[styles.actionText, { color: Colors.text }]}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pastMonths}>
          <Text style={[styles.pastTitle, { color: Colors.textSecondary }]}>Past Months</Text>
          {['March 2026', 'February 2026', 'January 2026'].map((month) => (
            <TouchableOpacity key={month} style={styles.pastMonthRow}>
              <Text style={[styles.pastMonthText, { color: Colors.text }]}>{month}</Text>
              <FileText size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  calendarBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  highlightCard: {
    padding: 20,
    marginBottom: 32,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionSection: {
    marginBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pastMonths: {
    marginBottom: 20,
  },
  pastTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  pastMonthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pastMonthText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ScrapbookScreen;
