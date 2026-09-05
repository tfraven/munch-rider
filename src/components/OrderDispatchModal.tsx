import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';
import { DispatchOffer } from '../types';

interface OrderDispatchModalProps {
  offer: DispatchOffer | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const OrderDispatchModal: React.FC<OrderDispatchModalProps> = ({
  offer,
  onAccept,
  onDecline,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  if (!offer) return null;

  const { trip, expiresInSeconds } = offer;
  const progressPercent = (expiresInSeconds / 30) * 100;

  return (
    <Modal visible={!!offer} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.lg,
            },
          ]}
        >
          {/* Top Urgent Alert Bar */}
          <View style={styles.topAlertBar}>
            <View style={styles.pulseRing}>
              <Ionicons name="flash" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.topAlertText}>NEW DELIVERY REQUEST</Text>
            <View style={styles.timerBadge}>
              <Ionicons name="timer-outline" size={16} color="#FFFFFF" />
              <Text style={styles.timerText}>{expiresInSeconds}s</Text>
            </View>
          </View>

          {/* Progress Countdown Bar */}
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPercent}%`,
                  backgroundColor:
                    expiresInSeconds > 10 ? theme.primary : theme.danger,
                },
              ]}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Earnings Hero Banner */}
            <View
              style={[
                styles.earningsBanner,
                { backgroundColor: isDark ? '#2D1B10' : '#FFF2EB' },
              ]}
            >
              <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                Guaranteed Payout
              </Text>
              <Text style={[styles.earningsAmount, { color: theme.primary }]}>
                Rs. {trip.earnings.totalTripEarnings}
              </Text>
              <View style={styles.earningsBreakdownRow}>
                <Text style={[styles.earningsSubText, { color: theme.textMuted }]}>
                  Base: Rs. {trip.earnings.baseFee} • Dist: Rs. {trip.earnings.distanceFee}
                  {trip.earnings.customerTip > 0
                    ? ` • Tip: Rs. ${trip.earnings.customerTip}`
                    : ''}
                </Text>
              </View>
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricChip, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="navigate-outline" size={16} color={theme.info} />
                <Text style={[styles.metricText, { color: theme.text }]}>
                  {trip.totalDistanceKm} km total
                </Text>
              </View>
              <View style={[styles.metricChip, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="time-outline" size={16} color={theme.accent} />
                <Text style={[styles.metricText, { color: theme.text }]}>
                  ~{trip.estimatedDurationMins} mins
                </Text>
              </View>
              <View
                style={[
                  styles.metricChip,
                  {
                    backgroundColor:
                      trip.paymentMethod === 'CASH_ON_DELIVERY'
                        ? isDark
                          ? '#451A03'
                          : '#FEF3C7'
                        : isDark
                        ? '#064E3B'
                        : '#ECFDF5',
                  },
                ]}
              >
                <Ionicons
                  name={
                    trip.paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'cash-outline'
                      : 'card-outline'
                  }
                  size={16}
                  color={
                    trip.paymentMethod === 'CASH_ON_DELIVERY'
                      ? theme.accent
                      : theme.secondary
                  }
                />
                <Text
                  style={[
                    styles.metricText,
                    {
                      color:
                        trip.paymentMethod === 'CASH_ON_DELIVERY'
                          ? theme.accent
                          : theme.secondary,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {trip.paymentMethod === 'CASH_ON_DELIVERY'
                    ? `Collect Rs. ${trip.cashToCollect}`
                    : 'Paid Online'}
                </Text>
              </View>
            </View>

            {/* Route Timeline */}
            <View style={styles.routeContainer}>
              {/* Pickup Vendor */}
              <View style={styles.routeStep}>
                <View style={styles.iconColumn}>
                  <View style={[styles.nodeCircle, { backgroundColor: theme.primary }]}>
                    <Ionicons name="restaurant" size={14} color="#FFFFFF" />
                  </View>
                  <View style={[styles.connectorLine, { backgroundColor: theme.border }]} />
                </View>
                <View style={styles.routeDetails}>
                  <View style={styles.routeHeader}>
                    <Text style={[styles.stepRole, { color: theme.primary }]}>
                      PICKUP ({trip.distanceToVendorKm} km away)
                    </Text>
                  </View>
                  <Text style={[styles.locationName, { color: theme.text }]}>
                    {trip.vendor.name}
                  </Text>
                  <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                    {trip.vendor.location.address}
                  </Text>
                  <Text style={[styles.itemSummary, { color: theme.textMuted }]}>
                    📦 {trip.itemCount} items ({trip.items.map((i) => i.name).slice(0, 2).join(', ')}
                    {trip.items.length > 2 ? '...' : ''})
                  </Text>
                </View>
              </View>

              {/* Drop-off Customer */}
              <View style={styles.routeStep}>
                <View style={styles.iconColumn}>
                  <View style={[styles.nodeCircle, { backgroundColor: theme.secondary }]}>
                    <Ionicons name="location" size={14} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.routeDetails}>
                  <View style={styles.routeHeader}>
                    <Text style={[styles.stepRole, { color: theme.secondary }]}>
                      DROP-OFF ({trip.distanceToCustomerKm} km)
                    </Text>
                  </View>
                  <Text style={[styles.locationName, { color: theme.text }]}>
                    {trip.customer.name}
                  </Text>
                  <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                    {trip.customer.location.address}
                  </Text>
                  {trip.customer.instructionsForRider ? (
                    <View
                      style={[
                        styles.noteBox,
                        { backgroundColor: theme.backgroundElement },
                      ]}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.textSecondary} />
                      <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                        "{trip.customer.instructionsForRider}"
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[
              styles.actionsContainer,
              {
                borderTopColor: theme.border,
                backgroundColor: theme.card,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.declineButton,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
              onPress={onDecline}
            >
              <Ionicons name="close-circle-outline" size={20} color={theme.danger} />
              <Text style={[styles.declineButtonText, { color: theme.danger }]}>
                Decline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: theme.primary }]}
              onPress={onAccept}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>ACCEPT ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  topAlertBar: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
  },
  pulseRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topAlertText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  earningsBanner: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.three,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 2,
  },
  earningsBreakdownRow: {
    marginTop: 2,
  },
  earningsSubText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    flexWrap: 'wrap',
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    marginBottom: Spacing.two,
  },
  routeStep: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  iconColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  routeDetails: {
    flex: 1,
    paddingBottom: Spacing.two,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepRole: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 6,
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
    ...Shadows.md,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
