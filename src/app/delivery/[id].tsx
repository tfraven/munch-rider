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
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { useRider } from '../../context/RiderContext';
import { LiveMapSimulation } from '../../components/LiveMapSimulation';
import { DeliveryWorkflowCard } from '../../components/DeliveryWorkflowCard';
import { ProofOfDeliveryModal } from '../../components/ProofOfDeliveryModal';
import { ChatModal } from '../../components/ChatModal';

export default function DeliveryExecutionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const {
    activeTrip,
    advanceDeliveryStatus,
    completeDelivery,
    chatMessages,
    sendMessage,
  } = useRider();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<'CUSTOMER' | 'VENDOR' | null>(null);

  if (!activeTrip) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={theme.secondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Active Delivery
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Return to Radar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirmOtp = (otp: string, photoProofUrl?: string) => {
    const res = completeDelivery(otp, photoProofUrl);
    if (res.success) {
      setShowOtpModal(false);
      router.back();
    }
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
        <TouchableOpacity
          style={[styles.backBtnCircle, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Turn-by-Turn Delivery Mode
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Order #{activeTrip.orderNumber}
          </Text>
        </View>
        <View style={[styles.liveTag, { backgroundColor: theme.danger }]}>
          <Text style={styles.liveTagText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Big Interactive Live Map Simulation */}
        <LiveMapSimulation trip={activeTrip} height={320} />

        {/* Step Progression & Workflow */}
        <View style={{ marginTop: Spacing.three }}>
          <DeliveryWorkflowCard
            trip={activeTrip}
            onAdvance={advanceDeliveryStatus}
            onOpenOtpModal={() => setShowOtpModal(true)}
            onOpenChat={(rec) => setChatRecipient(rec)}
          />
        </View>
      </ScrollView>

      {/* OTP Proof Modal */}
      <ProofOfDeliveryModal
        visible={showOtpModal}
        trip={activeTrip}
        onClose={() => setShowOtpModal(false)}
        onConfirm={handleConfirmOtp}
      />

      {/* In-App Chat Modal */}
      {chatRecipient && (
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'android' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  liveTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  backButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
