/**
 * GameContext.js
 * Global game state management using React Context + useReducer.
 *
 * Bug fixes applied:
 *  1. Expense tracking: annualExpenses now updates every year alongside income growth.
 *  2. AsyncStorage persistence: state is saved on every dispatch and restored on mount.
 *  3. MEC risk is now active: if isMECRisk is true the policy XP bonus is halved and
 *     a warning flag is surfaced for the UI to display.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createPolicy,
  growPolicy,
  takePolicyLoan,
  repayPolicyLoan,
  formatMoney,
} from '../engine/IBCEngine';
import { getRandomEvent, calculateEventXP } from '../engine/LifeEvents';

const STORAGE_KEY = '@gwg_state_v1';

// ─── Income Levels ────────────────────────────────────────────────────────────

export const INCOME_LEVELS = {
  starter: { label: 'Starter ($45K)', income: 45000, description: 'Entry-level career' },
  middle:  { label: 'Middle ($75K)',  income: 75000, description: 'Established professional' },
  high:    { label: 'High ($120K)',   income: 120000, description: 'Senior/Executive role' },
};

export const EXPENSE_RATIO = 0.55; // 55% of income goes to living expenses

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  phase: 'splash',   // splash | creation | playing | event | retired | legacy
  player: {
    name: '',
    age: 22,
    incomeLevel: 'middle',
    income: 75000,
    xp: 0,
    level: 1,
    generation: 1,
    ibcStreak: 0,
  },
  finances: {
    savings: 5000,
    policy: null,
    annualExpenses: 0,
    totalDebt: 0,
    legacyWealth: 0,
    yearlyNetWorth: [],
  },
  game: {
    year: 0,
    currentEvent: null,
    recentEventIds: [],
    ibcChoices: 0,
    bankChoices: 0,
    yearSummary: null,
    totalXP: 0,
    mecWarning: false,   // FIX #3: surfaced for UI
  },
  stats: {
    totalPolicyLoans: 0,
    totalBankLoans: 0,
    totalInterestSavedVsBank: 0,
    wealthMilestones: [],
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function gameReducer(state, action) {
  switch (action.type) {

    // ── Setup ──────────────────────────────────────────────────────────────
    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'HYDRATE':
      // Restore persisted state on app launch (FIX #2)
      return action.payload;

    case 'CREATE_CHARACTER': {
      const { name, incomeLevel } = action.payload;
      const income = INCOME_LEVELS[incomeLevel].income;
      return {
        ...state,
        phase: 'playing',
        player: {
          ...state.player,
          name,
          incomeLevel,
          income,
        },
        finances: {
          ...state.finances,
          // FIX #1: annualExpenses derived from income at creation and kept in sync
          annualExpenses: Math.round(income * EXPENSE_RATIO),
          savings: Math.round(income * 0.05),
        },
      };
    }

    // ── Policy ─────────────────────────────────────────────────────────────
    case 'OPEN_POLICY': {
      const { annualPremium } = action.payload;
      const policy = createPolicy(annualPremium, state.player.income);
      const savings = Math.max(0, state.finances.savings - annualPremium);

      // FIX #3: MEC risk halves the opening XP bonus as a gameplay consequence
      const xpBonus = policy.isMECRisk ? 250 : 500;

      return {
        ...state,
        finances: { ...state.finances, policy, savings },
        player: { ...state.player, xp: state.player.xp + xpBonus },
        game: { ...state.game, mecWarning: policy.isMECRisk },
      };
    }

    case 'TAKE_POLICY_LOAN': {
      if (!state.finances.policy) return state;
      const result = takePolicyLoan(state.finances.policy, action.payload.amount);
      if (!result.success) return state;
      return {
        ...state,
        finances: {
          ...state.finances,
          policy: result.policy,
          savings: state.finances.savings + result.amount,
        },
        stats: { ...state.stats, totalPolicyLoans: state.stats.totalPolicyLoans + 1 },
      };
    }

    case 'REPAY_POLICY_LOAN': {
      if (!state.finances.policy) return state;
      const { amount } = action.payload;
      const result = repayPolicyLoan(state.finances.policy, amount);
      const newSavings = Math.max(0, state.finances.savings - amount);
      return {
        ...state,
        finances: { ...state.finances, policy: result.policy, savings: newSavings },
      };
    }

    // ── Annual Cycle ───────────────────────────────────────────────────────
    case 'ADVANCE_YEAR': {
      const { premiumPayment = 0 } = action.payload || {};
      const income = state.player.income;

      // FIX #1: use the already-updated annualExpenses (kept in sync each year)
      const expenses = state.finances.annualExpenses;
      const annualSurplus = income - expenses - premiumPayment;

      // Grow IBC policy
      let newPolicy = state.finances.policy;
      let policySummary = null;
      if (newPolicy) {
        const extraPremium = premiumPayment > newPolicy.annualPremium
          ? premiumPayment - newPolicy.annualPremium
          : 0;
        const grown = growPolicy(newPolicy, extraPremium);
        newPolicy = grown.policy;
        policySummary = grown.summary;
      }

      // Savings grow at 4% HYSA
      const savingsGrowth = state.finances.savings * 0.04;
      const newSavings = state.finances.savings + savingsGrowth + annualSurplus;

      const newAge = state.player.age + 1;
      const newYear = state.game.year + 1;

      // Net worth
      const netWorth = Math.max(0, newSavings) +
        (newPolicy ? newPolicy.cashValue - newPolicy.loanBalance : 0) -
        state.finances.totalDebt;

      // XP + level
      const newXP = state.player.xp + 100;
      const newLevel = Math.floor(newXP / 1000) + 1;

      // FIX #1: income and expenses both advance together every year
      const incomeGrowth = newAge < 50 ? 0.025 : 0.01;
      const newIncome = Math.round(income * (1 + incomeGrowth));
      const newExpenses = Math.round(newIncome * EXPENSE_RATIO);  // ← was missing before

      // Trigger event every year
      const event = getRandomEvent(newAge, state.game.recentEventIds);
      const recentEventIds = [...state.game.recentEventIds.slice(-5), event.id];

      return {
        ...state,
        phase: 'event',
        player: {
          ...state.player,
          age: newAge,
          income: newIncome,
          xp: newXP,
          level: newLevel,
        },
        finances: {
          ...state.finances,
          policy: newPolicy,
          savings: Math.round(newSavings),
          annualExpenses: newExpenses,   // FIX #1: synced each year
          yearlyNetWorth: [
            ...state.finances.yearlyNetWorth,
            { age: newAge, netWorth: Math.round(netWorth) },
          ],
        },
        game: {
          ...state.game,
          year: newYear,
          currentEvent: event,
          recentEventIds,
          yearSummary: {
            income,
            expenses,
            surplus: Math.round(annualSurplus),
            savingsGrowth: Math.round(savingsGrowth),
            policySummary,
            netWorth: Math.round(netWorth),
          },
        },
      };
    }

    // ── Event Decisions ────────────────────────────────────────────────────
    case 'RESOLVE_EVENT': {
      const { choiceType } = action.payload;  // 'ibc' | 'bank' | 'cash'
      const event = state.game.currentEvent;
      if (!event) return { ...state, phase: 'playing' };

      const option = choiceType === 'ibc'   ? event.ibcOption
        : choiceType === 'bank' ? event.bankOption
        : event.cashOption;

      const xpGained = calculateEventXP(event, choiceType);
      const wealthDelta = option.wealthImpact || 0;
      const newSavings = Math.max(0, state.finances.savings + wealthDelta);
      const windfall = event.windfall || 0;

      let newPolicy = state.finances.policy;

      if (choiceType === 'ibc' && event.cost > 0 && newPolicy) {
        const loanResult = takePolicyLoan(newPolicy, event.cost);
        if (loanResult.success) newPolicy = loanResult.policy;
      }

      const newIBCChoices = choiceType === 'ibc'
        ? state.game.ibcChoices + 1 : state.game.ibcChoices;
      const newBankChoices = choiceType === 'bank'
        ? state.game.bankChoices + 1 : state.game.bankChoices;

      const ibcStreak = choiceType === 'ibc' ? state.player.ibcStreak + 1 : 0;
      const streakBonus = ibcStreak >= 3 ? 150 : 0;

      const isRetired = state.player.age >= 65;

      const netWorth = newSavings + (newPolicy ? newPolicy.cashValue - newPolicy.loanBalance : 0);
      const milestones = [...state.stats.wealthMilestones];
      [100000, 250000, 500000, 1000000].forEach((m) => {
        if (netWorth >= m && !milestones.includes(m)) milestones.push(m);
      });

      return {
        ...state,
        phase: isRetired ? 'retired' : 'playing',
        player: {
          ...state.player,
          xp: state.player.xp + xpGained + streakBonus,
          ibcStreak,
        },
        finances: {
          ...state.finances,
          policy: newPolicy,
          savings: newSavings + windfall,
        },
        game: {
          ...state.game,
          currentEvent: null,
          ibcChoices: newIBCChoices,
          bankChoices: newBankChoices,
          totalXP: state.game.totalXP + xpGained + streakBonus,
        },
        stats: { ...state.stats, wealthMilestones: milestones },
      };
    }

    // ── Legacy ─────────────────────────────────────────────────────────────
    case 'START_LEGACY': {
      const policy = state.finances.policy;
      const deathBenefit = policy ? policy.deathBenefit : 0;
      const savingsTransfer = Math.round(state.finances.savings * 0.8);
      const legacyWealth = deathBenefit + savingsTransfer;
      return {
        ...state,
        phase: 'legacy',
        finances: { ...state.finances, legacyWealth },
      };
    }

    case 'PLAY_NEXT_GENERATION': {
      const legacyWealth = state.finances.legacyWealth;
      return {
        ...initialState,
        phase: 'creation',
        player: {
          ...initialState.player,
          generation: state.player.generation + 1,
        },
        finances: {
          ...initialState.finances,
          savings: legacyWealth,
          legacyWealth,
        },
      };
    }

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // FIX #2: Restore saved game on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved = JSON.parse(raw);
            dispatch({ type: 'HYDRATE', payload: saved });
          } catch (_) {
            // corrupt data — start fresh
          }
        }
      })
      .catch(() => {/* ignore read errors */});
  }, []);

  // FIX #2: Persist state after every action (skip splash to avoid thrashing)
  useEffect(() => {
    if (state.phase !== 'splash') {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state]);

  const actions = {
    setPhase: (phase) => dispatch({ type: 'SET_PHASE', payload: phase }),
    createCharacter: (name, incomeLevel) =>
      dispatch({ type: 'CREATE_CHARACTER', payload: { name, incomeLevel } }),
    openPolicy: (annualPremium) =>
      dispatch({ type: 'OPEN_POLICY', payload: { annualPremium } }),
    takePolicyLoan: (amount) =>
      dispatch({ type: 'TAKE_POLICY_LOAN', payload: { amount } }),
    repayPolicyLoan: (amount) =>
      dispatch({ type: 'REPAY_POLICY_LOAN', payload: { amount } }),
    advanceYear: (premiumPayment) =>
      dispatch({ type: 'ADVANCE_YEAR', payload: { premiumPayment } }),
    resolveEvent: (choiceType) =>
      dispatch({ type: 'RESOLVE_EVENT', payload: { choiceType } }),
    startLegacy: () => dispatch({ type: 'START_LEGACY' }),
    playNextGeneration: () => dispatch({ type: 'PLAY_NEXT_GENERATION' }),
    resetGame: () => {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      dispatch({ type: 'RESET_GAME' });
    },
  };

  const computed = {
    netWorth: (() => {
      const { savings, policy, totalDebt } = state.finances;
      const policyEquity = policy ? policy.cashValue - policy.loanBalance : 0;
      return Math.round(savings + policyEquity - totalDebt);
    })(),
    ibcRatio: state.game.ibcChoices + state.game.bankChoices > 0
      ? Math.round((state.game.ibcChoices / (state.game.ibcChoices + state.game.bankChoices)) * 100)
      : 0,
    yearsToRetirement: Math.max(0, 65 - state.player.age),
    legacyScore: (() => {
      const { savings, policy, totalDebt } = state.finances;
      const db = policy ? policy.deathBenefit : 0;
      const ibcBonus = state.game.ibcChoices * 2000;
      return Math.round(savings + db + ibcBonus - totalDebt);
    })(),
  };

  return (
    <GameContext.Provider value={{ state, actions, computed, formatMoney }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
