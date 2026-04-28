import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { getPolicyMetrics, formatMoney, POLICY_CONSTANTS } from '../engine/IBCEngine';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

export default function PolicyScreen() {
  const { state, actions, computed } = useGame();
  const { finances, player } = state;
  const policy = finances.policy;
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | loans | how-it-works

  if (!policy) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>ðï¸</Text>
          <Text style={styles.emptyTitle}>No Policy Yet</Text>
          <Text style={styles.emptySubtitle}>
            Go to the Game tab and open your IBC whole life policy to start building your banking system.
          </Text>
        </View>
      </View>
    );
  }

  const metrics = getPolicyMetrics(policy);

  function handleTakeLoan() {
    const amount = parseInt(loanAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    actions.takePolicyLoan(amount);
    setShowLoanModal(false);
    setLoanAmount('');
  }

  function handleRepayLoan() {
    const amount = parseInt(repayAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    actions.repayPolicyLoan(amount);
    setShowRepayModal(false);
    setRepayAmount('');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1A0800', '#0A0A0A']} style={styles.header}>
          <Text style={styles.headerTitle}>ð¦ Your Policy</Text>
          <Text style={styles.headerSub}>Year {metrics.policyYear} â¢ {player.name}</Text>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{formatMoney(metrics.cashValue)}</Text>
              <Text style={styles.headerStatLabel}>Cash Value</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatValue, { color: COLORS.gold }]}>
                {formatMoney(metrics.deathBenefit)}
              </Text>
              <Text style={styles.headerStatLabel}>Death Benefit</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatValue, { color: COLORS.green }]}>{metrics.roi}%</Text>
              <Text style={styles.headerStatLabel}>Policy ROI</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['overview', 'loans', 'how-it-works'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'overview' ? 'Overview' : tab === 'loans' ? 'Loans' : 'How It Works'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <>
            {/* Health Gauge */}
            <View style={styles.section}>
              <View style={styles.healthRow}>
                <Text style={styles.sectionTitle}>Policy Health</Text>
                <View style={[styles.healthBadge, { backgroundColor: metrics.healthColor + '22' }]}>
                  <Text style={[styles.healthText, { color: metrics.healthColor }]}>
                    {metrics.health}
                  </Text>
                </View>
              </View>
              <View style={styles.ltvBarBg}>
                <View style={[styles.ltvBarFill, { width: `${metrics.loanToValue}%`, backgroundColor: metrics.healthColor }]} />
              </View>
              <Text style={styles.ltvLabel}>
                Loan-to-Value: {metrics.loanToValue}% (max 90% before issues)
              </Text>
            </View>

            {/* Key Metrics Grid */}
            <View style={styles.metricsGrid}>
              {[
                { label: 'Annual Premium', value: formatMoney(policy.annualPremium), icon: 'ð', color: COLORS.text },
                { label: 'Total Premiums Paid', value: formatMoney(metrics.totalPremiumsPaid), icon: 'ð¸', color: COLORS.textSecondary },
                { label: 'Cash Value', value: formatMoney(metrics.cashValue), icon: 'ð°', color: COLORS.gold },
                { label: 'Available to Borrow', value: formatMoney(metrics.availableLoan), icon: 'ð¦', color: COLORS.green },
                { label: 'Outstanding Loans', value: formatMoney(metrics.loanBalance), icon: 'ð', color: metrics.loanBalance > 0 ? COLORS.red : COLORS.textMuted },
                { label: 'Death Benefit', value: formatMoney(metrics.deathBenefit), icon: 'ð¡ï¸', color: COLORS.blue },
                { label: 'Dividends Earned', value: formatMoney(policy.dividendsEarned), icon: 'ð', color: COLORS.primary },
                { label: 'Policy Year', value: `Year ${metrics.policyYear}`, icon: 'ð', color: COLORS.textSecondary },
              ].map((item, i) => (
                <View key={i} style={styles.metricCard}>
                  <Text style={styles.metricIcon}>{item.icon}</Text>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text style={[styles.metricValue, { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            {/* Growth Rate Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>ð Your Policy Grows At</Text>
              <View style={styles.rateRow}>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateValue}>{(POLICY_CONSTANTS.BASE_GROWTH_RATE * 100).toFixed(1)}%</Text>
                  <Text style={styles.rateLabel}>Guaranteed</Text>
                </View>
                <Text style={styles.ratePlus}>+</Text>
                <View style={styles.rateBadge}>
                  <Text style={[styles.rateValue, { color: COLORS.gold }]}>
                    {(POLICY_CONSTANTS.DIVIDEND_RATE * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.rateLabel}>Dividend</Text>
                </View>
                <Text style={styles.ratePlus}>=</Text>
                <View style={[styles.rateBadge, { backgroundColor: '#002200' }]}>
                  <Text style={[styles.rateValue, { color: COLORS.green }]}>6%+</Text>
                  <Text style={styles.rateLabel}>Total</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'loans' && (
          <>
            {/* Loan Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loan Status</Text>
              {policy.loanBalance > 0 ? (
                <View style={styles.activeLoanCard}>
                  <View style={styles.activeLoanRow}>
                    <Text style={styles.activeLoanLabel}>Outstanding Balance</Text>
                    <Text style={styles.activeLoanValue}>{formatMoney(policy.loanBalance)}</Text>
                  </View>
                  <View style={styles.activeLoanRow}>
                    <Text style={styles.activeLoanLabel}>Annual Interest</Text>
                    <Text style={[styles.activeLoanValue, { color: COLORS.red }]}>
                      {formatMoney(policy.loanBalance * POLICY_CONSTANTS.LOAN_INTEREST_RATE)}/yr
                    </Text>
                  </View>
                  <View style={styles.activeLoanRow}>
                    <Text style={styles.activeLoanLabel}>Available to Borrow More</Text>
                    <Text style={[styles.activeLoanValue, { color: COLORS.green }]}>
                      {formatMoney(metrics.availableLoan)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noLoanCard}>
                  <Text style={styles.noLoanText}>â No outstanding loans. Full borrowing capacity available.</Text>
                </View>
              )}
            </View>

            {/* Loan Actions */}
            <View style={styles.loanActions}>
              <TouchableOpacity
                style={styles.loanActionButton}
                onPress={() => setShowLoanModal(true)}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.loanActionGradient}>
                  <Text style={styles.loanActionIcon}>ð³</Text>
                  <Text style={styles.loanActionText}>Take Loan</Text>
                  <Text style={styles.loanActionSub}>Up to {formatMoney(metrics.availableLoan)}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {policy.loanBalance > 0 && (
                <TouchableOpacity
                  style={styles.loanActionButton}
                  onPress={() => setShowRepayModal(true)}
                >
                  <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.loanActionGradient}>
                    <Text style={styles.loanActionIcon}>â</Text>
                    <Text style={styles.loanActionText}>Repay Loan</Text>
                    <Text style={styles.loanActionSub}>Balance: {formatMoney(policy.loanBalance)}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Loan Education */}
            <View style={styles.eduCard}>
              <Text style={styles.eduTitle}>ð How Policy Loans Work</Text>
              <Text style={styles.eduText}>
                Unlike bank loans, policy loans don't require credit checks or approval.
                Your cash value continues to grow even while loaned out â because you're
                borrowing against it, not withdrawing it.{'\n\n'}
                Interest accrues at {(POLICY_CONSTANTS.LOAN_INTEREST_RATE * 100)}% annually.
                Repay on your schedule â or not at all (the death benefit covers it).
              </Text>
            </View>
          </>
        )}

        {activeTab === 'how-it-works' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Infinite Banking Concept</Text>
            </View>

            {[
              {
                step: '01',
                icon: 'ð°',
                title: 'Fund Your Policy',
                desc: 'Pay premiums into a dividend-paying whole life insurance policy. Your cash value grows guaranteed.',
              },
              {
                step: '02',
                icon: 'ð',
                title: 'Cash Value Compounds',
                desc: 'Your money grows at 4.5% guaranteed + dividends. Tax-deferred. Safe from market crashes.',
              },
              {
                step: '03',
                icon: 'ð¦',
                title: 'Borrow Against It',
                desc: 'Need money? Borrow up to 90% of your cash value instantly. No bank. No credit check.',
              },
              {
                step: '04',
                icon: 'â»ï¸',
                title: 'Repay Yourself',
                desc: 'Pay back the loan on your schedule. The interest goes back into your banking system, not a bank\'s profits.',
              },
              {
                step: '05',
                icon: 'ð¨âð©âð§âð¦',
                title: 'Pass It On',
                desc: 'At death, the tax-free death benefit transfers to your heirs â creating generational wealth.',
              },
            ].map((item, i) => (
              <View key={i} style={styles.howCard}>
                <View style={styles.howStep}>
                  <Text style={styles.howStepText}>{item.step}</Text>
                </View>
                <View style={styles.howContent}>
                  <Text style={styles.howIcon}>{item.icon}</Text>
                  <View style={styles.howText}>
                    <Text style={styles.howTitle}>{item.title}</Text>
                    <Text style={styles.howDesc}>{item.desc}</Text>
                  </View>
                </View>
                {i < 4 && <View style={styles.howConnector} />}
              </View>
            ))}
          </>
        )}

      </ScrollView>

      {/* Take Loan Modal */}
      <Modal visible={showLoanModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ð³ Take Policy Loan</Text>
            <Text style={styles.modalSub}>
              Available: {formatMoney(metrics.availableLoan)}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Enter loan amount"
              placeholderTextColor={COLORS.textMuted}
              value={loanAmount}
              onChangeText={setLoanAmount}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleTakeLoan}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>GET LOAN</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowLoanModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Repay Modal */}
      <Modal visible={showRepayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>â Repay Policy Loan</Text>
            <Text style={styles.modalSub}>
              Balance: {formatMoney(policy.loanBalance)}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Enter repayment amount"
              placeholderTextColor={COLORS.textMuted}
              value={repayAmount}
              onChangeText={setRepayAmount}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleRepayLoan}>
              <LinearGradient colors={[COLORS.green, COLORS.greenDark]} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>REPAY LOAN</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowRepayModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: SPACING.xxxl },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: FONTS.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  header: { padding: SPACING.xl, paddingTop: SPACING.xxl },
  headerTitle: { fontSize: FONTS.xxl, fontWeight: '900', color: COLORS.text },
  headerSub: { fontSize: FONTS.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  headerStats: { flexDirection: 'row', justifyContent: 'space-around' },
  headerStat: { alignItems: 'center', flex: 1 },
  headerStatValue: { fontSize: FONTS.lg, fontWeight: '900', color: COLORS.text },
  headerStatLabel: { fontSize: FONTS.xs, color: COLORS.textMuted },
  headerStatDivider: { width: 1, backgroundColor: COLORS.cardBorder },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONTS.sm, color: COLORS.textMuted, fontWeight: '700' },
  tabTextActive: { color: COLORS.primary },

  section: { padding: SPACING.base, paddingBottom: 0 },
  sectionTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  healthBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  healthText: { fontSize: FONTS.xs, fontWeight: '800' },
  ltvBarBg: { height: 8, backgroundColor: COLORS.card, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.xs },
  ltvBarFill: { height: '100%', borderRadius: 4 },
  ltvLabel: { fontSize: FONTS.xs, color: COLORS.textMuted },

  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.base, gap: SPACING.sm,
  },
  metricCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  metricIcon: { fontSize: 20, marginBottom: SPACING.xs },
  metricLabel: { fontSize: FONTS.xs, color: COLORS.textMuted, marginBottom: 2 },
  metricValue: { fontSize: FONTS.md, fontWeight: '900', color: COLORS.text },

  infoCard: {
    margin: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  infoCardTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.md },
  rateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  rateBadge: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center',
  },
  rateValue: { fontSize: FONTS.lg, fontWeight: '900', color: COLORS.text },
  rateLabel: { fontSize: FONTS.xs, color: COLORS.textMuted },
  ratePlus: { fontSize: FONTS.xl, color: COLORS.textMuted, fontWeight: '900' },

  activeLoanCard: {
    backgroundColor: '#1A0000', borderRadius: RADIUS.lg,
    padding: SPACING.base, borderWidth: 1, borderColor: COLORS.red + '44', gap: SPACING.sm,
  },
  activeLoanRow: { flexDirection: 'row', justifyContent: 'space-between' },
  activeLoanLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },
  activeLoanValue: { fontSize: FONTS.sm, fontWeight: '800', color: COLORS.text },
  noLoanCard: {
    backgroundColor: '#001A00', borderRadius: RADIUS.lg,
    padding: SPACING.base, borderWidth: 1, borderColor: COLORS.green + '44',
  },
  noLoanText: { fontSize: FONTS.sm, color: COLORS.green, fontWeight: '700' },

  loanActions: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.base },
  loanActionButton: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  loanActionGradient: { padding: SPACING.base, alignItems: 'center' },
  loanActionIcon: { fontSize: 28, marginBottom: SPACING.xs },
  loanActionText: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.text },
  loanActionSub: { fontSize: FONTS.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  eduCard: {
    margin: SPACING.base, backgroundColor: '#001020',
    borderRadius: RADIUS.xl, padding: SPACING.base,
    borderLeftWidth: 3, borderLeftColor: COLORS.blue,
  },
  eduTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm },
  eduText: { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 22 },

  howCard: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
  howStep: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  howStepText: { fontSize: FONTS.xs, fontWeight: '900', color: COLORS.text },
  howContent: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  howIcon: { fontSize: 28 },
  howText: { flex: 1 },
  howTitle: { fontSize: FONTS.md, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  howDesc: { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20 },
  howConnector: { width: 2, height: 20, backgroundColor: COLORS.cardBorder, marginLeft: 15, marginVertical: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.modal, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl,
    borderTopWidth: 1, borderColor: COLORS.cardBorder,
  },
  modalTitle: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs },
  modalSub: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  modalInput: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    fontSize: FONTS.lg, color: COLORS.text, fontWeight: '700',
    marginBottom: SPACING.lg, textAlign: 'center',
  },
  modalBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
  modalBtnGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  modalBtnText: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  modalCancel: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sm, paddingVertical: SPACING.sm },
});
