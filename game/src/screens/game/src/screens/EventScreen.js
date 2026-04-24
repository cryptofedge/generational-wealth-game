import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { compareLoanOptions, formatMoney } from '../engine/IBCEngine';
import { EVENT_TYPES } from '../engine/LifeEvents';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

export default function EventScreen() {
  const { state, actions, computed } = useGame();
  const event = state.game.currentEvent;
  const policy = state.finances.policy;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [event?.id]);

  if (!event) return null;

  const comparison = event.cost > 0 && policy
    ? compareLoanOptions(event.cost, 0.07, 5, policy)
    : null;

  const eventColors = {
    [EVENT_TYPES.OPPORTUNITY]: { border: COLORS.green, bg: '#001A00', icon: 'ð' },
    [EVENT_TYPES.EMERGENCY]:   { border: COLORS.red,   bg: '#1A0000', icon: 'â¡' },
    [EVENT_TYPES.MILESTONE]:   { border: COLORS.blue,  bg: '#00001A', icon: 'ð¯' },
    [EVENT_TYPES.BONUS]:       { border: COLORS.gold,  bg: '#1A1400', icon: 'ð°' },
  };
  const ec = eventColors[event.type] || eventColors[EVENT_TYPES.MILESTONE];

  function handleChoice(choiceType) {
    actions.resolveEvent(choiceType);
  }

  const hasPolicyLoan = policy && event.cost > 0;
  const availableLoan = policy
    ? Math.max(0, policy.cashValue * 0.9 - policy.loanBalance)
    : 0;
  const canUsePolicyLoan = hasPolicyLoan && availableLoan >= event.cost * 0.5;

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ââ Event Header ââ */}
          <View style={[styles.eventHeader, { backgroundColor: ec.bg, borderBottomColor: ec.border }]}>
            <View style={styles.eventTypeBadge}>
              <Text style={[styles.eventTypeText, { color: ec.border }]}>
                {event.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDesc}>{event.description}</Text>

            {event.cost > 0 && (
              <View style={styles.costBadge}>
                <Text style={styles.costLabel}>Cost</Text>
                <Text style={styles.costValue}>{formatMoney(event.cost)}</Text>
              </View>
            )}
            {event.windfall > 0 && (
              <View style={[styles.costBadge, styles.windfallBadge]}>
                <Text style={styles.costLabel}>Windfall</Text>
                <Text style={[styles.costValue, { color: COLORS.green }]}>
                  +{formatMoney(event.windfall)}
                </Text>
              </View>
            )}
          </View>

          {/* ââ IBC vs Bank Comparison ââ */}
          {comparison && (
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>ð¸ Cost Comparison</Text>
              <View style={styles.comparisonRow}>
                <View style={[styles.comparisonSide, styles.bankSide]}>
                  <Text style={styles.comparisonSideLabel}>ð¦ Bank Loan</Text>
                  <Text style={styles.comparisonTotal}>{formatMoney(comparison.bank.totalPaid)}</Text>
                  <Text style={styles.comparisonSub}>Total paid</Text>
                  <Text style={[styles.comparisonInterest, { color: COLORS.red }]}>
                    -{formatMoney(comparison.bank.interestPaid)} interest
                  </Text>
                </View>
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={[styles.comparisonSide, styles.ibcSide]}>
                  <Text style={styles.comparisonSideLabel}>ðï¸ IBC Policy</Text>
                  <Text style={[styles.comparisonTotal, { color: COLORS.green }]}>
                    {formatMoney(event.cost + comparison.policy.totalInterest)}
                  </Text>
                  <Text style={styles.comparisonSub}>Total cost</Text>
                  <Text style={[styles.comparisonInterest, { color: COLORS.green }]}>
                    Cash value still grows!
                  </Text>
                </View>
              </View>
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsText}>
                  You save {formatMoney(comparison.savings)} using IBC! ðª
                </Text>
              </View>
            </View>
          )}

          {/* ââ Choice Cards ââ */}
          <Text style={styles.choicesLabel}>MAKE YOUR DECISION:</Text>

          {/* IBC Option */}
          <TouchableOpacity
            style={[styles.choiceCard, styles.ibcCard, !canUsePolicyLoan && styles.choiceCardDisabled]}
            onPress={() => canUsePolicyLoan || !event.cost ? handleChoice('ibc') : null}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#1A0D00', '#0D0700']} style={styles.choiceGradient}>
              <View style={styles.choiceHeader}>
                <View style={styles.choiceIconCircle}>
                  <Text style={styles.choiceIcon}>ðï¸</Text>
                </View>
                <View style={styles.choiceHeaderText}>
                  <Text style={styles.choiceLabel}>BEST MOVE</Text>
                  <Text style={styles.choiceTitle}>{event.ibcOption?.label}</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+{event.ibcOption?.xpBonus} XP</Text>
                </View>
              </View>

              <Text style={styles.choiceDesc}>{event.ibcOption?.description}</Text>

              {!canUsePolicyLoan && event.cost > 0 && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    â ï¸ Insufficient policy capacity. Available: {formatMoney(availableLoan)}
                  </Text>
                </View>
              )}

              <View style={styles.wealthImpact}>
                <Text style={styles.wealthImpactLabel}>Wealth Impact</Text>
                <Text style={[
                  styles.wealthImpactValue,
                  { color: (event.ibcOption?.wealthImpact || 0) >= 0 ? COLORS.green : COLORS.primary },
                ]}>
                  {(event.ibcOption?.wealthImpact || 0) >= 0 ? '+' : ''}
                  {formatMoney(event.ibcOption?.wealthImpact || 0)}
                </Text>
              </View>

              <View style={[styles.choiceButton, styles.ibcButton]}>
                <Text style={styles.choiceButtonText}>USE IBC POLICY â</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bank Option */}
          <TouchableOpacity
            style={[styles.choiceCard, styles.bankCard]}
            onPress={() => handleChoice('bank')}
            activeOpacity={0.85}
          >
            <View style={styles.choiceGradient}>
              <View style={styles.choiceHeader}>
                <View style={[styles.choiceIconCircle, { backgroundColor: '#1A1A2A' }]}>
                  <Text style={styles.choiceIcon}>ð¦</Text>
                </View>
                <View style={styles.choiceHeaderText}>
                  <Text style={[styles.choiceLabel, { color: COLORS.textMuted }]}>TRADITIONAL</Text>
                  <Text style={styles.choiceTitle}>{event.bankOption?.label}</Text>
                </View>
              </View>
              <Text style={styles.choiceDesc}>{event.bankOption?.description}</Text>
              <View style={styles.wealthImpact}>
                <Text style={styles.wealthImpactLabel}>Wealth Impact</Text>
                <Text style={[
                  styles.wealthImpactValue,
                  { color: (event.bankOption?.wealthImpact || 0) >= 0 ? COLORS.green : COLORS.red },
                ]}>
                  {(event.bankOption?.wealthImpact || 0) >= 0 ? '+' : ''}
                  {formatMoney(event.bankOption?.wealthImpact || 0)}
                </Text>
              </View>
              <View style={[styles.choiceButton, styles.bankButton]}>
                <Text style={[styles.choiceButtonText, { color: COLORS.text }]}>
                  USE BANK OPTION â
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Cash/Skip Option */}
          {event.cashOption && (
            <TouchableOpacity
              style={[styles.choiceCard, styles.cashCard]}
              onPress={() => handleChoice('cash')}
              activeOpacity={0.85}
            >
              <View style={styles.choiceGradient}>
                <View style={styles.choiceHeader}>
                  <View style={[styles.choiceIconCircle, { backgroundColor: '#1A1A1A' }]}>
                    <Text style={styles.choiceIcon}>ðµ</Text>
                  </View>
                  <View style={styles.choiceHeaderText}>
                    <Text style={[styles.choiceLabel, { color: COLORS.textMuted }]}>ALTERNATIVE</Text>
                    <Text style={styles.choiceTitle}>{event.cashOption?.label}</Text>
                  </View>
                </View>
                <Text style={styles.choiceDesc}>{event.cashOption?.description}</Text>
                <View style={styles.wealthImpact}>
                  <Text style={styles.wealthImpactLabel}>Wealth Impact</Text>
                  <Text style={[
                    styles.wealthImpactValue,
                    { color: (event.cashOption?.wealthImpact || 0) >= 0 ? COLORS.green : COLORS.textSecondary },
                  ]}>
                    {(event.cashOption?.wealthImpact || 0) >= 0 ? '+' : ''}
                    {formatMoney(event.cashOption?.wealthImpact || 0)}
                  </Text>
                </View>
                <View style={[styles.choiceButton, { backgroundColor: COLORS.card }]}>
                  <Text style={[styles.choiceButtonText, { color: COLORS.text }]}>
                    {event.cashOption?.label.toUpperCase()} â
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* IBC Streak indicator */}
          {state.player.ibcStreak > 0 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakText}>
                ð¥ IBC Streak: {state.player.ibcStreak} in a row! Keep it up for bonus XP!
              </Text>
            </View>
          )}

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: SPACING.xxxl },

  // Event Header
  eventHeader: {
    padding: SPACING.xl,
    borderBottomWidth: 2,
    marginBottom: SPACING.base,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  eventTypeText: { fontSize: FONTS.xs, fontWeight: '900', letterSpacing: 2 },
  eventTitle: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm },
  eventDesc: { fontSize: FONTS.md, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.md },
  costBadge: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
  },
  windfallBadge: { borderWidth: 1, borderColor: COLORS.green },
  costLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },
  costValue: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text },

  // Comparison
  comparisonCard: {
    marginHorizontal: SPACING.base, backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl, padding: SPACING.base,
    marginBottom: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  comparisonTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.md },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  comparisonSide: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  bankSide: { borderTopWidth: 2, borderTopColor: COLORS.red },
  ibcSide: { borderTopWidth: 2, borderTopColor: COLORS.green },
  comparisonSideLabel: { fontSize: FONTS.xs, color: COLORS.textMuted, marginBottom: SPACING.xs },
  comparisonTotal: { fontSize: FONTS.lg, fontWeight: '900', color: COLORS.text },
  comparisonSub: { fontSize: FONTS.xs, color: COLORS.textMuted },
  comparisonInterest: { fontSize: FONTS.xs, fontWeight: '700', marginTop: 2 },
  vsCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  vsText: { fontSize: FONTS.xs, fontWeight: '900', color: COLORS.textMuted },
  savingsBanner: {
    backgroundColor: '#001A00', borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.green,
  },
  savingsText: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.green },

  // Choices
  choicesLabel: {
    fontSize: FONTS.xs, fontWeight: '900', color: COLORS.textMuted,
    letterSpacing: 2, paddingHorizontal: SPACING.xl, marginBottom: SPACING.sm,
  },
  choiceCard: {
    marginHorizontal: SPACING.base, borderRadius: RADIUS.xl,
    marginBottom: SPACING.md, overflow: 'hidden', borderWidth: 1,
  },
  ibcCard: { borderColor: COLORS.primary },
  bankCard: { borderColor: COLORS.cardBorder, backgroundColor: COLORS.card },
  cashCard: { borderColor: COLORS.cardBorder, backgroundColor: COLORS.card },
  choiceCardDisabled: { opacity: 0.5 },
  choiceGradient: { padding: SPACING.base },
  choiceHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  choiceIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2A1400', alignItems: 'center', justifyContent: 'center',
  },
  choiceIcon: { fontSize: 22 },
  choiceHeaderText: { flex: 1 },
  choiceLabel: { fontSize: FONTS.xs, fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },
  choiceTitle: { fontSize: FONTS.base, fontWeight: '800', color: COLORS.text },
  xpBadge: {
    backgroundColor: COLORS.gold + '22', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.gold,
  },
  xpBadgeText: { fontSize: FONTS.xs, fontWeight: '800', color: COLORS.gold },
  choiceDesc: { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  warningBox: {
    backgroundColor: '#1A0A00', borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.sm,
  },
  warningText: { fontSize: FONTS.xs, color: COLORS.primary },
  wealthImpact: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
  },
  wealthImpactLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },
  wealthImpactValue: { fontSize: FONTS.sm, fontWeight: '900' },
  choiceButton: { borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  ibcButton: { backgroundColor: COLORS.primary },
  bankButton: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  choiceButtonText: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },

  streakBanner: {
    marginHorizontal: SPACING.base, backgroundColor: '#1A0A00',
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center',
  },
  streakText: { fontSize: FONTS.sm, color: COLORS.primary, fontWeight: '700' },
});
