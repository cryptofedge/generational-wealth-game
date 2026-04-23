import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { getPolicyMetrics, formatMoney } from '../engine/IBCEngine';
import { getLevelInfo, COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

export default function GameScreen() {
  const { state, actions, computed } = useGame();
  const { player, finances, game } = state;
  const [showPolicySetup, setShowPolicySetup] = useState(!finances.policy);
  const [premiumInput, setPremiumInput] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);
  const [additionalPremium, setAdditionalPremium] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const levelInfo = getLevelInfo(player.xp);

  const policy = finances.policy;
  const metrics = policy ? getPolicyMetrics(policy) : null;

  // Progress bar (22-65 = 43 years)
  const ageProgress = (player.age - 22) / 43;

  function handleOpenPolicy() {
    const amount = parseInt(premiumInput, 10);
    if (isNaN(amount) || amount < 100) return;
    actions.openPolicy(amount);
    setShowPolicySetup(false);
  }

  function handleAdvanceYear() {
    const extra = parseInt(additionalPremium, 10) || 0;
    actions.advanceYear(extra);
    setShowYearModal(false);
    setAdditionalPremium('');
  }

  const suggestedPremium = Math.round(player.income * 0.10 / 12); // 10% of income / month

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ââ Top Bar: Age + XP ââ */}
        <LinearGradient colors={['#1A0A00', '#0A0A0A']} style={styles.topBar}>
          <View style={styles.topLeft}>
            <Text style={styles.generationLabel}>GEN {player.generation}</Text>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.levelTitle}>
              Lvl {levelInfo.current.level} â¢ {levelInfo.current.title}
            </Text>
          </View>
          <View style={styles.ageCircle}>
            <Text style={styles.ageBig}>{player.age}</Text>
            <Text style={styles.ageLabel}>age</Text>
          </View>
        </LinearGradient>

        {/* XP Bar */}
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarBg}>
            <Animated.View
              style={[styles.xpBarFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]}
            />
          </View>
          <Text style={styles.xpText}>{player.xp.toLocaleString()} XP</Text>
        </View>

        {/* Life Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineBg}>
            <View style={[styles.timelineFill, { width: `${ageProgress * 100}%` }]} />
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>22</Text>
            <Text style={styles.timelineCenter}>{Math.round(43 - (43 * ageProgress))} years to retirement</Text>
            <Text style={styles.timelineLabel}>65</Text>
          </View>
        </View>

        {/* ââ Net Worth Card ââ */}
        <LinearGradient colors={GRADIENTS.hero} style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
          <Text style={styles.netWorthValue}>{formatMoney(computed.netWorth)}</Text>
          <View style={styles.netWorthRow}>
            <View style={styles.netWorthStat}>
              <Text style={styles.netWorthStatLabel}>Savings</Text>
              <Text style={styles.netWorthStatValue}>{formatMoney(finances.savings)}</Text>
            </View>
            {policy && (
              <View style={styles.netWorthStat}>
                <Text style={styles.netWorthStatLabel}>Policy Equity</Text>
                <Text style={[styles.netWorthStatValue, { color: COLORS.gold }]}>
                  {formatMoney(policy.cashValue - policy.loanBalance)}
                </Text>
              </View>
            )}
            <View style={styles.netWorthStat}>
              <Text style={styles.netWorthStatLabel}>IBC Moves</Text>
              <Text style={[styles.netWorthStatValue, { color: COLORS.green }]}>
                {game.ibcChoices}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ââ Income Card ââ */}
        <View style={styles.sectionRow}>
          <View style={[styles.miniCard, styles.incomeCard]}>
            <Text style={styles.miniCardIcon}>ð°</Text>
            <Text style={styles.miniCardLabel}>Annual Income</Text>
            <Text style={styles.miniCardValue}>{formatMoney(player.income)}</Text>
          </View>
          <View style={[styles.miniCard, styles.expenseCard]}>
            <Text style={styles.miniCardIcon}>ð </Text>
            <Text style={styles.miniCardLabel}>Annual Expenses</Text>
            <Text style={[styles.miniCardValue, { color: COLORS.red }]}>
              {formatMoney(finances.annualExpenses)}
            </Text>
          </View>
        </View>

        {/* ââ IBC Policy Section ââ */}
        {!policy ? (
          <TouchableOpacity
            style={styles.openPolicyCard}
            onPress={() => setShowPolicySetup(true)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#1A1A1A', '#222222']} style={styles.openPolicyGradient}>
              <Text style={styles.openPolicyIcon}>ð¦</Text>
              <Text style={styles.openPolicyTitle}>Open Your IBC Policy</Text>
              <Text style={styles.openPolicySubtitle}>
                Start your whole life insurance policy and become your own bank.
              </Text>
              <View style={styles.openPolicyButton}>
                <Text style={styles.openPolicyButtonText}>TAP TO OPEN POLICY â</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <View>
                <Text style={styles.policyTitle}>ð¦ Your IBC Policy</Text>
                <Text style={styles.policyYear}>Year {metrics.policyYear} of policy</Text>
              </View>
              <View style={[styles.healthBadge, { backgroundColor: metrics.healthColor + '22' }]}>
                <Text style={[styles.healthText, { color: metrics.healthColor }]}>
                  {metrics.health}
                </Text>
              </View>
            </View>

            <View style={styles.policyGrid}>
              {[
                { label: 'Cash Value', value: formatMoney(metrics.cashValue), color: COLORS.gold },
                { label: 'Available Loan', value: formatMoney(metrics.availableLoan), color: COLORS.green },
                { label: 'Loan Balance', value: formatMoney(metrics.loanBalance), color: metrics.loanBalance > 0 ? COLORS.red : COLORS.textMuted },
                { label: 'Death Benefit', value: formatMoney(metrics.deathBenefit), color: COLORS.blue },
              ].map((item, i) => (
                <View key={i} style={styles.policyGridItem}>
                  <Text style={styles.policyGridLabel}>{item.label}</Text>
                  <Text style={[styles.policyGridValue, { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            {/* Loan-to-value bar */}
            <View style={styles.ltvContainer}>
              <Text style={styles.ltvLabel}>Loan-to-Value: {metrics.loanToValue}%</Text>
              <View style={styles.ltvBarBg}>
                <View
                  style={[
                    styles.ltvBarFill,
                    {
                      width: `${metrics.loanToValue}%`,
                      backgroundColor: metrics.healthColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Annual Premium */}
            <View style={styles.premiumRow}>
              <Text style={styles.premiumLabel}>ð Annual Premium</Text>
              <Text style={styles.premiumValue}>{formatMoney(policy.annualPremium)}/yr</Text>
            </View>
          </View>
        )}

        {/* ââ Strategy Tip ââ */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>ð¡</Text>
          <Text style={styles.tipText}>
            {!policy
              ? 'Open your IBC policy first. It\'s the foundation of your banking system.'
              : policy.loanBalance > 0
              ? 'You have an outstanding policy loan. Repay it to restore your borrowing capacity.'
              : 'Your policy is in great shape! Use it to fund your next life event.'}
          </Text>
        </View>

        {/* ââ Advance Year Button ââ */}
        <TouchableOpacity
          style={styles.advanceButton}
          onPress={() => setShowYearModal(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.advanceGradient}>
            <Text style={styles.advanceText}>â© ADVANCE TO YEAR {player.age + 1}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Retire button when eligible */}
        {player.age >= 60 && (
          <TouchableOpacity
            style={styles.retireButton}
            onPress={() => actions.startLegacy()}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENTS.gold} style={styles.retireGradient}>
              <Text style={styles.retireText}>ðï¸ RETIRE & BUILD LEGACY</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* ââ Policy Setup Modal ââ */}
      <Modal visible={showPolicySetup} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ð¦ Open Your IBC Policy</Text>
            <Text style={styles.modalSubtitle}>
              Choose your annual premium. More premium = faster cash value growth.
            </Text>

            <View style={styles.suggestBox}>
              <Text style={styles.suggestLabel}>Suggested: {formatMoney(suggestedPremium * 12)}/yr</Text>
              <Text style={styles.suggestSub}>(10% of your income)</Text>
            </View>

            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder={`e.g. ${suggestedPremium * 12}`}
              placeholderTextColor={COLORS.textMuted}
              value={premiumInput}
              onChangeText={setPremiumInput}
            />

            <Text style={styles.modalHint}>
              Minimum: $1,200/yr â¢ Max recommended: {formatMoney(player.income * 0.20)}/yr
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleOpenPolicy}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>OPEN POLICY</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPolicySetup(false)}>
              <Text style={styles.modalCancel}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ââ Year Advance Modal ââ */}
      <Modal visible={showYearModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ð Advance to Age {player.age + 1}</Text>
            <Text style={styles.modalSubtitle}>
              Another year of compounding. Add extra premium to supercharge your policy.
            </Text>

            {policy && (
              <View style={styles.yearSummaryBox}>
                <View style={styles.yearRow}>
                  <Text style={styles.yearLabel}>Annual Premium Due</Text>
                  <Text style={styles.yearValue}>{formatMoney(policy.annualPremium)}</Text>
                </View>
                <View style={styles.yearRow}>
                  <Text style={styles.yearLabel}>Estimated Cash Value Growth</Text>
                  <Text style={[styles.yearValue, { color: COLORS.green }]}>
                    +{formatMoney(policy.cashValue * 0.06)}
                  </Text>
                </View>
                <View style={styles.yearRow}>
                  <Text style={styles.yearLabel}>Income this Year</Text>
                  <Text style={styles.yearValue}>{formatMoney(player.income)}</Text>
                </View>
              </View>
            )}

            {policy && (
              <>
                <Text style={styles.modalHint}>Add extra premium (PUA)?</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="Extra amount (optional)"
                  placeholderTextColor={COLORS.textMuted}
                  value={additionalPremium}
                  onChangeText={setAdditionalPremium}
                />
              </>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={handleAdvanceYear}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>â© ADVANCE YEAR</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowYearModal(false)}>
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

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.base,
  },
  topLeft: {},
  generationLabel: { fontSize: FONTS.xs, color: COLORS.primary, fontWeight: '800', letterSpacing: 2 },
  playerName: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text },
  levelTitle: { fontSize: FONTS.sm, color: COLORS.gold },
  ageCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
  ageBig: { fontSize: FONTS.xxl, fontWeight: '900', color: COLORS.text },
  ageLabel: { fontSize: FONTS.xs, color: COLORS.text, marginTop: -4 },

  // XP Bar
  xpBarContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xs, gap: SPACING.sm,
  },
  xpBarBg: { flex: 1, height: 6, backgroundColor: COLORS.card, borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  xpText: { fontSize: FONTS.xs, color: COLORS.gold, width: 70, textAlign: 'right' },

  // Timeline
  timelineContainer: {
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.base,
  },
  timelineBg: { height: 4, backgroundColor: COLORS.card, borderRadius: 2, overflow: 'hidden' },
  timelineFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  timelineLabels: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.xs,
  },
  timelineLabel: { fontSize: FONTS.xs, color: COLORS.textMuted },
  timelineCenter: { fontSize: FONTS.xs, color: COLORS.textSecondary },

  // Net Worth Card
  netWorthCard: {
    marginHorizontal: SPACING.base, borderRadius: RADIUS.xl,
    padding: SPACING.xl, marginBottom: SPACING.base,
  },
  netWorthLabel: { fontSize: FONTS.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  netWorthValue: { fontSize: FONTS.hero, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.md },
  netWorthRow: { flexDirection: 'row', gap: SPACING.base },
  netWorthStat: { flex: 1 },
  netWorthStatLabel: { fontSize: FONTS.xs, color: 'rgba(255,255,255,0.6)' },
  netWorthStatValue: { fontSize: FONTS.md, fontWeight: '800', color: COLORS.text },

  // Mini Cards
  sectionRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.base },
  miniCard: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg, padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  incomeCard: { borderColor: '#1A3A1A' },
  expenseCard: { borderColor: '#3A1A1A' },
  miniCardIcon: { fontSize: 24, marginBottom: SPACING.xs },
  miniCardLabel: { fontSize: FONTS.xs, color: COLORS.textMuted, marginBottom: 2 },
  miniCardValue: { fontSize: FONTS.md, fontWeight: '800', color: COLORS.green },

  // Policy Card
  openPolicyCard: {
    marginHorizontal: SPACING.base, borderRadius: RADIUS.xl,
    overflow: 'hidden', marginBottom: SPACING.base,
    borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed',
  },
  openPolicyGradient: { padding: SPACING.xl, alignItems: 'center' },
  openPolicyIcon: { fontSize: 48, marginBottom: SPACING.sm },
  openPolicyTitle: { fontSize: FONTS.lg, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs },
  openPolicySubtitle: { fontSize: FONTS.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  openPolicyButton: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
  },
  openPolicyButtonText: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },

  policyCard: {
    marginHorizontal: SPACING.base, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#FF6B0033',
    padding: SPACING.base, marginBottom: SPACING.base,
  },
  policyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  policyTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text },
  policyYear: { fontSize: FONTS.xs, color: COLORS.textMuted },
  healthBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  healthText: { fontSize: FONTS.xs, fontWeight: '800' },
  policyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  policyGridItem: { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm },
  policyGridLabel: { fontSize: FONTS.xs, color: COLORS.textMuted },
  policyGridValue: { fontSize: FONTS.base, fontWeight: '800', marginTop: 2 },
  ltvContainer: { marginBottom: SPACING.sm },
  ltvLabel: { fontSize: FONTS.xs, color: COLORS.textMuted, marginBottom: SPACING.xs },
  ltvBarBg: { height: 6, backgroundColor: COLORS.surface, borderRadius: 3, overflow: 'hidden' },
  ltvBarFill: { height: '100%', borderRadius: 3 },
  premiumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  premiumLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },
  premiumValue: { fontSize: FONTS.sm, fontWeight: '800', color: COLORS.primary },

  // Tip Card
  tipCard: {
    flexDirection: 'row', gap: SPACING.sm,
    marginHorizontal: SPACING.base, backgroundColor: '#1A1500',
    borderRadius: RADIUS.lg, padding: SPACING.base,
    borderLeftWidth: 3, borderLeftColor: COLORS.gold,
    marginBottom: SPACING.base,
  },
  tipIcon: { fontSize: 20 },
  tipText: { flex: 1, fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20 },

  // Advance Button
  advanceButton: {
    marginHorizontal: SPACING.base, borderRadius: RADIUS.lg,
    overflow: 'hidden', marginBottom: SPACING.md,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
  },
  advanceGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  advanceText: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },

  retireButton: {
    marginHorizontal: SPACING.base, borderRadius: RADIUS.lg,
    overflow: 'hidden', marginBottom: SPACING.md,
  },
  retireGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  retireText: { fontSize: FONTS.base, fontWeight: '900', color: '#000' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.modal, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    borderTopWidth: 1, borderColor: COLORS.cardBorder,
  },
  modalTitle: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs },
  modalSubtitle: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 20 },
  suggestBox: {
    backgroundColor: '#1A1A00', borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.gold,
  },
  suggestLabel: { fontSize: FONTS.base, fontWeight: '800', color: COLORS.gold },
  suggestSub: { fontSize: FONTS.xs, color: COLORS.textMuted },
  modalInput: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    fontSize: FONTS.lg, color: COLORS.text, fontWeight: '700',
    marginBottom: SPACING.sm, textAlign: 'center',
  },
  modalHint: { fontSize: FONTS.xs, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg },
  modalButton: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
  modalButtonGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  modalButtonText: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  modalCancel: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sm, paddingVertical: SPACING.sm },
  yearSummaryBox: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.base, marginBottom: SPACING.md, gap: SPACING.sm,
  },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between' },
  yearLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },
  yearValue: { fontSize: FONTS.sm, fontWeight: '800', color: COLORS.text },
});
