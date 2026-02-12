/**
 * Refinance Alert Generator
 * 
 * Generates refinance opportunity alerts by comparing property loan rates
 * against current market rates from FRED.
 */

import { checkRefinanceOpportunity } from '../../services/fred.service';
import { generateAlertId } from '../../domain/alerts';
import { getAllProperties, type PropertyWithRelations } from '../../supabase/repositories/properties.repository';
import type { GeneratedAlertInsert, AlertSeverity } from '../../supabase/repositories/alerts.repository';

// ============================================
// Configuration
// ============================================

const DEFAULT_RATE_THRESHOLD = 0.75; // 0.75% rate difference to trigger alert
const MINIMUM_EQUITY_PERCENTAGE = 20; // 20% equity required

// ============================================
// Types
// ============================================

export interface RefinanceAlertMetadata {
  currentRate: number;
  marketRate: number;
  rateDifference: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  equityPercentage: number;
  loanBalance: number;
  propertyValue: number;
  monthlyPayment: number;
}

// ============================================
// Alert Generation
// ============================================

/**
 * Generate refinance alert for a single property
 * 
 * @param property - Property with all relations loaded
 * @param ruleId - Alert rule ID (optional)
 * @param thresholdDifference - Minimum rate difference to trigger alert
 * @param minimumEquity - Minimum equity percentage required
 * @returns Generated alert or null if no opportunity
 */
export async function generateRefinanceAlert(
  property: PropertyWithRelations,
  ruleId?: string,
  thresholdDifference: number = DEFAULT_RATE_THRESHOLD,
  minimumEquity: number = MINIMUM_EQUITY_PERCENTAGE
): Promise<GeneratedAlertInsert | null> {
  // Get active loan
  const activeLoan = property.loans.find(l => l.status === 'active');
  
  if (!activeLoan || !activeLoan.interest_rate) {
    return null; // No loan or missing interest rate
  }

  try {
    // Check for refinance opportunity using FRED service
    const opportunity = await checkRefinanceOpportunity(
      activeLoan.interest_rate,
      new Date(activeLoan.origination_date),
      'MORTGAGE30US',
      thresholdDifference
    );

    if (!opportunity.isOpportunity) {
      return null; // No opportunity
    }

    // Calculate equity percentage
    const currentValue = property.valuations[0]?.estimated_value || property.property.purchase_price;
    const loanBalance = property.loanBalances[0]?.principal_balance || activeLoan.original_principal;
    const equityPercentage = ((currentValue - loanBalance) / currentValue) * 100;

    // Require minimum equity
    if (equityPercentage < minimumEquity) {
      return null;
    }

    // Calculate estimated savings
    const monthlyPayment = activeLoan.monthly_payment;
    const savingsPercentage = opportunity.potentialSavings / activeLoan.interest_rate;
    const estimatedMonthlySavings = monthlyPayment * savingsPercentage;
    const estimatedAnnualSavings = estimatedMonthlySavings * 12;

    // Determine severity based on savings potential
    const severity: AlertSeverity = 
      opportunity.potentialSavings >= 1.5 ? 'high' :
      opportunity.potentialSavings >= 1.0 ? 'medium' : 'low';

    // Prepare metadata
    const metadata: RefinanceAlertMetadata = {
      currentRate: activeLoan.interest_rate,
      marketRate: opportunity.currentMarketRate!,
      rateDifference: opportunity.potentialSavings,
      estimatedMonthlySavings: Math.round(estimatedMonthlySavings * 100) / 100,
      estimatedAnnualSavings: Math.round(estimatedAnnualSavings * 100) / 100,
      equityPercentage: Math.round(equityPercentage * 10) / 10,
      loanBalance: Math.round(loanBalance),
      propertyValue: Math.round(currentValue),
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    };

    // Generate stable alert ID
    const alertId = generateAlertId(
      ruleId || 'refinance_opportunity',
      property.property.id,
      new Date()
    );

    // Create alert
    return {
      id: alertId,
      rule_id: ruleId,
      property_id: property.property.id,
      severity,
      title: 'Refinance Opportunity',
      description: `Current mortgage rates are ${opportunity.potentialSavings.toFixed(2)}% lower than your loan rate. You could save approximately $${Math.round(estimatedMonthlySavings)}/month by refinancing.`,
      estimated_value: Math.round(estimatedAnnualSavings),
      triggered_at: new Date().toISOString(),
      metadata: metadata as any,
    };
  } catch (error) {
    console.error(`Error generating refinance alert for property ${property.property.id}:`, error);
    return null;
  }
}

/**
 * Generate refinance alerts for all properties in portfolio
 * 
 * @param thresholdDifference - Minimum rate difference to trigger alert
 * @param minimumEquity - Minimum equity percentage required
 * @returns Array of generated alerts
 */
export async function generateRefinanceAlertsForPortfolio(
  thresholdDifference: number = DEFAULT_RATE_THRESHOLD,
  minimumEquity: number = MINIMUM_EQUITY_PERCENTAGE
): Promise<GeneratedAlertInsert[]> {
  console.log('[Alert Generator] Starting refinance alert generation...');

  try {
    // Fetch all properties with relations
    const properties = await getAllProperties();
    console.log(`[Alert Generator] Analyzing ${properties.length} properties for refinance opportunities`);

    const alerts: GeneratedAlertInsert[] = [];

    // Generate alerts for each property
    for (const property of properties) {
      const alert = await generateRefinanceAlert(
        property,
        undefined,
        thresholdDifference,
        minimumEquity
      );

      if (alert) {
        alerts.push(alert);
        console.log(`[Alert Generator] ✓ Refinance opportunity found for ${property.property.address}`);
      }
    }

    console.log(`[Alert Generator] Generated ${alerts.length} refinance alerts`);
    return alerts;
  } catch (error) {
    console.error('[Alert Generator] Failed to generate refinance alerts:', error);
    throw error;
  }
}

/**
 * Get refinance alert summary statistics
 * Useful for reporting and monitoring
 */
export async function getRefinanceAlertSummary(): Promise<{
  totalProperties: number;
  propertiesWithLoans: number;
  propertiesWithRates: number;
  alertsGenerated: number;
  totalPotentialSavings: number;
}> {
  try {
    const properties = await getAllProperties();
    const propertiesWithLoans = properties.filter(p => 
      p.loans.some(l => l.status === 'active')
    ).length;
    
    const propertiesWithRates = properties.filter(p => 
      p.loans.some(l => l.status === 'active' && l.interest_rate)
    ).length;

    const alerts = await generateRefinanceAlertsForPortfolio();
    const totalPotentialSavings = alerts.reduce((sum, alert) => 
      sum + (alert.estimated_value || 0), 0
    );

    return {
      totalProperties: properties.length,
      propertiesWithLoans,
      propertiesWithRates,
      alertsGenerated: alerts.length,
      totalPotentialSavings: Math.round(totalPotentialSavings),
    };
  } catch (error) {
    console.error('[Alert Generator] Failed to get summary:', error);
    throw error;
  }
}
