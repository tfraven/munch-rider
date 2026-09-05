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
import { StatCard } from '../../components/StatCard';
import { WithdrawalModal } from '../../components/WithdrawalModal';

export default function EarningsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const {
    walletBalance,
    cashInHand,
    todayEarnings,
    todayTripsCount,
    transactions,
    dailySummaries,
    requestWithdrawal,
  } = useRider();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'EARNING' | 'WITHDRAWAL'>('ALL');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const handleWithdrawConfirm = (
    amount: number,
    method: 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER',
    accountNumber: string,
    accountTitle: string
  ) => {
    requestWithdrawal(amount, method, accountNumber, accountTitle);
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Earnings & Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Wallet Card */}
        <View
          style={[
            styles.walletCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.md,
            },
          ]}
        >
          <View style={styles.walletTopRow}>
            <View>
              <Text style={[styles.walletLabel, { color: theme.textSecondary }]}>
                Available Wallet Balance
              </Text>
              <Text style={[styles.walletAmount, { color: theme.primary }]}>
                Rs. {walletBalance}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.withdrawBtn,
                { backgroundColor: theme.primary, ...Shadows.sm },
              ]}
              onPress={() => setShowWithdrawModal(true)}
            >
              <Ionicons name="arrow-up-circle" size={18} color="#FFFFFF" />
              <Text style={styles.withdrawBtnText}>Cash Out</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          {/* COD Cash In Hand Notice */}
          <View style={styles.cashInHandRow}>
            <View style={styles.cashInHandLeft}>
              <Ionicons name="cash-outline" size={20} color={theme.accent} />
              <View>
                <Text style={[styles.cashInHandTitle, { color: theme.text }]}>
                  Cash In Hand (COD Collected)
                </Text>
                <Text style={[styles.cashInHandSub, { color: theme.textSecondary }]}>
                  Settled automatically against digital payouts
                </Text>
              </View>
            </View>
            <Text style={[styles.cashInHandAmount, { color: theme.accent }]}>
              Rs. {cashInHand}
            </Text>
          </View>
        </View>

        {/* Weekly & Shift Metrics */}
        <View style={styles.statsRow}>
          <StatCard
            title="Today's Pay"
            value={`Rs. ${todayEarnings}`}
            subtitle={`${todayTripsCount} Trips`}
            icon="calendar"
            iconColor={theme.primary}
          />
          <StatCard
            title="This Week"
            value="Rs. 6,790"
            subtitle="35 Trips • 26 hrs"
            icon="trending-up"
            iconColor={theme.secondary}
          />
        </View>

        {/* Daily Summary Breakdown Accordion */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Daily Earnings
          </Text>
        </View>

        <View style={styles.daysList}>
          {dailySummaries.map((day, idx) => (
            <View
              key={idx}
              style={[
                styles.dayCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  ...Shadows.sm,
                },
              ]}
            >
              <View style={styles.dayTopRow}>
                <View>
                  <Text style={[styles.dayDate, { color: theme.text }]}>{day.date}</Text>
                  <Text style={[styles.daySub, { color: theme.textSecondary }]}>
                    {day.tripsCompleted} trips • {day.onlineHours} hrs online • Rs. {day.totalTips} tips
                  </Text>
                </View>
                <Text style={[styles.dayTotal, { color: theme.primary }]}>
                  Rs. {day.totalEarnings}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Transaction History Section */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Wallet Transactions
          </Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {[
            { id: 'ALL' as const, label: 'All' },
            { id: 'EARNING' as const, label: 'Trip Earnings' },
            { id: 'WITHDRAWAL' as const, label: 'Withdrawals' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    filterType === f.id ? theme.primary : theme.backgroundElement,
                },
              ]}
              onPress={() => setFilterType(f.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: filterType === f.id ? '#FFFFFF' : theme.textSecondary,
                    fontWeight: filterType === f.id ? '800' : '600',
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        <View style={styles.txnsList}>
          {filteredTransactions.map((txn) => {
            const isEarning = txn.type === 'EARNING' || txn.type === 'BONUS';
            return (
              <View
                key={txn.id}
                style={[
                  styles.txnCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    ...Shadows.sm,
                  },
                ]}
              >
                <View style={styles.txnLeft}>
                  <View
                    style={[
                      styles.txnIconCircle,
                      {
                        backgroundColor: isEarning
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
                        isEarning
                          ? txn.type === 'BONUS'
                            ? 'gift'
                            : 'arrow-down-circle'
                          : 'arrow-up-circle'
                      }
                      size={20}
                      color={isEarning ? theme.secondary : theme.accent}
                    />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={[styles.txnTitle, { color: theme.text }]}>
                      {txn.title}
                    </Text>
                    <Text style={[styles.txnTimestamp, { color: theme.textSecondary }]}>
                      {txn.timestamp}
                      {txn.accountDetails ? ` • ${txn.accountDetails}` : ''}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.txnAmount,
                    {
                      color: isEarning ? theme.secondary : theme.text,
                    },
                  ]}
                >
                  {isEarning ? `+Rs. ${txn.amount}` : `-Rs. ${Math.abs(txn.amount)}`}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        visible={showWithdrawModal}
        walletBalance={walletBalance}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={handleWithdrawConfirm}
      />
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
  },
  walletCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  cashInHandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashInHandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cashInHandTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  cashInHandSub: {
    fontSize: 11,
    marginTop: 1,
  },
  cashInHandAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  daysList: {
    gap: Spacing.two,
  },
  dayCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  dayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  daySub: {
    fontSize: 12,
    marginTop: 2,
  },
  dayTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.three,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 12,
  },
  txnsList: {
    gap: Spacing.two,
  },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txnIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  txnTimestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
});
