'use client';

import { Bell } from 'lucide-react';
import AlertsList from '../alerts/AlertsList';
import type { AlertWithState } from '@/lib/supabase/repositories/alerts.repository';

interface AlertsSectionProps {
  alerts: AlertWithState[];
  onViewAll?: () => void;
}

export default function AlertsSection({ alerts, onViewAll }: AlertsSectionProps) {
  // Show only top 3 alerts on dashboard
  const topAlerts = alerts.slice(0, 3);
  const hasMore = alerts.length > 3;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        
        {hasMore && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
          </button>
        )}
      </div>

      <AlertsList alerts={topAlerts} />
    </div>
  );
}
