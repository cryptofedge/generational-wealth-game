import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame, INCOME_LEVELS } from '../context/GameContext';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

const INCOME_CARDS = [
  {
    key: 'starter',
    emoji: '🌱',
    title: 'Starter',
    income: '$45,000/yr',
    desc: 'Entry-level career. Every dollar matters.',
    difficulty: 'Hard Mode',
    diffColor: COLORS.red,
    premium: '$250/mo',
  },
  {
    key: 'middle',
    emoji: '💼',
    title: 'Professional',
    income: '$75,000/yr',
    desc: 'Established career. Room to grow.',
    difficulty: 'Normal',
    diffColor: COLORS.gold,
    premium: '$500/mo',
    recommended: true,
  },
  {
    key: 'high',
    emoji: '🏆',
    title: 'Executive',
    income: '$120,000/yr',
    desc: 'High earner. Maximize your legacy.',
    difficulty: 'Easy Mode',
    diffColor: COLORS.green,
    premium: '$800/mo',
  },
];

export default function CharacterCreationScreen() {
  const { actions } = useGame();
  const [name, setName] = useState('');
  const [selectedIncome, setSelectedIncome] = useState('middle');
  const [step, setStep] = useState(1); // 1 = name, 2 = income
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goToStep2() {
    if (!name.trim()) return;
    Keyboard.dismiss();
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => setStep(2));
    setStep(2);
  }

  function startGame() {
    actions.createCharacter(name.trim() || 'Player', selectedIncome);
  }

  return (
    <LinearGradient colors={['#0A0A0A', '#120800', '#0A0A0A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
          <Text style={styles.stepLabel}>Step {step} of 2</Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {step === 1 ? (
            // ââ STEP 1: Name ââââââââââââââââââââââââââââââââââââââââââââââ
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>👤</Text>
              <Text style={styles.heading}>Who are you?</Text>
              <Text style={styles.subheading}>
                Enter your character's name. This is the start of your dynasty.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name..."
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  maxLength={20}
                  returnKeyType="next"
                  onSubmitEditing={goToStep2}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  You start at age 22 and play until retirement at 65.{'\n'}
                  Build wealth through the Infinite Banking Concept.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.nextButton, !name.trim() && styles.nextButtonDisabled]}
                onPress={goToStep2}
                disabled={!name.trim()}
              >
                <LinearGradient
                  colors={name.trim() ? GRADIENTS.primary : ['#333', '#222']}
                  style={styles.nextGradient}
                >
                  <Text style={styles.nextText}>NEXT →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            // ââ STEP 2: Income Level ââââââââââââââââââââââââââââââââââââââ
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>💼</Text>
              <Text style={styles.heading}>Choose Your Career</Text>
              <Text style={styles.subheading}>
                Your income level determines your starting position.
              </Text>

              {INCOME_CARDS.map((card) => (
                <TouchableOpacity
                  key={card.key}
                  style={[
                    styles.incomeCard,
                    selectedIncome === card.key && styles.incomeCardSelected,
                  ]}
                  onPress={() => setSelectedIncome(card.key)}
                  activeOpacity={0.85}
                >
                  {card.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>⭐ RECOMMENDED</Text>
                    </View>
                  )}
                  <View style={styles.incomeCardRow}>
                    <Text style={styles.incomeEmoji}>{card.emoji}</Text>
                    <View style={styles.incomeInfo}>
                      <View style={styles.incomeHeaderRow}>
                        <Text style={styles.incomeTitle}>{card.title}</Text>
                        <Text style={[styles.difficulty, { color: card.diffColor }]}>
                          {card.difficulty}
                        </Text>
                      </View>
                      <Text style={styles.incomeAmount}>{card.income}</Text>
                      <Text style={styles.incomeDesc}>{card.desc}</Text>
                    </View>
                    <View style={[
                      styles.selectCircle,
                      selectedIncome === card.key && styles.selectCircleActive,
                    ]}>
                      {selectedIncome === card.key && <Text style={styles.checkmark}>✔</Text>}
                    </View>
                  </View>
                  <View style={styles.premiumRow}>
                    <Text style={styles.premiumLabel}>Suggested IBC Premium:</Text>
                    <Text style={styles.premiumValue}>{card.premium}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
                <LinearGradient colors={GRADIENTS.gold} style={styles.startGradient}>
                  <Text style={styles.startText}>🚀 BEGIN YOUR DYNASTY</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.base, paddingBottom: SPACING.xxxl },

  header: { alignItems: 'center', paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  stepDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.cardBorder,
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepLine: { width: 40, height: 2, backgroundColor: COLORS.cardBorder, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.primary },
  stepLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },

  stepContent: { alignItems: 'center', paddingHorizontal: SPACING.sm },
  emoji: { fontSize: 56, marginBottom: SPACING.md },
  heading: {
    fontSize: FONTS.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },

  // Input
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  input: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    fontSize: FONTS.xl,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    width: '100%',
    gap: SPACING.sm,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20 },

  // Next button
  nextButton: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden' },
  nextButtonDisabled: { opacity: 0.5 },
  nextGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  nextText: { fontSize: FONTS.base, fontWeight: '900', color: COLORS.text, letterSpacing: 2 },

  // Income cards
  incomeCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  incomeCardSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recommendedBadge: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.xs,
  },
  recommendedText: { fontSize: FONTS.xs, fontWeight: '800', color: '#000' },
  incomeCardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  incomeEmoji: { fontSize: 36 },
  incomeInfo: { flex: 1 },
  incomeHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  incomeTitle: { fontSize: FONTS.base, fontWeight: '800', color: COLORS.text },
  difficulty: { fontSize: FONTS.xs, fontWeight: '700' },
  incomeAmount: { fontSize: FONTS.lg, fontWeight: '900', color: COLORS.gold, marginVertical: 2 },
  incomeDesc: { fontSize: FONTS.sm, color: COLORS.textSecondary },
  selectCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  selectCircleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { fontSize: 14, color: COLORS.text, fontWeight: '900' },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  premiumLabel: { fontSize: FONTS.sm, color: COLORS.textMuted },
  premiumValue: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.primary },

  // Start button
  startButton: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  startGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  startText: { fontSize: FONTS.base, fontWeight: '900', color: '#000', letterSpacing: 1 },
});
