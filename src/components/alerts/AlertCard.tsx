'use client';

import { AlertTriangle, TrendingDown, DollarSign, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AlertWithState } from '@/lib/supabase/repositories/alerts.repository';

interface AlertCardProps {
  alert: AlertWithState;
  onDismiss?: (alertId: string) => void;
  onClick?: (alertId: string) => void;
}

const severityConfig = {
  critical: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    badgeVariant: 'destructive' as const,
    icon: AlertTriangle,
  },
  high: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    badgeVariant: 'destructive' as const,
    icon: TrendingDown,
  },
  medium: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    badgeVariant: 'outline' as const,
    icon: AlertTriangle,
  },
  low: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    badgeVariant: 'secondary' as const,
    icon: AlertTriangle,
  },
};

export default function AlertCard({ alert, onDismiss, onClick }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const isUnread = !alert.user_state?.is_read;

  const handleClick = () => {
    if (onClick) {
      onClick(alert.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(alert.id);
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 shadow-sm border transition-all',
        config.borderColor,
        isUnread && 'ring-2 ring-blue-100',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {alert.title}
              {isUnread && (
                <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={config.badgeVariant} className="capitalize">
                {alert.severity}
              </Badge>
              
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {alert.description}
          </p>

          {/* Estimated Value */}
          {alert.estimated_value && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <DollarSign className="w-4 h-4" />
              <span>
                Potential savings: ${alert.estimated_value.toLocaleString()}/year
              </span>
            </div>
          )}

          {/* Action Deadline */}
          {alert.action_deadline && (
            <div className="mt-2 text-xs text-gray-500">
              Action by: {new Date(alert.action_deadline).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
