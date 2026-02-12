/**
 * Time-Series Snapshots
 * 
 * These entities track values that change over time with effective dates.
 * They enable historical queries and trend analysis.
 */

// ============================================
// Valuation Snapshots
// ============================================

export type ValuationSource = 
  | 'zillow_api' 
  | 'manual' 
  | 'appraisal' 
  | 'comparative_market_analysis'
  | 'tax_assessment';

export type ValuationConfidence = 'high' | 'medium' | 'low';

/**
 * ValuationSnapshot represents a property's estimated market value at a point in time.
 * 
 * Key principles:
 * - Each snapshot is immutable once created
 * - Multiple snapshots can exist for the same date from different sources
 * - Current value = most recent snapshot
 * - Historical value = snapshot at or before specific date
 * 
 * Query patterns:
 * - Current: ORDER BY effectiveDate DESC LIMIT 1
 * - Historical: WHERE effectiveDate <= '2024-06-01' ORDER BY effectiveDate DESC LIMIT 1
 */
export interface ValuationSnapshot {
  id: string;
  propertyId: string;
  effectiveDate: Date;
  estimatedValue: number;
  source: ValuationSource;
  confidence: ValuationConfidence;
  metadata?: Record<string, any>;  // API response, comparables, assessor data, etc.
  createdAt: Date;
}

// ============================================
// Loan Balance Snapshots
// ============================================

export type BalanceSource = 
  | 'amortization_calculated' 
  | 'statement' 
  | 'manual_override';

/**
 * LoanBalanceSnapshot tracks the principal balance of a loan over time.
 * 
 * Key principles:
 * - Balance decreases monthly via amortization
 * - Statement snapshots provide ground truth
 * - Manual overrides for extra principal payments
 * - Source field enables audit trail
 * 
 * Usage:
 * - Current balance: Latest snapshot for active loan
 * - Historical balance: Snapshot at or before specific date
 * - Projected balance: Amortization calculation from last known snapshot
 */
export interface LoanBalanceSnapshot {
  id: string;
  loanId: string;
  effectiveDate: Date;
  principalBalance: number;
  source: BalanceSource;
  notes?: string;                  // e.g., "Extra $5K principal payment"
  createdAt: Date;
}

/**
 * Helper to find current balance from snapshots
 */
export function getCurrentBalance(snapshots: LoanBalanceSnapshot[]): number {
  if (snapshots.length === 0) return 0;
  
  const sorted = [...snapshots].sort(
    (a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime()
  );
  
  return sorted[0].principalBalance;
}

/**
 * Helper to find balance at specific date
 */
export function getBalanceAtDate(
  snapshots: LoanBalanceSnapshot[],
  targetDate: Date
): number {
  const validSnapshots = snapshots.filter(
    s => s.effectiveDate <= targetDate
  );
  
  if (validSnapshots.length === 0) return 0;
  
  const sorted = validSnapshots.sort(
    (a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime()
  );
  
  return sorted[0].principalBalance;
}
