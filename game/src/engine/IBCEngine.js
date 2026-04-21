/**
 * IBCEngine.js
 * Core Infinite Banking Concept calculations.
 * Models a dividend-paying whole life insurance policy.
 */

// âââ Constants âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export const POLICY_CONSTANTS = {
  BASE_GROWTH_RATE: 0.045,       // 4.5% guaranteed crediting rate
  DIVIDEND_RATE: 0.015,          // 1.5% dividend (mutual company)
  LOAN_INTEREST_RATE: 0.05,      // 5% annual policy loan rate
  MAX_LOAN_RATIO: 0.90,          // borrow up to 90% of cash value
  YEAR1_EFFICIENCY: 0.65,        // yr 1 cash value = 65% of premium (policy fees)
  YEAR2_EFFICIENCY: 0.85,        // yr 2 cash value efficiency
  DEATH_BENEFIT_MULTIPLIER: 12,  // initial DB = 12Ã annual premium
  MEC_RATIO: 0.25,               // premium over 25% of income triggers MEC risk warning
};

// âââ Policy Initialization ââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Create a new policy given annual premium and income.
 */
export function createPolicy(annualPremium, annualIncome) {
  const deathBenefit = annualPremium * POLICY_CONSTANTS.DEATH_BENEFIT_MULTIPLIER;
  const cashValue = annualPremium * POLICY_CONSTANTS.YEAR1_EFFICIENCY;
  const isMEC = annualPremium / annualIncome > POLICY_CONSTANTS.MEC_RATIO;

  return {
    annualPremium,
    cashValue,
    deathBenefit,
    loanBalance: 0,
    totalPremiumsPaid: annualPremium,
    policyYear: 1,
    isMECRisk: isMEC,
    dividendsEarned: 0,
    totalInterestPaid: 0,
  };
}

// âââ Annual Policy Growth âââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Advance policy by one year.
 * Returns updated policy object + summary of changes.
 */
export function growPolicy(policy, additionalPremium = 0) {
  const premium = policy.annualPremium + additionalPremium;
  const policyYear = policy.policyYear + 1;

  // Cash value efficiency improves after year 1
  const efficiency = policyYear === 2
    ? POLICY_CONSTANTS.YEAR2_EFFICIENCY
    : 1.0;

  // New premium adds to cash value
  const newPremiumCashValue = premium * efficiency;

  // Existing cash value grows at guaranteed rate
  const guaranteedGrowth = policy.cashValue * POLICY_CONSTANTS.BASE_GROWTH_RATE;

  // Dividend on total cash value (net of loan)
  const netCashValue = Math.max(0, policy.cashValue - policy.loanBalance);
  const dividend = netCashValue * POLICY_CONSTANTS.DIVIDEND_RATE;

  // Loan interest accrues on outstanding balance
  const loanInterest = policy.loanBalance * POLICY_CONSTANTS.LOAN_INTEREST_RATE;
  const newLoanBalance = policy.loanBalance + loanInterest;

  // New cash value
  const newCashValue = policy.cashValue + newPremiumCashValue + guaranteedGrowth + dividend;

  // Death benefit grows with cash value
  const dbGrowth = guaranteedGrowth * 2; // DB grows faster than CV
  const newDeathBenefit = policy.deathBenefit + dbGrowth + (premium * 8);

  return {
    policy: {
      ...policy,
      annualPremium: policy.annualPremium,
      cashValue: newCashValue,
      deathBenefit: newDeathBenefit,
      loanBalance: newLoanBalance,
      totalPremiumsPaid: policy.totalPremiumsPaid + premium,
      policyYear,
      dividendsEarned: policy.dividendsEarned + dividend,
      totalInterestPaid: policy.totalInterestPaid + loanInterest,
    },
    summary: {
      guaranteedGrowth: Math.round(guaranteedGrowth),
      dividend: Math.round(dividend),
      loanInterest: Math.round(loanInterest),
      newPremiumAdded: Math.round(newPremiumCashValue),
      netGain: Math.round(guaranteedGrowth + dividend - loanInterest + newPremiumCashValue),
    },
  };
}

// âââ Policy Loans âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Take a loan against the policy.
 * Returns { success, amount, policy, message }
 */
export function takePolicyLoan(policy, requestedAmount) {
  const maxLoan = policy.cashValue * POLICY_CONSTANTS.MAX_LOAN_RATIO - policy.loanBalance;

  if (maxLoan <= 0) {
    return {
      success: false,
      amount: 0,
      policy,
      message: 'No available loan capacity. Repay existing loans first.',
    };
  }

  const loanAmount = Math.min(requestedAmount, maxLoan);
  const newLoanBalance = policy.loanBalance + loanAmount;

  return {
    success: true,
    amount: Math.round(loanAmount),
    policy: { ...policy, loanBalance: newLoanBalance },
    message: loanAmount < requestedAmount
      ? `Partial loan: $${fmt(loanAmount)} (max available)`
      : `Loan of $${fmt(loanAmount)} approved`,
  };
}

/**
 * Repay a policy loan (partially or fully).
 */
export function repayPolicyLoan(policy, paymentAmount) {
  const actualPayment = Math.min(paymentAmount, policy.loanBalance);
  const newLoanBalance = policy.loanBalance - actualPayment;

  return {
    policy: { ...policy, loanBalance: newLoanBalance },
    amountRepaid: Math.round(actualPayment),
    remainingBalance: Math.round(newLoanBalance),
  };
}

// âââ Comparison: Bank Loan vs Policy Loan ââââââââââââââââââââââââââââââââââââ

/**
 * Compare total cost of bank loan vs IBC policy loan over N years.
 */
export function compareLoanOptions(amount, bankRate = 0.07, termYears = 5, policy) {
  // Bank loan total interest
  const monthlyBankRate = bankRate / 12;
  const n = termYears * 12;
  const monthlyPayment = amount * (monthlyBankRate * Math.pow(1 + monthlyBankRate, n)) /
    (Math.pow(1 + monthlyBankRate, n) - 1);
  const bankTotalPaid = monthlyPayment * n;
  const bankInterestPaid = bankTotalPaid - amount;

  // Policy loan: interest accrues but cash value keeps growing
  const policyInterestCost = amount * POLICY_CONSTANTS.LOAN_INTEREST_RATE * termYears;
  const lostGrowthOpportunity = 0; // Cash value keeps compounding even while loaned

  // Net cost of policy loan (interest paid minus continued dividend growth)
  const continuedDividend = policy
    ? (policy.cashValue * POLICY_CONSTANTS.DIVIDEND_RATE * termYears)
    : 0;
  const policyNetCost = Math.max(0, policyInterestCost - continuedDividend);

  return {
    bank: {
      totalPaid: Math.round(bankTotalPaid),
      interestPaid: Math.round(bankInterestPaid),
      monthlyPayment: Math.round(monthlyPayment),
    },
    policy: {
      totalInterest: Math.round(policyInterestCost),
      continuedDividend: Math.round(continuedDividend),
      netCost: Math.round(policyNetCost),
      cashValueUnaffected: true,
    },
    savings: Math.round(bankInterestPaid - policyNetCost),
    recommendation: bankInterestPaid > policyNetCost ? 'IBC' : 'Bank',
  };
}

// âââ Metrics & Scoring ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Get key policy metrics for display.
 */
export function getPolicyMetrics(policy) {
  const availableLoan = Math.max(
    0,
    policy.cashValue * POLICY_CONSTANTS.MAX_LOAN_RATIO - policy.loanBalance
  );
  const equityRatio = policy.loanBalance / policy.cashValue;
  const loanToValue = Math.round(equityRatio * 100);

  return {
    cashValue: Math.round(policy.cashValue),
    deathBenefit: Math.round(policy.deathBenefit),
    loanBalance: Math.round(policy.loanBalance),
    availableLoan: Math.round(availableLoan),
    loanToValue,
    policyYear: policy.policyYear,
    totalPremiumsPaid: Math.round(policy.totalPremiumsPaid),
    roi: policy.totalPremiumsPaid > 0
      ? Math.round(((policy.cashValue - policy.totalPremiumsPaid) / policy.totalPremiumsPaid) * 100)
      : 0,
    health: loanToValue < 50 ? 'Excellent' : loanToValue < 75 ? 'Good' : 'Warning',
    healthColor: loanToValue < 50 ? '#00E676' : loanToValue < 75 ? '#FFD700' : '#FF3D00',
  };
}

// âââ Helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function fmt(n) {
  return n.toLocaleString('en-US');
}

export function formatMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
