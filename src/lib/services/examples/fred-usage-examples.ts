/**
 * FRED Service Usage Examples
 * 
 * This file demonstrates practical usage patterns for the FRED service
 * in the context of the real estate dashboard application.
 */

import {
  getLatestMortgageRate,
  getMortgageRateHistory,
  getAllCurrentMortgageRates,
  checkRefinanceOpportunity,
  type MortgageRate,
} from '../fred.service';

// ============================================
// Example 1: Display Current Rates on Dashboard
// ============================================

/**
 * Fetch and format current mortgage rates for display
 * Use in a server component or API route
 */
export async function getCurrentRatesForDashboard() {
  try {
    const rates = await getAllCurrentMortgageRates();

    return {
      success: true,
      data: {
        thirtyYear: rates.thirtyYear ? {
          rate: rates.thirtyYear.rate,
          date: rates.thirtyYear.date.toISOString().split('T')[0],
          formatted: `${rates.thirtyYear.rate}%`,
        } : null,
        fifteenYear: rates.fifteenYear ? {
          rate: rates.fifteenYear.rate,
          date: rates.fifteenYear.date.toISOString().split('T')[0],
          formatted: `${rates.fifteenYear.rate}%`,
        } : null,
        fiveOneARM: rates.fiveOneARM ? {
          rate: rates.fiveOneARM.rate,
          date: rates.fiveOneARM.date.toISOString().split('T')[0],
          formatted: `${rates.fiveOneARM.rate}%`,
        } : null,
      },
    };
  } catch (error) {
    console.error('Error fetching current rates:', error);
    return {
      success: false,
      error: 'Failed to fetch current mortgage rates',
    };
  }
}

// ============================================
// Example 2: Generate Refinance Alerts for All Properties
// ============================================

/**
 * Check all properties for refinance opportunities
 * Run this in a scheduled job (daily or weekly)
 */
export async function generateRefinanceAlertsForPortfolio(properties: any[]) {
  const alerts = [];

  for (const property of properties) {
    // Skip properties without active loans
    const activeLoan = property.loans?.find((l: any) => l.status === 'active');
    if (!activeLoan || !activeLoan.interest_rate) {
      continue;
    }

    try {
      // Check for refinance opportunity
      const opportunity = await checkRefinanceOpportunity(
        activeLoan.interest_rate,
        new Date(activeLoan.origination_date),
        'MORTGAGE30US',
        0.75 // 0.75% threshold
      );

      if (!opportunity.isOpportunity) {
        continue;
      }

      // Calculate equity
      const currentValue = property.valuations?.[0]?.estimated_value || property.purchase_price;
      const loanBalance = property.loanBalances?.[0]?.principal_balance || activeLoan.original_principal;
      const equityPercentage = ((currentValue - loanBalance) / currentValue) * 100;

      // Require at least 20% equity
      if (equityPercentage < 20) {
        continue;
      }

      // Calculate savings
      const monthlyPayment = activeLoan.monthly_payment;
      const savingsPercentage = opportunity.potentialSavings / activeLoan.interest_rate;
      const estimatedMonthlySavings = monthlyPayment * savingsPercentage;
      const estimatedAnnualSavings = estimatedMonthlySavings * 12;

      // Create alert
      alerts.push({
        propertyId: property.id,
        propertyAddress: property.address,
        severity: opportunity.potentialSavings >= 1.5 ? 'high' : 'medium',
        currentRate: activeLoan.interest_rate,
        marketRate: opportunity.currentMarketRate,
        rateDifference: opportunity.potentialSavings,
        estimatedMonthlySavings: Math.round(estimatedMonthlySavings),
        estimatedAnnualSavings: Math.round(estimatedAnnualSavings),
        equityPercentage: Math.round(equityPercentage),
      });
    } catch (error) {
      console.error(`Error checking refinance for property ${property.id}:`, error);
    }
  }

  return alerts;
}

// ============================================
// Example 3: Rate Trend Analysis
// ============================================

/**
 * Analyze rate trends over the past year
 * Useful for market insights and timing decisions
 */
export async function analyzeRateTrends() {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const rates = await getMortgageRateHistory('MORTGAGE30US', oneYearAgo);

    if (rates.length === 0) {
      return null;
    }

    // Calculate statistics
    const rateValues = rates.map(r => r.rate);
    const currentRate = rateValues[rateValues.length - 1];
    const yearAgoRate = rateValues[0];
    const minRate = Math.min(...rateValues);
    const maxRate = Math.max(...rateValues);
    const avgRate = rateValues.reduce((sum, r) => sum + r, 0) / rateValues.length;

    // Calculate trend (simple linear regression)
    const trend = currentRate > yearAgoRate ? 'increasing' : 'decreasing';
    const trendPercentage = ((currentRate - yearAgoRate) / yearAgoRate) * 100;

    return {
      current: currentRate,
      yearAgo: yearAgoRate,
      min: minRate,
      max: maxRate,
      average: Math.round(avgRate * 100) / 100,
      trend,
      trendPercentage: Math.round(trendPercentage * 100) / 100,
      volatility: maxRate - minRate,
      dataPoints: rates.length,
    };
  } catch (error) {
    console.error('Error analyzing rate trends:', error);
    return null;
  }
}

// ============================================
// Example 4: Rate Comparison for Property Detail Page
// ============================================

/**
 * Compare a property's loan rate against current market rates
 * Display on property detail page
 */
export async function comparePropertyRateToMarket(property: any) {
  const activeLoan = property.loans?.find((l: any) => l.status === 'active');
  
  if (!activeLoan || !activeLoan.interest_rate) {
    return {
      hasLoan: false,
      message: 'No active loan found',
    };
  }

  try {
    const currentMarketRate = await getLatestMortgageRate('MORTGAGE30US');

    if (!currentMarketRate) {
      return {
        hasLoan: true,
        error: 'Unable to fetch current market rates',
      };
    }

    const rateDifference = activeLoan.interest_rate - currentMarketRate.rate;
    const isAboveMarket = rateDifference > 0;

    return {
      hasLoan: true,
      propertyRate: activeLoan.interest_rate,
      marketRate: currentMarketRate.rate,
      difference: Math.abs(rateDifference),
      isAboveMarket,
      recommendation: isAboveMarket && rateDifference >= 0.75
        ? 'Consider refinancing to lower your rate'
        : isAboveMarket
        ? 'Your rate is slightly above market'
        : 'Your rate is competitive',
      asOfDate: currentMarketRate.date.toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error comparing rates:', error);
    return {
      hasLoan: true,
      error: 'Failed to compare rates',
    };
  }
}

// ============================================
// Example 5: Historical Rate Chart Data
// ============================================

/**
 * Prepare rate data for charting (e.g., with Recharts)
 * Show rate history on dashboard or property page
 */
export async function getRateChartData(months: number = 12) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const rates = await getMortgageRateHistory('MORTGAGE30US', startDate);

    // Format for charting library
    return rates.map(rate => ({
      date: rate.date.toISOString().split('T')[0],
      rate: rate.rate,
      formattedDate: rate.date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    }));
  } catch (error) {
    console.error('Error fetching rate chart data:', error);
    return [];
  }
}

// ============================================
// Example 6: Weekly Rate Update Job
// ============================================

/**
 * Scheduled job to fetch and store latest rates
 * Run this weekly (e.g., every Friday after FRED updates)
 */
export async function weeklyRateUpdateJob() {
  console.log('Starting weekly rate update job...');

  try {
    // Fetch all current rates
    const rates = await getAllCurrentMortgageRates();

    // Store in database (market_data table)
    const updates = [];

    if (rates.thirtyYear) {
      updates.push({
        data_type: 'mortgage_rate',
        region_type: 'national',
        region_code: 'US',
        series_id: 'MORTGAGE30US',
        effective_date: rates.thirtyYear.date.toISOString().split('T')[0],
        value: rates.thirtyYear.rate,
        metadata: {
          term: '30-year',
          type: 'fixed',
        },
      });
    }

    if (rates.fifteenYear) {
      updates.push({
        data_type: 'mortgage_rate',
        region_type: 'national',
        region_code: 'US',
        series_id: 'MORTGAGE15US',
        effective_date: rates.fifteenYear.date.toISOString().split('T')[0],
        value: rates.fifteenYear.rate,
        metadata: {
          term: '15-year',
          type: 'fixed',
        },
      });
    }

    if (rates.fiveOneARM) {
      updates.push({
        data_type: 'mortgage_rate',
        region_type: 'national',
        region_code: 'US',
        series_id: 'MORTGAGE5US',
        effective_date: rates.fiveOneARM.date.toISOString().split('T')[0],
        value: rates.fiveOneARM.rate,
        metadata: {
          term: '5/1',
          type: 'arm',
        },
      });
    }

    console.log(`Successfully fetched ${updates.length} rate updates`);

    // TODO: Insert into market_data table using Supabase
    // await supabase.from('market_data').upsert(updates);

    return {
      success: true,
      updatesCount: updates.length,
      updates,
    };
  } catch (error) {
    console.error('Weekly rate update job failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Example 7: API Route Handler (Next.js)
// ============================================

/**
 * Example Next.js API route to expose FRED data
 * File: app/api/rates/current/route.ts
 */
export async function GET_CurrentRatesAPIRoute() {
  try {
    const rates = await getAllCurrentMortgageRates();

    return Response.json({
      success: true,
      data: rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch current rates',
      },
      { status: 500 }
    );
  }
}

// ============================================
// Example 8: Server Component Usage
// ============================================

/**
 * Example server component that displays current rates
 * File: app/dashboard/page.tsx
 */
export async function DashboardServerComponent() {
  const ratesData = await getCurrentRatesForDashboard();

  if (!ratesData.success) {
    return {
      error: ratesData.error,
    };
  }

  return {
    rates: ratesData.data,
    // Pass to client component for rendering
  };
}
