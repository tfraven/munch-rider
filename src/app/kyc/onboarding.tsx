import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { useRider } from '../../context/RiderContext';

export default function KycOnboardingScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();

  const { profile, submitKYC } = useRider();

  const [cnic, setCnic] = useState(profile.cnicNumber || '35201-8849201-3');
  const [license, setLicense] = useState(profile.licenseNumber || 'LHR-DL-49021');
  const [vehicleModel, setVehicleModel] = useState(profile.vehicleModel || 'Honda CD 70');
  const [vehicleNumber, setVehicleNumber] = useState(profile.vehicleNumber || 'MN-25-1092');

  const [cnicFrontUploaded, setCnicFrontUploaded] = useState(true);
  const [cnicBackUploaded, setCnicBackUploaded] = useState(true);
  const [licenseUploaded, setLicenseUploaded] = useState(true);

  const handleSubmit = () => {
    submitKYC({
      cnic,
      license,
      vehicleModel,
      vehicleNumber,
    });
    router.back();
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
            Rider KYC & Verification
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Submit your National ID & Driving License
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Alert Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor:
                profile.kycStatus === 'VERIFIED'
                  ? isDark
                    ? '#064E3B'
                    : '#ECFDF5'
                  : isDark
                  ? '#451A03'
                  : '#FEF3C7',
              borderColor:
                profile.kycStatus === 'VERIFIED' ? theme.secondary : theme.accent,
            },
          ]}
        >
          <Ionicons
            name={
              profile.kycStatus === 'VERIFIED'
                ? 'shield-checkmark'
                : 'alert-circle'
            }
            size={22}
            color={
              profile.kycStatus === 'VERIFIED' ? theme.secondary : theme.accent
            }
          />
          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusTitle,
                {
                  color:
                    profile.kycStatus === 'VERIFIED'
                      ? theme.secondary
                      : theme.accent,
                },
              ]}
            >
              KYC Status: {profile.kycStatus}
            </Text>
            <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
              {profile.kycStatus === 'VERIFIED'
                ? 'Your documents have been verified by the Munch admin team. You have priority dispatch.'
                : 'Submitted documents are under review. Verification typically takes 15 minutes.'}
            </Text>
          </View>
        </View>

        {/* Identity Details */}
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
          <Text style={[styles.cardHeading, { color: theme.text }]}>
            Identity Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              CNIC / National Identity Card Number
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={cnic}
              onChangeText={setCnic}
              placeholder="35201-XXXXXXX-X"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Driving License Number
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={license}
              onChangeText={setLicense}
              placeholder="DL-XXXXX"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        {/* Vehicle Details */}
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
          <Text style={[styles.cardHeading, { color: theme.text }]}>
            Vehicle Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Vehicle Make & Model
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="e.g. Honda CD 70 (Red)"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Registration Number Plate
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              placeholder="e.g. MN-25-1092"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        {/* Document Photos Upload Simulation */}
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
          <Text style={[styles.cardHeading, { color: theme.text }]}>
            Document Photos
          </Text>

          <View style={styles.photoUploadRow}>
            {/* CNIC Front */}
            <TouchableOpacity
              style={[
                styles.uploadBox,
                {
                  backgroundColor: cnicFrontUploaded
                    ? isDark
                      ? '#064E3B'
                      : '#ECFDF5'
                    : theme.backgroundElement,
                  borderColor: cnicFrontUploaded ? theme.secondary : theme.border,
                },
              ]}
              onPress={() => setCnicFrontUploaded((p) => !p)}
            >
              <Ionicons
                name={cnicFrontUploaded ? 'checkmark-circle' : 'camera'}
                size={22}
                color={cnicFrontUploaded ? theme.secondary : theme.textSecondary}
              />
              <Text style={[styles.uploadBoxText, { color: theme.text }]}>
                CNIC Front
              </Text>
              <Text style={[styles.uploadStatusText, { color: theme.textSecondary }]}>
                {cnicFrontUploaded ? 'Uploaded ✓' : 'Tap to Take Photo'}
              </Text>
            </TouchableOpacity>

            {/* CNIC Back */}
            <TouchableOpacity
              style={[
                styles.uploadBox,
                {
                  backgroundColor: cnicBackUploaded
                    ? isDark
                      ? '#064E3B'
                      : '#ECFDF5'
                    : theme.backgroundElement,
                  borderColor: cnicBackUploaded ? theme.secondary : theme.border,
                },
              ]}
              onPress={() => setCnicBackUploaded((p) => !p)}
            >
              <Ionicons
                name={cnicBackUploaded ? 'checkmark-circle' : 'camera'}
                size={22}
                color={cnicBackUploaded ? theme.secondary : theme.textSecondary}
              />
              <Text style={[styles.uploadBoxText, { color: theme.text }]}>
                CNIC Back
              </Text>
              <Text style={[styles.uploadStatusText, { color: theme.textSecondary }]}>
                {cnicBackUploaded ? 'Uploaded ✓' : 'Tap to Take Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save & Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.primary, ...Shadows.md },
          ]}
          onPress={handleSubmit}
        >
          <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            SUBMIT DOCUMENTS FOR VERIFICATION
          </Text>
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
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 12,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  photoUploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 4,
  },
  uploadBoxText: {
    fontSize: 13,
    fontWeight: '700',
  },
  uploadStatusText: {
    fontSize: 11,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
