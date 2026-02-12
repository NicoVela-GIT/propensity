'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, Building2 } from 'lucide-react';
import { PropertyGridCard } from '@/components/properties';
import { getAllProperties } from '@/lib/supabase/services/property.service';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { Property } from '@/lib/types';

const propertyTypeFilters = [
  { value: 'all', label: 'All' },
  { value: 'single-family', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'multi-family', label: 'Multi Family' },
];

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties on mount
  useEffect(() => {
    getAllProperties().then(data => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  // Filter properties based on search and type
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = searchQuery === '' ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || property.propertyType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType, properties]);

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete property:', id);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Properties
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track your real estate portfolio
          </p>
        </div>
        <Link
          href="/properties/add"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 self-start sm:self-auto shadow-sm btn-press"
        >
          <PlusCircle className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by address or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {propertyTypeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 btn-press',
                selectedType === filter.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <PropertyGridCard
                property={property}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            {searchQuery || selectedType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first investment property.'}
          </p>
          <Link
            href="/properties/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add Property
          </Link>
        </div>
      )}
    </div>
  );
}
