'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export default function KPICard({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  icon,
  iconBgColor = 'bg-green-500',
}: KPICardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const showTrend = trend !== undefined;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {showTrend && (
            <div className="flex items-center gap-1 flex-wrap">
              {isPositive && (
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
              {isNegative && (
                <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive && 'text-green-600',
                  isNegative && 'text-red-600',
                  !isPositive && !isNegative && 'text-gray-500'
                )}
              >
                {isPositive && '+'}
                {trend}%
              </span>
              <span className="text-sm text-gray-400">{trendLabel}</span>
            </div>
          )}
        </div>
        
        <div
          className={cn(
            'p-3 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105',
            iconBgColor
          )}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
}
