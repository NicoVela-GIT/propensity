/**
 * Property Service
 * 
 * This service provides a unified interface for property data,
 * automatically switching between mock data and Supabase based on
 * the NEXT_PUBLIC_USE_SUPABASE environment variable.
 */

import { isSupabaseEnabled } from '../client';
import { getAllProperties as getSupabaseProperties, getPropertyById as getSupabasePropertyById, type PropertyWithRelations } from '../repositories/properties.repository';
import { properties as mockProperties, getPropertyById as getMockPropertyById } from '../../data';
import { convertOldPropertyToNew } from '../../domain/adapters';
import { 
  calculateTotalROI, 
  calculateMonthlyCashFlow,
  calculateAppreciation,
  daysBetween
} from '../../domain/computed';
import type { Property as OldProperty } from '../../types';

/**
 * Convert Supabase data to old Property format for backward compatibility
 */
function convertSupabaseToOldProperty(data: PropertyWithRelations): OldProperty {
  const { property, capitalStructure, loans, valuations, loanBalances, leases, expenses } = data;
  
  // Get most recent valuation
  const currentValuation = valuations[0];
  const currentValue = currentValuation?.estimated_value || property.purchase_price;
  
  // Get active loans and their balances
  const activeLoans = loans.filter(l => l.status === 'active');
  const activeLoanBalances = activeLoans.map(loan => {
    const balance = loanBalances.find(lb => lb.loan_id === loan.id);
    return balance?.principal_balance || loan.original_principal;
  });
  const activeLoanPayments = activeLoans.map(loan => loan.monthly_payment);
  
  // Get interest rate from first active loan (most properties have one mortgage)
  const interestRate = activeLoans.length > 0 ? activeLoans[0].interest_rate : undefined;
  
  // Get active lease
  const activeLease = leases.find(l => l.status === 'active');
  const monthlyRent = activeLease?.monthly_rent || 0;
  
  // Calculate monthly expenses
  // Use override if provided, otherwise calculate from expenses table
  const monthlyExpenses = property.monthly_expenses_override !== null && property.monthly_expenses_override !== undefined
    ? property.monthly_expenses_override
    : expenses.filter(e => e.is_recurring).reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate appreciation percentage
  const appreciationPercent = Math.round(calculateAppreciation(currentValue, property.purchase_price));
  
  // Calculate time-based metrics for ROI
  const purchaseDate = new Date(property.purchase_date);
  const today = new Date();
  const daysOwned = daysBetween(purchaseDate, today);
  const yearsOwned = daysOwned / 365;
  
  // Get initial investment
  const initialCashInvested = capitalStructure?.cash_invested || property.purchase_price;
  
  // Get previous year value (for now, use purchase price as baseline)
  // TODO: Implement proper historical valuation lookup when we have time-series data
  const previousYearValue = property.purchase_price;
  
  // Get previous year loan balances (use current as approximation)
  // TODO: Implement proper historical balance lookup
  const previousYearLoanBalances = activeLoanBalances;
  
  // Calculate annual cash flow
  const monthlyCashFlow = calculateMonthlyCashFlow(
    monthlyRent,
    monthlyExpenses,
    activeLoanPayments
  );
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Calculate ROI using domain function
  const roi = yearsOwned > 0 ? Math.round(calculateTotalROI(
    annualCashFlow,
    currentValue,
    previousYearValue,
    activeLoanBalances,
    previousYearLoanBalances,
    initialCashInvested
  )) : 0;
  
  return {
    id: property.id,
    rank: 0, // Will be calculated when sorting
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zip_code || '',
    currentValue,
    purchasePrice: property.purchase_price,
    purchaseDate,
    monthlyIncome: monthlyRent,
    monthlyExpenses,
    mortgagePayment: activeLoanPayments.reduce((sum, p) => sum + p, 0),
    mortgageBalance: activeLoanBalances.reduce((sum, b) => sum + b, 0),
    downPayment: initialCashInvested,
    interestRate,
    appreciation: appreciationPercent,
    roi,
    propertyType: property.property_type as 'single-family' | 'multi-family' | 'commercial' | 'condo' | 'townhouse',
    bedrooms: property.bedrooms || undefined,
    bathrooms: property.bathrooms || undefined,
    squareFeet: property.square_feet || undefined,
    yearBuilt: property.year_built || undefined,
    ownedSince: purchaseDate.getFullYear(),
    lease: activeLease ? {
      type: activeLease.lease_type as 'annual' | 'semi-annual' | 'month-to-month',
      startDate: new Date(activeLease.start_date),
      currentRent: activeLease.monthly_rent,
      reminderDays: activeLease.renewal_reminder_days || 30,
      isVacant: false,
    } : undefined,
  };
}

/**
 * Get all properties (from Supabase or mock data)
 */
export async function getAllProperties(): Promise<OldProperty[]> {
  if (isSupabaseEnabled()) {
    try {
      const supabaseData = await getSupabaseProperties();
      return supabaseData.map(convertSupabaseToOldProperty);
    } catch (error) {
      console.error('Error fetching from Supabase, falling back to mock data:', error);
      return mockProperties;
    }
  }
  
  return mockProperties;
}

/**
 * Get property by ID (from Supabase or mock data)
 */
export async function getPropertyById(id: string): Promise<OldProperty | null> {
  if (isSupabaseEnabled()) {
    try {
      const supabaseData = await getSupabasePropertyById(id);
      if (!supabaseData) return null;
      return convertSupabaseToOldProperty(supabaseData);
    } catch (error) {
      console.error('Error fetching from Supabase, falling back to mock data:', error);
      return getMockPropertyById(id) || null;
    }
  }
  
  return getMockPropertyById(id) || null;
}

/**
 * Update property (in Supabase or mock data)
 */
export async function updateProperty(id: string, updates: Partial<OldProperty>): Promise<OldProperty | null> {
  if (isSupabaseEnabled()) {
    try {
      const { 
        updateProperty: updateSupabaseProperty,
        getPropertyById: getSupabasePropertyById,
        updateLease
      } = await import('../repositories/properties.repository');
      const { supabase } = await import('../client');
      
      // Fetch property data once if needed for related updates
      const needsPropertyData = 
        updates.monthlyIncome !== undefined || 
        updates.downPayment !== undefined || 
        updates.mortgageBalance !== undefined || 
        updates.mortgagePayment !== undefined ||
        updates.interestRate !== undefined;
      
      const propertyData = needsPropertyData ? await getSupabasePropertyById(id) : null;
      
      // 1. Update property table fields
      const propertyUpdates: any = {};
      
      if (updates.address) propertyUpdates.address = updates.address;
      if (updates.city) propertyUpdates.city = updates.city;
      if (updates.state) propertyUpdates.state = updates.state;
      if (updates.zipCode) propertyUpdates.zip_code = updates.zipCode;
      if (updates.propertyType) propertyUpdates.property_type = updates.propertyType;
      if (updates.bedrooms !== undefined) propertyUpdates.bedrooms = updates.bedrooms;
      if (updates.bathrooms !== undefined) propertyUpdates.bathrooms = updates.bathrooms;
      if (updates.squareFeet !== undefined) propertyUpdates.square_feet = updates.squareFeet;
      if (updates.yearBuilt !== undefined) propertyUpdates.year_built = updates.yearBuilt;
      if (updates.monthlyExpenses !== undefined) propertyUpdates.monthly_expenses_override = updates.monthlyExpenses;
      
      if (Object.keys(propertyUpdates).length > 0) {
        await updateSupabaseProperty(id, propertyUpdates);
      }
      
      // 2. Update current valuation if provided (use upsert to handle same-day updates)
      if (updates.currentValue !== undefined) {
        const { error: valuationError } = await supabase
          .from('valuation_snapshots')
          .upsert({
            property_id: id,
            effective_date: new Date().toISOString().split('T')[0],
            estimated_value: updates.currentValue,
            source: 'manual_update',
            confidence: 'high',
          }, {
            onConflict: 'property_id,effective_date,source',
          });
        
        if (valuationError) {
          console.error('Error updating valuation:', valuationError);
          throw new Error('Failed to update valuation');
        }
      }
      
      // 3. Update lease rent if provided
      if (updates.monthlyIncome !== undefined && propertyData) {
        if (propertyData.leases.length > 0) {
          const activeLease = propertyData.leases.find(l => l.status === 'active') || propertyData.leases[0];
          await updateLease(activeLease.id, {
            monthly_rent: updates.monthlyIncome,
          });
        }
      }
      
      // 4. Update capital structure (down payment) if provided
      if (updates.downPayment !== undefined && propertyData?.capitalStructure) {
        const currentLoanAmount = propertyData.capitalStructure.loan_amount;
        const totalAcquisitionCost = propertyData.capitalStructure.total_acquisition_cost;
        
        const { error: capitalError } = await supabase
          .from('capital_structures')
          .update({
            cash_invested: updates.downPayment,
            loan_amount: currentLoanAmount,
            total_acquisition_cost: totalAcquisitionCost,
          })
          .eq('property_id', id);
        
        if (capitalError) {
          console.error('Error updating capital structure:', capitalError);
          throw new Error('Failed to update down payment');
        }
      }
      
      // 5. Update mortgage balance if provided (use upsert for same-day updates)
      if (updates.mortgageBalance !== undefined && propertyData) {
        const activeLoan = propertyData.loans.find(l => l.status === 'active');
        
        if (activeLoan) {
          const { error: balanceError } = await supabase
            .from('loan_balance_snapshots')
            .upsert({
              loan_id: activeLoan.id,
              effective_date: new Date().toISOString().split('T')[0],
              principal_balance: updates.mortgageBalance,
              source: 'manual_update',
            }, {
              onConflict: 'loan_id,effective_date',
            });
          
          if (balanceError) {
            console.error('Error updating loan balance:', balanceError);
            throw new Error('Failed to update mortgage balance');
          }
        }
      }
      
      // 6. Update mortgage payment if provided
      if (updates.mortgagePayment !== undefined && propertyData) {
        const activeLoan = propertyData.loans.find(l => l.status === 'active');
        
        if (activeLoan) {
          const { error: loanError } = await supabase
            .from('loans')
            .update({
              monthly_payment: updates.mortgagePayment,
              updated_at: new Date().toISOString(),
            })
            .eq('id', activeLoan.id);
          
          if (loanError) {
            console.error('Error updating loan payment:', loanError);
            throw new Error('Failed to update mortgage payment');
          }
        }
      }
      
      // 7. Update interest rate if provided
      if (updates.interestRate !== undefined && propertyData) {
        const activeLoan = propertyData.loans.find(l => l.status === 'active');
        
        if (activeLoan) {
          const { error: loanError } = await supabase
            .from('loans')
            .update({
              interest_rate: updates.interestRate,
              updated_at: new Date().toISOString(),
            })
            .eq('id', activeLoan.id);
          
          if (loanError) {
            console.error('Error updating interest rate:', loanError);
            throw new Error('Failed to update interest rate');
          }
        }
      }
      
      // Fetch and return updated property
      return await getPropertyById(id);
    } catch (error) {
      console.error('Error updating in Supabase:', error);
      throw error;
    }
  }
  
  // Update mock data (in-memory only)
  const mockProperty = getMockPropertyById(id);
  if (!mockProperty) return null;
  
  Object.assign(mockProperty, updates);
  return mockProperty;
}
