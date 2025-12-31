'use client';

import { useState, useMemo } from 'react';
import { 
  Bell, 
  Eye, 
  AlertTriangle, 
  DollarSign, 
  RefreshCw,
  TrendingUp,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { alerts, getAlertCounts } from '@/lib/data';
import { Alert } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// KPI Card Component
function AlertKPICard({
  title,
  value,
  icon,
  iconBgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', iconBgColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Enhanced Alert Card Component
function AlertCard({ alert, onMarkRead }: { alert: Alert; onMarkRead?: (id: string) => void }) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  };

  const iconMap: Record<string, React.ReactNode> = {
    'value-surge': <TrendingUp className="w-6 h-6 text-green-600" />,
    'refinance': <RefreshCw className="w-6 h-6 text-blue-600" />,
    'rent-increase': <DollarSign className="w-6 h-6 text-yellow-600" />,
    'opportunity': <Bell className="w-6 h-6 text-purple-600" />,
    'alert': <AlertTriangle className="w-6 h-6 text-red-600" />,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-xl flex-shrink-0">
          {iconMap[alert.type] || <Bell className="w-6 h-6 text-gray-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {alert.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold',
                priorityColors[alert.priority]
              )}>
                {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
              </span>
              {!alert.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" title="Unread" />
              )}
              <button
                onClick={() => onMarkRead?.(alert.id)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mark as read"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-1">{alert.description}</p>
          
          {/* Date */}
          <div className="flex items-center gap-1.5 text-gray-500 mt-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {format(new Date(alert.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Value Highlight Box */}
      {alert.equityGained && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  ${alert.equityGained.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">
                  {alert.type === 'value-surge' ? 'Equity Gained' : 
                   alert.type === 'refinance' ? 'Annual Savings' : 
                   'Potential Value'}
                </p>
              </div>
            </div>
            {alert.percentChange && (
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                {alert.percentChange >= 0 ? '+' : ''}{alert.percentChange}% change
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Deadline Warning */}
      {alert.actionDeadline && (
        <div className="bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <span className="text-sm font-medium text-yellow-700">
            Action needed by {format(new Date(alert.actionDeadline), 'MMM d, yyyy')}
          </span>
        </div>
      )}

      {/* View Details Link */}
      <button className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 mt-4 transition-colors">
        View Details
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Filter Tab Component
function FilterTab({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-bold',
          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'urgent' | 'read'>('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const counts = getAlertCounts();

  // Filter alerts based on active tab and filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Tab filter
      if (activeTab === 'unread' && alert.isRead) return false;
      if (activeTab === 'read' && !alert.isRead) return false;
      if (activeTab === 'urgent' && alert.priority !== 'high') return false;

      // Priority filter
      if (priorityFilter !== 'all' && alert.priority !== priorityFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && alert.type !== typeFilter) return false;

      return true;
    });
  }, [activeTab, priorityFilter, typeFilter]);

  const handleMarkRead = (id: string) => {
    // TODO: Update alert read status
    console.log('Mark as read:', id);
  };

  const handleRefresh = () => {
    // TODO: Refresh alerts from API
    console.log('Refreshing alerts...');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Investment Alerts
          </h1>
          <p className="text-gray-600 mt-1">
            Stay informed about market opportunities and property updates
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors btn-press self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-in-up stagger-1">
          <AlertKPICard
            title="Total Alerts"
            value={counts.total}
            icon={<Bell className="w-6 h-6 text-white" />}
            iconBgColor="bg-blue-500"
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <AlertKPICard
            title="Unread"
            value={counts.unread}
            icon={<Eye className="w-6 h-6 text-white" />}
            iconBgColor="bg-green-500"
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <AlertKPICard
            title="High Priority"
            value={counts.highPriority}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            iconBgColor="bg-red-500"
          />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <AlertKPICard
            title="Opportunities"
            value={counts.opportunities}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            iconBgColor="bg-yellow-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* Tab Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterTab
            label="All"
            count={counts.total}
            isActive={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          />
          <FilterTab
            label="Unread"
            count={counts.unread}
            isActive={activeTab === 'unread'}
            onClick={() => setActiveTab('unread')}
          />
          <FilterTab
            label="Urgent"
            count={counts.highPriority}
            isActive={activeTab === 'urgent'}
            onClick={() => setActiveTab('urgent')}
          />
          <FilterTab
            label="Read"
            isActive={activeTab === 'read'}
            onClick={() => setActiveTab('read')}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">Filter:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="value-surge">Value Surge</option>
            <option value="refinance">Refinance</option>
            <option value="rent-increase">Rent Increase</option>
            <option value="opportunity">Opportunity</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(index + 3) * 50}ms` }}
            >
              <AlertCard alert={alert} onMarkRead={handleMarkRead} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No alerts found
            </h3>
            <p className="text-gray-600">
              {activeTab !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters.'
                : "You're all caught up! No new alerts at this time."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
