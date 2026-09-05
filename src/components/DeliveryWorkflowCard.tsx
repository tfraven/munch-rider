import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';
import { DeliveryTrip } from '../types';

interface DeliveryWorkflowCardProps {
  trip: DeliveryTrip;
  onAdvance: () => void;
  onOpenOtpModal: () => void;
  onOpenChat: (recipient: 'CUSTOMER' | 'VENDOR') => void;
}

export const DeliveryWorkflowCard: React.FC<DeliveryWorkflowCardProps> = ({
  trip,
  onAdvance,
  onOpenOtpModal,
  onOpenChat,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  // Checklist items
  const [checkedItems, setCheckedItems] = useState<{ [id: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const isHeadingToVendor = trip.status === 'NAVIGATING_TO_VENDOR';
  const isAtVendor = trip.status === 'ARRIVED_AT_VENDOR';
  const isHeadingToCustomer = trip.status === 'NAVIGATING_TO_CUSTOMER';
  const isAtCustomer = trip.status === 'ARRIVED_AT_CUSTOMER';

  const getStepNumber = () => {
    if (isHeadingToVendor) return 1;
    if (isAtVendor) return 2;
    if (isHeadingToCustomer) return 3;
    if (isAtCustomer) return 4;
    return 4;
  };

  const currentStep = getStepNumber();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          ...Shadows.md,
        },
      ]}
    >
      {/* Header: Status & Order Number */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.orderNumber, { color: theme.primary }]}>
            #{trip.orderNumber}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {trip.itemCount} items • {trip.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'Paid Online'}
          </Text>
        </View>
        <View
          style={[
            styles.stageBadge,
            {
              backgroundColor: isHeadingToVendor || isAtVendor
                ? isDark
                  ? '#2D1B10'
                  : '#FFF2EB'
                : isDark
                ? '#064E3B'
                : '#ECFDF5',
            },
          ]}
        >
          <Text
            style={[
              styles.stageBadgeText,
              {
                color: isHeadingToVendor || isAtVendor
                  ? theme.primary
                  : theme.secondary,
              },
            ]}
          >
            Step {currentStep} of 4
          </Text>
        </View>
      </View>

      {/* Progress Line */}
      <View style={styles.stepsBarContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.stepSegment,
              {
                backgroundColor:
                  step <= currentStep
                    ? step <= 2
                      ? theme.primary
                      : theme.secondary
                    : theme.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Active Stage Card Content */}
      <View
        style={[
          styles.stageContentBox,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        {isHeadingToVendor && (
          <View style={styles.stageBody}>
            <View style={styles.stageTitleRow}>
              <Ionicons name="bicycle" size={20} color={theme.primary} />
              <Text style={[styles.stageHeading, { color: theme.text }]}>
                Head to {trip.vendor.name}
              </Text>
            </View>
            <Text style={[styles.stageSub, { color: theme.textSecondary }]}>
              {trip.vendor.location.address} ({trip.distanceToVendorKm} km)
            </Text>
            {trip.vendor.instructionsForRider && (
              <Text style={[styles.instructions, { color: theme.accent }]}>
                💡 Shop Note: {trip.vendor.instructionsForRider}
              </Text>
            )}
            <View style={styles.contactBar}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: theme.card }]}
                onPress={() => makeCall(trip.vendor.phone)}
              >
                <Ionicons name="call" size={16} color={theme.primary} />
                <Text style={[styles.contactBtnText, { color: theme.primary }]}>Call Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: theme.card }]}
                onPress={() => onOpenChat('VENDOR')}
              >
                <Ionicons name="chatbubbles" size={16} color={theme.info} />
                <Text style={[styles.contactBtnText, { color: theme.info }]}>Chat Shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isAtVendor && (
          <View style={styles.stageBody}>
            <View style={styles.stageTitleRow}>
              <Ionicons name="checkmark-done-circle" size={20} color={theme.primary} />
              <Text style={[styles.stageHeading, { color: theme.text }]}>
                Verify Items & Collect Parcel
              </Text>
            </View>
            <Text style={[styles.stageSub, { color: theme.textSecondary }]}>
              Show Order #{trip.orderNumber} to vendor counter.
            </Text>

            {/* Item checklist */}
            <View style={styles.checklistContainer}>
              {trip.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.checkItemRow}
                  onPress={() => toggleCheck(item.id)}
                >
                  <Ionicons
                    name={checkedItems[item.id] ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={checkedItems[item.id] ? theme.primary : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.checkItemText,
                      {
                        color: checkedItems[item.id] ? theme.textSecondary : theme.text,
                        textDecorationLine: checkedItems[item.id] ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {item.quantity}x {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isHeadingToCustomer && (
          <View style={styles.stageBody}>
            <View style={styles.stageTitleRow}>
              <Ionicons name="navigate" size={20} color={theme.secondary} />
              <Text style={[styles.stageHeading, { color: theme.text }]}>
                Deliver to {trip.customer.name}
              </Text>
            </View>
            <Text style={[styles.stageSub, { color: theme.textSecondary }]}>
              {trip.customer.location.address} ({trip.distanceToCustomerKm} km)
            </Text>
            {trip.customer.instructionsForRider && (
              <Text style={[styles.instructions, { color: theme.accent }]}>
                💬 Customer: "{trip.customer.instructionsForRider}"
              </Text>
            )}
            <View style={styles.contactBar}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: theme.card }]}
                onPress={() => makeCall(trip.customer.phone)}
              >
                <Ionicons name="call" size={16} color={theme.secondary} />
                <Text style={[styles.contactBtnText, { color: theme.secondary }]}>
                  Call Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: theme.card }]}
                onPress={() => onOpenChat('CUSTOMER')}
              >
                <Ionicons name="chatbubbles" size={16} color={theme.info} />
                <Text style={[styles.contactBtnText, { color: theme.info }]}>
                  Chat Customer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isAtCustomer && (
          <View style={styles.stageBody}>
            <View style={styles.stageTitleRow}>
              <Ionicons name="key-outline" size={20} color={theme.secondary} />
              <Text style={[styles.stageHeading, { color: theme.text }]}>
                Arrived at Customer Doorstep
              </Text>
            </View>
            <Text style={[styles.stageSub, { color: theme.textSecondary }]}>
              Ask customer for their 4-digit Delivery OTP.
            </Text>
            {trip.paymentMethod === 'CASH_ON_DELIVERY' && (
              <View
                style={[
                  styles.codAlertBox,
                  { backgroundColor: isDark ? '#451A03' : '#FEF3C7' },
                ]}
              >
                <Ionicons name="cash" size={18} color={theme.accent} />
                <Text style={[styles.codAlertText, { color: theme.accent }]}>
                  Collect Cash: Rs. {trip.cashToCollect}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Main Workflow Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: isHeadingToVendor || isAtVendor ? theme.primary : theme.secondary,
            ...Shadows.md,
          },
        ]}
        onPress={() => {
          if (isAtCustomer) {
            onOpenOtpModal();
          } else {
            onAdvance();
          }
        }}
      >
        <Ionicons
          name={
            isHeadingToVendor
              ? 'location'
              : isAtVendor
              ? 'bag-check'
              : isHeadingToCustomer
              ? 'home'
              : 'checkmark-done-circle'
          }
          size={22}
          color="#FFFFFF"
        />
        <Text style={styles.actionButtonText}>
          {isHeadingToVendor
            ? 'I HAVE ARRIVED AT SHOP'
            : isAtVendor
            ? 'CONFIRM ORDER PICKED UP'
            : isHeadingToCustomer
            ? 'I HAVE ARRIVED AT CUSTOMER'
            : 'ENTER OTP & COMPLETE DELIVERY'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stepsBarContainer: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: Spacing.two,
  },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stageContentBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    marginVertical: Spacing.two,
  },
  stageBody: {
    gap: 4,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  stageSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  instructions: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  contactBar: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checklistContainer: {
    marginTop: Spacing.two,
    gap: 8,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  codAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.two,
  },
  codAlertText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.two,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
