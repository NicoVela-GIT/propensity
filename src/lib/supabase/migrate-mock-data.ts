/**
 * Mock Data Migration Script
 * 
 * This script migrates the existing mock data from src/lib/data.ts
 * into the Supabase database.
 * 
 * Run this once to populate your database with the 6 properties.
 */

import { properties as mockProperties } from '../data';
import { createProperty } from './repositories/properties.repository';

/**
 * Migrate all mock properties to Supabase
 */
export async function migrateMockData() {
  console.log('🚀 Starting mock data migration...');
  console.log(`📦 Found ${mockProperties.length} properties to migrate`);

  const results = {
    success: [] as string[],
    failed: [] as { address: string; error: string }[],
  };

  for (const mockProperty of mockProperties) {
    try {
      console.log(`\n📍 Migrating: ${mockProperty.address}, ${mockProperty.city}`);

      // Calculate closing costs if not provided
      const closingCosts = mockProperty.purchasePrice * 0.03; // Assume 3% closing costs

      // Calculate loan amount from down payment
      const loanAmount = mockProperty.mortgageBalance || 0;
      const cashInvested = mockProperty.downPayment + closingCosts;

      // Prepare property data
      const propertyData = {
        property: {
          address: mockProperty.address,
          city: mockProperty.city,
          state: mockProperty.state,
          zip_code: mockProperty.zipCode || null,
          property_type: mockProperty.propertyType,
          bedrooms: mockProperty.bedrooms || null,
          bathrooms: mockProperty.bathrooms || null,
          square_feet: mockProperty.squareFeet || null,
          year_built: mockProperty.yearBuilt || null,
          purchase_price: mockProperty.purchasePrice,
          purchase_date: mockProperty.purchaseDate.toISOString().split('T')[0],
          closing_costs: closingCosts,
          monthly_expenses_override: mockProperty.monthlyExpenses || null,
          notes: null,
          image_url: null,
        },
        capitalStructure: {
          cash_invested: cashInvested,
          loan_amount: loanAmount,
          total_acquisition_cost: mockProperty.purchasePrice + closingCosts,
        },
        loan: loanAmount > 0 ? {
          loan_type: 'conventional',
          original_principal: loanAmount,
          interest_rate: 6.5, // Assume 6.5% interest rate
          term_months: 360, // Assume 30-year mortgage
          origination_date: mockProperty.purchaseDate.toISOString().split('T')[0],
          monthly_payment: mockProperty.mortgagePayment,
          status: 'active',
        } : undefined,
        initialValuation: {
          effective_date: new Date().toISOString().split('T')[0], // Today's date
          estimated_value: mockProperty.currentValue,
          source: 'migration',
          confidence: 'medium',
          metadata: {
            originalData: {
              appreciation: mockProperty.appreciation,
              roi: mockProperty.roi,
            },
          },
        },
        initialLoanBalance: loanAmount > 0 ? {
          effective_date: new Date().toISOString().split('T')[0],
          principal_balance: mockProperty.mortgageBalance,
          source: 'migration',
          notes: 'Migrated from mock data',
        } : undefined,
        lease: mockProperty.lease && !mockProperty.lease.isVacant ? {
          tenant_name: null,
          lease_type: mockProperty.lease.type,
          start_date: mockProperty.lease.startDate.toISOString().split('T')[0],
          end_date: null, // We don't have end dates in mock data
          monthly_rent: mockProperty.lease.currentRent,
          security_deposit: null,
          status: 'active',
          renewal_reminder_days: mockProperty.lease.reminderDays || 30,
        } : undefined,
      };

      // Create property in Supabase
      await createProperty(propertyData);

      console.log(`✅ Successfully migrated: ${mockProperty.address}`);
      results.success.push(mockProperty.address);

    } catch (error) {
      console.error(`❌ Failed to migrate ${mockProperty.address}:`, error);
      results.failed.push({
        address: mockProperty.address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully migrated:');
    results.success.forEach(addr => console.log(`   - ${addr}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed to migrate:');
    results.failed.forEach(({ address, error }) => {
      console.log(`   - ${address}: ${error}`);
    });
  }

  console.log('\n🎉 Migration complete!');

  return results;
}

/**
 * Check if migration is needed
 */
export async function checkMigrationStatus() {
  const { getAllProperties } = await import('./repositories/properties.repository');
  
  try {
    const properties = await getAllProperties();
    return {
      isNeeded: properties.length === 0,
      currentCount: properties.length,
      mockCount: mockProperties.length,
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      isNeeded: true,
      currentCount: 0,
      mockCount: mockProperties.length,
    };
  }
}
