/**
 * Daily Alert Generation Job
 * 
 * Runs all alert generators and stores results in the database.
 * Should be run daily (e.g., at 6 AM).
 */

import { generateRefinanceAlertsForPortfolio } from '../alerts/generators/refinance-alert.generator';
import { upsertGeneratedAlerts } from '../supabase/repositories/alerts.repository';

// ============================================
// Job Implementation
// ============================================

export interface AlertGenerationResult {
  success: boolean;
  refinanceAlerts: number;
  totalAlerts: number;
  error?: string;
  timestamp: string;
  details?: {
    refinanceAlertsGenerated: number;
    refinanceAlertsStored: number;
  };
}

/**
 * Generate all alerts for the portfolio
 * 
 * Runs all enabled alert generators and stores the results in the database.
 * Currently supports:
 * - Refinance opportunity alerts
 * 
 * Future alert types can be added here:
 * - Market appreciation alerts
 * - Lease expiration alerts
 * - Maintenance reserve alerts
 * - Negative cash flow alerts
 * 
 * @returns Result object with success status and alert counts
 * 
 * @example
 * ```typescript
 * const result = await generateAllAlerts();
 * if (result.success) {
 *   console.log(`Generated ${result.totalAlerts} total alerts`);
 * }
 * ```
 */
export async function generateAllAlerts(): Promise<AlertGenerationResult> {
  const timestamp = new Date().toISOString();
  
  console.log('[Job] Starting daily alert generation...');
  console.log(`[Job] Timestamp: ${timestamp}`);

  try {
    // ============================================
    // 1. Generate Refinance Alerts
    // ============================================
    console.log('[Job] Generating refinance opportunity alerts...');
    
    const refinanceAlerts = await generateRefinanceAlertsForPortfolio();
    console.log(`[Job] Generated ${refinanceAlerts.length} refinance alerts`);

    // Store refinance alerts in database
    if (refinanceAlerts.length > 0) {
      const stored = await upsertGeneratedAlerts(refinanceAlerts);
      console.log(`[Job] Stored ${stored.length} refinance alerts in database`);
    }

    // ============================================
    // 2. Generate Other Alert Types (Future)
    // ============================================
    
    // TODO: Add market appreciation alerts
    // const marketAlerts = await generateMarketAppreciationAlerts();
    
    // TODO: Add lease expiration alerts
    // const leaseAlerts = await generateLeaseExpirationAlerts();
    
    // TODO: Add maintenance reserve alerts
    // const maintenanceAlerts = await generateMaintenanceReserveAlerts();
    
    // TODO: Add negative cash flow alerts
    // const cashFlowAlerts = await generateNegativeCashFlowAlerts();

    // ============================================
    // 3. Calculate Totals
    // ============================================
    
    const totalAlerts = refinanceAlerts.length;

    console.log('[Job] Alert generation completed successfully');
    console.log(`[Job] Total alerts generated: ${totalAlerts}`);

    return {
      success: true,
      refinanceAlerts: refinanceAlerts.length,
      totalAlerts,
      timestamp,
      details: {
        refinanceAlertsGenerated: refinanceAlerts.length,
        refinanceAlertsStored: refinanceAlerts.length,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Job] Failed to generate alerts:', errorMessage);
    console.error('[Job] Error details:', error);
    
    return {
      success: false,
      refinanceAlerts: 0,
      totalAlerts: 0,
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Get alert generation statistics
 * Useful for monitoring and reporting
 */
export async function getAlertGenerationStats(): Promise<{
  lastRun?: string;
  totalAlertsActive: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}> {
  try {
    const { getActiveAlerts } = await import('../supabase/repositories/alerts.repository');
    
    const alerts = await getActiveAlerts();

    // Group by type (extract from metadata or rule_id)
    const alertsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};

    alerts.forEach(alert => {
      // Count by severity
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      
      // Count by type (use title as proxy for type)
      const type = alert.title.toLowerCase().includes('refinance') ? 'refinance' : 'other';
      alertsByType[type] = (alertsByType[type] || 0) + 1;
    });

    return {
      totalAlertsActive: alerts.length,
      alertsByType,
      alertsBySeverity,
    };
  } catch (error) {
    console.error('[Job] Failed to get alert generation stats:', error);
    throw error;
  }
}

/**
 * Cleanup old dismissed alerts
 * Should be run periodically (e.g., monthly)
 * 
 * @param daysOld - Delete alerts dismissed more than this many days ago
 * @returns Number of alerts deleted
 */
export async function cleanupOldAlerts(daysOld: number = 90): Promise<number> {
  try {
    const { deleteOldDismissedAlerts } = await import('../supabase/repositories/alerts.repository');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    console.log(`[Job] Cleaning up alerts dismissed before ${cutoffDateStr}`);
    
    const deletedCount = await deleteOldDismissedAlerts(cutoffDateStr);
    
    console.log(`[Job] Deleted ${deletedCount} old dismissed alerts`);
    
    return deletedCount;
  } catch (error) {
    console.error('[Job] Failed to cleanup old alerts:', error);
    throw error;
  }
}
