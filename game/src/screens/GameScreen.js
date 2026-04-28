/**
 * GameScreen.js
 * Main gameplay screen — shown during the 'playing' phase.
 * Displays HUD stats, net-worth chart, policy prompt or summary,
 * year summary after an event resolves, and the Advance Year button.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { POLICY_CONSTANTS } from '../engine/IBCEngine';
import { getLevelInfo, COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

// ─── Mini Net-Worth Bar Chart ─────────────────────────────────────────────────

function NetWorthChart({ history }) {
  if (history.length < 2) return null;
  const values = history.map((h) => h.netWorth);
  const max = Math.max(...values, 1);
  const BAR_H = 64;

  return (
    <View style={chart.wrap}>
      <Text style={chart.title}>📈 Net Worth History</Text>
      <View style={chart.bars}>
        {values.map((v, i) => {
          const h = Math.max(4, Math.round((Math.max(0, v) / max) * BAR_H));
          const isLast = i === values.length - 1;
          return (
            <View
              key={i}
              style={[
                chart.bar,
                { height: h, backgroundColor: isLast ? COLORS.primary : COLORS.surface },
              ]}
            />
          );
        })}
      </View>
      <View style={chart.labels}>
        <Text style={chart.labelText}>Age {history[0]?.age}</Text>
        <Text style={[chart.labelText, { color: COLORS.primary }]}>
          {fmt(values[values.length - 1])}
        </Text>
        <Text style={chart.labelText}>Age {history[history.length - 1]?.age}</Text>
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 3 },
  bar: { flex: 1, borderRadius: 3, minWidth: 3 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  labelText: { fontSize: FONTS.xs, color: COLORS.textMuted },
});

// ─── Open Policy Prompt ───────────────────────────────────────────────────────

function OpenPolicyPrompt() {
  const { state, actions, formatMoney } = useGame();
  const income = state.player.income;
  const opts = [
    { pct: 5,  label: '5%',  amount: Math.round((income * 0.05) / 100) * 100 },
    { pct: 10, label: '10%', amount: Math.round((income * 0.10) / 100) * 100 },
    { pct: 15, label: '15%', amount: Math.round((income * 0.15) / 100) * 100 },
  ];
  const [selected, setSelected] = useState(opts[1].amount);
  const mecRisk = selected / income > POLICY_CONSTANTS.MEC_RATIO;

  function open() {
    actions.openPolicy(selected);
  }

  return (
    <View style={op.card}>
      <Text style={op.icon}>🏦</Text>
      <Text style={op.title}>Open Your IBC Policy</Text>
      <Text style={op.desc}>
        Fund a dividend-paying whole life policy. Your cash value grows at 4.5% guaranteed
        + dividends, and you can borrow against it instantly — no credit check, no bank.
      </Text>

      <Text style={op.label}>SELECT ANNUAL PREMIUM</Text>
      <View style={op.grid}>
        {opts.map((o) => (
          <TouchableOpacity
            key={o.pct}
            style={[op.opt, selected === o.amount && op.optSel]}
            onPress={() => setSelected(o.amount)}
            activeOpacity={0.8}
          >
            <Text style={[op.optAmt, selected === o.amount && op.optAmtSel]}>
              {formatMoney(o.amount)}
            </Text>
            <Text style={op.optPct}>{o.label} income</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mecRisk && (
        <View style={op.mecWarn}>
          <Text style={op.mecIcon}>⚠️</Text>
          <Text style={op.mecText}>
            Premium {'>'} 25% of income. MEC risk — XP bonus reduced to 250 and tax-free
            growth advantage may be limited. Consider a lower premium.
          </Text>
        </View>
      )}

      <TouchableOpacity style={op.btn} onPress={open} activeOpacity={0.85}>
        <LinearGradient colors={GRADIENTS.primary} style={op.btnGrad}>
          <Text style={op.btnText}>OPEN POLICY  {mecRisk ? '(+250 XP)' : '(+500 XP)'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const op = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    alignItems: 'center',
  },
  icon: { fontSize: 48, marginBottom: SPACING.sm },
  title: { fontSize: FONTS.lg, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs },
  desc: {
    fontSize: FONTS.sm, color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.xs, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 1, marginBottom: SPACING.sm, alignSelf: 'flex-start',
  },
  grid: { flexDirection: 'row', gap: SPACING.sm, width: '100%', marginBottom: SPACING.md },
  opt: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  optSel: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  optAmt: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.textSecondary },
  optAmtSel: { color: COLORS.primary },
  optPct: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 2 },
  mecWarn: {
    flexDirection: 'row', gap: SPACING.xs, backgroundColor: '#1A1000',
    borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.gold, width: '100%',
  },
  mecIcon: { fontSize: 16 },
  mecText: { flex: 1, fontSize: FONTS.xs, color: COLORS.gold, lineHeight: 18 },
  btn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGrad: { paddingVertical: SPACING.md, alignItems: 'center' },
  btnText: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
});

// ─── Year Summary Card ────────────────────────────────────────────────────────

function YearSummaryCard({ summary, formatMoney }) {
  if (!summary) return null;
  const { income, expenses, surplus, savingsGrowth, policySummary } = summary;
  return (
    <View style={ys.card}>
      <Text style={ys.title}>📅 Year Summary</Text>
      <Row label="Income Earned"     value={`+${formatMoney(income)}`}   color={COLORS.green} />
      <Row label="Living Expenses"   value={`-${formatMoney(expenses)}`} color={COLORS.red} />
      <Row
        label="Net Saved"
        value={`${surplus >= 0 ? '+' : ''}${formatMoney(surplus)}`}
        color={surplus >= 0 ? COLORS.green : COLORS.red}
        bold
      />
      {savingsGrowth > 0 && (
        <Row label="Savings Interest (4%)" value={`+${formatMoney(savingsGrowth)}`} color={COLORS.textSecondary} />
      )}
      {policySummary && (
        <>
          <View style={ys.divider} />
          <Row label="Policy Growth" value={`+${formatMoney(policySummary.guaranteedGrowth)}`} color={COLORS.gold} />
          <Row label="Dividends"     value={`+${formatMoney(policySummary.dividend)}`}         color={COLORS.gold} />
          {policySummary.loanInterest > 0 && (
            <Row label="Loan Interest" value={`-${formatMoney(policySummary.loanInterest)}`} color={COLORS.red} />
          )}
        </>
      )}
    </View>
  );
}

function Row({ label, value, color, bold }) {
  return (
    <View style={ys.row}>
      <Text style={ys.rowLabel}>{label}</Text>
      <Text style={[ys.rowValue, { color: color || COLORS.text }, bold && { fontWeight: '900' }]}>
        {value}
      </Text>
    </View>
  );
}

const ys = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.base, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: FONTS.sm, fontWeight: '900', color: COLORS.textMuted,
    letterSpacing: 1, marginBottom: SPACING.sm,
  },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: SPACING.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: FONTS.sm, color: COLORS.textSecondary },
  rowValue: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.text },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GameScreen() {
  const { state, actions, computed, formatMoney } = useGame();
  const { player, finances, game } = state;
  const policy = finances.policy;
  const li = getLevelInfo(player.xp);
  const isRetired = player.age >= 65;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  function handleAdvanceYear() {
    if (isRetired) {
      actions.startLegacy();
      return;
    }
    const premium = policy ? policy.annualPremium : 0;
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    actions.advanceYear(premium);
  }

  return (
    <View style={styles.container}>
      {/* ── HUD ── */}
      <View style={styles.hud}>
        <View style={styles.hudTop}>
          <View>
            <Text style={styles.hudName}>{player.name}</Text>
            <Text style={styles.hudMeta}>
              Age {player.age} · Year {game.year + 1} · Gen {player.generation}
            </Text>
          </View>
          <View style={styles.hudRight}>
            <Text style={styles.hudLevel}>⚡ {li.current.title}</Text>
            <Text style={styles.hudXP}>{player.xp.toLocaleString()} XP</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${Math.round(li.progress * 100)}%` }]} />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{fmt(finances.savings)}</Text>
            <Text style={styles.statLabel}>Savings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: COLORS.green }]}>
              {policy ? fmt(policy.cashValue) : '—'}
            </Text>
            <Text style={styles.statLabel}>Cash Value</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>
              {fmt(computed.netWorth)}
            </Text>
            <Text style={styles.statLabel}>Net Worth</Text>
          </View>
        </View>

        {/* MEC warning banner */}
        {game.mecWarning && (
          <View style={styles.mecBanner}>
            <Text style={styles.mecBannerText}>
              ⚠️ MEC Risk — Policy overfunded. Some tax advantages may be limited.
            </Text>
          </View>
        )}
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Policy prompt or year summary */}
        {!policy ? (
          <OpenPolicyPrompt />
        ) : (
          <YearSummaryCard summary={game.yearSummary} formatMoney={formatMoney} />
        )}

        {/* Net-worth chart */}
        <NetWorthChart history={finances.yearlyNetWorth} />

        {/* Years-to-retirement badge */}
        {!isRetired && (
          <View style={styles.retireBadge}>
            <Text style={styles.retireBadgeText}>
              🏁  {computed.yearsToRetirement} years until retirement
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Advance Year Button ── */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity
            style={styles.advanceBtn}
            onPress={handleAdvanceYear}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isRetired ? GRADIENTS.gold : GRADIENTS.primary}
              style={styles.advanceGrad}
            >
              <Text style={[styles.advanceText, isRetired && { color: '#000' }]}>
                {isRetired ? '🏆  VIEW LEGACY' : '⚡  NEXT YEAR →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // HUD
  hud: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    padding: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  hudTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  hudName: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text },
  hudMeta: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 2 },
  hudRight: { alignItems: 'flex-end' },
  hudLevel: { fontSize: FONTS.sm, fontWeight: '800', color: COLORS.primary },
  hudXP: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 2 },

  xpBarBg: { height: 4, backgroundColor: COLORS.surface, borderRadius: 2, overflow: 'hidden', marginBottom: SPACING.sm },
  xpBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  stat: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center' },
  statValue: { fontSize: FONTS.md, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.cardBorder },

  mecBanner: {
    marginTop: SPACING.sm,
    backgroundColor: '#1A1000',
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  mecBannerText: { fontSize: FONTS.xs, color: COLORS.gold },

  // Content
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  retireBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.base,
    alignSelf: 'center',
    marginTop: SPACING.xs,
  },
  retireBadgeText: { fontSize: FONTS.xs, color: COLORS.textMuted, fontWeight: '700' },

  // Footer
  footer: {
    padding: SPACING.base,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  advanceBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  advanceGrad: { paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  advanceText: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, letterSpacing: 2 },
});
