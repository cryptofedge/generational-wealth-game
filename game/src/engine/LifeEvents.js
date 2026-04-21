/**
 * LifeEvents.js
 * Random life events that drive gameplay decisions.
 * Each event gives the player an IBC vs traditional choice.
 */

export const EVENT_TYPES = {
  OPPORTUNITY: 'opportunity',  // Good â player can invest/buy
  EMERGENCY: 'emergency',      // Bad â player must spend money
  MILESTONE: 'milestone',      // Life milestone â neutral but requires decision
  BONUS: 'bonus',              // Pure windfall
};

export const LIFE_EVENTS = [
  // âââ VEHICLE EVENTS ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'car_used',
    title: 'ð Used Car Needed',
    description:
      'Your old car finally gave out. You need reliable transportation to get to work.',
    type: EVENT_TYPES.MILESTONE,
    cost: 18000,
    minAge: 22,
    maxAge: 40,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Borrow $18,000 from your policy at 5%. Your cash value keeps growing.',
      xpBonus: 150,
      wealthImpact: -900,   // net: $18k Ã 5% interest
    },
    bankOption: {
      label: 'Auto Loan',
      description: 'Bank loan at 7% over 4 years. Total paid: ~$20,700.',
      wealthImpact: -2700,  // $2,700 in bank interest lost
    },
    cashOption: {
      label: 'Pay Cash',
      description: 'Drain your savings. No debt, but opportunity cost.',
      wealthImpact: -1200,  // lost investment returns on $18k
    },
  },

  {
    id: 'car_new',
    title: 'ð New Car Opportunity',
    description:
      'You\'ve been eyeing a new car. It\'s time for an upgrade. Can you afford it the smart way?',
    type: EVENT_TYPES.OPPORTUNITY,
    cost: 32000,
    minAge: 25,
    maxAge: 55,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Borrow $32,000 at 5%. Repay yourself and recapture the interest.',
      xpBonus: 200,
      wealthImpact: -1600,
    },
    bankOption: {
      label: 'Dealership Financing',
      description: '6.9% APR for 60 months. Total cost: ~$38,200.',
      wealthImpact: -6200,
    },
    cashOption: {
      label: 'Skip It',
      description: 'Keep your current car and invest the $32K instead.',
      wealthImpact: 5000,   // growing that $32k
    },
  },

  // âââ HOME EVENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'home_downpayment',
    title: 'ð  Home Down Payment',
    description:
      'You\'ve found your dream home! You need $50,000 for a 10% down payment.',
    type: EVENT_TYPES.MILESTONE,
    cost: 50000,
    minAge: 25,
    maxAge: 45,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Use a $50K policy loan for the down payment. Your cash value still earns dividends.',
      xpBonus: 400,
      wealthImpact: 8000,   // home equity growth > loan cost
    },
    bankOption: {
      label: 'Drain Savings',
      description: 'Empty your savings account for the down payment.',
      wealthImpact: -3000,  // lost compound growth
    },
    cashOption: {
      label: 'Keep Renting',
      description: 'Skip the home and invest the $50K in index funds instead.',
      wealthImpact: 4000,
    },
  },

  {
    id: 'home_repair',
    title: 'ð§ Major Home Repair',
    description:
      'Your roof and HVAC both failed. Repairs will cost $18,000.',
    type: EVENT_TYPES.EMERGENCY,
    cost: 18000,
    minAge: 28,
    maxAge: 65,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Quick $18K policy loan. No credit check. No bank approval needed.',
      xpBonus: 100,
      wealthImpact: -900,
    },
    bankOption: {
      label: 'Home Equity Line',
      description: 'HELOC at 8.5%. Added debt tied to your home.',
      wealthImpact: -3500,
    },
    cashOption: {
      label: 'Credit Card',
      description: 'Put it on credit cards at 22% APR. Very expensive.',
      wealthImpact: -8000,
    },
  },

  // âââ BUSINESS EVENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'business_start',
    title: 'ð¼ Launch Your Business',
    description:
      'You\'ve got a killer business idea. Startup costs: $40,000. ROI potential is high.',
    type: EVENT_TYPES.OPPORTUNITY,
    cost: 40000,
    minAge: 25,
    maxAge: 50,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Fund your business with a $40K policy loan. Be your own bank.',
      xpBonus: 500,
      wealthImpact: 15000,  // business ROI outweighs loan cost
    },
    bankOption: {
      label: 'SBA Loan',
      description: '6.5% business loan. Bank owns a piece of your dream.',
      wealthImpact: 8000,
    },
    cashOption: {
      label: 'Pass',
      description: 'The timing isn\'t right. Skip this opportunity.',
      wealthImpact: 0,
    },
  },

  {
    id: 'franchise_opportunity',
    title: 'ð Franchise Opportunity',
    description:
      'A profitable franchise is available in your area. Buy-in: $75,000.',
    type: EVENT_TYPES.OPPORTUNITY,
    cost: 75000,
    minAge: 30,
    maxAge: 55,
    ibcOption: {
      label: 'Multiple Policy Loans',
      description: 'Stack loans from your policy to fund the franchise. Recapture all the interest.',
      xpBonus: 700,
      wealthImpact: 25000,
    },
    bankOption: {
      label: 'Business Loan',
      description: 'Bank funds the franchise at 7% over 10 years.',
      wealthImpact: 12000,
    },
    cashOption: {
      label: 'Pass',
      description: 'You don\'t have the capital. Missed opportunity.',
      wealthImpact: -2000,  // regret cost â inflation erodes opportunity
    },
  },

  // âââ EDUCATION EVENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'college_fund',
    title: 'ð Child\'s College Fund',
    description:
      'Your child starts college in one year. Tuition + living: $60,000.',
    type: EVENT_TYPES.MILESTONE,
    cost: 60000,
    minAge: 40,
    maxAge: 55,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Fund college with your policy. No FAFSA complications. No bank.',
      xpBonus: 450,
      wealthImpact: -3000,
    },
    bankOption: {
      label: 'Parent PLUS Loans',
      description: '8.05% federal PLUS loans. Significant long-term debt.',
      wealthImpact: -12000,
    },
    cashOption: {
      label: 'Scholarship Hunt',
      description: 'Your child works part-time and wins partial scholarships.',
      wealthImpact: -20000,
    },
  },

  // âââ INVESTMENT EVENTS ââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'real_estate_deal',
    title: 'ð¢ Real Estate Investment',
    description:
      'A rental property deal just hit the market. You need $30,000 for the down payment. It cash flows $800/month.',
    type: EVENT_TYPES.OPPORTUNITY,
    cost: 30000,
    minAge: 28,
    maxAge: 58,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Use a policy loan for the down payment. Rent income repays the loan.',
      xpBonus: 600,
      wealthImpact: 22000,  // rental income over time
    },
    bankOption: {
      label: 'Investment Property Loan',
      description: 'Higher rate (7.5%) for non-owner occupied. Cuts into cash flow.',
      wealthImpact: 14000,
    },
    cashOption: {
      label: 'Pass',
      description: 'Let this deal go.',
      wealthImpact: -1000,
    },
  },

  {
    id: 'stock_market_dip',
    title: 'ð Market Crash Buy Opportunity',
    description:
      'The market just dropped 30%. Smart money is buying. You need $25,000 to take advantage.',
    type: EVENT_TYPES.OPPORTUNITY,
    cost: 25000,
    minAge: 25,
    maxAge: 60,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Pull $25K from your policy â instantly available. Buy the dip.',
      xpBonus: 400,
      wealthImpact: 18000,  // market recovery gains
    },
    bankOption: {
      label: 'Margin Account',
      description: 'Use broker margin at 9%. Risky if market stays down.',
      wealthImpact: 10000,
    },
    cashOption: {
      label: 'Do Nothing',
      description: 'You\'re too scared to buy. Miss the recovery rally.',
      wealthImpact: 0,
    },
  },

  // âââ EMERGENCY EVENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'medical_emergency',
    title: 'ð¥ Medical Emergency',
    description:
      'Unexpected surgery + hospital stay. After insurance, your out-of-pocket is $22,000.',
    type: EVENT_TYPES.EMERGENCY,
    cost: 22000,
    minAge: 22,
    maxAge: 65,
    ibcOption: {
      label: 'Policy Loan',
      description: 'No stress. Pull $22K from your policy immediately. No credit check.',
      xpBonus: 200,
      wealthImpact: -1100,
    },
    bankOption: {
      label: 'Medical Payment Plan',
      description: 'Hospital payment plan at 12%. Long-term financial drag.',
      wealthImpact: -6000,
    },
    cashOption: {
      label: 'Credit Card Debt',
      description: '24% APR credit card. Financial disaster.',
      wealthImpact: -10000,
    },
  },

  {
    id: 'job_loss',
    title: 'â ï¸ Job Loss',
    description:
      'You were laid off. You need $24,000 to cover 6 months of living expenses while you job hunt.',
    type: EVENT_TYPES.EMERGENCY,
    cost: 24000,
    minAge: 25,
    maxAge: 60,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Your policy is your emergency fund. Access $24K immediately â no bank approval.',
      xpBonus: 350,
      wealthImpact: -1200,
    },
    bankOption: {
      label: 'Raid Retirement Account',
      description: 'Early 401k withdrawal â 10% penalty + income tax. Destroys future wealth.',
      wealthImpact: -14000,
    },
    cashOption: {
      label: 'Borrow from Family',
      description: 'Awkward, but interest-free.',
      wealthImpact: -2000,  // relationship cost / stress
    },
  },

  // âââ FAMILY EVENTS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'new_baby',
    title: 'ð¶ New Baby!',
    description:
      'Congratulations! A baby is on the way. Hospital + nursery + emergency fund: $15,000.',
    type: EVENT_TYPES.MILESTONE,
    cost: 15000,
    minAge: 24,
    maxAge: 42,
    ibcOption: {
      label: 'Policy Loan + Baby Policy',
      description: 'Fund costs with a policy loan AND start a whole life policy for the baby. Generational wealth begins.',
      xpBonus: 500,
      wealthImpact: 2000,  // baby policy starts compounding for 18+ years
    },
    bankOption: {
      label: 'Savings Account',
      description: 'Drain your HYSA. Start fresh.',
      wealthImpact: -3000,
    },
    cashOption: {
      label: 'Credit & Worry',
      description: 'Finance it. Stress is at an all-time high.',
      wealthImpact: -5000,
    },
  },

  {
    id: 'wedding',
    title: 'ð Wedding Day',
    description:
      'You\'re getting married! Dream wedding budget: $28,000.',
    type: EVENT_TYPES.MILESTONE,
    cost: 28000,
    minAge: 22,
    maxAge: 40,
    ibcOption: {
      label: 'Policy Loan',
      description: 'Fund the wedding with a policy loan. Repay yourself post-honeymoon.',
      xpBonus: 200,
      wealthImpact: -1400,
    },
    bankOption: {
      label: 'Personal Loan',
      description: '10% personal loan. Starting married life in debt.',
      wealthImpact: -6000,
    },
    cashOption: {
      label: 'Small Wedding',
      description: 'Courthouse + dinner with close family. Save the money.',
      wealthImpact: 5000,
    },
  },

  // âââ WINDFALL EVENTS ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'inheritance',
    title: 'ð Unexpected Inheritance',
    description:
      'A relative left you $40,000. What\'s the smartest move?',
    type: EVENT_TYPES.BONUS,
    cost: 0,
    windfall: 40000,
    minAge: 22,
    maxAge: 65,
    ibcOption: {
      label: 'Overfund Your Policy (PUA)',
      description: 'Dump the $40K into Paid-Up Additions. Supercharge your cash value immediately.',
      xpBonus: 600,
      wealthImpact: 20000,  // PUA compounding over decades
    },
    bankOption: {
      label: 'Invest in Index Funds',
      description: 'S&P 500 index fund. Market-dependent growth.',
      wealthImpact: 14000,
    },
    cashOption: {
      label: 'Pay Off Loans',
      description: 'Use it to repay any policy loans or high-interest debt.',
      wealthImpact: 8000,
    },
  },

  {
    id: 'bonus_check',
    title: 'ð° Year-End Bonus',
    description:
      'Your employer just surprised you with a $12,000 performance bonus!',
    type: EVENT_TYPES.BONUS,
    cost: 0,
    windfall: 12000,
    minAge: 22,
    maxAge: 65,
    ibcOption: {
      label: 'Repay Policy Loan',
      description: 'Use the bonus to repay your policy loan. Recapture the interest.',
      xpBonus: 300,
      wealthImpact: 5000,
    },
    bankOption: {
      label: 'Add to Savings',
      description: 'Park it in your HYSA at 4.5%.',
      wealthImpact: 3000,
    },
    cashOption: {
      label: 'Lifestyle Upgrade',
      description: 'Treat yourself. No wealth impact but happiness +10.',
      wealthImpact: -1000,
    },
  },

  // âââ ADVANCED EVENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'policy_dividend_spike',
    title: 'ð Record Dividend Year',
    description:
      'Your insurance company had an exceptional year. Your policy dividend is 2Ã normal this year!',
    type: EVENT_TYPES.BONUS,
    cost: 0,
    windfall: 0,
    minAge: 27,
    maxAge: 65,
    ibcOption: {
      label: 'Use Dividend to Fund PUA',
      description: 'Direct the extra dividend into paid-up additions for accelerated growth.',
      xpBonus: 400,
      wealthImpact: 8000,
    },
    bankOption: {
      label: 'Take Cash Dividend',
      description: 'Pocket the dividend as cash.',
      wealthImpact: 2000,
    },
    cashOption: {
      label: 'Reduce Premium Temporarily',
      description: 'Let the dividend cover this year\'s premium.',
      wealthImpact: 1500,
    },
  },

  {
    id: 'legacy_transfer',
    title: 'ð¦ Set Up Children\'s Policies',
    description:
      'Your financial advisor recommends starting whole life policies for your children to build their generational wealth.',
    type: EVENT_TYPES.OPPORTUNITY,
    cost: 5000,  // annual premiums for kids' policies
    minAge: 30,
    maxAge: 50,
    ibcOption: {
      label: 'Fund Children\'s Policies',
      description: 'Start whole life policies for your kids. 40+ years of compounding begins now.',
      xpBonus: 800,
      wealthImpact: 30000,  // generational compounding value
    },
    bankOption: {
      label: '529 College Plans',
      description: 'Education-restricted accounts. Good but limited in use.',
      wealthImpact: 10000,
    },
    cashOption: {
      label: 'Pass for Now',
      description: 'Wait until you\'re more financially stable.',
      wealthImpact: -5000,  // lost decades of compounding
    },
  },
];

// âââ Event Utilities ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Get random life event appropriate for the player's current age.
 * Avoids recently shown events.
 */
export function getRandomEvent(age, recentEventIds = []) {
  const eligible = LIFE_EVENTS.filter(
    (e) => age >= e.minAge && age <= e.maxAge && !recentEventIds.includes(e.id)
  );

  if (eligible.length === 0) return LIFE_EVENTS[0]; // fallback

  // Weight EMERGENCY events more heavily in early career
  // Weight OPPORTUNITY events more in mid-career
  const weights = eligible.map((e) => {
    if (e.type === EVENT_TYPES.EMERGENCY && age < 35) return 2;
    if (e.type === EVENT_TYPES.OPPORTUNITY && age >= 30) return 2;
    if (e.type === EVENT_TYPES.BONUS) return 1.5;
    return 1;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < eligible.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return eligible[i];
  }

  return eligible[eligible.length - 1];
}

/**
 * Get the XP gained from making a smart financial choice.
 */
export function calculateEventXP(event, choiceType) {
  const base = event.ibcOption?.xpBonus || 100;
  if (choiceType === 'ibc') return base;
  if (choiceType === 'bank') return Math.round(base * 0.4);
  if (choiceType === 'cash') return Math.round(base * 0.6);
  return 0;
}
