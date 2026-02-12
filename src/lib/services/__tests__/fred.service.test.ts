/**
 * FRED Service Tests
 * 
 * Manual test script to verify FRED API integration.
 * Run with: npx tsx src/lib/services/__tests__/fred.service.test.ts
 * 
 * Note: Requires FRED_API_KEY in .env.local
 */

import {
  getLatestMortgageRate,
  getMortgageRateHistory,
  getAllCurrentMortgageRates,
  calculateRateDifference,
  checkRefinanceOpportunity,
  type MortgageRate,
} from '../fred.service';

// ============================================
// Test Utilities
// ============================================

function logTestHeader(testName: string): void {
  console.log('\n' + '='.repeat(60));
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(60));
}

function logSuccess(message: string): void {
  console.log('✅', message);
}

function logError(message: string, error?: any): void {
  console.error('❌', message);
  if (error) {
    console.error('   Error:', error.message || error);
  }
}

function logInfo(message: string): void {
  console.log('ℹ️ ', message);
}

// ============================================
// Tests
// ============================================

async function testGetLatestMortgageRate(): Promise<void> {
  logTestHeader('Get Latest 30-Year Mortgage Rate');

  try {
    const rate = await getLatestMortgageRate('MORTGAGE30US');

    if (!rate) {
      logError('No rate data returned');
      return;
    }

    logSuccess('Successfully fetched latest mortgage rate');
    logInfo(`Date: ${rate.date.toISOString().split('T')[0]}`);
    logInfo(`Rate: ${rate.rate}%`);
    logInfo(`Series: ${rate.seriesId}`);

    // Validate data
    if (rate.rate < 0 || rate.rate > 20) {
      logError('Rate seems invalid (outside 0-20% range)');
    }

    if (rate.date > new Date()) {
      logError('Rate date is in the future');
    }
  } catch (error) {
    logError('Failed to fetch latest mortgage rate', error);
  }
}

async function testGetMortgageRateHistory(): Promise<void> {
  logTestHeader('Get Mortgage Rate History (Last 90 Days)');

  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const rates = await getMortgageRateHistory('MORTGAGE30US', ninetyDaysAgo);

    if (rates.length === 0) {
      logError('No historical rates returned');
      return;
    }

    logSuccess(`Successfully fetched ${rates.length} rate observations`);
    logInfo(`Date range: ${rates[0].date.toISOString().split('T')[0]} to ${rates[rates.length - 1].date.toISOString().split('T')[0]}`);
    logInfo(`Rate range: ${Math.min(...rates.map(r => r.rate))}% to ${Math.max(...rates.map(r => r.rate))}%`);

    // Show first and last few rates
    console.log('\n   First 3 observations:');
    rates.slice(0, 3).forEach(r => {
      console.log(`   - ${r.date.toISOString().split('T')[0]}: ${r.rate}%`);
    });

    console.log('\n   Last 3 observations:');
    rates.slice(-3).forEach(r => {
      console.log(`   - ${r.date.toISOString().split('T')[0]}: ${r.rate}%`);
    });
  } catch (error) {
    logError('Failed to fetch mortgage rate history', error);
  }
}

async function testGetAllCurrentMortgageRates(): Promise<void> {
  logTestHeader('Get All Current Mortgage Rates');

  try {
    const rates = await getAllCurrentMortgageRates();

    logSuccess('Successfully fetched all current rates');

    if (rates.thirtyYear) {
      logInfo(`30-Year Fixed: ${rates.thirtyYear.rate}% (as of ${rates.thirtyYear.date.toISOString().split('T')[0]})`);
    } else {
      logError('30-year rate not available');
    }

    if (rates.fifteenYear) {
      logInfo(`15-Year Fixed: ${rates.fifteenYear.rate}% (as of ${rates.fifteenYear.date.toISOString().split('T')[0]})`);
    } else {
      logError('15-year rate not available');
    }

    if (rates.fiveOneARM) {
      logInfo(`5/1 ARM: ${rates.fiveOneARM.rate}% (as of ${rates.fiveOneARM.date.toISOString().split('T')[0]})`);
    } else {
      logError('5/1 ARM rate not available');
    }
  } catch (error) {
    logError('Failed to fetch all current rates', error);
  }
}

async function testCalculateRateDifference(): Promise<void> {
  logTestHeader('Calculate Rate Difference');

  try {
    // Test with a date 2 years ago
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const difference = await calculateRateDifference('MORTGAGE30US', twoYearsAgo);

    logSuccess(`Rate difference calculated: ${difference.toFixed(2)}%`);

    if (difference > 0) {
      logInfo(`Rates have DECREASED by ${difference.toFixed(2)}% (good for refinancing)`);
    } else if (difference < 0) {
      logInfo(`Rates have INCREASED by ${Math.abs(difference).toFixed(2)}% (not good for refinancing)`);
    } else {
      logInfo('Rates are unchanged');
    }
  } catch (error) {
    logError('Failed to calculate rate difference', error);
  }
}

async function testCheckRefinanceOpportunity(): Promise<void> {
  logTestHeader('Check Refinance Opportunity');

  try {
    // Simulate a loan from 2 years ago at 7.0%
    const loanDate = new Date();
    loanDate.setFullYear(loanDate.getFullYear() - 2);
    const currentRate = 7.0;

    const opportunity = await checkRefinanceOpportunity(
      currentRate,
      loanDate,
      'MORTGAGE30US',
      0.75 // 0.75% threshold
    );

    logSuccess('Refinance opportunity check completed');
    logInfo(`Current loan rate: ${currentRate}%`);
    logInfo(`Current market rate: ${opportunity.currentMarketRate}%`);
    logInfo(`Rate difference: ${opportunity.rateDifference.toFixed(2)}%`);
    logInfo(`Potential savings: ${opportunity.potentialSavings.toFixed(2)}%`);

    if (opportunity.isOpportunity) {
      logSuccess(`✨ REFINANCE OPPORTUNITY DETECTED! Save ${opportunity.potentialSavings.toFixed(2)}%`);
    } else {
      logInfo('No refinance opportunity at this time');
    }
  } catch (error) {
    logError('Failed to check refinance opportunity', error);
  }
}

async function testErrorHandling(): Promise<void> {
  logTestHeader('Error Handling');

  try {
    // Test with invalid series ID
    logInfo('Testing with invalid series ID...');
    try {
      await getLatestMortgageRate('INVALID_SERIES' as any);
      logError('Should have thrown an error for invalid series');
    } catch (error) {
      logSuccess('Correctly threw error for invalid series');
    }

    // Test with missing API key (if not configured)
    if (!process.env.FRED_API_KEY || process.env.FRED_API_KEY === 'your_fred_api_key_here') {
      logInfo('FRED_API_KEY not configured - this is expected for initial setup');
      logInfo('Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html');
    }
  } catch (error) {
    logError('Error handling test failed', error);
  }
}

// ============================================
// Run All Tests
// ============================================

async function runAllTests(): Promise<void> {
  console.log('\n🧪 FRED Service Test Suite');
  console.log('Starting tests...\n');

  const startTime = Date.now();

  await testGetLatestMortgageRate();
  await testGetMortgageRateHistory();
  await testGetAllCurrentMortgageRates();
  await testCalculateRateDifference();
  await testCheckRefinanceOpportunity();
  await testErrorHandling();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ All tests completed in ${duration}s`);
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Ensure FRED_API_KEY is set in .env.local');
  console.log('2. Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html');
  console.log('3. Review the test results above');
  console.log('4. Integrate the service into your alert system\n');
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
}

export { runAllTests };
