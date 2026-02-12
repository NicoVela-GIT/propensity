/**
 * Alerts Repository
 * 
 * Manages storage and retrieval of alerts and alert rules.
 */

import { supabase } from '../client';
import type { Database } from '../database.types';

// ============================================
// Types
// ============================================

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type Json = Database['public']['Tables']['alert_rules']['Row']['parameters'];

export interface AlertRuleInsert {
  rule_type: string;
  enabled?: boolean | null;
  parameters: Json;
}

export interface AlertRule extends AlertRuleInsert {
  id: string;
  enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GeneratedAlertInsert {
  id: string; // Hash-based ID for idempotency
  rule_id?: string;
  property_id?: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  estimated_value?: number;
  action_deadline?: string; // YYYY-MM-DD
  triggered_at: string; // ISO timestamp
  metadata?: Record<string, any>;
}

export interface GeneratedAlert extends GeneratedAlertInsert {
  created_at: string | null;
}

export interface UserAlertState {
  alert_id: string;
  is_read: boolean | null;
  is_dismissed: boolean | null;
  dismissed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AlertWithState extends GeneratedAlert {
  user_state?: UserAlertState;
}

// ============================================
// Alert Rules
// ============================================

/**
 * Create or update an alert rule
 */
export async function upsertAlertRule(rule: AlertRuleInsert & { id?: string }): Promise<AlertRule> {
  const { data, error } = await supabase
    .from('alert_rules')
    .upsert(rule)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert alert rule: ${error.message}`);
  }

  return data;
}

/**
 * Get all enabled alert rules
 */
export async function getEnabledAlertRules(): Promise<AlertRule[]> {
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('enabled', true)
    .order('rule_type');

  if (error) {
    throw new Error(`Failed to fetch enabled alert rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Get alert rule by ID
 */
export async function getAlertRuleById(id: string): Promise<AlertRule | null> {
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch alert rule: ${error.message}`);
  }

  return data;
}

/**
 * Get alert rule by type
 */
export async function getAlertRuleByType(ruleType: string): Promise<AlertRule | null> {
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('rule_type', ruleType)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch alert rule by type: ${error.message}`);
  }

  return data;
}

/**
 * Enable or disable an alert rule
 */
export async function setAlertRuleEnabled(id: string, enabled: boolean): Promise<AlertRule> {
  const { data, error } = await supabase
    .from('alert_rules')
    .update({ enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update alert rule: ${error.message}`);
  }

  return data;
}

// ============================================
// Generated Alerts
// ============================================

/**
 * Store or update generated alerts
 * Uses upsert to handle re-generation gracefully
 */
export async function upsertGeneratedAlerts(alerts: GeneratedAlertInsert[]): Promise<GeneratedAlert[]> {
  if (alerts.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('generated_alerts')
    .upsert(alerts, {
      onConflict: 'id',
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert generated alerts: ${error.message}`);
  }

  return data || [];
}

/**
 * Insert a single generated alert
 */
export async function insertGeneratedAlert(alert: GeneratedAlertInsert): Promise<GeneratedAlert> {
  const result = await upsertGeneratedAlerts([alert]);
  return result[0];
}

/**
 * Get all active alerts (not dismissed)
 */
export async function getActiveAlerts(): Promise<AlertWithState[]> {
  const { data, error } = await supabase
    .from('generated_alerts')
    .select(`
      *,
      user_state:user_alert_state(*)
    `)
    .order('triggered_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch active alerts: ${error.message}`);
  }

  // Filter out dismissed alerts and flatten user_state
  const alerts = (data || []).map(alert => ({
    ...alert,
    user_state: Array.isArray(alert.user_state) ? alert.user_state[0] : alert.user_state,
  })).filter(alert => !alert.user_state?.is_dismissed);

  return alerts;
}

/**
 * Get alerts for a specific property
 */
export async function getAlertsForProperty(propertyId: string): Promise<AlertWithState[]> {
  const { data, error } = await supabase
    .from('generated_alerts')
    .select(`
      *,
      user_state:user_alert_state(*)
    `)
    .eq('property_id', propertyId)
    .order('triggered_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch alerts for property: ${error.message}`);
  }

  return (data || []).map(alert => ({
    ...alert,
    user_state: Array.isArray(alert.user_state) ? alert.user_state[0] : alert.user_state,
  }));
}

/**
 * Get unread alerts count
 */
export async function getUnreadAlertsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('generated_alerts')
    .select('*', { count: 'exact', head: true })
    .not('id', 'in', 
      supabase
        .from('user_alert_state')
        .select('alert_id')
        .eq('is_read', true)
    );

  if (error) {
    throw new Error(`Failed to count unread alerts: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get alert by ID with user state
 */
export async function getAlertById(id: string): Promise<AlertWithState | null> {
  const { data, error } = await supabase
    .from('generated_alerts')
    .select(`
      *,
      user_state:user_alert_state(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch alert: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    user_state: Array.isArray(data.user_state) ? data.user_state[0] : data.user_state,
  };
}

// ============================================
// User Alert State
// ============================================

/**
 * Mark an alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<UserAlertState> {
  const { data, error } = await supabase
    .from('user_alert_state')
    .upsert({
      alert_id: alertId,
      is_read: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark alert as read: ${error.message}`);
  }

  return data;
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(alertId: string): Promise<UserAlertState> {
  const { data, error } = await supabase
    .from('user_alert_state')
    .upsert({
      alert_id: alertId,
      is_dismissed: true,
      dismissed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to dismiss alert: ${error.message}`);
  }

  return data;
}

/**
 * Un-dismiss an alert
 */
export async function undismissAlert(alertId: string): Promise<UserAlertState> {
  const { data, error } = await supabase
    .from('user_alert_state')
    .update({
      is_dismissed: false,
      dismissed_at: null,
    })
    .eq('alert_id', alertId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to undismiss alert: ${error.message}`);
  }

  return data;
}

// ============================================
// Cleanup
// ============================================

/**
 * Delete old dismissed alerts
 * 
 * @param beforeDate - Delete alerts dismissed before this date (YYYY-MM-DD)
 * @returns Number of alerts deleted
 */
export async function deleteOldDismissedAlerts(beforeDate: string): Promise<number> {
  // First get the alert IDs to delete
  const { data: stateData, error: stateError } = await supabase
    .from('user_alert_state')
    .select('alert_id')
    .eq('is_dismissed', true)
    .lt('dismissed_at', beforeDate);

  if (stateError) {
    throw new Error(`Failed to fetch old dismissed alerts: ${stateError.message}`);
  }

  if (!stateData || stateData.length === 0) {
    return 0;
  }

  const alertIds = stateData.map(s => s.alert_id);

  // Delete the alerts (cascade will delete user_alert_state)
  const { data, error } = await supabase
    .from('generated_alerts')
    .delete()
    .in('id', alertIds)
    .select();

  if (error) {
    throw new Error(`Failed to delete old dismissed alerts: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Delete alerts for a specific property
 */
export async function deleteAlertsForProperty(propertyId: string): Promise<number> {
  const { data, error } = await supabase
    .from('generated_alerts')
    .delete()
    .eq('property_id', propertyId)
    .select();

  if (error) {
    throw new Error(`Failed to delete alerts for property: ${error.message}`);
  }

  return data?.length || 0;
}
