'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  TrendingUp,
  Bell,
} from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Add', href: '/properties/add', icon: PlusCircle, isCenter: true },
  { name: 'Insights', href: '/market', icon: TrendingUp },
  { name: 'Alerts', href: '/alerts', icon: Bell, badge: 3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 animate-slide-in-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 relative',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}

