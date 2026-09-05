import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  useColorScheme,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing, Fonts } from '../../constants/theme';
import { useRider } from '../../context/RiderContext';
import { StatCard } from '../../components/StatCard';
import { LiveMapSimulation } from '../../components/LiveMapSimulation';
import { DeliveryWorkflowCard } from '../../components/DeliveryWorkflowCard';
import { OrderDispatchModal } from '../../components/OrderDispatchModal';
import { ProofOfDeliveryModal } from '../../components/ProofOfDeliveryModal';
import { ChatModal } from '../../components/ChatModal';

export default function RiderHomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();

  const {
    profile,
    isOnline,
    toggleDutyStatus,
    incomingOffer,
    triggerMockOrderOffer,
    acceptOffer,
    declineOffer,
    activeTrip,
    advanceDeliveryStatus,
    completeDelivery,
    todayEarnings,
    todayTripsCount,
    chatMessages,
    sendMessage,
  } = useRider();

  // Modals state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<'CUSTOMER' | 'VENDOR' | null>(null);

  const handleOpenChat = (recipient: 'CUSTOMER' | 'VENDOR') => {
    setChatRecipient(recipient);
  };

  const handleConfirmOtp = (otp: string, photoProofUrl?: string) => {
    const res = completeDelivery(otp, photoProofUrl);
    if (res.success) {
      setShowOtpModal(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top App Header */}
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
        <View style={styles.headerLeft}>
          <View style={styles.riderAvatarContainer}>
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <MaterialCommunityIcons
                name="motorbike"
                size={22}
                color={theme.primary}
              />
            </View>
            <View
              style={[
                styles.onlineIndicatorBadge,
                { backgroundColor: isOnline ? theme.secondary : theme.textMuted },
              ]}
            />
          </View>
          <View>
            <Text style={[styles.riderName, { color: theme.text }]}>
              {profile.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                {profile.rating} ({profile.totalRatingsCount}) • {profile.vehicleModel}
              </Text>
            </View>
          </View>
        </View>

        {/* Duty Toggle Pill */}
        <TouchableOpacity
          style={[
            styles.dutyTogglePill,
            {
              backgroundColor: isOnline
                ? isDark
                  ? '#064E3B'
                  : '#ECFDF5'
                : isDark
                ? '#1F293D'
                : '#F1F5F9',
              borderColor: isOnline ? theme.secondary : theme.border,
            },
          ]}
          onPress={toggleDutyStatus}
        >
          <View
            style={[
              styles.dutyDot,
              { backgroundColor: isOnline ? theme.secondary : theme.textMuted },
            ]}
          />
          <Text
            style={[
              styles.dutyText,
              { color: isOnline ? theme.secondary : theme.textSecondary },
            ]}
          >
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* If OFFLINE Banner */}
        {!isOnline && (
          <View
            style={[
              styles.offlineCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                ...Shadows.sm,
              },
            ]}
          >
            <View style={[styles.offlineIconBg, { backgroundColor: theme.backgroundElement }]}>
              <MaterialCommunityIcons
                name="sleep"
                size={28}
                color={theme.textSecondary}
              />
            </View>
            <Text style={[styles.offlineTitle, { color: theme.text }]}>
              You are currently Offline
            </Text>
            <Text style={[styles.offlineSubtitle, { color: theme.textSecondary }]}>
              Switch duty status to Online to start receiving proximity delivery orders in town.
            </Text>
            <TouchableOpacity
              style={[styles.goOnlineBtn, { backgroundColor: theme.secondary }]}
              onPress={toggleDutyStatus}
            >
              <Ionicons name="power" size={18} color="#FFFFFF" />
              <Text style={styles.goOnlineBtnText}>GO ONLINE NOW</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Quick Performance KPIs */}
        <View style={styles.statsRow}>
          <StatCard
            title="Today's Pay"
            value={`Rs. ${todayEarnings}`}
            icon="wallet"
            iconColor={theme.primary}
            badge="+20% tip"
            badgeType="success"
          />
          <StatCard
            title="Completed"
            value={`${todayTripsCount} Trips`}
            icon="checkmark-circle"
            iconColor={theme.secondary}
            badge="100% on time"
            badgeType="info"
          />
        </View>

        {/* Active Delivery Flow OR Radar Searching */}
        {activeTrip ? (
          <View style={styles.activeDeliverySection}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveBadgeRow}>
                <View style={[styles.livePulse, { backgroundColor: theme.danger }]} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  ACTIVE TRIP IN PROGRESS
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/delivery/${activeTrip.id}` as any)}
              >
                <Text style={[styles.expandText, { color: theme.primary }]}>
                  Full Screen ↗
                </Text>
              </TouchableOpacity>
            </View>

            {/* Live GPS Map Simulation */}
            <LiveMapSimulation trip={activeTrip} height={200} />

            {/* Step-by-Step Delivery Action Card */}
            <View style={{ marginTop: Spacing.three }}>
              <DeliveryWorkflowCard
                trip={activeTrip}
                onAdvance={advanceDeliveryStatus}
                onOpenOtpModal={() => setShowOtpModal(true)}
                onOpenChat={handleOpenChat}
              />
            </View>
          </View>
        ) : isOnline ? (
          /* Radar Searching Animation when idle & online */
          <View
            style={[
              styles.radarCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                ...Shadows.sm,
              },
            ]}
          >
            <View style={styles.radarVisualContainer}>
              <View style={[styles.radarOuterRing, { borderColor: theme.primary }]} />
              <View style={[styles.radarMiddleRing, { borderColor: theme.primary }]} />
              <View
                style={[styles.radarCenterCircle, { backgroundColor: theme.primary }]}
              >
                <MaterialCommunityIcons name="radar" size={32} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.radarTitle, { color: theme.text }]}>
              Scanning for Nearby Orders...
            </Text>
            <Text style={[styles.radarSubtitle, { color: theme.textSecondary }]}>
              Stay in busy town areas like Gol Chowk, Canal Road & Station Market for faster orders.
            </Text>

            {/* Simulate Trigger Button */}
            <TouchableOpacity
              style={[
                styles.testPingBtn,
                { backgroundColor: theme.primary, ...Shadows.md },
              ]}
              onPress={triggerMockOrderOffer}
            >
              <Ionicons name="notifications" size={18} color="#FFFFFF" />
              <Text style={styles.testPingText}>Simulate Order Request Ping (30s)</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Hotspots & Surge Zones */}
        <View style={styles.hotspotsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Town Hotspots & High Demand 🔥
            </Text>
          </View>

          <View
            style={[
              styles.hotspotCard,
              { backgroundColor: theme.card, borderColor: theme.border, ...Shadows.sm },
            ]}
          >
            <View style={styles.hotspotRow}>
              <View
                style={[
                  styles.hotspotIconBg,
                  { backgroundColor: isDark ? '#2D1B10' : '#FFF2EB' },
                ]}
              >
                <Ionicons name="flame" size={20} color={theme.primary} />
              </View>
              <View style={styles.hotspotInfo}>
                <Text style={[styles.hotspotName, { color: theme.text }]}>
                  Main Gol Chowk Market
                </Text>
                <Text style={[styles.hotspotSub, { color: theme.textSecondary }]}>
                  14+ food stalls preparing orders right now
                </Text>
              </View>
              <View
                style={[
                  styles.surgeBadge,
                  { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' },
                ]}
              >
                <Text style={[styles.surgeText, { color: theme.secondary }]}>
                  +Rs. 25 Surge
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.hotspotCard,
              { backgroundColor: theme.card, borderColor: theme.border, ...Shadows.sm },
            ]}
          >
            <View style={styles.hotspotRow}>
              <View
                style={[
                  styles.hotspotIconBg,
                  { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' },
                ]}
              >
                <Ionicons name="restaurant" size={20} color={theme.info} />
              </View>
              <View style={styles.hotspotInfo}>
                <Text style={[styles.hotspotName, { color: theme.text }]}>
                  Canal View Food Street
                </Text>
                <Text style={[styles.hotspotSub, { color: theme.textSecondary }]}>
                  BBQ & Karahi rush (8 mins average prep time)
                </Text>
              </View>
              <View
                style={[
                  styles.surgeBadge,
                  { backgroundColor: isDark ? '#451A03' : '#FEF3C7' },
                ]}
              >
                <Text style={[styles.surgeText, { color: theme.accent }]}>
                  High Demand
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 30-sec Incoming Order Dispatch Modal */}
      <OrderDispatchModal
        offer={incomingOffer}
        onAccept={acceptOffer}
        onDecline={declineOffer}
      />

      {/* Proof of Delivery / OTP Verification Modal */}
      <ProofOfDeliveryModal
        visible={showOtpModal}
        trip={activeTrip}
        onClose={() => setShowOtpModal(false)}
        onConfirm={handleConfirmOtp}
      />

      {/* In-App Chat Modal */}
      {chatRecipient && activeTrip && (
        <ChatModal
          visible={!!chatRecipient}
          recipientType={chatRecipient}
          recipientName={
            chatRecipient === 'CUSTOMER'
              ? activeTrip.customer.name
              : activeTrip.vendor.name
          }
          orderNumber={activeTrip.orderNumber}
          messages={chatMessages}
          onClose={() => setChatRecipient(null)}
          onSendMessage={sendMessage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'android' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riderAvatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicatorBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  riderName: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dutyTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    gap: 6,
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 100, // Tab bar inset
  },
  offlineCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  offlineIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  offlineSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  goOnlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    gap: 8,
    ...Shadows.md,
  },
  goOnlineBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  activeDeliverySection: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
  },
  radarCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  radarVisualContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.three,
    position: 'relative',
  },
  radarOuterRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    opacity: 0.25,
  },
  radarMiddleRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    opacity: 0.5,
  },
  radarCenterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  radarSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  testPingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    gap: 8,
  },
  testPingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  hotspotsSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  hotspotCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  hotspotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotspotIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  hotspotInfo: {
    flex: 1,
  },
  hotspotName: {
    fontSize: 14,
    fontWeight: '700',
  },
  hotspotSub: {
    fontSize: 12,
    marginTop: 2,
  },
  surgeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  surgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
