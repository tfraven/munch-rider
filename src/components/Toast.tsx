import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';
import { useColorScheme } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  if (!visible || !message) return null;

  const getIconAndBg = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.secondary,
          bg: isDark ? '#064E3B' : '#ECFDF5',
          border: theme.secondary,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: theme.accent,
          bg: isDark ? '#451A03' : '#FEF3C7',
          border: theme.accent,
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: theme.danger,
          bg: isDark ? '#450A0A' : '#FEE2E2',
          border: theme.danger,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: theme.primary,
          bg: isDark ? '#2D1B10' : '#FFF2EB',
          border: theme.primary,
        };
    }
  };

  const { icon, color, bg, border } = getIconAndBg();

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: bg,
            borderColor: border,
            ...Shadows.lg,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} style={styles.icon} />
        <Text
          style={[
            styles.message,
            { color: isDark ? '#F8FAFC' : '#0F172A' },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 9999,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    maxWidth: 500,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
