'use client';

import Link from 'next/link';
import { Eye, TrendingUp, Bell, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, PropertyDistribution } from '@/lib/types';

interface AlertCardProps {
  alert: Alert;
}

function AlertCard({ alert }: AlertCardProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{alert.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
              {alert.title}
            </h4>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0',
                priorityColors[alert.priority]
              )}
            >
              {alert.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {alert.description}
          </p>
          <div className="text-sm font-semibold text-green-600">
            Est. Value: ${alert.estimatedValue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PropertyDistributionProps {
  data: PropertyDistribution[];
}

function PropertyDistributionCard({ data }: PropertyDistributionProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Property Distribution</h3>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.type} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{item.type}</span>
            <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-md">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface QuickActionsProps {
  actions: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
}

function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{action.icon}</span>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </div>
            {action.badge && (
              <span className="bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                {action.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

interface RightPanelProps {
  alerts: Alert[];
  propertyDistribution: PropertyDistribution[];
}

export default function RightPanel({ alerts, propertyDistribution }: RightPanelProps) {
  const quickActions = [
    { label: 'View All Properties', href: '/properties', icon: <Eye className="w-5 h-5" /> },
    { label: 'Market Analysis', href: '/market', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Investment Opportunities', href: '/opportunities', icon: <Bell className="w-5 h-5" />, badge: 3 },
  ];

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 p-5 h-screen sticky top-0 overflow-y-auto">
      {/* Recent Alerts Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
          </div>
          <Link
            href="/alerts"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4" />
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      {/* Property Distribution */}
      <div className="mb-6">
        <PropertyDistributionCard data={propertyDistribution} />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </aside>
  );
}

