'use client';

import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function FormSection({
  title,
  icon,
  children,
  className,
  delay = 0,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="text-gray-600">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

