'use client';

import { LineChart, PieChart, Wallet, Calculator } from 'lucide-react';

export default function FinancialAnalysisPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div className="bg-purple-600 p-2 rounded-lg">
          <LineChart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Financial Analysis
          </h1>
          <p className="text-gray-600">
            Deep dive into your portfolio financials
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: 'Cash Flow Analysis',
            description: 'Track income, expenses, and net operating income across all properties',
            icon: Wallet,
            color: 'bg-green-500',
          },
          {
            title: 'ROI Calculator',
            description: 'Calculate return on investment with customizable parameters',
            icon: Calculator,
            color: 'bg-blue-500',
          },
          {
            title: 'Equity Growth',
            description: 'Monitor your equity buildup over time',
            icon: LineChart,
            color: 'bg-purple-500',
          },
          {
            title: 'Portfolio Breakdown',
            description: 'Visualize your portfolio allocation and diversification',
            icon: PieChart,
            color: 'bg-orange-500',
          },
        ].map((item, index) => (
          <div
            key={item.title}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`${item.color} p-3 rounded-lg w-fit mb-4`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <span className="text-sm text-blue-600 font-medium">
              Coming Soon
            </span>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div
        className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100 animate-fade-in-up"
        style={{ animationDelay: '500ms' }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          💡 Financial Reports
        </h3>
        <p className="text-gray-600">
          Generate comprehensive financial reports for tax purposes, loan
          applications, or investment analysis. Export to PDF or CSV for easy
          sharing with your accountant or financial advisor.
        </p>
      </div>
    </div>
  );
}

