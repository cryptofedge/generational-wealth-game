/**
 * EventScreen.js
 * Displayed during the 'event' phase.
 * Shows the current life event and three choice cards (IBC / Bank / Cash).
 * After a choice is tapped a result bottom-sheet slides up before returning
 * to the game.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { EVENT_TYPES } from '../engine/LifeEvents';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META = {
  [EVENT_TYPES.OPPORTUNITY]: { color: COLORS.green,  label: '🟢 OPPORTUNITY',  bg: '#001A00' },
  [EVENT_TYPES.EMERGENCY]:   { color: COLORS.red,    label: '🔴 EMERGENCY',    bg: '#1A0000' },
  [EVENT_TYPES.MILESTONE]:   { color: COLORS.gold,   label: '🟡 MILESTONE',    bg: '#1A1000' },
  [EVENT_TYPES.BONUS]:       { color: COLORS.blue,   label: '🔵 WINDFALL',     bg: '#00001A' },
};

function fmtImpact(n) {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${Math.round(abs / 1000)}K` : `$${Math.round(abs)}`;
  return n >= 0 ? `+${s}` : `-${s}`;
}

// ─── Choice Card ──────────────────────────────────────────────────────────────

function ChoiceCard({ type, option, label, icon, accentColor, recommended, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.choiceCard, { borderColor: disabled ? COLORS.cardBorder : accentColor + '88' }]}
      onPress={disabled ? null : onPress}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {recommended && !disabled && (
        <View style={[styles.recBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.recText}>⭐ RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.choiceHeader}>
        <Text style={styles.choiceIcon}>{icon}</Text>
        <View style={styles.choiceHeaderText}>
          <Text style={[styles.choiceType, { color: disabled ? COLORS.textDisabled : accentColor }]}>
            {label}
          </Text>
          <Text style={[styles.choiceTitle, disabled && { color: COLORS.textDisabled }]}>
            {option.label}
          </Text>
        </View>
      </View>

      <Text style={[styles.choiceDesc, disabled && { color: COLORS.textDisabled }]}>
        {disabled
          ? '⚠️ You need an IBC policy first. Open one from the Game tab.'
          : option.description}
      </Text>

      {!disabled && (
        <View style={styles.choiceFooter}>
          <Text style={[
            styles.choiceImpact,
            { color: (option.wealthImpact || 0) >= 0 ? COLORS.green : COLORS.red },
          ]}>
            Wealth Impact: {fmtImpact(option.wealthImpact || 0)}
          </Text>
          {option.xpBonus && (
            <Text style={styles.choiceXP}>+{option.xpBonus} XP</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Result Sheet ─────────────────────────────────────────────────────────────

function ResultSheet({ visible, choiceType, event, onContinue, formatMoney, netWorth }) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  if (!event || !choiceType) return null;

  const option = choiceType === 'ibc'  ? event.ibcOption
    : choiceType === 'bank' ? event.bankOption
    : event.cashOption;

  const icon = { ibc: '🏦', bank: '🏛️', cash: '💵' }[choiceType];
  const title = {
    ibc:  'Smart IBC Move! 💡',
    bank: 'Bank Route Taken 🏛️',
    cash: 'Cash Decision Made 💵',
  }[choiceType];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={rs.overlay}>
        <Animated.View style={[rs.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={rs.icon}>{icon}</Text>
          <Text style={rs.title}>{title}</Text>
          <Text style={rs.desc}>{option.description}</Text>

          <View style={rs.stats}>
            <View style={rs.statRow}>
              <Text style={rs.statLabel}>Wealth Impact</Text>
              <Text style={[
                rs.statValue,
                { color: (option.wealthImpact || 0) >= 0 ? COLORS.green : COLORS.red },
              ]}>
                {fmtImpact(option.wealthImpact || 0)}
              </Text>
            </View>
            {option.xpBonus && (
              <View style={rs.statRow}>
                <Text style={rs.statLabel}>XP Earned</Text>
                <Text style={[rs.statValue, { color: COLORS.gold }]}>+{option.xpBonus}</Text>
              </View>
            )}
            <View style={rs.statRow}>
              <Text style={rs.statLabel}>New Net Worth</Text>
              <Text style={rs.statValue}>{formatMoney(netWorth)}</Text>
            </View>
          </View>

          <TouchableOpacity style={rs.btn} onPress={onContinue} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.primary} style={rs.btnGrad}>
              <Text style={rs.btnText}>CONTINUE →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const rs = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.modal,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl, paddingBottom: SPACING.xxxl,
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  icon: { fontSize: 56, marginBottom: SPACING.sm },
  title: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  desc: { fontSize: FONTS.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.lg },
  stats: { width: '100%', marginBottom: SPACING.xl },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.surface,
  },
  statLabel: { fontSize: FONTS.sm, color: COLORS.textSecondary },
  statValue: { fontSize: FONTS.sm, fontWeight: '800', color: COLORS.text },
  btn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGrad: { paddingVertical: SPACING.lg, alignItems: 'center' },
  btnText: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, letterSpacing: 2 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EventScreen() {
  const { state, actions, computed, formatMoney } = useGame();
  const event = state.game.currentEvent;
  const hasPolicy = !!state.finances.policy;

  const [pendingChoice, setPendingChoice] = useState(null);

  if (!event) return null;

  const meta = TYPE_META[event.type] || TYPE_META[EVENT_TYPES.MILESTONE];
  const ibcDisabled = !hasPolicy && event.cost > 0;

  function choose(type) {
    setPendingChoice(type);
    actions.resolveEvent(type);
  }

  function continueGame() {
    setPendingChoice(null);
  }

  return (
    <View style={styles.container}>
      {/* ── Event Header ── */}
      <LinearGradient colors={[meta.bg, COLORS.bg]} style={styles.header}>
        <Text style={[styles.typeBadge, { color: meta.color }]}>{meta.label}</Text>
        <Text style={styles.eventEmoji}>{event.title.split(' ')[0]}</Text>
        <Text style={styles.eventTitle}>{event.title.slice(event.title.indexOf(' ') + 1)}</Text>
        <Text style={styles.eventDesc}>{event.description}</Text>
        {event.cost > 0 && (
          <View style={[styles.costBadge, { borderColor: meta.color + '66' }]}>
            <Text style={[styles.costText, { color: meta.color }]}>
              Cost: {formatMoney(event.cost)}
            </Text>
          </View>
        )}
        {event.windfall > 0 && (
          <View style={[styles.costBadge, { borderColor: COLORS.green + '66' }]}>
            <Text style={[styles.costText, { color: COLORS.green }]}>
              Windfall: +{formatMoney(event.windfall)}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* ── Choices ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ChoiceCard
          type="ibc"
          option={event.ibcOption}
          label="IBC STRATEGY"
          icon="🏦"
          accentColor={COLORS.primary}
          recommended
          disabled={ibcDisabled}
          onPress={() => choose('ibc')}
        />
        <ChoiceCard
          type="bank"
          option={event.bankOption}
          label="BANK STRATEGY"
          icon="🏛️"
          accentColor={COLORS.blue}
          onPress={() => choose('bank')}
        />
        <ChoiceCard
          type="cash"
          option={event.cashOption}
          label="CASH STRATEGY"
          icon="💵"
          accentColor={COLORS.textMuted}
          onPress={() => choose('cash')}
        />

        {/* IBC nudge if no policy */}
        {ibcDisabled && (
          <View style={styles.nudge}>
            <Text style={styles.nudgeText}>
              💡 Open an IBC policy from the Game tab to unlock the smartest financial moves.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Result Sheet ── */}
      <ResultSheet
        visible={pendingChoice !== null}
        choiceType={pendingChoice}
        event={event}
        onContinue={continueGame}
        formatMoney={formatMoney}
        netWorth={computed.netWorth}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: { padding: SPACING.xl, paddingTop: SPACING.xxl },
  typeBadge: { fontSize: FONTS.xs, fontWeight: '800', letterSpacing: 2, marginBottom: SPACING.xs },
  eventEmoji: { fontSize: 48, marginBottom: SPACING.xs },
  eventTitle: { fontSize: FONTS.xxl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs },
  eventDesc: { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  costBadge: {
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 3, marginTop: SPACING.xs,
  },
  costText: { fontSize: FONTS.sm, fontWeight: '800' },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  choiceCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, borderWidth: 1.5,
    padding: SPACING.base, marginBottom: SPACING.md,
  },
  recBadge: {
    alignSelf: 'flex-start', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2, marginBottom: SPACING.xs,
  },
  recText: { fontSize: FONTS.xs, fontWeight: '900', color: '#000' },
  choiceHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  choiceIcon: { fontSize: 28 },
  choiceHeaderText: { flex: 1 },
  choiceType: { fontSize: FONTS.xs, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  choiceTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text },
  choiceDesc: { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  choiceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  choiceImpact: { fontSize: FONTS.sm, fontWeight: '800' },
  choiceXP: { fontSize: FONTS.xs, fontWeight: '700', color: COLORS.gold },

  nudge: {
    backgroundColor: '#001020', borderRadius: RADIUS.md, padding: SPACING.base,
    borderLeftWidth: 3, borderLeftColor: COLORS.blue,
  },
  nudgeText: { fontSize: FONTS.sm, color: COLORS.blue, lineHeight: 20 },
});
