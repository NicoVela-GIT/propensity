/**
 * Services Index
 * 
 * Centralized exports for all external service integrations
 */

// FRED API Service - Mortgage rate data
export {
  getLatestMortgageRate,
  getMortgageRateHistory,
  getAllCurrentMortgageRates,
  calculateRateDifference,
  checkRefinanceOpportunity,
  type MortgageRate,
  type MortgageRateSeries,
  type FREDObservation,
  type FREDSeriesResponse,
} from './fred.service';
