import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';
import { DeliveryTrip } from '../types';

interface ProofOfDeliveryModalProps {
  visible: boolean;
  trip: DeliveryTrip | null;
  onClose: () => void;
  onConfirm: (otp: string, photoProofUrl?: string) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  visible,
  trip,
  onClose,
  onConfirm,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const [otp, setOtp] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [cashCollectedConfirmed, setCashCollectedConfirmed] = useState(false);

  if (!trip) return null;

  const isCod = trip.paymentMethod === 'CASH_ON_DELIVERY';

  const handleKeyPress = (num: string) => {
    if (otp.length < 4) {
      setOtp((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setOtp((prev) => prev.slice(0, -1));
  };

  const handleUseQuickOtp = () => {
    // Quick shortcut for ease of testing in emulator
    setOtp(trip.customer.deliveryOtp);
  };

  const handleSubmit = () => {
    onConfirm(
      otp,
      photoAdded
        ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80'
        : undefined
    );
    setOtp('');
    setPhotoAdded(false);
    setCashCollectedConfirmed(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Proof of Delivery</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Order #{trip.orderNumber}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* OTP Prompt */}
            <View style={styles.otpPromptBox}>
              <Ionicons name="shield-checkmark" size={24} color={theme.secondary} />
              <Text style={[styles.promptText, { color: theme.text }]}>
                Enter 4-Digit Customer OTP
              </Text>
              <TouchableOpacity onPress={handleUseQuickOtp}>
                <Text style={[styles.otpHint, { color: theme.primary }]}>
                  Customer OTP: {trip.customer.deliveryOtp} (Tap to auto-fill)
                </Text>
              </TouchableOpacity>
            </View>

            {/* OTP Display Boxes */}
            <View style={styles.otpDisplayRow}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    {
                      borderColor: otp.length === index ? theme.primary : theme.border,
                      backgroundColor: theme.backgroundElement,
                    },
                  ]}
                >
                  <Text style={[styles.otpChar, { color: theme.text }]}>
                    {otp[index] || ''}
                  </Text>
                </View>
              ))}
            </View>

            {/* Custom On-screen Keypad */}
            <View style={styles.keypadContainer}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['C', '0', '⌫'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.keyButton,
                        {
                          backgroundColor: theme.backgroundElement,
                        },
                      ]}
                      onPress={() => {
                        if (key === '⌫') handleDelete();
                        else if (key === 'C') setOtp('');
                        else handleKeyPress(key);
                      }}
                    >
                      <Text
                        style={[
                          styles.keyText,
                          {
                            color:
                              key === '⌫'
                                ? theme.danger
                                : key === 'C'
                                ? theme.accent
                                : theme.text,
                          },
                        ]}
                      >
                        {key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {/* COD Cash Collection Checkbox */}
            {isCod && (
              <TouchableOpacity
                style={[
                  styles.codConfirmCard,
                  {
                    backgroundColor: isDark ? '#451A03' : '#FEF3C7',
                    borderColor: theme.accent,
                  },
                ]}
                onPress={() => setCashCollectedConfirmed((prev) => !prev)}
              >
                <Ionicons
                  name={cashCollectedConfirmed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={theme.accent}
                />
                <View style={styles.codTextContainer}>
                  <Text style={[styles.codMainText, { color: theme.accent }]}>
                    Cash Collected: Rs. {trip.cashToCollect}
                  </Text>
                  <Text style={[styles.codSubText, { color: theme.textSecondary }]}>
                    Confirm that you received the exact cash from the customer.
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Optional Photo Proof */}
            <TouchableOpacity
              style={[
                styles.photoButton,
                {
                  backgroundColor: photoAdded
                    ? isDark
                      ? '#064E3B'
                      : '#ECFDF5'
                    : theme.backgroundElement,
                  borderColor: photoAdded ? theme.secondary : theme.border,
                },
              ]}
              onPress={() => setPhotoAdded((prev) => !prev)}
            >
              <Ionicons
                name={photoAdded ? 'checkmark-circle' : 'camera-outline'}
                size={22}
                color={photoAdded ? theme.secondary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.photoBtnText,
                  { color: photoAdded ? theme.secondary : theme.textSecondary },
                ]}
              >
                {photoAdded ? 'Photo Proof Attached' : 'Take Doorstep Photo (Optional)'}
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    otp.length === 4 && (!isCod || cashCollectedConfirmed)
                      ? theme.secondary
                      : theme.textMuted,
                  ...Shadows.md,
                },
              ]}
              disabled={otp.length !== 4 || (isCod && !cashCollectedConfirmed)}
              onPress={handleSubmit}
            >
              <Ionicons name="checkmark-done" size={22} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>CONFIRM & FINISH DELIVERY</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  otpPromptBox: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  otpHint: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  otpDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  otpBox: {
    width: 52,
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpChar: {
    fontSize: 24,
    fontWeight: '900',
  },
  keypadContainer: {
    gap: 8,
    marginBottom: Spacing.four,
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  keyButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 18,
    fontWeight: '800',
  },
  codConfirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  codTextContainer: {
    flex: 1,
  },
  codMainText: {
    fontSize: 14,
    fontWeight: '800',
  },
  codSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  photoButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: Spacing.four,
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
