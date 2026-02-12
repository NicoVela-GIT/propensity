'use client';

import { useState } from 'react';
import AlertCard from './AlertCard';
import type { AlertWithState } from '@/lib/supabase/repositories/alerts.repository';

interface AlertsListProps {
  alerts: AlertWithState[];
  onAlertClick?: (alertId: string) => void;
}

export default function AlertsList({ alerts, onAlertClick }: AlertsListProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismiss = async (alertId: string) => {
    try {
      // Optimistically update UI
      setDismissedAlerts(prev => new Set(prev).add(alertId));

      // Call API to dismiss alert
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      });

      if (!response.ok) {
        // Revert on error
        setDismissedAlerts(prev => {
          const next = new Set(prev);
          next.delete(alertId);
          return next;
        });
        console.error('Failed to dismiss alert');
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      // Revert on error
      setDismissedAlerts(prev => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const handleAlertClick = async (alertId: string) => {
    // Mark as read when clicked
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' }),
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }

    // Call parent handler if provided
    if (onAlertClick) {
      onAlertClick(alertId);
    }
  };

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          All caught up!
        </h3>
        <p className="text-sm text-gray-500">
          You have no active alerts at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onDismiss={handleDismiss}
          onClick={handleAlertClick}
        />
      ))}
    </div>
  );
}
