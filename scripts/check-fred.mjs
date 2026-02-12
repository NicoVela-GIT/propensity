#!/usr/bin/env node

/**
 * FRED Service Quick Check
 * 
 * Quick verification that the FRED service is configured and working.
 * Run with: npm run check-fred
 * Or: node scripts/check-fred.mjs
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
const envPath = join(process.cwd(), '.env.local');
try {
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
} catch (error) {
  console.error('❌ Could not load .env.local');
  process.exit(1);
}

// Dynamic import after env vars are set
const { getLatestMortgageRate } = await import('../src/lib/services/fred.service.ts');

console.log('🔍 Checking FRED Service...\n');

try {
  const rate = await getLatestMortgageRate('MORTGAGE30US');
  
  if (rate) {
    console.log('✅ FRED Service is working!');
    console.log(`\n📊 Current 30-Year Mortgage Rate: ${rate.rate}%`);
    console.log(`📅 As of: ${rate.date.toISOString().split('T')[0]}`);
    console.log('\n✨ Your FRED API integration is ready to use!\n');
  } else {
    console.log('❌ No rate data available');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ FRED Service Error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Check that FRED_API_KEY is set in .env.local');
  console.error('2. Verify your API key at: https://fred.stlouisfed.org/');
  console.error('3. Check your internet connection\n');
  process.exit(1);
}
