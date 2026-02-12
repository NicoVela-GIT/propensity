/**
 * Computed Metrics
 * 
 * All derived calculations for property and portfolio performance.
 * These metrics are NEVER stored - always computed from source data.
 */

import { Property, Loan, CapitalStructure } from './entities';
import { ValuationSnapshot, LoanBalanceSnapshot } from './snapshots';
import { Lease, RentPayment, Expense } from './operating';

// ============================================
// Property-Level Metrics
// ============================================

/**
 * Calculate current equity for a property
 * 
 * Formula: Equity = Current Valuation - Sum of Active Loan Balances
 * 
 * @param currentValuation - Latest property valuation
 * @param activeLoanBalances - Array of current balances for all active loans
 * @returns Current equity in dollars
 */
export function calculateEquity(
  currentValuation: number,
  activeLoanBalances: number[]
): number {
  const totalDebt = activeLoanBalances.reduce((sum, balance) => sum + balance, 0);
  return currentValuation - totalDebt;
}

/**
 * Calculate equity as percentage of property value
 * 
 * @param currentValuation - Latest property valuation
 * @param activeLoanBalances - Array of current balances for all active loans
 * @returns Equity percentage (0-100)
 */
export function calculateEquityPercentage(
  currentValuation: number,
  activeLoanBalances: number[]
): number {
  if (currentValuation === 0) return 0;
  const equity = calculateEquity(currentValuation, activeLoanBalances);
  return (equity / currentValuation) * 100;
}

/**
 * Calculate appreciation percentage since purchase
 * 
 * Formula: Appreciation = ((Current Value - Purchase Price) / Purchase Price) * 100
 * 
 * @param currentValue - Current property value
 * @param purchasePrice - Original purchase price
 * @returns Appreciation percentage
 */
export function calculateAppreciation(
  currentValue: number,
  purchasePrice: number
): number {
  if (purchasePrice === 0) return 0;
  return ((currentValue - purchasePrice) / purchasePrice) * 100;
}

/**
 * Calculate absolute appreciation in dollars
 * 
 * @param currentValue - Current property value
 * @param purchasePrice - Original purchase price
 * @returns Appreciation in dollars
 */
export function calculateAppreciationAmount(
  currentValue: number,
  purchasePrice: number
): number {
  return currentValue - purchasePrice;
}

/**
 * Calculate monthly cash flow
 * 
 * Formula: Cash Flow = Monthly Rent - Monthly Expenses - Total Debt Service
 * 
 * @param monthlyRent - Total monthly rental income
 * @param monthlyExpenses - Total monthly operating expenses
 * @param loanPayments - Array of monthly payments for all active loans
 * @returns Monthly cash flow (can be negative)
 */
export function calculateMonthlyCashFlow(
  monthlyRent: number,
  monthlyExpenses: number,
  loanPayments: number[]
): number {
  const totalDebtService = loanPayments.reduce((sum, payment) => sum + payment, 0);
  return monthlyRent - monthlyExpenses - totalDebtService;
}

/**
 * Calculate Net Operating Income (NOI)
 * 
 * NOI excludes debt service - it's a property-level metric independent of financing
 * Formula: NOI = Rental Income - Operating Expenses
 * 
 * @param monthlyRent - Monthly rental income
 * @param monthlyExpenses - Monthly operating expenses (taxes, insurance, HOA, maintenance, etc.)
 * @returns Monthly NOI
 */
export function calculateNOI(
  monthlyRent: number,
  monthlyExpenses: number
): number {
  return monthlyRent - monthlyExpenses;
}

/**
 * Calculate annual cash flow from monthly
 * 
 * @param monthlyCashFlow - Monthly cash flow
 * @returns Annualized cash flow
 */
export function calculateAnnualCashFlow(monthlyCashFlow: number): number {
  return monthlyCashFlow * 12;
}

// ============================================
// Return Metrics
// ============================================

/**
 * Calculate Cash-on-Cash Return
 * 
 * CoC measures annual cash flow as a percentage of cash invested.
 * Formula: CoC = (Annual Cash Flow / Initial Cash Invested) * 100
 * 
 * @param annualCashFlow - Total annual cash flow (can be negative)
 * @param initialCashInvested - Down payment + closing costs paid in cash
 * @returns Cash-on-cash return percentage
 */
export function calculateCashOnCashReturn(
  annualCashFlow: number,
  initialCashInvested: number
): number {
  if (initialCashInvested === 0) return 0;
  return (annualCashFlow / initialCashInvested) * 100;
}

/**
 * Calculate total ROI including all sources of return
 * 
 * Total return includes:
 * 1. Cash flow (monthly income after all expenses)
 * 2. Appreciation (property value increase)
 * 3. Principal paydown (forced savings via mortgage)
 * 
 * Formula: ROI = ((Cash Flow + Appreciation + Principal Paydown) / Initial Cash Invested) * 100
 * 
 * @param annualCashFlow - Annual net cash flow
 * @param currentValue - Current property value
 * @param previousYearValue - Property value one year ago
 * @param currentLoanBalances - Current balances of all active loans
 * @param previousYearLoanBalances - Loan balances one year ago
 * @param initialCashInvested - Initial cash investment
 * @returns Total ROI percentage (annualized)
 */
export function calculateTotalROI(
  annualCashFlow: number,
  currentValue: number,
  previousYearValue: number,
  currentLoanBalances: number[],
  previousYearLoanBalances: number[],
  initialCashInvested: number
): number {
  if (initialCashInvested === 0) return 0;
  
  // 1. Cash flow gain
  const cashFlowGain = annualCashFlow;
  
  // 2. Appreciation gain
  const appreciationGain = currentValue - previousYearValue;
  
  // 3. Principal paydown (debt reduction = equity increase)
  const previousDebt = previousYearLoanBalances.reduce((sum, b) => sum + b, 0);
  const currentDebt = currentLoanBalances.reduce((sum, b) => sum + b, 0);
  const principalPaydown = previousDebt - currentDebt;
  
  // Total gain
  const totalGain = cashFlowGain + appreciationGain + principalPaydown;
  
  return (totalGain / initialCashInvested) * 100;
}

/**
 * Calculate equity multiple
 * 
 * Shows how many times your initial investment you now have in equity.
 * Example: 2.5x means your $20K investment is now $50K in equity.
 * 
 * @param currentEquity - Current equity in property
 * @param initialCashInvested - Initial cash investment
 * @returns Equity multiple (e.g., 2.5 = 2.5x return)
 */
export function calculateEquityMultiple(
  currentEquity: number,
  initialCashInvested: number
): number {
  if (initialCashInvested === 0) return 0;
  return currentEquity / initialCashInvested;
}

/**
 * Calculate cap rate (capitalization rate)
 * 
 * Cap rate is used for valuing investment properties.
 * Formula: Cap Rate = (Annual NOI / Property Value) * 100
 * 
 * @param annualNOI - Annual Net Operating Income
 * @param propertyValue - Current property value
 * @returns Cap rate percentage
 */
export function calculateCapRate(
  annualNOI: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;
  return (annualNOI / propertyValue) * 100;
}

// ============================================
// Portfolio-Level Metrics
// ============================================

export interface PortfolioMetricsParams {
  asOfDate: Date;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface PortfolioMetrics {
  // Stock metrics (point-in-time as of asOfDate)
  totalValue: number;
  totalEquity: number;
  propertiesOwned: number;
  
  // Flow metrics (aggregated over [periodStart, periodEnd])
  periodCashFlow: number;
  periodAppreciation: number;
  periodPrincipalPaydown: number;
  
  // Derived metrics
  annualizedCashOnCash: number;
  annualizedTotalReturn: number;
  
  // Metadata
  queryParams: PortfolioMetricsParams;
}

/**
 * Calculate weighted average ROI across portfolio
 * 
 * Weighted by initial cash invested (NOT simple average).
 * A 50% ROI on $10K is less impactful than a 10% ROI on $100K.
 * 
 * Formula: Weighted ROI = Sum(property_roi * cash_invested) / Sum(cash_invested)
 * 
 * @param propertyROIs - Array of { roi, cashInvested } for each property
 * @returns Weighted average ROI percentage
 */
export function calculateWeightedPortfolioROI(
  propertyROIs: Array<{ roi: number; cashInvested: number }>
): number {
  const totalInvested = propertyROIs.reduce((sum, p) => sum + p.cashInvested, 0);
  if (totalInvested === 0) return 0;
  
  const weightedSum = propertyROIs.reduce(
    (sum, p) => sum + (p.roi * p.cashInvested),
    0
  );
  
  return weightedSum / totalInvested;
}

/**
 * Calculate portfolio total debt
 * 
 * @param activeLoanBalances - Array of all active loan balances across portfolio
 * @returns Total outstanding debt
 */
export function calculatePortfolioDebt(activeLoanBalances: number[]): number {
  return activeLoanBalances.reduce((sum, balance) => sum + balance, 0);
}

/**
 * Calculate portfolio leverage ratio
 * 
 * Formula: Leverage = Total Debt / Total Value
 * 
 * @param totalDebt - Sum of all loan balances
 * @param totalValue - Sum of all property values
 * @returns Leverage ratio as decimal (e.g., 0.75 = 75% LTV)
 */
export function calculateLeverageRatio(
  totalDebt: number,
  totalValue: number
): number {
  if (totalValue === 0) return 0;
  return totalDebt / totalValue;
}

// ============================================
// Date/Time Utilities
// ============================================

/**
 * Calculate months remaining on a loan
 * 
 * @param originationDate - When the loan started
 * @param termMonths - Original loan term in months
 * @param currentDate - Date to calculate from (defaults to now)
 * @returns Months remaining (0 if loan term has passed)
 */
export function calculateMonthsRemaining(
  originationDate: Date,
  termMonths: number,
  currentDate: Date = new Date()
): number {
  const msPerMonth = 1000 * 60 * 60 * 24 * 30.44; // Average days per month
  const monthsElapsed = Math.floor(
    (currentDate.getTime() - originationDate.getTime()) / msPerMonth
  );
  return Math.max(0, termMonths - monthsElapsed);
}

/**
 * Calculate days until lease expiration
 * 
 * @param endDate - Lease end date
 * @param currentDate - Date to calculate from (defaults to now)
 * @returns Days until expiration (negative if expired)
 */
export function calculateDaysUntilExpiration(
  endDate: Date,
  currentDate: Date = new Date()
): number {
  const diffTime = endDate.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Annualize a period return based on number of days
 * 
 * @param periodReturn - Return over the period (as percentage)
 * @param days - Number of days in the period
 * @returns Annualized return percentage
 */
export function annualizeReturn(
  periodReturn: number,
  days: number
): number {
  if (days === 0) return 0;
  const annualizationFactor = 365 / days;
  return periodReturn * annualizationFactor;
}

/**
 * Calculate days between two dates
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// Loan Amortization Calculations
// ============================================

/**
 * Calculate monthly payment for a loan
 * 
 * Uses standard amortization formula
 * 
 * @param principal - Loan principal
 * @param annualRate - Annual interest rate (e.g., 4.5 for 4.5%)
 * @param termMonths - Loan term in months
 * @returns Monthly payment (principal + interest)
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal === 0 || termMonths === 0) return 0;
  if (annualRate === 0) return principal / termMonths;
  
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  return payment;
}

/**
 * Calculate remaining balance after N payments
 * 
 * @param principal - Original loan principal
 * @param annualRate - Annual interest rate (e.g., 4.5 for 4.5%)
 * @param termMonths - Original loan term in months
 * @param paymentsMade - Number of payments already made
 * @returns Remaining principal balance
 */
export function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  termMonths: number,
  paymentsMade: number
): number {
  if (paymentsMade >= termMonths) return 0;
  if (annualRate === 0) {
    return principal - (principal / termMonths * paymentsMade);
  }
  
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  
  const remainingBalance = principal * Math.pow(1 + monthlyRate, paymentsMade) - 
    monthlyPayment * ((Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate);
  
  return Math.max(0, remainingBalance);
}
