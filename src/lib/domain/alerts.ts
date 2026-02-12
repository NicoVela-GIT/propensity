/**
 * Alert System
 * 
 * Alerts are derived queries, not stored data. They are computed from domain state
 * and regenerated on-demand or via scheduled jobs.
 */

// ============================================
// Alert Rules
// ============================================

export type AlertRuleType = 
  | 'lease_expiring' 
  | 'rent_below_market' 
  | 'value_surge' 
  | 'refinance_opportunity'
  | 'expense_increase'
  | 'maintenance_reserve_low'
  | 'vacancy_alert'
  | 'property_tax_increase';

/**
 * AlertRule defines the business logic for generating alerts.
 * 
 * Philosophy:
 * - Rules are stored, alerts are computed
 * - Changing a rule applies retroactively
 * - Parameters stored as JSON for flexibility
 * 
 * Example parameters:
 * - lease_expiring: { "days_before_expiration": 60 }
 * - value_surge: { "threshold_percentage": 5.0, "lookback_days": 90 }
 * - rent_below_market: { "threshold_percentage": 10.0 }
 */
export interface AlertRule {
  id: string;
  ruleType: AlertRuleType;
  enabled: boolean;
  parameters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Generated Alerts (Ephemeral)
// ============================================

export type AlertSeverity = 'high' | 'medium' | 'low';

/**
 * Alert represents an actionable signal computed from domain state.
 * 
 * Key principles:
 * - Alerts are computed, not stored as primary data
 * - ID is a hash of rule + property + trigger conditions (stable across regenerations)
 * - Alert engine runs nightly or on-demand
 * - User state (read/dismissed) tracked separately
 * 
 * Lifecycle:
 * 1. Rule engine evaluates all AlertRules
 * 2. Generates Alert objects for current conditions
 * 3. UI displays alerts
 * 4. User interactions stored in UserAlertState
 * 5. Next run: regenerate fresh alerts, merge with user state
 */
export interface Alert {
  id: string;                      // Hash of rule + property + conditions
  ruleId: string;
  propertyId?: string;             // Null for portfolio-level alerts
  
  severity: AlertSeverity;
  title: string;
  description: string;
  estimatedValue?: number;         // Potential savings/gains in dollars
  
  actionDeadline?: Date;
  triggeredAt: Date;
}

// ============================================
// User Alert State (UI concerns)
// ============================================

/**
 * UserAlertState tracks user interactions with alerts.
 * 
 * Separated from Alert entity to distinguish domain logic from UI state.
 */
export interface UserAlertState {
  userId: string;
  alertId: string;
  isRead: boolean;
  isDismissed: boolean;
  dismissedAt?: Date;
  createdAt: Date;
}

// ============================================
// Alert Rule Examples
// ============================================

/**
 * Example rule definitions for common scenarios
 */
export const ALERT_RULE_TEMPLATES: Record<AlertRuleType, { 
  description: string; 
  defaultParameters: Record<string, any>;
  severityLogic: string;
}> = {
  lease_expiring: {
    description: 'Trigger when lease expiration is approaching',
    defaultParameters: {
      days_before_expiration_high: 30,
      days_before_expiration_medium: 60,
    },
    severityLogic: '< 30 days = high, < 60 days = medium',
  },
  
  rent_below_market: {
    description: 'Trigger when current rent is below market rate',
    defaultParameters: {
      threshold_percentage: 10.0,  // 10% below market
    },
    severityLogic: '> 15% below = high, > 10% below = medium',
  },
  
  value_surge: {
    description: 'Trigger when property value increases significantly',
    defaultParameters: {
      threshold_percentage_high: 8.0,
      threshold_percentage_medium: 5.0,
      lookback_days: 90,
    },
    severityLogic: '> 8% in 90 days = high, > 5% = medium',
  },
  
  refinance_opportunity: {
    description: 'Trigger when interest rates drop significantly',
    defaultParameters: {
      rate_difference_threshold: 0.75,  // 0.75% lower
      minimum_months_remaining: 24,
      minimum_equity_percentage: 20,
    },
    severityLogic: 'Based on potential monthly savings',
  },
  
  expense_increase: {
    description: 'Trigger when recurring expense increases significantly',
    defaultParameters: {
      threshold_percentage: 10.0,
    },
    severityLogic: '> 15% = high, > 10% = medium',
  },
  
  maintenance_reserve_low: {
    description: 'Trigger when maintenance spending is below recommended',
    defaultParameters: {
      annual_percentage_of_value: 1.0,  // 1% of property value per year
    },
    severityLogic: '< 0.5% = high, < 1% = medium',
  },
  
  vacancy_alert: {
    description: 'Trigger when property becomes vacant',
    defaultParameters: {
      days_vacant_high: 60,
      days_vacant_medium: 30,
    },
    severityLogic: '> 60 days = high, > 30 days = medium',
  },
  
  property_tax_increase: {
    description: 'Trigger when property tax increases',
    defaultParameters: {
      threshold_percentage: 10.0,
    },
    severityLogic: '> 15% = high, > 10% = medium',
  },
};

/**
 * Helper to generate stable alert ID
 * Same inputs = same ID (prevents duplicate alerts)
 */
export function generateAlertId(
  ruleId: string,
  propertyId: string | undefined,
  triggerDate: Date
): string {
  const dateStr = triggerDate.toISOString().split('T')[0];
  const input = `${ruleId}-${propertyId || 'portfolio'}-${dateStr}`;
  
  // Simple hash (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `alert-${Math.abs(hash).toString(36)}`;
}
