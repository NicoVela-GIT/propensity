/**
 * FRED API Service
 * 
 * Fetches mortgage interest rate data from the Federal Reserve Economic Data (FRED) API.
 * 
 * API Documentation: https://fred.stlouisfed.org/docs/api/fred/
 * 
 * Available mortgage rate series:
 * - MORTGAGE30US: 30-Year Fixed Rate Mortgage Average in the United States
 * - MORTGAGE15US: 15-Year Fixed Rate Mortgage Average in the United States
 * - MORTGAGE5US: 5/1-Year Adjustable Rate Mortgage Average in the United States
 */

// ============================================
// Types
// ============================================

export interface FREDObservation {
  date: string;           // ISO date string (YYYY-MM-DD)
  value: string;          // Rate as string (e.g., "6.82")
  realtime_start: string;
  realtime_end: string;
}

export interface FREDSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FREDObservation[];
}

export interface MortgageRate {
  date: Date;
  rate: number;           // Percentage (e.g., 6.82)
  seriesId: string;
}

export type MortgageRateSeries = 
  | 'MORTGAGE30US'   // 30-year fixed
  | 'MORTGAGE15US'   // 15-year fixed
  | 'MORTGAGE5US';   // 5/1 ARM

// ============================================
// Configuration
// ============================================

const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred';

/**
 * Get FRED API key (lazy evaluation to support runtime env var loading)
 */
function getFredApiKey(): string {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error(
      'FRED_API_KEY is not configured. Please add it to your .env.local file.\n' +
      'Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html'
    );
  }
  return apiKey;
}

// ============================================
// API Client
// ============================================

/**
 * Fetch observations for a specific FRED series
 * 
 * @param seriesId - The FRED series ID (e.g., 'MORTGAGE30US')
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @param limit - Maximum number of observations to return (default: 1000)
 * @returns Array of observations
 */
async function fetchSeriesObservations(
  seriesId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 1000
): Promise<FREDObservation[]> {
  const apiKey = getFredApiKey();

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    limit: limit.toString(),
    sort_order: 'desc', // Get most recent observations first
  });

  if (startDate) {
    params.append('observation_start', startDate);
  }

  if (endDate) {
    params.append('observation_end', endDate);
  }

  const url = `${FRED_API_BASE_URL}/series/observations?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FRED API request failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data: FREDSeriesResponse = await response.json();
    return data.observations;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch FRED data: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parse FRED observation to MortgageRate
 */
function parseObservation(obs: FREDObservation, seriesId: string): MortgageRate | null {
  // FRED uses "." for missing values
  if (obs.value === '.') {
    return null;
  }

  const rate = parseFloat(obs.value);
  if (isNaN(rate)) {
    return null;
  }

  return {
    date: new Date(obs.date),
    rate,
    seriesId,
  };
}

// ============================================
// Public API
// ============================================

/**
 * Get the latest mortgage rate for a specific series
 * 
 * @param seriesId - The mortgage rate series to fetch
 * @returns The most recent mortgage rate, or null if unavailable
 * 
 * @example
 * ```typescript
 * const rate = await getLatestMortgageRate('MORTGAGE30US');
 * console.log(`Current 30-year rate: ${rate?.rate}%`);
 * ```
 */
export async function getLatestMortgageRate(
  seriesId: MortgageRateSeries = 'MORTGAGE30US'
): Promise<MortgageRate | null> {
  try {
    // Fetch last 10 observations to ensure we get a valid value (sorted desc by FRED API)
    const observations = await fetchSeriesObservations(seriesId, undefined, undefined, 10);
    
    // Find the most recent valid observation (first one since sorted desc)
    for (let i = 0; i < observations.length; i++) {
      const parsed = parseObservation(observations[i], seriesId);
      if (parsed) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching latest mortgage rate for ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Get mortgage rate history for a specific series
 * 
 * @param seriesId - The mortgage rate series to fetch
 * @param startDate - Start date (YYYY-MM-DD) or Date object
 * @param endDate - End date (YYYY-MM-DD) or Date object (defaults to today)
 * @returns Array of mortgage rates, sorted by date ascending
 * 
 * @example
 * ```typescript
 * // Get last 90 days of rates
 * const ninetyDaysAgo = new Date();
 * ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
 * 
 * const rates = await getMortgageRateHistory('MORTGAGE30US', ninetyDaysAgo);
 * console.log(`Fetched ${rates.length} rate observations`);
 * ```
 */
export async function getMortgageRateHistory(
  seriesId: MortgageRateSeries = 'MORTGAGE30US',
  startDate?: string | Date,
  endDate?: string | Date
): Promise<MortgageRate[]> {
  try {
    // Convert Date objects to YYYY-MM-DD strings
    const startDateStr = startDate instanceof Date 
      ? startDate.toISOString().split('T')[0]
      : startDate;
    
    const endDateStr = endDate instanceof Date
      ? endDate.toISOString().split('T')[0]
      : endDate;

    const observations = await fetchSeriesObservations(
      seriesId,
      startDateStr,
      endDateStr
    );

    // Parse and filter valid observations
    const rates = observations
      .map(obs => parseObservation(obs, seriesId))
      .filter((rate): rate is MortgageRate => rate !== null);

    return rates;
  } catch (error) {
    console.error(`Error fetching mortgage rate history for ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Get all current mortgage rates (30-year, 15-year, 5/1 ARM)
 * 
 * @returns Object containing the latest rates for all series
 * 
 * @example
 * ```typescript
 * const rates = await getAllCurrentMortgageRates();
 * console.log('30-year:', rates.thirtyYear?.rate);
 * console.log('15-year:', rates.fifteenYear?.rate);
 * console.log('5/1 ARM:', rates.fiveOneARM?.rate);
 * ```
 */
export async function getAllCurrentMortgageRates(): Promise<{
  thirtyYear: MortgageRate | null;
  fifteenYear: MortgageRate | null;
  fiveOneARM: MortgageRate | null;
}> {
  try {
    // Fetch all rates in parallel
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
  } catch (error) {
    console.error('Error fetching all current mortgage rates:', error);
    throw error;
  }
}

/**
 * Calculate the rate difference between two dates
 * Useful for determining refinance opportunities
 * 
 * @param seriesId - The mortgage rate series to analyze
 * @param originalDate - The date of the original loan
 * @param comparisonDate - The date to compare against (defaults to latest)
 * @returns The rate difference in percentage points (positive = rates went down)
 * 
 * @example
 * ```typescript
 * const loanDate = new Date('2022-01-15');
 * const difference = await calculateRateDifference('MORTGAGE30US', loanDate);
 * 
 * if (difference > 0.75) {
 *   console.log('Refinance opportunity! Rates dropped by', difference, '%');
 * }
 * ```
 */
export async function calculateRateDifference(
  seriesId: MortgageRateSeries,
  originalDate: Date,
  comparisonDate?: Date
): Promise<number> {
  try {
    const startDateStr = originalDate.toISOString().split('T')[0];
    const endDateStr = comparisonDate 
      ? comparisonDate.toISOString().split('T')[0]
      : undefined;

    const rates = await getMortgageRateHistory(seriesId, startDateStr, endDateStr);

    if (rates.length === 0) {
      throw new Error('No rate data available for the specified date range');
    }

    // Get the rate closest to the original date
    const originalRate = rates[0];
    
    // Get the most recent rate (or rate closest to comparison date)
    const currentRate = rates[rates.length - 1];

    // Positive difference means rates went down (good for refinancing)
    return originalRate.rate - currentRate.rate;
  } catch (error) {
    console.error('Error calculating rate difference:', error);
    throw error;
  }
}

/**
 * Check if a property qualifies for a refinance opportunity
 * 
 * @param currentInterestRate - The property's current mortgage interest rate
 * @param loanOriginationDate - When the loan was originated
 * @param seriesId - The mortgage rate series to compare against
 * @param thresholdDifference - Minimum rate difference to trigger alert (default: 0.75%)
 * @returns Object indicating if refinance is worthwhile and the potential savings
 * 
 * @example
 * ```typescript
 * const opportunity = await checkRefinanceOpportunity(
 *   6.5,
 *   new Date('2022-06-01'),
 *   'MORTGAGE30US'
 * );
 * 
 * if (opportunity.isOpportunity) {
 *   console.log(`Save ${opportunity.rateDifference}% by refinancing!`);
 * }
 * ```
 */
export async function checkRefinanceOpportunity(
  currentInterestRate: number,
  loanOriginationDate: Date,
  seriesId: MortgageRateSeries = 'MORTGAGE30US',
  thresholdDifference: number = 0.75
): Promise<{
  isOpportunity: boolean;
  currentMarketRate: number | null;
  rateDifference: number;
  potentialSavings: number; // Percentage points
}> {
  try {
    const latestRate = await getLatestMortgageRate(seriesId);

    if (!latestRate) {
      return {
        isOpportunity: false,
        currentMarketRate: null,
        rateDifference: 0,
        potentialSavings: 0,
      };
    }

    const rateDifference = currentInterestRate - latestRate.rate;
    const isOpportunity = rateDifference >= thresholdDifference;

    return {
      isOpportunity,
      currentMarketRate: latestRate.rate,
      rateDifference,
      potentialSavings: Math.max(0, rateDifference),
    };
  } catch (error) {
    console.error('Error checking refinance opportunity:', error);
    throw error;
  }
}
