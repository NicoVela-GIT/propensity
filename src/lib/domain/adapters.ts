/**
 * Type Adapters
 * 
 * Convert between old and new domain models for backward compatibility.
 * This enables gradual migration without breaking existing UI components.
 */

import * as OldTypes from '../types';
import * as NewTypes from './entities';
import { ValuationSnapshot, LoanBalanceSnapshot } from './snapshots';
import { Lease, getPeriodString } from './operating';
import { 
  calculateEquity, 
  calculateAppreciation, 
  calculateMonthlyCashFlow,
  calculateEquityPercentage 
} from './computed';

// ============================================
// Old Property → New Entities
// ============================================

/**
 * Convert legacy Property format to new domain model entities
 * 
 * Creates:
 * - Property entity (core immutable data)
 * - CapitalStructure (acquisition financing)
 * - Loan (if property has mortgage)
 * - ValuationSnapshot (current value)
 * - LoanBalanceSnapshot (current balance)
 * - Lease (if property has active lease)
 * 
 * @param oldProperty - Legacy property object
 * @returns Object containing all new domain entities
 */
export function convertOldPropertyToNew(
  oldProperty: OldTypes.Property
): {
  property: NewTypes.Property;
  capitalStructure: NewTypes.CapitalStructure;
  loan?: NewTypes.Loan;
  valuation: ValuationSnapshot;
  loanBalance?: LoanBalanceSnapshot;
  lease?: Lease;
} {
  const now = new Date();
  
  // Core property entity
  const property: NewTypes.Property = {
    id: oldProperty.id,
    address: oldProperty.address,
    city: oldProperty.city,
    state: oldProperty.state,
    zipCode: oldProperty.zipCode,
    propertyType: oldProperty.propertyType,
    bedrooms: oldProperty.bedrooms,
    bathrooms: oldProperty.bathrooms,
    squareFeet: oldProperty.squareFeet,
    yearBuilt: oldProperty.yearBuilt,
    purchasePrice: oldProperty.purchasePrice,
    purchaseDate: oldProperty.purchaseDate || now,
    closingCosts: undefined, // Not tracked in old model
    notes: oldProperty.notes,
    imageUrl: oldProperty.imageUrl,
    createdAt: now,
    updatedAt: now,
  };
  
  // Capital structure
  const cashInvested = oldProperty.downPayment || oldProperty.purchasePrice;
  const loanAmount = oldProperty.mortgageBalance || 0;
  
  const capitalStructure: NewTypes.CapitalStructure = {
    propertyId: oldProperty.id,
    initialCapital: {
      cashInvested,
      loanAmount,
      totalAcquisitionCost: oldProperty.purchasePrice,
    },
    createdAt: now,
  };
  
  // Loan (if exists)
  let loan: NewTypes.Loan | undefined;
  let loanBalance: LoanBalanceSnapshot | undefined;
  
  if (oldProperty.mortgageBalance && oldProperty.mortgageBalance > 0) {
    loan = {
      id: `loan-${oldProperty.id}`,
      propertyId: oldProperty.id,
      loanType: 'acquisition',
      terms: {
        originalPrincipal: loanAmount,
        interestRate: 4.5, // Default assumption (not in old model)
        termMonths: 360,   // 30-year mortgage assumption
        originationDate: oldProperty.purchaseDate || now,
        monthlyPayment: oldProperty.mortgagePayment || 0,
      },
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    
    loanBalance = {
      id: `balance-${oldProperty.id}`,
      loanId: loan.id,
      effectiveDate: now,
      principalBalance: oldProperty.mortgageBalance,
      source: 'manual_override',
      createdAt: now,
    };
  }
  
  // Current valuation
  const valuation: ValuationSnapshot = {
    id: `valuation-${oldProperty.id}`,
    propertyId: oldProperty.id,
    effectiveDate: now,
    estimatedValue: oldProperty.currentValue,
    source: 'manual',
    confidence: 'medium',
    createdAt: now,
  };
  
  // Lease (if exists and not vacant)
  let lease: Lease | undefined;
  if (oldProperty.lease && !oldProperty.lease.isVacant) {
    // Determine lease type
    const leaseType: 'fixed' | 'month-to-month' = 
      oldProperty.lease.type === 'month-to-month' ? 'month-to-month' : 'fixed';
    
    // Calculate end date for fixed-term leases
    let endDate: Date | undefined;
    if (leaseType === 'fixed') {
      endDate = new Date(oldProperty.lease.startDate);
      
      let months = 12; // Default to annual
      switch (oldProperty.lease.type) {
        case 'semi-annual':
          months = 6;
          break;
        case 'annual':
          months = 12;
          break;
        case 'custom':
          months = oldProperty.lease.customMonths || 12;
          break;
      }
      
      endDate.setMonth(endDate.getMonth() + months);
    }
    
    lease = {
      id: `lease-${oldProperty.id}`,
      propertyId: oldProperty.id,
      leaseType,
      startDate: oldProperty.lease.startDate,
      endDate,
      monthlyRent: oldProperty.lease.currentRent,
      status: 'active',
      renewalReminderDays: oldProperty.lease.reminderDays,
      createdAt: now,
      updatedAt: now,
    };
  }
  
  return { 
    property, 
    capitalStructure, 
    loan, 
    valuation, 
    loanBalance, 
    lease 
  };
}

// ============================================
// New Entities → Old Property
// ============================================

/**
 * Convert new domain entities back to legacy Property format
 * 
 * This enables existing UI components to continue working without changes.
 * Derived metrics (ROI, appreciation) are computed on the fly.
 * 
 * @param property - New property entity
 * @param capitalStructure - Capital structure
 * @param currentValuation - Latest valuation snapshot (optional)
 * @param loans - All loans for this property (optional)
 * @param loanBalances - Latest balance snapshots for loans (optional)
 * @param lease - Active lease (optional)
 * @returns Legacy Property object
 */
export function convertNewPropertyToOld(
  property: NewTypes.Property,
  capitalStructure: NewTypes.CapitalStructure,
  currentValuation?: ValuationSnapshot,
  loans?: NewTypes.Loan[],
  loanBalances?: LoanBalanceSnapshot[],
  lease?: Lease
): OldTypes.Property {
  // Calculate derived metrics
  const currentValue = currentValuation?.estimatedValue || property.purchasePrice;
  const activeLoanBalances = loanBalances?.map(lb => lb.principalBalance) || [];
  const loanPayments = loans?.map(l => l.terms.monthlyPayment) || [];
  
  const monthlyIncome = lease?.monthlyRent || 0;
  const monthlyExpenses = 0; // Would need to aggregate from Expense entities
  
  const appreciation = calculateAppreciation(currentValue, property.purchasePrice);
  const equity = calculateEquity(currentValue, activeLoanBalances);
  
  // Simplified ROI calculation
  // Note: For accurate ROI, would need historical data for appreciation and principal paydown
  const roi = capitalStructure.initialCapital.cashInvested > 0
    ? ((equity - capitalStructure.initialCapital.cashInvested) / 
        capitalStructure.initialCapital.cashInvested) * 100
    : 0;
  
  // Convert lease back to old format
  let oldLease: OldTypes.LeaseInfo | undefined;
  if (lease) {
    const leaseType: OldTypes.LeaseType = 
      lease.leaseType === 'month-to-month' 
        ? 'month-to-month' 
        : 'annual'; // Simplified mapping
    
    oldLease = {
      type: leaseType,
      startDate: lease.startDate,
      currentRent: lease.monthlyRent,
      reminderDays: lease.renewalReminderDays,
      isVacant: false,
    };
  }
  
  return {
    id: property.id,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    currentValue,
    purchasePrice: property.purchasePrice,
    purchaseDate: property.purchaseDate,
    monthlyIncome,
    monthlyExpenses,
    mortgagePayment: loanPayments[0], // First loan payment
    mortgageBalance: activeLoanBalances[0], // First loan balance
    downPayment: capitalStructure.initialCapital.cashInvested,
    appreciation,
    roi,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet,
    yearBuilt: property.yearBuilt,
    imageUrl: property.imageUrl,
    notes: property.notes,
    ownedSince: property.purchaseDate.getFullYear(),
    lease: oldLease,
  };
}

// ============================================
// Batch Conversions
// ============================================

/**
 * Convert multiple old properties to new format
 * 
 * @param oldProperties - Array of legacy properties
 * @returns Array of conversion results
 */
export function convertOldPropertiesToNew(
  oldProperties: OldTypes.Property[]
): Array<ReturnType<typeof convertOldPropertyToNew>> {
  return oldProperties.map(convertOldPropertyToNew);
}

/**
 * Helper to extract just the Property entities from batch conversion
 * 
 * @param conversions - Results from convertOldPropertiesToNew
 * @returns Array of Property entities only
 */
export function extractProperties(
  conversions: Array<ReturnType<typeof convertOldPropertyToNew>>
): NewTypes.Property[] {
  return conversions.map(c => c.property);
}

/**
 * Helper to extract just the Loan entities from batch conversion
 * 
 * @param conversions - Results from convertOldPropertiesToNew
 * @returns Array of Loan entities (excluding undefined)
 */
export function extractLoans(
  conversions: Array<ReturnType<typeof convertOldPropertyToNew>>
): NewTypes.Loan[] {
  return conversions.map(c => c.loan).filter((l): l is NewTypes.Loan => l !== undefined);
}

// ============================================
// Alert Conversions
// ============================================

/**
 * Convert old Alert to new Alert format
 * 
 * Note: Old alerts are UI objects. New alerts are domain-driven.
 * This adapter is lossy - old alerts lack rule associations.
 * 
 * @param oldAlert - Legacy alert object
 * @returns New Alert entity
 */
export function convertOldAlertToNew(
  oldAlert: OldTypes.Alert
): import('./alerts').Alert {
  return {
    id: oldAlert.id,
    ruleId: 'unknown', // Old alerts don't have rule associations
    propertyId: oldAlert.propertyAddress ? undefined : undefined, // Would need to lookup by address
    severity: oldAlert.priority === 'high' ? 'high' : 
              oldAlert.priority === 'medium' ? 'medium' : 'low',
    title: oldAlert.title,
    description: oldAlert.description,
    estimatedValue: oldAlert.estimatedValue,
    actionDeadline: oldAlert.actionDeadline,
    triggeredAt: oldAlert.createdAt,
  };
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate that conversion from new to old produces valid data
 * 
 * Useful for testing adapter logic
 * 
 * @param oldProperty - Original old property
 * @param newProperty - Property entity
 * @returns True if key fields match
 */
export function validateConversion(
  oldProperty: OldTypes.Property,
  newProperty: NewTypes.Property
): boolean {
  return (
    oldProperty.id === newProperty.id &&
    oldProperty.address === newProperty.address &&
    oldProperty.purchasePrice === newProperty.purchasePrice &&
    oldProperty.propertyType === newProperty.propertyType
  );
}
