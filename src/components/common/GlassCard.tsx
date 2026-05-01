import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors, Radius, Spacing } from '../../theme/Theme';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  const { Colors, isDark } = useTheme();
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: Colors.surface, // Use solid surface for clarity/safety
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
        borderWidth: 1.5,
      }, 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
