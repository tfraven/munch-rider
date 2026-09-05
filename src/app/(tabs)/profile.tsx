import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Platform,
  Linking,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { useRider } from '../../context/RiderContext';
import { StatCard } from '../../components/StatCard';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();

  const { profile, showToast } = useRider();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);

  const callHelpline = () => {
    Linking.openURL('tel:080068624').catch(() => {
      showToast('Calling Munch 24/7 Rider Support Helpline...', 'info');
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            ...Shadows.sm,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Rider Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.sm,
            },
          ]}
        >
          <View style={styles.profileTopRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <MaterialCommunityIcons name="account" size={44} color={theme.primary} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.nameText, { color: theme.text }]}>
                  {profile.name}
                </Text>
                <View
                  style={[
                    styles.kycBadge,
                    {
                      backgroundColor:
                        profile.kycStatus === 'VERIFIED'
                          ? isDark
                            ? '#064E3B'
                            : '#ECFDF5'
                          : isDark
                          ? '#451A03'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      profile.kycStatus === 'VERIFIED'
                        ? 'checkmark-circle'
                        : 'time-outline'
                    }
                    size={14}
                    color={
                      profile.kycStatus === 'VERIFIED'
                        ? theme.secondary
                        : theme.accent
                    }
                  />
                  <Text
                    style={[
                      styles.kycBadgeText,
                      {
                        color:
                          profile.kycStatus === 'VERIFIED'
                            ? theme.secondary
                            : theme.accent,
                      },
                    ]}
                  >
                    {profile.kycStatus}
                  </Text>
                </View>
              </View>

              <Text style={[styles.contactText, { color: theme.textSecondary }]}>
                {profile.phone} • {profile.email}
              </Text>
              <Text style={[styles.joinedText, { color: theme.textMuted }]}>
                Member since {profile.joinedDate} • {profile.totalDeliveriesCompleted} Deliveries
              </Text>
            </View>
          </View>
        </View>

        {/* Performance KPI Tiles */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <StatCard
              title="Rating"
              value={`${profile.rating} ⭐`}
              subtitle={`${profile.totalRatingsCount} reviews`}
              icon="star"
              iconColor="#FBBF24"
            />
            <StatCard
              title="Acceptance"
              value={`${profile.acceptanceRate}%`}
              subtitle="High priority rider"
              icon="flash"
              iconColor={theme.primary}
            />
          </View>
          <View style={styles.metricsRow}>
            <StatCard
              title="Completion"
              value={`${profile.completionRate}%`}
              subtitle="Zero cancellations"
              icon="checkmark-done"
              iconColor={theme.secondary}
            />
            <StatCard
              title="On-Time Rate"
              value={`${profile.onTimeRate}%`}
              subtitle="Town speed master"
              icon="timer"
              iconColor={theme.info}
            />
          </View>
        </View>

        {/* Vehicle & Verification Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.sm,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleLeft}>
              <MaterialCommunityIcons
                name="motorbike"
                size={22}
                color={theme.primary}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Vehicle & Verification
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/kyc/onboarding' as any)}
            >
              <Text style={[styles.editLink, { color: theme.primary }]}>
                {profile.kycStatus === 'VERIFIED' ? 'View KYC' : 'Submit Docs'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Vehicle</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {profile.vehicleModel} ({profile.vehicleType})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Number Plate</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {profile.vehicleNumber}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>CNIC / ID</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {profile.cnicNumber}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>License</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {profile.licenseNumber}
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.sm,
            },
          ]}
        >
          <View style={styles.sectionTitleLeft}>
            <Ionicons name="settings-outline" size={20} color={theme.text} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Rider Preferences
            </Text>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                Audio Radar Alert (Loud Chime)
              </Text>
              <Text style={[styles.switchSub, { color: theme.textSecondary }]}>
                Play loud sound when new order pings arrive
              </Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={soundAlerts ? theme.primary : theme.textMuted}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                Auto GPS Navigation
              </Text>
              <Text style={[styles.switchSub, { color: theme.textSecondary }]}>
                Automatically launch Google Maps upon order acceptance
              </Text>
            </View>
            <Switch
              value={autoNavigate}
              onValueChange={setAutoNavigate}
              trackColor={{ false: theme.border, true: theme.secondaryLight }}
              thumbColor={autoNavigate ? theme.secondary : theme.textMuted}
            />
          </View>
        </View>

        {/* Emergency SOS & 24/7 Helpline */}
        <TouchableOpacity
          style={[
            styles.sosCard,
            {
              backgroundColor: isDark ? '#450A0A' : '#FEE2E2',
              borderColor: theme.danger,
            },
          ]}
          onPress={callHelpline}
        >
          <Ionicons name="call" size={24} color={theme.danger} />
          <View style={styles.sosTextContainer}>
            <Text style={[styles.sosTitle, { color: theme.danger }]}>
              24/7 Rider Emergency Helpline
            </Text>
            <Text style={[styles.sosSub, { color: theme.danger }]}>
              Tap to call platform dispatcher or report an on-road accident
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[
            styles.signOutButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
          onPress={() => showToast('Signed out of Munch Rider session', 'info')}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={[styles.signOutText, { color: theme.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'android' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.three,
  },
  profileCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '900',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  contactText: {
    fontSize: 12,
    marginTop: 2,
  },
  joinedText: {
    fontSize: 11,
    marginTop: 4,
  },
  metricsGrid: {
    gap: Spacing.two,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  editLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 12,
  },
  sosTextContainer: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sosSub: {
    fontSize: 11,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
