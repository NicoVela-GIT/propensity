'use client';

import Link from 'next/link';
import { MapPin, Bed, Bath, Square, TrendingUp, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Property } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PropertyGridCardProps {
  property: Property;
  onDelete?: (id: string) => void;
}

const propertyTypeLabels: Record<string, string> = {
  'single-family': 'Single Family',
  'multi-family': 'Multi Family',
  'condo': 'Condo',
  'townhouse': 'Townhouse',
  'commercial': 'Commercial',
};

export default function PropertyGridCard({
  property,
  onDelete,
}: PropertyGridCardProps) {
  // Calculate monthly profit
  const monthlyProfit = property.monthlyIncome - 
    (property.monthlyExpenses || 0) - 
    (property.mortgagePayment || 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden card-hover">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {property.address}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500 mt-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">
                {property.city}, {property.state} {property.zipCode}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-2">
            <Link
              href={`/properties/${property.id}/edit`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit property"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete?.(property.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Property Type Badge */}
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium"
        >
          {propertyTypeLabels[property.propertyType] || property.propertyType}
        </Badge>

        {/* Specs Row */}
        <div className="flex items-center gap-4 mt-4 text-gray-600">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms} bath</span>
            </div>
          )}
          {property.squareFeet !== undefined && (
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4" />
              <span className="text-sm">{property.squareFeet.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Financial Row */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Current Value</p>
            <p className="text-lg font-bold text-gray-900">
              ${property.currentValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Monthly Profit</p>
            <p className={cn(
              'text-lg font-bold',
              monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {monthlyProfit >= 0 ? '+' : ''}${monthlyProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ROI & Owned Since */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <TrendingUp className={cn(
              'w-4 h-4',
              property.roi >= 0 ? 'text-green-600' : 'text-red-600'
            )} />
            <span className={cn(
              'text-sm font-semibold',
              property.roi >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {property.roi}% Annual ROI
            </span>
          </div>
          {property.ownedSince && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Owned {property.ownedSince}</span>
            </div>
          )}
        </div>
      </div>

      {/* View Details Button */}
      <Link
        href={`/properties/${property.id}`}
        className="block w-full py-3 text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}

