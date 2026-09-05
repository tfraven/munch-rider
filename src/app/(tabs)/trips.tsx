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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { useRider } from '../../context/RiderContext';
import { DeliveryTrip } from '../../types';

export default function TripsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const { completedTrips } = useRider();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setSelectedTripId((prev) => (prev === id ? null : id));
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Delivery Trips ({completedTrips.length})
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {completedTrips.map((trip) => {
          const isExpanded = selectedTripId === trip.id;
          const isDelivered = trip.status === 'DELIVERED';

          return (
            <TouchableOpacity
              key={trip.id}
              activeOpacity={0.9}
              style={[
                styles.tripCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  ...Shadows.sm,
                },
              ]}
              onPress={() => toggleExpand(trip.id)}
            >
              {/* Trip Summary Row */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View
                    style={[
                      styles.statusIconCircle,
                      {
                        backgroundColor: isDelivered
                          ? isDark
                            ? '#064E3B'
                            : '#ECFDF5'
                          : isDark
                          ? '#450A0A'
                          : '#FEE2E2',
                      },
                    ]}
                  >
                    <Ionicons
                      name={isDelivered ? 'checkmark-circle' : 'close-circle'}
                      size={22}
                      color={isDelivered ? theme.secondary : theme.danger}
                    />
                  </View>
                  <View>
                    <Text style={[styles.orderNumber, { color: theme.text }]}>
                      #{trip.orderNumber}
                    </Text>
                    <Text style={[styles.tripDate, { color: theme.textSecondary }]}>
                      {new Date(trip.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {trip.vendor.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryRight}>
                  <Text style={[styles.earningsTotal, { color: theme.primary }]}>
                    Rs. {trip.earnings.totalTripEarnings}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.textMuted}
                  />
                </View>
              </View>

              {/* Route snippet */}
              <View style={styles.routeSnippet}>
                <View style={styles.snippetPoint}>
                  <Ionicons name="restaurant-outline" size={14} color={theme.primary} />
                  <Text
                    style={[styles.snippetText, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {trip.vendor.location.address}
                  </Text>
                </View>
                <View style={styles.snippetPoint}>
                  <Ionicons name="location-outline" size={14} color={theme.secondary} />
                  <Text
                    style={[styles.snippetText, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {trip.customer.location.address}
                  </Text>
                </View>
              </View>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <View
                  style={[
                    styles.expandedDetails,
                    {
                      borderTopColor: theme.borderLight,
                      backgroundColor: theme.backgroundElement,
                    },
                  ]}
                >
                  {/* Items List */}
                  <Text style={[styles.detailHeading, { color: theme.text }]}>
                    Order Items ({trip.itemCount})
                  </Text>
                  <View style={styles.itemsList}>
                    {trip.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={[styles.itemName, { color: theme.text }]}>
                          {item.quantity}x {item.name}
                        </Text>
                        <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>
                          Rs. {item.price * item.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Payment & COD */}
                  <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                      Payment Method
                    </Text>
                    <Text style={[styles.receiptValue, { color: theme.text }]}>
                      {trip.paymentMethod === 'CASH_ON_DELIVERY'
                        ? 'Cash on Delivery (COD)'
                        : trip.paymentMethod}
                    </Text>
                  </View>

                  {trip.cashToCollect > 0 && (
                    <View style={styles.receiptRow}>
                      <Text style={[styles.receiptLabel, { color: theme.accent }]}>
                        Cash Collected
                      </Text>
                      <Text style={[styles.receiptValue, { color: theme.accent, fontWeight: '800' }]}>
                        Rs. {trip.cashToCollect}
                      </Text>
                    </View>
                  )}

                  {/* Earnings Breakdown */}
                  <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
                  <Text style={[styles.detailHeading, { color: theme.text }]}>
                    Rider Payout Breakdown
                  </Text>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                      Base Fare ({trip.distanceToVendorKm} km)
                    </Text>
                    <Text style={[styles.receiptValue, { color: theme.text }]}>
                      Rs. {trip.earnings.baseFee}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                      Distance Fare ({trip.distanceToCustomerKm} km)
                    </Text>
                    <Text style={[styles.receiptValue, { color: theme.text }]}>
                      Rs. {trip.earnings.distanceFee}
                    </Text>
                  </View>
                  {trip.earnings.customerTip > 0 && (
                    <View style={styles.receiptRow}>
                      <Text style={[styles.receiptLabel, { color: theme.secondary }]}>
                        Customer Tip
                      </Text>
                      <Text style={[styles.receiptValue, { color: theme.secondary, fontWeight: '800' }]}>
                        +Rs. {trip.earnings.customerTip}
                      </Text>
                    </View>
                  )}
                  {trip.earnings.surgeBonus ? (
                    <View style={styles.receiptRow}>
                      <Text style={[styles.receiptLabel, { color: theme.primary }]}>
                        Surge Rush Bonus
                      </Text>
                      <Text style={[styles.receiptValue, { color: theme.primary, fontWeight: '800' }]}>
                        +Rs. {trip.earnings.surgeBonus}
                      </Text>
                    </View>
                  ) : null}

                  {/* Customer Rating if given */}
                  {trip.customerRating && (
                    <View
                      style={[
                        styles.ratingFeedbackBox,
                        { backgroundColor: isDark ? '#2D1B10' : '#FFF2EB' },
                      ]}
                    >
                      <View style={styles.ratingStarsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= (trip.customerRating || 5) ? 'star' : 'star-outline'}
                            size={16}
                            color="#FBBF24"
                          />
                        ))}
                        <Text style={[styles.ratingStarsLabel, { color: theme.primary }]}>
                          Customer Rating
                        </Text>
                      </View>
                      {trip.customerFeedback ? (
                        <Text style={[styles.feedbackComment, { color: theme.text }]}>
                          "{trip.customerFeedback}"
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  tripCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  tripDate: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  earningsTotal: {
    fontSize: 16,
    fontWeight: '900',
  },
  routeSnippet: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: 4,
  },
  snippetPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snippetText: {
    fontSize: 12,
    flex: 1,
  },
  expandedDetails: {
    borderTopWidth: 1,
    padding: Spacing.three,
    gap: 6,
  },
  detailHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 4,
  },
  itemsList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 13,
  },
  detailDivider: {
    height: 1,
    marginVertical: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  ratingFeedbackBox: {
    padding: 10,
    borderRadius: BorderRadius.md,
    marginTop: 8,
    gap: 4,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStarsLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  feedbackComment: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
