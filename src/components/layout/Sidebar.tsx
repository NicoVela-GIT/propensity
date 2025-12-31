'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  LineChart,
  TrendingUp,
  Bell,
  DollarSign,
  BarChart3,
} from 'lucide-react';

const navigation = [
  {
    section: 'PORTFOLIO MANAGEMENT',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Properties', href: '/properties', icon: Building2 },
      { name: 'Add Property', href: '/properties/add', icon: PlusCircle },
      { name: 'Financial Analysis', href: '/financial', icon: LineChart },
      { name: 'Market Insights', href: '/market', icon: TrendingUp },
    ],
  },
];

interface SidebarProps {
  alertCount?: number;
  portfolioValue?: string;
  monthlyROI?: string;
}

export default function Sidebar({
  alertCount = 3,
  portfolioValue = '$2.4M',
  monthlyROI = '8.2%',
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Property Tracker</h1>
            <p className="text-xs text-gray-500 leading-tight">Investment Portfolio</p>
            <p className="text-xs text-gray-500 leading-tight">Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-gray-400 mb-3 tracking-wide">
              {section.section}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Alerts with Badge */}
        <Link
          href="/alerts"
          className={cn(
            'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            pathname === '/alerts'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            Alerts
          </div>
          {alertCount > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
              {alertCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Quick Stats Section */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <p className="text-xs font-semibold text-gray-400 tracking-wide">QUICK STATS</p>

        {/* Portfolio Value Card */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Portfolio Value</p>
              <p className="text-xl font-bold text-gray-900">{portfolioValue}</p>
            </div>
          </div>
        </div>

        {/* Monthly ROI Card */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Monthly ROI</p>
              <p className="text-xl font-bold text-gray-900">{monthlyROI}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User/Plan Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-600 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-lg">
              RE
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">Real Estate I...</p>
              <p className="text-xs text-gray-500">Premium Plan</p>
            </div>
          </div>
          <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md">
            PRO
          </span>
        </div>
      </div>
    </aside>
  );
}

