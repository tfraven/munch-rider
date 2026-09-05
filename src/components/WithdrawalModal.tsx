import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';

interface WithdrawalModalProps {
  visible: boolean;
  walletBalance: number;
  onClose: () => void;
  onConfirm: (
    amount: number,
    method: 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER',
    accountNumber: string,
    accountTitle: string
  ) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  visible,
  walletBalance,
  onClose,
  onConfirm,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const [selectedMethod, setSelectedMethod] = useState<
    'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER'
  >('EASYPAISA');
  const [amountStr, setAmountStr] = useState('1000');
  const [accountNumber, setAccountNumber] = useState('03035544332');
  const [accountTitle, setAccountTitle] = useState('Tariq Mehmood');

  const amount = parseFloat(amountStr) || 0;
  const isValid = amount >= 200 && amount <= walletBalance && accountNumber.trim().length >= 8;

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onConfirm(amount, selectedMethod, accountNumber, accountTitle);
    onClose();
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
              <Text style={[styles.title, { color: theme.text }]}>Withdraw Earnings</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Available Balance: Rs. {walletBalance}
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
            {/* Payment Method Selector */}
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              Select Cashout Method
            </Text>
            <View style={styles.methodSelectorRow}>
              {[
                { id: 'EASYPAISA' as const, label: 'Easypaisa', icon: 'wallet' },
                { id: 'JAZZCASH' as const, label: 'JazzCash', icon: 'phone-portrait' },
                { id: 'BANK_TRANSFER' as const, label: 'Bank Account', icon: 'business' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.methodChip,
                    {
                      backgroundColor:
                        selectedMethod === m.id
                          ? isDark
                            ? '#2D1B10'
                            : '#FFF2EB'
                          : theme.backgroundElement,
                      borderColor:
                        selectedMethod === m.id ? theme.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedMethod(m.id)}
                >
                  <Ionicons
                    name={m.icon as any}
                    size={18}
                    color={selectedMethod === m.id ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.methodChipText,
                      {
                        color:
                          selectedMethod === m.id ? theme.primary : theme.textSecondary,
                        fontWeight: selectedMethod === m.id ? '800' : '600',
                      },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount Input */}
            <Text style={[styles.sectionHeading, { color: theme.text, marginTop: Spacing.three }]}>
              Withdrawal Amount (Rs.)
            </Text>
            <View
              style={[
                styles.amountInputRow,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: amount > walletBalance ? theme.danger : theme.border,
                },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                Rs.
              </Text>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                keyboardType="numeric"
                value={amountStr}
                onChangeText={setAmountStr}
                placeholder="0"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickChipsRow}>
              {[500, 1000, 2000, walletBalance].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor:
                        amount === val
                          ? theme.primary
                          : theme.backgroundElement,
                    },
                  ]}
                  onPress={() => handleQuickAmount(val)}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      {
                        color:
                          amount === val ? '#FFFFFF' : theme.textSecondary,
                      },
                    ]}
                  >
                    {val === walletBalance ? 'Max (All)' : `Rs. ${val}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Account Details */}
            <Text style={[styles.sectionHeading, { color: theme.text, marginTop: Spacing.four }]}>
              Account Details
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {selectedMethod === 'BANK_TRANSFER'
                  ? 'IBAN / Account Number'
                  : 'Mobile Wallet Number'}
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
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="0300 1234567"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Account Title (Full Name)
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
                value={accountTitle}
                onChangeText={setAccountTitle}
                placeholder="e.g. Tariq Mehmood"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Instant Notice */}
            <View
              style={[
                styles.noticeBox,
                { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' },
              ]}
            >
              <Ionicons name="flash" size={16} color={theme.secondary} />
              <Text style={[styles.noticeText, { color: theme.secondary }]}>
                Transfers to Easypaisa & JazzCash are instant (0% fee for launch).
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isValid ? theme.primary : theme.textMuted,
                  ...Shadows.md,
                },
              ]}
              disabled={!isValid}
              onPress={handleSubmit}
            >
              <Ionicons name="arrow-up-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                WITHDRAW RS. {amount > 0 ? amount : 0}
              </Text>
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
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  methodSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: 4,
  },
  methodChipText: {
    fontSize: 11,
    textAlign: 'center',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: Spacing.two,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    paddingVertical: 8,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.three,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
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
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
