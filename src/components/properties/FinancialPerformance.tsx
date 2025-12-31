'use client';

import { DollarSign, TrendingUp } from 'lucide-react';
import { Property, calculateMonthlyProfit } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FinancialPerformanceProps {
  property: Property;
}

export default function FinancialPerformance({ property }: FinancialPerformanceProps) {
  const monthlyProfit = calculateMonthlyProfit(
    property.monthlyIncome,
    property.monthlyExpenses,
    property.mortgagePayment
  );
  const annualProfit = monthlyProfit * 12;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      {/* Section Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <DollarSign className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Financial Performance</h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Highlight Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Monthly Profit Card */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Monthly Profit</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className={cn(
              'text-2xl font-bold',
              monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              ${Math.abs(monthlyProfit).toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              ${Math.abs(annualProfit).toLocaleString()} annually
            </p>
          </div>

          {/* ROI Card */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">ROI</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className={cn(
              'text-2xl font-bold',
              property.roi >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {property.roi}%
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Annual return
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
            <p className="text-lg font-bold text-green-600">
              ${property.monthlyIncome.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Monthly Expenses</p>
            <p className="text-lg font-bold text-red-500">
              -${(property.monthlyExpenses || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Mortgage Payment</p>
            <p className="text-lg font-bold text-red-500">
              -${(property.mortgagePayment || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

