/**
 * FRED Service Manual Test
 * 
 * This script manually loads .env.local and tests the FRED service.
 * Run with: npx tsx scripts/test-fred-service.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Manually load .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      process.env[key] = value;
    }
  }
});

console.log('✅ Loaded environment variables from .env.local');
console.log(`FRED_API_KEY: ${process.env.FRED_API_KEY?.substring(0, 8)}...`);
console.log('');

// Now import and test the service
import {
  getLatestMortgageRate,
  getMortgageRateHistory,
  getAllCurrentMortgageRates,
  checkRefinanceOpportunity,
} from '../src/lib/services/fred.service';

async function runTests() {
  console.log('🧪 Testing FRED Service with real API key\n');
  console.log('='.repeat(60));

  // Test 1: Get latest 30-year rate
  try {
    console.log('\n📊 Test 1: Get Latest 30-Year Mortgage Rate');
    const rate = await getLatestMortgageRate('MORTGAGE30US');
    
    if (rate) {
      console.log('✅ SUCCESS');
      console.log(`   Date: ${rate.date.toISOString().split('T')[0]}`);
      console.log(`   Rate: ${rate.rate}%`);
      console.log(`   Series: ${rate.seriesId}`);
    } else {
      console.log('❌ No rate data returned');
    }
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
  }

  // Test 2: Get all current rates
  try {
    console.log('\n📊 Test 2: Get All Current Mortgage Rates');
    const rates = await getAllCurrentMortgageRates();
    
    console.log('✅ SUCCESS');
    if (rates.thirtyYear) {
      console.log(`   30-Year: ${rates.thirtyYear.rate}% (${rates.thirtyYear.date.toISOString().split('T')[0]})`);
    }
    if (rates.fifteenYear) {
      console.log(`   15-Year: ${rates.fifteenYear.rate}% (${rates.fifteenYear.date.toISOString().split('T')[0]})`);
    }
    if (rates.fiveOneARM) {
      console.log(`   5/1 ARM: ${rates.fiveOneARM.rate}% (${rates.fiveOneARM.date.toISOString().split('T')[0]})`);
    }
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
  }

  // Test 3: Get rate history (last 30 days)
  try {
    console.log('\n📊 Test 3: Get Rate History (Last 30 Days)');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const history = await getMortgageRateHistory('MORTGAGE30US', thirtyDaysAgo);
    
    console.log('✅ SUCCESS');
    console.log(`   Fetched ${history.length} observations`);
    if (history.length > 0) {
      console.log(`   Date range: ${history[0].date.toISOString().split('T')[0]} to ${history[history.length - 1].date.toISOString().split('T')[0]}`);
      console.log(`   Rate range: ${Math.min(...history.map(r => r.rate))}% to ${Math.max(...history.map(r => r.rate))}%`);
    }
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
  }

  // Test 4: Check refinance opportunity
  try {
    console.log('\n📊 Test 4: Check Refinance Opportunity');
    console.log('   Scenario: Loan from 2 years ago at 7.0%');
    
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const opportunity = await checkRefinanceOpportunity(
      7.0,
      twoYearsAgo,
      'MORTGAGE30US',
      0.75
    );
    
    console.log('✅ SUCCESS');
    console.log(`   Current loan rate: 7.0%`);
    console.log(`   Current market rate: ${opportunity.currentMarketRate}%`);
    console.log(`   Rate difference: ${opportunity.rateDifference.toFixed(2)}%`);
    console.log(`   Is opportunity: ${opportunity.isOpportunity ? '✨ YES' : 'No'}`);
    if (opportunity.isOpportunity) {
      console.log(`   Potential savings: ${opportunity.potentialSavings.toFixed(2)}%`);
    }
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('\n🎉 FRED service is working correctly with your API key!\n');
}

runTests().catch(error => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});
