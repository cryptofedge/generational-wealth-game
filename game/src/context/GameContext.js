/**
 * GameContext.js
 * Global game state management using React Context + useReducer.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { createPolicy, growPolicy, takePolicyLoan, repayPolicyLoan, formatMoney } from '../engine/IBCEngine';
import { getRandomEvent, calculateEventXP } from '../engine/LifeEvents';

// âââ Income Levels ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export const INCOME_LEVELS = {
  starter: { label: 'Starter ($45K)', income: 45000, description: 'Entry-level career' },
  middle:  { label: 'Middle ($75K)',  income: 75000, description: 'Established professional' },
  high:    { label: 'High ($120K)',   income: 120000, description: 'Senior/Executive role' },
};

export const EXPENSE_RATIO = 0.55; // 55% of income goes to living expenses

// âââ Initial State ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
    ibcStreak: 0,    // consecutive years using IBC
  },
  finances: {
    savings: 5000,    // traditional savings/investments
    policy: null,     // IBCEngine policy object (null until created)
    annualExpenses: 0,
    totalDebt: 0,
    legacyWealth: 0,  // wealth transferred from previous generation
    yearlyNetWorth: [],
  },
  game: {
    year: 0,          // years played (0-43, ages 22-65)
    currentEvent: null,
    recentEventIds: [],
    ibcChoices: 0,    // total IBC decisions made
    bankChoices: 0,
    yearSummary: null,
    totalXP: 0,
  },
  stats: {
    totalPolicyLoans: 0,
    totalBankLoans: 0,
    totalInterestSavedVsBank: 0,
    wealthMilestones: [],
  },
};

// âââ Reducer ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function gameReducer(state, action) {
  switch (action.type) {

    // ââ Setup ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    case 'SET_PHASE':
      return { ...state, phase: action.payload };

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
          annualExpenses: Math.round(income * EXPENSE_RATIO),
          savings: Math.round(income * 0.05),  // 5% starter savings
        },
      };
    }

    // ââ Policy âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    case 'OPEN_POLICY': {
      const { annualPremium } = action.payload;
      const policy = createPolicy(annualPremium, state.player.income);
      const savings = Math.max(0, state.finances.savings - annualPremium);
      return {
        ...state,
        finances: {
          ...state.finances,
          policy,
          savings,
        },
        player: {
          ...state.player,
          xp: state.player.xp + 500,
        },
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
        stats: {
          ...state.stats,
          totalPolicyLoans: state.stats.totalPolicyLoans + 1,
        },
      };
    }

    case 'REPAY_POLICY_LOAN': {
      if (!state.finances.policy) return state;
      const { amount } = action.payload;
      const result = repayPolicyLoan(state.finances.policy, amount);
      const newSavings = Math.max(0, state.finances.savings - amount);
      return {
        ...state,
        finances: {
          ...state.finances,
          policy: result.policy,
          savings: newSavings,
        },
      };
    }

    // ââ Annual Cycle ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    case 'ADVANCE_YEAR': {
      const { premiumPayment = 0 } = action.payload || {};
      const income = state.player.income;
      const expenses = state.finances.annualExpenses;
      const annualSurplus = income - expenses - premiumPayment;

      // Grow IBC policy
      let newPolicy = state.finances.policy;
      let policySummary = null;
      if (newPolicy) {
        const grown = growPolicy(newPolicy, premiumPayment > newPolicy.annualPremium
          ? premiumPayment - newPolicy.annualPremium : 0);
        newPolicy = grown.policy;
        policySummary = grown.summary;
      }

      // Savings grow at 4% HYSA
      const savingsGrowth = state.finances.savings * 0.04;
      const newSavings = state.finances.savings + savingsGrowth + annualSurplus;

      const newAge = state.player.age + 1;
      const newYear = state.game.year + 1;

      // Calculate net worth
      const netWorth = Math.max(0, newSavings) +
        (newPolicy ? newPolicy.cashValue - newPolicy.loanBalance : 0) -
        state.finances.totalDebt;

      // Check for level up
      const newXP = state.player.xp + 100;
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Income grows ~2-3% per year (career advancement)
      const incomeGrowth = newAge < 50 ? 0.025 : 0.01;
      const newIncome = Math.round(income * (1 + incomeGrowth));
      const newExpenses = Math.round(newIncome * EXPENSE_RATIO);

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
          annualExpenses: newExpenses,
          yearlyNetWorth: [
            ...state.finances.yearlyNetWorth,
            { age: newAge, netWorth: Math.round(netWorth) }
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

    // ââ Event Decisions âââââââââââââââââââââââââââââââââââââââââââââââââââââ
    case 'RESOLVE_EVENT': {
      const { choiceType } = action.payload;  // 'ibc' | 'bank' | 'cash'
      const event = state.game.currentEvent;
      if (!event) return { ...state, phase: 'playing' };

      const option = choiceType === 'ibc' ? event.ibcOption
        : choiceType === 'bank' ? event.bankOption
        : event.cashOption;

      const xpGained = calculateEventXP(event, choiceType);
      const wealthDelta = option.wealthImpact || 0;
      const newSavings = Math.max(0, state.finances.savings + wealthDelta);
      const windfall = event.windfall || 0;

      let newPolicy = state.finances.policy;

      // IBC choice: if cost > 0 and policy exists, take a policy loan
      if (choiceType === 'ibc' && event.cost > 0 && newPolicy) {
        const loanResult = takePolicyLoan(newPolicy, event.cost);
        if (loanResult.success) {
          newPolicy = loanResult.policy;
        }
      }

      const newIBCChoices = choiceType === 'ibc'
        ? state.game.ibcChoices + 1 : state.game.ibcChoices;
      const newBankChoices = choiceType === 'bank'
        ? state.game.bankChoices + 1 : state.game.bankChoices;

      const ibcStreak = choiceType === 'ibc'
        ? state.player.ibcStreak + 1 : 0;

      // Streak bonus XP
      const streakBonus = ibcStreak >= 3 ? 150 : 0;

      // Check retirement
      const isRetired = state.player.age >= 65;

      // Check milestone
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
        stats: {
          ...state.stats,
          wealthMilestones: milestones,
        },
      };
    }

    // ââ Legacy ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    case 'START_LEGACY': {
      // Transfer wealth to next generation
      const policy = state.finances.policy;
      const deathBenefit = policy ? policy.deathBenefit : 0;
      const savingsTransfer = Math.round(state.finances.savings * 0.8); // estate taxes/costs
      const legacyWealth = deathBenefit + savingsTransfer;

      return {
        ...state,
        phase: 'legacy',
        finances: {
          ...state.finances,
          legacyWealth,
        },
      };
    }

    case 'PLAY_NEXT_GENERATION': {
      const legacyWealth = state.finances.legacyWealth;
      // Start fresh with inherited wealth
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

    default:
      return state;
  }
}

// âââ Context ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

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
  };

  // Computed values
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
