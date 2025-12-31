'use client';

import { DollarSign, ExternalLink, Pencil, CreditCard } from 'lucide-react';
import { Property, calculateEquity, calculateEquityPercentage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PropertyValueSidebarProps {
  property: Property;
  onEditValue?: () => void;
  onEditMortgage?: () => void;
}

export default function PropertyValueSidebar({
  property,
  onEditValue,
  onEditMortgage,
}: PropertyValueSidebarProps) {
  const appreciationPercent = property.purchasePrice > 0
    ? ((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100
    : 0;
  
  const equity = calculateEquity(property.currentValue, property.mortgageBalance || 0);
  const equityPercentage = calculateEquityPercentage(property.currentValue, property.mortgageBalance || 0);

  // Generate Zillow and Redfin URLs
  const addressEncoded = encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`);
  const zillowUrl = `https://www.zillow.com/homes/${addressEncoded}`;
  const redfinUrl = `https://www.redfin.com/search?q=${addressEncoded}`;

  return (
    <div className="space-y-6">
      {/* Property Value Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Property Value</h3>
        </div>

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Estimated Value</p>
            <p className="text-3xl font-bold text-gray-900">
              ${property.currentValue.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onEditValue}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit value"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        <p className={cn(
          'text-sm font-medium mb-6',
          appreciationPercent >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {appreciationPercent >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}% since purchase
        </p>

        {/* External Links */}
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-500">Check Current Market Value:</p>
          <a
            href={zillowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">View on Zillow</span>
          </a>
          <a
            href={redfinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">View on Redfin</span>
          </a>
          <p className="text-xs text-gray-400 mt-2">
            Check these sites for updated estimates, then use the edit button above to update your property value.
          </p>
        </div>

        {/* Purchase Price */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Purchase Price</span>
            <span className="font-semibold text-gray-900">
              ${property.purchasePrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Equity & Debt Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Equity & Debt</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Equity</p>
            <p className="text-2xl font-bold text-green-600">
              ${equity.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Mortgage Balance</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                ${(property.mortgageBalance || 0).toLocaleString()}
              </span>
              <button
                onClick={onEditMortgage}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit mortgage balance"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Down Payment</span>
            <span className="font-semibold text-gray-900">
              ${(property.downPayment || 0).toLocaleString()}
            </span>
          </div>

          {/* Equity Progress Bar */}
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Equity</span>
              <span>{equityPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(equityPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

