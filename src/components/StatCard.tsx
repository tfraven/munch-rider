import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBgColor,
  badge,
  badgeType = 'success',
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const finalIconColor = iconColor || theme.primary;
  const finalIconBg = iconBgColor || (isDark ? theme.backgroundElement : theme.primaryLight);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          ...Shadows.sm,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: finalIconBg }]}>
          <Ionicons name={icon} size={20} color={finalIconColor} />
        </View>
        {badge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  badgeType === 'success'
                    ? isDark
                      ? '#064E3B'
                      : '#ECFDF5'
                    : badgeType === 'warning'
                    ? isDark
                      ? '#451A03'
                      : '#FEF3C7'
                    : isDark
                    ? '#1E3A8A'
                    : '#EFF6FF',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    badgeType === 'success'
                      ? theme.secondary
                      : badgeType === 'warning'
                      ? theme.accent
                      : theme.info,
                },
              ]}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
