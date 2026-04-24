import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../engine/IBCEngine';
import { getLevelInfo, COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

export default function LegacyScreen() {
  const { state, actions, computed } = useGame();
  const { player, finances, game, stats } = state;
  const policy = finances.policy;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const levelInfo = getLevelInfo(player.xp);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(confettiAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ]).start();
  }, []);

  const legacyScore = computed.legacyScore;
  const ibcRatio = computed.ibcRatio;
  const deathBenefit = policy?.deathBenefit || 0;
  const totalXPEarned = game.totalXP;

  // Grade calculation
  const getGrade = () => {
    if (ibcRatio >= 80 && legacyScore >= 500000) return { grade: 'S+', label: 'Infinite Banker Legend', color: COLORS.gold };
    if (ibcRatio >= 60 && legacyScore >= 250000) return { grade: 'A', label: 'IBC Master', color: COLORS.primary };
    if (ibcRatio >= 40 && legacyScore >= 100000) return { grade: 'B', label: 'Smart Saver', color: COLORS.green };
    if (legacyScore >= 50000) return { grade: 'C', label: 'Getting There', color: COLORS.blue };
    return { grade: 'D', label: 'Traditional Thinker', color: COLORS.textSecondary };
  };
  const grade = getGrade();

  const wealthTransferred = Math.round(
    (policy?.cashValue || 0) - (policy?.loanBalance || 0) + finances.savings
  );
  const deathBenefitToHeirs = deathBenefit;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                left: `${(i * 5) % 100}%`,
                top: `${Math.random() * 30}%`,
                backgroundColor: [COLORS.primary, COLORS.gold, COLORS.green][i % 3],
                opacity: confettiAnim,
                transform: [{ rotate: `${i * 18}deg` }],
              },
            ]}
          />
        ))}

        {/* Hero Grade Card */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
          <LinearGradient colors={GRADIENTS.hero} style={styles.heroCard}>
            <Text style={styles.heroEmoji}>ð</Text>
            <Text style={styles.heroTitle}>DYNASTY COMPLETE!</Text>
            <Text style={styles.heroSubtitle}>
              {player.name} â¢ Age {player.age} â¢ Generation {player.generation}
            </Text>

            <View style={[styles.gradeBadge, { borderColor: grade.color }]}>
              <Text style={[styles.gradeText, { color: grade.color }]}>{grade.grade}</Text>
            </View>
            <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Legacy Score */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.legacyScoreCard}>
            <Text style={styles.legacyScoreLabel}>LEGACY SCORE</Text>
            <Text style={styles.legacyScoreValue}>{formatMoney(legacyScore)}</Text>
            <Text style={styles.legacyScoreSub}>
              Wealth your family inherits
            </Text>
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>ð° Wealth Breakdown</Text>
            {[
              { label: 'Cash & Investments', value: finances.savings, icon: 'ðµ', color: COLORS.green },
              { label: 'Policy Cash Value', value: policy?.cashValue || 0, icon: 'ð', color: COLORS.gold },
              { label: 'Policy Loans Outstanding', value: -(policy?.loanBalance || 0), icon: 'ð', color: COLORS.red },
              { label: 'Tax-Free Death Benefit', value: deathBenefitToHeirs, icon: 'ð¡ï¸', color: COLORS.blue },
            ].map((item, i) => (
              <View key={i} style={styles.breakdownRow}>
                <Text style={styles.breakdownIcon}>{item.icon}</Text>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={[styles.breakdownValue, { color: item.value >= 0 ? item.color : COLORS.red }]}>
                  {item.value >= 0 ? '+' : ''}{formatMoney(item.value)}
                </Text>
              </View>
            ))}
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownIcon}>ð</Text>
              <Text style={[styles.breakdownLabel, { fontWeight: '900', color: COLORS.text }]}>
                Total Legacy
              </Text>
              <Text style={[styles.breakdownValue, { color: COLORS.gold, fontSize: FONTS.lg }]}>
                {formatMoney(legacyScore)}
              </Text>
            </View>
          </View>

          {/* Stats Report Card */}
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>ð Career Report Card</Text>
            {[
              { label: 'Years Played', value: `${game.year}`, sub: 'ages 22â' + player.age },
              { label: 'IBC Decisions', value: `${game.ibcChoices}`, sub: `${ibcRatio}% of all choices`, color: COLORS.primary },
              { label: 'Bank Decisions', value: `${game.bankChoices}`, sub: 'traditional route' },
              { label: 'Level Reached', value: `${levelInfo.current.level}`, sub: levelInfo.current.title, color: COLORS.gold },
              { label: 'Total XP', value: `${totalXPEarned.toLocaleString()}`, sub: 'experience points' },
              { label: 'Wealth Milestones', value: `${stats.wealthMilestones.length}`, sub: stats.wealthMilestones.map(m => formatMoney(m)).join(' Â· ') || 'none' },
            ].map((item, i) => (
              <View key={i} style={styles.reportRow}>
                <View style={styles.reportLeft}>
                  <Text style={styles.reportLabel}>{item.label}</Text>
                  <Text style={styles.reportSub}>{item.sub}</Text>
                </View>
                <Text style={[styles.reportValue, item.color && { color: item.color }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* IBC Impact */}
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>ð¦ Your IBC Impact</Text>
            <Text style={styles.impactText}>
              By using IBC strategies {game.ibcChoices} times, you likely saved{' '}
              <Text style={styles.impactHighlight}>
                {formatMoney(game.ibcChoices * 3500)}
              </Text>{' '}
              in bank interest over your lifetime.{'\n\n'}
              Your death benefit of{' '}
              <Text style={styles.impactHighlight}>{formatMoney(deathBenefitToHeirs)}</Text>{' '}
              passes to your heirs completely tax-free.
            </Text>
          </View>

          {/* Next Generation */}
          {wealthTransferred > 0 && (
            <View style={styles.nextGenCard}>
              <Text style={styles.nextGenIcon}>ð¨âð©âð§âð¦</Text>
              <Text style={styles.nextGenTitle}>Generational Wealth Created</Text>
              <Text style={styles.nextGenAmount}>{formatMoney(wealthTransferred)}</Text>
              <Text style={styles.nextGenSub}>
                transferred to Generation {player.generation + 1}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.nextGenButton} onPress={actions.playNextGeneration}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.nextGenButtonGradient}>
                <Text style={styles.nextGenButtonText}>
                  ð PLAY GENERATION {player.generation + 1}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => actions.setPhase('splash')}
            >
              <Text style={styles.restartText}>ð Start New Dynasty</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Educational simulation. Not financial advice. Consult a licensed IBC practitioner.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: SPACING.xxxl },

  confetti: {
    position: 'absolute', width: 8, height: 8, borderRadius: 2,
  },

  heroCard: {
    margin: SPACING.base, borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center',
    marginTop: SPACING.xl,
  },
  heroEmoji: { fontSize: 64, marginBottom: SPACING.md },
  heroTitle: {
    fontSize: FONTS.xxl, fontWeight: '900', color: COLORS.text,
    letterSpacing: 3, textAlign: 'center', marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: FONTS.sm, color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xl, textAlign: 'center',
  },
  gradeBadge: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradeText: { fontSize: FONTS.xxxl, fontWeight: '900' },
  gradeLabel: { fontSize: FONTS.base, fontWeight: '700', textAlign: 'center' },

  legacyScoreCard: {
    margin: SPACING.base, backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.gold, alignItems: 'center',
  },
  legacyScoreLabel: {
    fontSize: FONTS.xs, fontWeight: '900', color: COLORS.gold,
    letterSpacing: 3, marginBottom: SPACING.xs,
  },
  legacyScoreValue: { fontSize: FONTS.hero, fontWeight: '900', color: COLORS.gold },
  legacyScoreSub: { fontSize: FONTS.sm, color: COLORS.textMuted },

  breakdownCard: {
    margin: SPACING.base, backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl, padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  breakdownTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.md },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs },
  breakdownIcon: { fontSize: 20, width: 28 },
  breakdownLabel: { flex: 1, fontSize: FONTS.sm, color: COLORS.textSecondary },
  breakdownValue: { fontSize: FONTS.sm, fontWeight: '800' },
  breakdownDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: SPACING.sm },

  reportCard: {
    margin: SPACING.base, backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl, padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  reportTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.md },
  reportRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: SPACING.xs,
    borderBottomWidth: 1, borderBottomColor: COLORS.surface,
  },
  reportLeft: {},
  reportLabel: { fontSize: FONTS.sm, color: COLORS.text, fontWeight: '700' },
  reportSub: { fontSize: FONTS.xs, color: COLORS.textMuted },
  reportValue: { fontSize: FONTS.xl, fontWeight: '900', color: COLORS.text },

  impactCard: {
    margin: SPACING.base, backgroundColor: '#0A1A0A',
    borderRadius: RADIUS.xl, padding: SPACING.base,
    borderLeftWidth: 3, borderLeftColor: COLORS.green,
  },
  impactTitle: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.sm },
  impactText: { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 22 },
  impactHighlight: { color: COLORS.green, fontWeight: '900' },

  nextGenCard: {
    margin: SPACING.base, backgroundColor: '#0A001A',
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center',
  },
  nextGenIcon: { fontSize: 48, marginBottom: SPACING.sm },
  nextGenTitle: { fontSize: FONTS.base, fontWeight: '700', color: COLORS.textSecondary },
  nextGenAmount: { fontSize: FONTS.xxxl, fontWeight: '900', color: COLORS.primary, marginVertical: SPACING.xs },
  nextGenSub: { fontSize: FONTS.sm, color: COLORS.textMuted },

  actionButtons: { padding: SPACING.base, gap: SPACING.md },
  nextGenButton: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  nextGenButtonGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  nextGenButtonText: { fontSize: FONTS.base, fontWeight: '900', color: '#000', letterSpacing: 1 },
  restartButton: {
    paddingVertical: SPACING.lg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: RADIUS.lg,
  },
  restartText: { fontSize: FONTS.base, color: COLORS.textSecondary, fontWeight: '700' },

  disclaimer: {
    fontSize: FONTS.xs, color: COLORS.textDisabled,
    textAlign: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl,
  },
});
