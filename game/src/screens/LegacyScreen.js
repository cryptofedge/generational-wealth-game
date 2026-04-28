/**
 * LegacyScreen.js
 * End-of-life summary shown during the 'legacy' phase.
 * Displays the player's legacy score, wealth breakdown, career report,
 * letter grade, confetti, and options to play the next generation or restart.
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { getLevelInfo, COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

function getGrade(ibcRatio, legacyScore) {
  if (ibcRatio >= 80 && legacyScore >= 500_000)
    return { letter: 'S+', label: 'Infinite Banker Legend', color: COLORS.gold };
  if (ibcRatio >= 60 && legacyScore >= 250_000)
    return { letter: 'A',  label: 'IBC Master',            color: COLORS.primary };
  if (ibcRatio >= 40 && legacyScore >= 100_000)
    return { letter: 'B',  label: 'Smart Saver',           color: COLORS.green };
  if (legacyScore >= 50_000)
    return { letter: 'C',  label: 'Getting There',         color: COLORS.blue };
  return   { letter: 'D',  label: 'Traditional Thinker',   color: COLORS.textMuted };
}

// ─── Confetti particle ────────────────────────────────────────────────────────

function Confetti() {
  const particles = useRef(
    [...Array(20)].map(() => ({
      x: Math.random() * 100,
      anim: new Animated.Value(0),
      color: [COLORS.primary, COLORS.gold, COLORS.green, COLORS.blue][Math.floor(Math.random() * 4)],
      size: 6 + Math.floor(Math.random() * 6),
      delay: Math.random() * 1000,
    }))
  ).current;

  useEffect(() => {
    particles.forEach(({ anim, delay }) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          delay,
          useNativeDriver: true,
        })
      ).start();
    });
  }, []);

  return (
    <View style={conf.container} pointerEvents="none">
      {particles.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 600] });
        const rotate = p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              conf.particle,
              {
                left: `${p.x}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: [{ translateY }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const conf = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, height: 600, zIndex: 0 },
  particle: { position: 'absolute', borderRadius: 2 },
});

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({ label, value, sub, color }) {
  return (
    <View style={stat.row}>
      <View style={stat.left}>
        <Text style={stat.label}>{label}</Text>
        {sub ? <Text style={stat.sub}>{sub}</Text> : null}
      </View>
      <Text style={[stat.value, color && { color }]}>{value}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.surface,
  },
  left: { flex: 1 },
  label: { fontSize: FONTS.sm, color: COLORS.textSecondary },
  sub: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 1 },
  value: { fontSize: FONTS.sm, fontWeight: '900', color: COLORS.text },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LegacyScreen() {
  const { state, actions, computed, formatMoney } = useGame();
  const { player, finances, game, stats } = state;
  const policy = finances.policy;

  const pCV      = policy ? policy.cashValue    : 0;
  const pLoan    = policy ? policy.loanBalance  : 0;
  const pDB      = policy ? policy.deathBenefit : 0;
  const legacyScore = Math.round(finances.savings + pCV - pLoan + pDB);

  const ibcRatio = computed.ibcRatio;
  const grade    = getGrade(ibcRatio, legacyScore);
  const li       = getLevelInfo(player.xp);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const estimatedInterestSaved = game.ibcChoices * 3500;

  return (
    <View style={styles.container}>
      <Confetti />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Hero ── */}
          <LinearGradient colors={GRADIENTS.hero} style={styles.hero}>
            <Text style={styles.heroEmoji}>🏆</Text>
            <Text style={styles.heroTitle}>DYNASTY COMPLETE!</Text>
            <Text style={styles.heroSub}>
              {player.name}  ·  Age 65  ·  Generation {player.generation}
            </Text>

            {/* Grade Circle */}
            <View style={[styles.gradeCircle, { borderColor: grade.color }]}>
              <Text style={[styles.gradeLetter, { color: grade.color }]}>{grade.letter}</Text>
            </View>
            <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>
          </LinearGradient>

          {/* ── Legacy Score ── */}
          <View style={[styles.scoreCard, { borderColor: COLORS.gold }]}>
            <Text style={styles.scoreSub}>LEGACY SCORE</Text>
            <Text style={styles.scoreVal}>{fmt(legacyScore)}</Text>
            <Text style={styles.scoreNote}>Total wealth your family inherits</Text>
          </View>

          {/* ── Wealth Breakdown ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💰 Wealth Breakdown</Text>
            <StatRow label="Cash & Savings"          value={fmt(finances.savings)}   color={COLORS.green} />
            <StatRow label="Policy Cash Value"        value={fmt(pCV)}                color={COLORS.gold}  />
            {pLoan > 0 && (
              <StatRow label="Policy Loans Outstanding" value={`-${fmt(pLoan)}`}      color={COLORS.red}   />
            )}
            <StatRow label="Tax-Free Death Benefit"   value={fmt(pDB)}               color={COLORS.blue}  />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>🏆 Total Legacy</Text>
              <Text style={[styles.totalValue, { color: COLORS.gold }]}>{fmt(legacyScore)}</Text>
            </View>
          </View>

          {/* ── Career Report ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Career Report</Text>
            <StatRow
              label="Years Played"
              value={`${game.year}`}
              sub="ages 22–65"
            />
            <StatRow
              label="IBC Decisions"
              value={`${game.ibcChoices}`}
              sub={`${ibcRatio}% of all decisions`}
              color={COLORS.primary}
            />
            <StatRow
              label="Bank Decisions"
              value={`${game.bankChoices}`}
              sub="traditional route"
            />
            <StatRow
              label="Level Reached"
              value={li.current.title}
              sub={`${player.xp.toLocaleString()} total XP`}
              color={COLORS.gold}
            />
            <StatRow
              label="Wealth Milestones"
              value={`${stats.wealthMilestones.length}`}
              sub={stats.wealthMilestones.map((m) => fmt(m)).join(' · ') || 'none reached'}
            />
            <StatRow
              label="Est. Interest Saved vs Bank"
              value={fmt(estimatedInterestSaved)}
              sub="lifetime savings by using IBC"
              color={COLORS.green}
            />
          </View>

          {/* ── Actions ── */}
          <TouchableOpacity
            style={styles.nextGenBtn}
            onPress={actions.playNextGeneration}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENTS.gold} style={styles.nextGenGrad}>
              <Text style={styles.nextGenText}>🚀 PLAY GENERATION {player.generation + 1} →</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restartBtn}
            onPress={actions.resetGame}
            activeOpacity={0.85}
          >
            <Text style={styles.restartText}>🔄 Start New Dynasty</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Educational simulation. Not financial advice.{'\n'}
            Consult a licensed IBC practitioner.
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  // Hero
  hero: {
    borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center',
    marginBottom: SPACING.md, overflow: 'hidden',
  },
  heroEmoji: { fontSize: 64, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.xxl, fontWeight: '900', color: COLORS.text,
    letterSpacing: 3, marginBottom: SPACING.xs,
  },
  heroSub: { fontSize: FONTS.sm, color: 'rgba(255,255,255,0.7)', marginBottom: SPACING.lg },
  gradeCircle: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradeLetter: { fontSize: FONTS.xxxl, fontWeight: '900' },
  gradeLabel: { fontSize: FONTS.md, fontWeight: '800' },

  // Score card
  scoreCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, borderWidth: 2,
    padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.md,
  },
  scoreSub: { fontSize: FONTS.xs, fontWeight: '900', color: COLORS.gold, letterSpacing: 3, marginBottom: SPACING.xs },
  scoreVal: { fontSize: FONTS.hero, fontWeight: '900', color: COLORS.gold },
  scoreNote: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: SPACING.xs },

  // Generic card
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.cardBorder, padding: SPACING.base, marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    marginTop: SPACING.sm, paddingTop: SPACING.md,
  },
  totalLabel: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text },
  totalValue: { fontSize: FONTS.xl, fontWeight: '900' },

  // Buttons
  nextGenBtn: {
    borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm,
    shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
  },
  nextGenGrad: { paddingVertical: SPACING.lg, alignItems: 'center' },
  nextGenText: { fontSize: FONTS.base, fontWeight: '900', color: '#000', letterSpacing: 1 },

  restartBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.cardBorder, paddingVertical: SPACING.lg, alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  restartText: { fontSize: FONTS.sm, color: COLORS.textSecondary, fontWeight: '700' },

  disclaimer: {
    fontSize: FONTS.xs, color: COLORS.textDisabled, textAlign: 'center', lineHeight: 18,
  },
});
