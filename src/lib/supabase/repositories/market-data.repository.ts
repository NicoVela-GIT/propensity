/**
 * Market Data Repository
 * 
 * Manages storage and retrieval of external market data (mortgage rates, HPI, etc.)
 * from the market_data table.
 */

import { supabase } from '../client';

// ============================================
// Types
// ============================================

export interface MarketDataInsert {
  data_type: 'mortgage_rate' | 'hpi';
  region_type: 'national' | 'state' | 'metro' | 'zip3';
  region_code: string;
  effective_date: string; // YYYY-MM-DD
  value: number;
  metadata?: Record<string, any>;
}

export interface MarketData extends MarketDataInsert {
  id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Write Operations
// ============================================

/**
 * Store or update market data
 * Uses upsert to handle duplicate dates gracefully
 * 
 * @param data - Array of market data records to insert/update
 * @returns The upserted records
 * 
 * @example
 * ```typescript
 * await upsertMarketData([{
 *   data_type: 'mortgage_rate',
 *   region_type: 'national',
 *   region_code: 'US',
 *   effective_date: '2026-02-05',
 *   value: 6.11,
 *   metadata: { series_id: 'MORTGAGE30US', term: '30-year' }
 * }]);
 * ```
 */
export async function upsertMarketData(data: MarketDataInsert[]): Promise<MarketData[]> {
  const { data: result, error } = await supabase
    .from('market_data')
    .upsert(data, {
      onConflict: 'data_type,region_type,region_code,effective_date',
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert market data: ${error.message}`);
  }

  return result || [];
}

/**
 * Insert a single market data record
 */
export async function insertMarketData(data: MarketDataInsert): Promise<MarketData> {
  const result = await upsertMarketData([data]);
  return result[0];
}

// ============================================
// Read Operations - Mortgage Rates
// ============================================

/**
 * Get the latest mortgage rate from database
 * 
 * @param seriesId - The FRED series ID (e.g., 'MORTGAGE30US')
 * @returns The most recent rate record, or null if not found
 * 
 * @example
 * ```typescript
 * const rate = await getLatestMortgageRate('MORTGAGE30US');
 * console.log(`Current 30-year rate: ${rate?.value}%`);
 * ```
 */
export async function getLatestMortgageRate(seriesId: string = 'MORTGAGE30US'): Promise<MarketData | null> {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('data_type', 'mortgage_rate')
    .eq('metadata->>series_id', seriesId)
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest mortgage rate: ${error.message}`);
  }

  return data;
}

/**
 * Get mortgage rate history from database
 * 
 * @param seriesId - The FRED series ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Array of rate records sorted by date ascending
 * 
 * @example
 * ```typescript
 * const rates = await getMortgageRateHistory('MORTGAGE30US', '2025-01-01', '2026-02-01');
 * ```
 */
export async function getMortgageRateHistory(
  seriesId: string,
  startDate: string,
  endDate?: string
): Promise<MarketData[]> {
  let query = supabase
    .from('market_data')
    .select('*')
    .eq('data_type', 'mortgage_rate')
    .eq('metadata->>series_id', seriesId)
    .gte('effective_date', startDate)
    .order('effective_date', { ascending: true });

  if (endDate) {
    query = query.lte('effective_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch mortgage rate history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all current mortgage rates (30-year, 15-year, ARM)
 * 
 * @returns Object with latest rates for each series
 */
export async function getAllCurrentMortgageRates(): Promise<{
  thirtyYear: MarketData | null;
  fifteenYear: MarketData | null;
  fiveOneARM: MarketData | null;
}> {
  const [thirtyYear, fifteenYear, fiveOneARM] = await Promise.all([
    getLatestMortgageRate('MORTGAGE30US'),
    getLatestMortgageRate('MORTGAGE15US'),
    getLatestMortgageRate('MORTGAGE5US'),
  ]);

  return {
    thirtyYear,
    fifteenYear,
    fiveOneARM,
  };
}

// ============================================
// Read Operations - House Price Index (HPI)
// ============================================

/**
 * Get latest HPI data for a region
 * 
 * @param regionType - Type of region (state, metro, zip3)
 * @param regionCode - Region identifier
 * @returns The most recent HPI record, or null if not found
 */
export async function getLatestHPI(
  regionType: 'state' | 'metro' | 'zip3',
  regionCode: string
): Promise<MarketData | null> {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('data_type', 'hpi')
    .eq('region_type', regionType)
    .eq('region_code', regionCode)
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest HPI: ${error.message}`);
  }

  return data;
}

/**
 * Get HPI history for a region
 * 
 * @param regionType - Type of region
 * @param regionCode - Region identifier
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Array of HPI records sorted by date ascending
 */
export async function getHPIHistory(
  regionType: 'state' | 'metro' | 'zip3',
  regionCode: string,
  startDate: string,
  endDate?: string
): Promise<MarketData[]> {
  let query = supabase
    .from('market_data')
    .select('*')
    .eq('data_type', 'hpi')
    .eq('region_type', regionType)
    .eq('region_code', regionCode)
    .gte('effective_date', startDate)
    .order('effective_date', { ascending: true });

  if (endDate) {
    query = query.lte('effective_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch HPI history: ${error.message}`);
  }

  return data || [];
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if market data exists for a specific date
 * 
 * @param dataType - Type of data
 * @param effectiveDate - Date to check (YYYY-MM-DD)
 * @returns True if data exists for that date
 */
export async function hasDataForDate(
  dataType: 'mortgage_rate' | 'hpi',
  effectiveDate: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('market_data')
    .select('*', { count: 'exact', head: true })
    .eq('data_type', dataType)
    .eq('effective_date', effectiveDate);

  if (error) {
    throw new Error(`Failed to check data existence: ${error.message}`);
  }

  return (count || 0) > 0;
}

/**
 * Get the date of the most recent data update
 * 
 * @param dataType - Type of data to check
 * @returns The most recent effective_date, or null if no data
 */
export async function getLastUpdateDate(
  dataType: 'mortgage_rate' | 'hpi'
): Promise<string | null> {
  const { data, error } = await supabase
    .from('market_data')
    .select('effective_date')
    .eq('data_type', dataType)
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get last update date: ${error.message}`);
  }

  return data?.effective_date || null;
}

/**
 * Delete old market data (for cleanup)
 * 
 * @param dataType - Type of data to clean
 * @param beforeDate - Delete records before this date (YYYY-MM-DD)
 * @returns Number of records deleted
 */
export async function deleteOldMarketData(
  dataType: 'mortgage_rate' | 'hpi',
  beforeDate: string
): Promise<number> {
  const { data, error } = await supabase
    .from('market_data')
    .delete()
    .eq('data_type', dataType)
    .lt('effective_date', beforeDate)
    .select();

  if (error) {
    throw new Error(`Failed to delete old market data: ${error.message}`);
  }

  return data?.length || 0;
}
