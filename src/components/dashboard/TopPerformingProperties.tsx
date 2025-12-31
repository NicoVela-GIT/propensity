'use client';

import Link from 'next/link';
import { TrendingUp, Eye } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Property } from '@/lib/types';

interface TopPerformingPropertiesProps {
  properties: Property[];
  maxDisplay?: number;
}

export default function TopPerformingProperties({
  properties,
  maxDisplay = 3,
}: TopPerformingPropertiesProps) {
  const topProperties = properties
    .sort((a, b) => b.roi - a.roi)
    .slice(0, maxDisplay);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Top Performing Properties</h2>
        </div>
        <Link
          href="/properties"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {topProperties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={{ ...property, rank: index + 1 }}
          />
        ))}
      </div>
    </div>
  );
}

