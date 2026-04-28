import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '../theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { actions } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    // Pulsing logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Coin spin
    Animated.loop(
      Animated.timing(coinAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);

  const coinRotate = coinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#0A0A0A', '#1A0A00', '#0A0A0A']} style={styles.container}>
      {/* Background particles */}
      {[...Array(12)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.particle,
            {
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 13.7) % 100}%`,
              width: i % 3 === 0 ? 4 : 2,
              height: i % 3 === 0 ? 4 : 2,
              opacity: 0.3,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo Mark */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={GRADIENTS.hero} style={styles.logoGradient}>
            <Animated.Text style={[styles.logoIcon, { transform: [{ rotate: coinRotate }] }]}>💰</Animated.Text>
          </LinearGradient>
          <View style={styles.orbitRing} />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>GENERATIONAL</Text>
        <Text style={styles.titleAccent}>WEALTH GAME</Text>
        <Text style={styles.subtitle}>Become Your Own Bank</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { icon: '📅', label: '43 Years', sub: 'of gameplay' },
            { icon: '🏛️', label: 'IBC', sub: 'strategy' },
            { icon: '👨‍👩‍👧‍👦', label: 'Legacy', sub: 'building' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => actions.setPhase('creation')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.startGradient}>
            <Text style={styles.startText}>START YOUR DYNASTY</Text>
            <Text style={styles.startArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.tagline}>
          Based on Nelson Nash's{' '}
          <Text style={styles.taglineBook}>Becoming Your Own Banker</Text>
        </Text>

        <Text style={styles.disclaimer}>Educational purposes only. Not financial advice.</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: SPACING.xl, width: '100%' },

  particle: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    borderRadius: 99,
  },

  // Logo
  logoContainer: { marginBottom: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  logoIcon: { fontSize: 56 },
  orbitRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: COLORS.primary,
    opacity: 0.3,
  },

  // Text
  title: {
    fontSize: FONTS.xxxl,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 4,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: FONTS.xxxl,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: SPACING.xxl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statIcon: { fontSize: 24, marginBottom: SPACING.xs },
  statLabel: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.gold, textAlign: 'center' },
  statSub: { fontSize: FONTS.xs, color: COLORS.textMuted, textAlign: 'center' },

  // Button
  startButton: {
    width: '90%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  startText: {
    fontSize: FONTS.base,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  startArrow: { fontSize: FONTS.lg, color: COLORS.text },

  // Footer
  tagline: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  taglineBook: { color: COLORS.gold, fontStyle: 'italic' },
  disclaimer: { fontSize: FONTS.xs, color: COLORS.textDisabled, textAlign: 'center' },
});
