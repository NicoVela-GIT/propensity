/**
 * Operating Performance Entities
 * 
 * These entities track income and expenses that affect cash flow.
 */

// ============================================
// Lease Entity
// ============================================

export type LeaseType = 'fixed' | 'month-to-month';
export type LeaseStatus = 'active' | 'expired' | 'terminated';

/**
 * Lease represents a rental agreement with a tenant.
 * 
 * Key principles:
 * - Lease changes create new lease records (preserves history)
 * - Only one active lease per property at a time
 * - Month-to-month leases have no end date
 * - Rent payments tracked separately for occupancy analysis
 */
export interface Lease {
  id: string;
  propertyId: string;
  tenantName?: string;
  leaseType: LeaseType;
  
  startDate: Date;
  endDate?: Date;                  // Null for month-to-month
  
  monthlyRent: number;
  securityDeposit?: number;
  
  status: LeaseStatus;
  renewalReminderDays: number;     // e.g., 60 days before expiration
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper to calculate lease expiration date
 */
export function getLeaseExpirationDate(lease: Lease): Date | null {
  if (lease.leaseType === 'month-to-month') {
    // Month-to-month leases don't have a fixed expiration
    const nextMonth = new Date(lease.startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  }
  
  return lease.endDate || null;
}

/**
 * Helper to calculate days until lease expiration
 */
export function getDaysUntilExpiration(lease: Lease, currentDate: Date = new Date()): number | null {
  const expirationDate = getLeaseExpirationDate(lease);
  if (!expirationDate) return null;
  
  const diffTime = expirationDate.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// Rent Payment
// ============================================

export type PaymentStatus = 'paid' | 'late' | 'unpaid';

/**
 * RentPayment tracks expected and actual rent received for a period.
 * 
 * Enables:
 * - Occupancy tracking (paid vs unpaid months)
 * - Late payment identification
 * - Actual vs expected income analysis
 */
export interface RentPayment {
  id: string;
  leaseId: string;
  period: string;                  // 'YYYY-MM' format (e.g., '2024-03')
  expectedAmount: number;
  receivedAmount?: number;
  receivedDate?: Date;
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
}

/**
 * Helper to generate period string from date
 */
export function getPeriodString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// ============================================
// Expenses
// ============================================

export type ExpenseCategory = 
  | 'property_tax' 
  | 'insurance' 
  | 'hoa' 
  | 'maintenance' 
  | 'utilities' 
  | 'management_fee'
  | 'capital_improvement'
  | 'other';

export type RecurrencePattern = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | null;

/**
 * Expense represents a dated cost associated with property operations.
 * 
 * Types:
 * - One-time: Repairs, improvements (isRecurring = false)
 * - Recurring: Taxes, insurance, HOA (isRecurring = true)
 */
export interface Expense {
  id: string;
  propertyId: string;
  effectiveDate: Date;
  category: ExpenseCategory;
  amount: number;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern;
  description?: string;
  createdAt: Date;
}

// ============================================
// Recurring Expenses (with variable amounts)
// ============================================

/**
 * RecurringExpense models expenses that repeat but may change in amount.
 * 
 * Examples:
 * - Property tax (annual, amount changes yearly)
 * - Insurance (annual, premium increases)
 * - HOA fees (monthly, periodic increases)
 * 
 * Amount changes tracked via RecurringExpenseSnapshot
 */
export interface RecurringExpense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  recurrencePattern: Exclude<RecurrencePattern, null>;
  currentAmount: number;           // Latest known value (for projections)
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RecurringExpenseSnapshot tracks amount changes over time.
 * 
 * Query pattern:
 * - Current amount: Latest snapshot
 * - Historical: Snapshot at or before specific date
 */
export interface RecurringExpenseSnapshot {
  id: string;
  recurringExpenseId: string;
  effectiveDate: Date;
  amount: number;
  source: 'bill_received' | 'estimated' | 'manual';
  notes?: string;                  // e.g., "Tax reassessment +12%"
  createdAt: Date;
}

/**
 * Helper to prorate recurring expense to monthly amount
 */
export function getMonthlyExpenseAmount(
  amount: number,
  pattern: Exclude<RecurrencePattern, null>
): number {
  switch (pattern) {
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'semiannual':
      return amount / 6;
    case 'annual':
      return amount / 12;
    default:
      return 0;
  }
}
