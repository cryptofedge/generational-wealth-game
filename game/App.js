/**
 * App.js â Generational Wealth Game
 * Root component: navigation controller + global game state provider
 *
 * Flow:
 *  splash â creation â playing â· event â retired â legacy â (next gen)
 */

import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GameProvider, useGame } from './src/context/GameContext';
import SplashScreen from './src/screens/SplashScreen';
import CharacterCreationScreen from './src/screens/CharacterCreationScreen';
import GameScreen from './src/screens/GameScreen';
import EventScreen from './src/screens/EventScreen';
import PolicyScreen from './src/screens/PolicyScreen';
import LegacyScreen from './src/screens/LegacyScreen';
import { COLORS } from './src/theme';

// âââ Tab Bar ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

import { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';

function TabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { key: 'game',   label: 'Game',   icon: 'ð®' },
    { key: 'policy', label: 'Policy', icon: 'ð¦' },
  ];
  return (
    <View style={tabStyles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[tabStyles.tab, activeTab === tab.key && tabStyles.tabActive]}
          onPress={() => setActiveTab(tab.key)}
          activeOpacity={0.8}
        >
          <Text style={tabStyles.tabIcon}>{tab.icon}</Text>
          <Text style={[tabStyles.tabLabel, activeTab === tab.key && tabStyles.tabLabelActive]}>
            {tab.label}
          </Text>
          {activeTab === tab.key && <View style={tabStyles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    position: 'relative',
  },
  tabActive: {},
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary, fontWeight: '800' },
  activeIndicator: {
    position: 'absolute',
    top: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
});

// âââ Game Shell âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function GameShell() {
  const { state } = useGame();
  const { phase } = state;
  const [activeTab, setActiveTab] = useState('game');

  // Route to correct screen based on phase
  if (phase === 'splash') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <SplashScreen />
      </SafeAreaView>
    );
  }

  if (phase === 'creation') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <CharacterCreationScreen />
      </SafeAreaView>
    );
  }

  if (phase === 'event') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <EventScreen />
      </SafeAreaView>
    );
  }

  if (phase === 'retired' || phase === 'legacy') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LegacyScreen />
      </SafeAreaView>
    );
  }

  // Playing phase â show tabs
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.playContainer}>
        <View style={styles.screenContainer}>
          {activeTab === 'game' ? <GameScreen /> : <PolicyScreen />}
        </View>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

// âââ Root âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <GameProvider>
        <GameShell />
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  playContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
