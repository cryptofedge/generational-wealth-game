# ð® Generational Wealth Game â Mobile App

A **Life Simulator RPG** for iOS & Android that teaches the **Infinite Banking Concept (IBC)** through gameplay.

Built with **React Native + Expo**.

---

## ð Quick Start

```bash
cd game
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS or Android) to play immediately.

---

## ð± Submitting to App Stores

### Prerequisites
- [Expo account](https://expo.dev) (free)
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`

### Build Commands
```bash
# Android APK / AAB
npm run build:android

# iOS IPA
npm run build:ios
```

---

## ð¯ Game Overview

| Feature | Details |
|---------|---------|
| **Genre** | Life Simulator RPG |
| **Play time** | 15â30 min per dynasty |
| **Age range** | 22 â 65 (43 years) |
| **Decisions** | IBC vs Bank vs Cash |
| **Generations** | Unlimited â pass wealth forward |

### Game Loop
1. **Create your character** â choose name + income level
2. **Open your IBC policy** â start whole life insurance
3. **Advance year by year** â income grows, cash value compounds
4. **React to life events** â car, home, business, emergencies
5. **Make IBC decisions** â policy loan vs bank loan vs cash
6. **Retire at 65** â see your Legacy Score
7. **Pass wealth to next generation** â start again with inherited wealth

---

## ðï¸ Architecture

```
game/
âââ App.js                    # Root + navigation controller
âââ src/
â   âââ context/
â   â   âââ GameContext.js    # State management (useReducer)
â   âââ engine/
â   â   âââ IBCEngine.js      # IBC policy math & calculations
â   â   âââ LifeEvents.js     # 18+ life events with IBC choices
â   âââ screens/
â   â   âââ SplashScreen.js
â   â   âââ CharacterCreationScreen.js
â   â   âââ GameScreen.js     # Main game loop + policy dashboard
â   â   âââ EventScreen.js    # Life event decisions
â   â   âââ PolicyScreen.js   # Policy details + loan management
â   â   âââ LegacyScreen.js   # End game + generational transfer
â   âââ theme.js              # Colors, fonts, spacing
```

---

## â ï¸ Disclaimer

Educational purposes only. Not financial advice. Always consult a licensed IBC practitioner or financial professional before making insurance or investment decisions.
