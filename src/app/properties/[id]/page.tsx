'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Pencil, Trash2 } from 'lucide-react';
import {
  PropertyOverview,
  FinancialPerformance,
  LeaseInformation,
  PropertyValueSidebar,
} from '@/components/properties';
import { getPropertyById } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const propertyTypeLabels: Record<string, string> = {
  'single-family': 'Single Family',
  'multi-family': 'Multi Family',
  'condo': 'Condo',
  'townhouse': 'Townhouse',
  'commercial': 'Commercial',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const property = getPropertyById(propertyId);

  if (!property) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link
            href="/properties"
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete property:', property.id);
  };

  const handleEditValue = () => {
    // TODO: Implement edit value modal
    console.log('Edit value for:', property.id);
  };

  const handleEditMortgage = () => {
    // TODO: Implement edit mortgage modal
    console.log('Edit mortgage for:', property.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Back button + Property info */}
            <div className="flex items-start gap-4 animate-fade-in-up">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors mt-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {property.address}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {property.city}, {property.state} {property.zipCode}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                  >
                    {propertyTypeLabels[property.propertyType] || property.propertyType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <Link
                href={`/properties/${property.id}/edit`}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 btn-press"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Property
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 btn-press"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <PropertyOverview property={property} />
            <FinancialPerformance property={property} />
            <LeaseInformation property={property} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80">
            <PropertyValueSidebar
              property={property}
              onEditValue={handleEditValue}
              onEditMortgage={handleEditMortgage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

