'use client';

import { MapPin } from 'lucide-react';
import { Property } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  convertOldPropertyToNew,
  calculateEquity,
  calculateEquityPercentage,
  calculateAppreciation,
} from '@/lib/domain';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  // Convert to domain model and calculate metrics
  const { property: domainProperty, valuation, loanBalance } = convertOldPropertyToNew(property);
  
  const computedEquity = calculateEquity(
    valuation.estimatedValue,
    loanBalance ? [loanBalance.principalBalance] : []
  );
  
  const computedEquityPercent = calculateEquityPercentage(
    valuation.estimatedValue,
    loanBalance ? [loanBalance.principalBalance] : []
  );
  
  const computedAppreciation = calculateAppreciation(
    valuation.estimatedValue,
    domainProperty.purchasePrice
  );
  
  const getRoiColor = (roi: number) => {
    if (roi >= 100) return 'bg-green-100 text-green-700 border-green-200';
    if (roi >= 20) return 'bg-green-50 text-green-600 border-green-100';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover cursor-pointer',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-4">
          {property.rank && (
            <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
              #{property.rank}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {property.address}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {property.city}, {property.state}
              </span>
            </div>
          </div>
        </div>
        
        <span className={cn(
          'px-3 py-1.5 rounded-full text-sm font-semibold border self-start',
          getRoiColor(property.roi)
        )}>
          {property.roi}% ROI
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Equity</p>
          <p className="text-base sm:text-lg xl:text-xl font-bold text-gray-900">
            ${computedEquity.toLocaleString('en-US')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {computedEquityPercent.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
          <p className="text-base sm:text-lg xl:text-xl font-bold text-green-600">
            +${property.monthlyIncome.toLocaleString('en-US')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Appreciation</p>
          <p className="text-base sm:text-lg xl:text-xl font-bold text-green-600">
            +{computedAppreciation.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
