'use client';

import { Building2, Bed, Bath, Square, Calendar, Home } from 'lucide-react';
import { Property } from '@/lib/types';
import { format } from 'date-fns';

interface PropertyOverviewProps {
  property: Property;
}

export default function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <Building2 className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Property Overview</h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Bed className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bedrooms</p>
              <p className="text-xl font-bold text-gray-900">
                {property.bedrooms ?? '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <Bath className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bathrooms</p>
              <p className="text-xl font-bold text-gray-900">
                {property.bathrooms ?? '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Square className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Square Feet</p>
              <p className="text-xl font-bold text-gray-900">
                {property.squareFeet?.toLocaleString() ?? '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-sm">Year Built</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {property.yearBuilt ?? '-'}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Purchase Date</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {property.purchaseDate
                ? format(new Date(property.purchaseDate), 'M/d/yyyy')
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

