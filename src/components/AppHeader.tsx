import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Bell, ChevronDown, Settings, ChevronLeft } from 'lucide-react-native';
import { Colors, Shadows } from '../theme/Theme';

interface AppHeaderProps {
  title?: string;
  showCircleSelector?: boolean;
  circleName?: string;
  onCirclePress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  showNotification?: boolean;
  showSettings?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showCircleSelector = false,
  circleName = 'Circle',
  onCirclePress,
  onNotificationPress,
  onSettingsPress,
  showNotification = true,
  showSettings = false,
  showBackButton = false,
  onBack,
}) => {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.content}>
        {/* Left Side: Back or Brand */}
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.brandTitle}>HERE</Text>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerContainer}>
          {showCircleSelector ? (
            <TouchableOpacity
              style={styles.circleSelector}
              onPress={onCirclePress}
            >
              <Text style={styles.circleSelectorText} numberOfLines={1}>
                {circleName}
              </Text>
              <ChevronDown size={14} color="#4F46E5" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {showNotification && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
            >
              <Bell size={22} color="#64748B" />
            </TouchableOpacity>
          )}
          {showSettings && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSettingsPress}
            >
              <Settings size={22} color="#64748B" />
            </TouchableOpacity>
          )}
          {!showNotification && !showSettings && <View style={{ width: 40 }} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: 'white',
    paddingTop:
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  leftContainer: {
    width: 80, // Fixed width to balance the center
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: -0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  circleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '100%',
  },
  circleSelectorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 4,
  },
  rightActions: {
    width: 80, // Same balance as left
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  backButton: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});
