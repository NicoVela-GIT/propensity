/**
 * Core Domain Entities
 * 
 * These entities represent the fundamental building blocks of the real estate
 * investment domain model. They focus on immutable or slowly-changing data.
 */

// ============================================
// Core Property Entity
// ============================================

/**
 * Property represents a physical real estate asset and its acquisition context.
 * 
 * Key principles:
 * - Purchase price and date are immutable (historical facts)
 * - Physical attributes rarely change
 * - Current value is tracked separately in ValuationSnapshot
 * - Loan information is tracked separately in Loan entity
 */
export interface Property {
  id: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  
  // Physical attributes (rarely change)
  propertyType: 'single-family' | 'multi-family' | 'commercial' | 'condo' | 'townhouse';
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  
  // Acquisition (immutable after creation)
  purchasePrice: number;
  purchaseDate: Date;
  closingCosts?: number;
  
  // Metadata
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Capital Structure
// ============================================

/**
 * CapitalStructure tracks the initial capital investment for a property.
 * 
 * This is immutable and represents the acquisition financing structure.
 * Used for calculating cash-on-cash return and ROI.
 */
export interface CapitalStructure {
  propertyId: string;
  
  initialCapital: {
    cashInvested: number;          // Down payment + closing costs paid in cash
    loanAmount: number;             // Initial principal borrowed
    totalAcquisitionCost: number;   // Purchase price + closing costs
  };
  
  createdAt: Date;
}

/**
 * Helper to calculate cash invested
 */
export function calculateCashInvested(
  downPayment: number,
  closingCosts: number,
  closingCostsFinanced: number = 0
): number {
  return downPayment + (closingCosts - closingCostsFinanced);
}

// ============================================
// Loan Entity
// ============================================

export type LoanType = 'acquisition' | 'refinance' | 'heloc' | 'seller_financing';
export type LoanStatus = 'active' | 'paid_off' | 'refinanced';

/**
 * Loan represents a debt obligation against a property.
 * 
 * Key features:
 * - Supports multiple loans per property (e.g., mortgage + HELOC)
 * - Tracks refinance relationships via replacedByLoanId
 * - Balance history tracked separately in LoanBalanceSnapshot
 */
export interface Loan {
  id: string;
  propertyId: string;
  loanType: LoanType;
  
  terms: {
    originalPrincipal: number;
    interestRate: number;          // Annual percentage (e.g., 4.5 for 4.5%)
    termMonths: number;
    originationDate: Date;
    monthlyPayment: number;        // Principal + interest only (no taxes/insurance)
  };
  
  status: LoanStatus;
  paidOffDate?: Date;
  replacedByLoanId?: string;       // For refinance tracking
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended Loan interface with computed balance
 * (Used in application layer, not stored in database)
 */
export interface LoanWithBalance extends Loan {
  currentBalance: number;          // From latest LoanBalanceSnapshot
  monthsRemaining: number;         // Calculated from current date
}
