import React, { useEffect, useState } from 'react';
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

interface LiveMapSimulationProps {
  trip: DeliveryTrip | null;
  height?: number;
  onOpenExternalNavigation?: () => void;
}

export const LiveMapSimulation: React.FC<LiveMapSimulationProps> = ({
  trip,
  height = 240,
  onOpenExternalNavigation,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  // Animated progress position (0 to 100)
  const [riderProgress, setRiderProgress] = useState(25);

  useEffect(() => {
    if (!trip) return;

    // Set initial position based on delivery stage
    if (trip.status === 'NAVIGATING_TO_VENDOR') {
      setRiderProgress(20);
    } else if (trip.status === 'ARRIVED_AT_VENDOR') {
      setRiderProgress(35);
    } else if (trip.status === 'PICKED_UP' || trip.status === 'NAVIGATING_TO_CUSTOMER') {
      setRiderProgress(65);
    } else if (trip.status === 'ARRIVED_AT_CUSTOMER') {
      setRiderProgress(90);
    }

    // Micro-movement animation
    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        const jitter = (Math.random() - 0.5) * 2;
        return Math.min(95, Math.max(10, prev + jitter));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [trip?.status]);

  const openMaps = () => {
    if (onOpenExternalNavigation) {
      onOpenExternalNavigation();
      return;
    }
    if (!trip) return;
    const dest =
      trip.status === 'NAVIGATING_TO_VENDOR' || trip.status === 'ARRIVED_AT_VENDOR'
        ? trip.vendor.location
        : trip.customer.location;

    const url = Platform.select({
      ios: `maps:0,0?q=${dest.latitude},${dest.longitude}`,
      android: `geo:0,0?q=${dest.latitude},${dest.longitude}(${encodeURIComponent(dest.address)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${dest.latitude},${dest.longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const isHeadingToVendor =
    trip?.status === 'NAVIGATING_TO_VENDOR' || trip?.status === 'ARRIVED_AT_VENDOR';

  const currentDestinationTitle = isHeadingToVendor
    ? trip?.vendor.name || 'Vendor'
    : trip?.customer.name || 'Customer';

  const currentDistance = isHeadingToVendor
    ? `${trip?.distanceToVendorKm || 0.8} km`
    : `${trip?.distanceToCustomerKm || 2.1} km`;

  return (
    <View
      style={[
        styles.mapContainer,
        {
          height,
          backgroundColor: isDark ? '#141E30' : '#E8EEF5',
          borderColor: theme.border,
          ...Shadows.md,
        },
      ]}
    >
      {/* Map Grid Pattern simulation */}
      <View style={styles.gridOverlay}>
        <View style={[styles.gridRoadHorizontal, { top: '35%' }]} />
        <View style={[styles.gridRoadHorizontal, { top: '70%' }]} />
        <View style={[styles.gridRoadVertical, { left: '25%' }]} />
        <View style={[styles.gridRoadVertical, { left: '75%' }]} />
        <View style={[styles.riverStream, { top: '50%' }]} />
      </View>

      {/* Route Path (SVG-like dotted connector line) */}
      <View style={styles.routeLineContainer}>
        <View style={[styles.routePath, { borderColor: theme.primary }]} />
      </View>

      {/* Vendor Pin (Pickup Point) */}
      <View style={[styles.pinWrapper, { top: '25%', left: '18%' }]}>
        <View style={[styles.pinBubble, { backgroundColor: theme.primary, ...Shadows.md }]}>
          <Ionicons name="restaurant" size={14} color="#FFFFFF" />
        </View>
        <View style={[styles.pinLabel, { backgroundColor: theme.card }]}>
          <Text style={[styles.pinLabelText, { color: theme.text }]} numberOfLines={1}>
            {trip?.vendor.name || 'Vendor'}
          </Text>
        </View>
      </View>

      {/* Customer Pin (Drop-off Point) */}
      <View style={[styles.pinWrapper, { top: '65%', left: '75%' }]}>
        <View style={[styles.pinBubble, { backgroundColor: theme.secondary, ...Shadows.md }]}>
          <Ionicons name="home" size={14} color="#FFFFFF" />
        </View>
        <View style={[styles.pinLabel, { backgroundColor: theme.card }]}>
          <Text style={[styles.pinLabelText, { color: theme.text }]} numberOfLines={1}>
            {trip?.customer.name || 'Customer'}
          </Text>
        </View>
      </View>

      {/* Rider GPS Bike Marker */}
      <View
        style={[
          styles.riderMarker,
          {
            top: `${25 + (riderProgress / 100) * 40}%`,
            left: `${18 + (riderProgress / 100) * 57}%`,
          },
        ]}
      >
        <View style={[styles.riderPulseRing, { borderColor: theme.primary }]} />
        <View style={[styles.riderIconCircle, { backgroundColor: '#0F172A', ...Shadows.lg }]}>
          <MaterialCommunityIcons name="motorbike" size={18} color="#FF6B00" />
        </View>
      </View>

      {/* Navigation HUD Overlay (Top) */}
      <View style={styles.topHud}>
        <View style={[styles.hudCard, { backgroundColor: theme.card, ...Shadows.sm }]}>
          <Ionicons
            name={isHeadingToVendor ? 'arrow-redo' : 'navigate'}
            size={18}
            color={isHeadingToVendor ? theme.primary : theme.secondary}
          />
          <View style={styles.hudTextContainer}>
            <Text style={[styles.hudDistance, { color: theme.text }]}>
              {currentDistance} away
            </Text>
            <Text
              style={[styles.hudDestination, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              Heading to {currentDestinationTitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Launch Turn-by-Turn GPS Button (Bottom Right) */}
      <TouchableOpacity
        style={[styles.openGpsButton, { backgroundColor: theme.primary, ...Shadows.md }]}
        onPress={openMaps}
      >
        <Ionicons name="navigate" size={18} color="#FFFFFF" />
        <Text style={styles.openGpsText}>Start Turn-by-Turn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    width: '100%',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  gridRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  gridRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  riverStream: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#93C5FD',
    opacity: 0.35,
    transform: [{ rotate: '-12deg' }],
  },
  routeLineContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  routePath: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: '60%',
    height: '40%',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderRadius: 30,
    opacity: 0.8,
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  pinBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 2,
    maxWidth: 90,
  },
  pinLabelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  riderMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 10,
  },
  riderPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    opacity: 0.4,
  },
  riderIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  topHud: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    right: Spacing.two,
  },
  hudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  hudTextContainer: {
    flex: 1,
  },
  hudDistance: {
    fontSize: 13,
    fontWeight: '800',
  },
  hudDestination: {
    fontSize: 11,
    fontWeight: '500',
  },
  openGpsButton: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  openGpsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
