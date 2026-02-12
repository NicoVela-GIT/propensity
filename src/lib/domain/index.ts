/**
 * Domain Model - Barrel Export
 * 
 * Central export point for all domain entities, types, and functions.
 * Import from this file in your application code.
 * 
 * Usage:
 * ```typescript
 * import { Property, Loan, calculateEquity } from '@/lib/domain';
 * ```
 */

// ============================================
// Core Entities
// ============================================

export type {
  Property,
  CapitalStructure,
  Loan,
  LoanWithBalance,
  LoanType,
  LoanStatus,
} from './entities';

export { calculateCashInvested } from './entities';

// ============================================
// Time-Series Snapshots
// ============================================

export type {
  ValuationSnapshot,
  ValuationSource,
  ValuationConfidence,
  LoanBalanceSnapshot,
  BalanceSource,
} from './snapshots';

export {
  getCurrentBalance,
  getBalanceAtDate,
} from './snapshots';

// ============================================
// Operating Performance
// ============================================

export type {
  Lease,
  LeaseType,
  LeaseStatus,
  RentPayment,
  PaymentStatus,
  Expense,
  ExpenseCategory,
  RecurrencePattern,
  RecurringExpense,
  RecurringExpenseSnapshot,
} from './operating';

export {
  getLeaseExpirationDate,
  getDaysUntilExpiration,
  getPeriodString,
  getMonthlyExpenseAmount,
} from './operating';

// ============================================
// Alert System
// ============================================

export type {
  AlertRule,
  AlertRuleType,
  Alert,
  AlertSeverity,
  UserAlertState,
} from './alerts';

export {
  ALERT_RULE_TEMPLATES,
  generateAlertId,
} from './alerts';

// ============================================
// Computed Metrics
// ============================================

export type {
  PortfolioMetrics,
  PortfolioMetricsParams,
} from './computed';

export {
  // Property-level equity calculations
  calculateEquity,
  calculateEquityPercentage,
  
  // Appreciation calculations
  calculateAppreciation,
  calculateAppreciationAmount,
  
  // Cash flow calculations
  calculateMonthlyCashFlow,
  calculateNOI,
  calculateAnnualCashFlow,
  
  // Return metrics
  calculateCashOnCashReturn,
  calculateTotalROI,
  calculateEquityMultiple,
  calculateCapRate,
  
  // Portfolio metrics
  calculateWeightedPortfolioROI,
  calculatePortfolioDebt,
  calculateLeverageRatio,
  
  // Date/time utilities
  calculateMonthsRemaining,
  calculateDaysUntilExpiration,
  annualizeReturn,
  daysBetween,
  
  // Loan calculations
  calculateMonthlyPayment,
  calculateRemainingBalance,
} from './computed';

// ============================================
// Adapters (Backward Compatibility)
// ============================================

export {
  convertOldPropertyToNew,
  convertNewPropertyToOld,
  convertOldPropertiesToNew,
  extractProperties,
  extractLoans,
  convertOldAlertToNew,
  validateConversion,
} from './adapters';
