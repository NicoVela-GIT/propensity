/**
 * Weekly Mortgage Rate Update Job
 * 
 * Fetches latest mortgage rates from FRED API and stores them in the database.
 * Should be run weekly (e.g., every Friday after FRED updates).
 */

import { getAllCurrentMortgageRates } from '../services/fred.service';
import { upsertMarketData, type MarketDataInsert } from '../supabase/repositories/market-data.repository';

// ============================================
// Job Implementation
// ============================================

export interface RateUpdateResult {
  success: boolean;
  updatesCount: number;
  updates?: MarketDataInsert[];
  error?: string;
  timestamp: string;
}

/**
 * Update mortgage rates from FRED API
 * 
 * Fetches current rates for 30-year, 15-year, and 5/1 ARM mortgages
 * and stores them in the market_data table.
 * 
 * @returns Result object with success status and update details
 * 
 * @example
 * ```typescript
 * const result = await updateMortgageRates();
 * if (result.success) {
 *   console.log(`Updated ${result.updatesCount} rates`);
 * }
 * ```
 */
export async function updateMortgageRates(): Promise<RateUpdateResult> {
  const timestamp = new Date().toISOString();
  
  console.log('[Job] Starting weekly mortgage rate update...');

  try {
    // Fetch latest rates from FRED API
    const rates = await getAllCurrentMortgageRates();

    // Prepare data for database
    const updates: MarketDataInsert[] = [];

    if (rates.thirtyYear) {
      updates.push({
        data_type: 'mortgage_rate',
        region_type: 'national',
        region_code: 'US',
        effective_date: rates.thirtyYear.date.toISOString().split('T')[0],
        value: rates.thirtyYear.rate,
        metadata: {
          series_id: 'MORTGAGE30US',
          term: '30-year',
          type: 'fixed',
          source: 'FRED',
        },
      });
      console.log(`[Job] 30-year rate: ${rates.thirtyYear.rate}% (${rates.thirtyYear.date.toISOString().split('T')[0]})`);
    }

    if (rates.fifteenYear) {
      updates.push({
        data_type: 'mortgage_rate',
        region_type: 'national',
        region_code: 'US',
        effective_date: rates.fifteenYear.date.toISOString().split('T')[0],
        value: rates.fifteenYear.rate,
        metadata: {
          series_id: 'MORTGAGE15US',
          term: '15-year',
          type: 'fixed',
          source: 'FRED',
        },
      });
      console.log(`[Job] 15-year rate: ${rates.fifteenYear.rate}% (${rates.fifteenYear.date.toISOString().split('T')[0]})`);
    }

    if (rates.fiveOneARM) {
      updates.push({
        data_type: 'mortgage_rate',
        region_type: 'national',
        region_code: 'US',
        effective_date: rates.fiveOneARM.date.toISOString().split('T')[0],
        value: rates.fiveOneARM.rate,
        metadata: {
          series_id: 'MORTGAGE5US',
          term: '5/1',
          type: 'arm',
          source: 'FRED',
        },
      });
      console.log(`[Job] 5/1 ARM rate: ${rates.fiveOneARM.rate}% (${rates.fiveOneARM.date.toISOString().split('T')[0]})`);
    }

    // Store in database
    if (updates.length > 0) {
      await upsertMarketData(updates);
      console.log(`[Job] Successfully stored ${updates.length} mortgage rates in database`);
    } else {
      console.log('[Job] No rates available to store');
    }

    console.log('[Job] Weekly mortgage rate update completed successfully');

    return {
      success: true,
      updatesCount: updates.length,
      updates,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Job] Failed to update mortgage rates:', errorMessage);
    
    return {
      success: false,
      updatesCount: 0,
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Validate that rates were updated recently
 * Useful for monitoring job health
 * 
 * @param maxDaysOld - Maximum age of rates in days (default: 14)
 * @returns True if rates are fresh, false if stale
 */
export async function validateRatesAreFresh(maxDaysOld: number = 14): Promise<boolean> {
  try {
    const { getLastUpdateDate } = await import('../supabase/repositories/market-data.repository');
    
    const lastUpdate = await getLastUpdateDate('mortgage_rate');
    
    if (!lastUpdate) {
      console.warn('[Job] No mortgage rate data found in database');
      return false;
    }

    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > maxDaysOld) {
      console.warn(`[Job] Mortgage rates are stale (${Math.round(daysSinceUpdate)} days old)`);
      return false;
    }

    console.log(`[Job] Mortgage rates are fresh (${Math.round(daysSinceUpdate)} days old)`);
    return true;
  } catch (error) {
    console.error('[Job] Failed to validate rate freshness:', error);
    return false;
  }
}
