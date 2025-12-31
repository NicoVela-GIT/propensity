'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddPropertyForm } from '@/components/forms';
import { getPropertyById } from '@/lib/data';
import { AddPropertyFormData } from '@/lib/validations';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const property = getPropertyById(propertyId);

  if (!property) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're trying to edit doesn't exist.</p>
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

  // Convert Property to form data format
  const initialFormData: Partial<AddPropertyFormData> = {
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode || '',
    propertyType: property.propertyType,
    purchasePrice: property.purchasePrice,
    purchaseDate: property.purchaseDate ? new Date(property.purchaseDate) : undefined,
    downPayment: property.downPayment,
    currentEstimatedValue: property.currentValue,
    currentMortgageBalance: property.mortgageBalance,
    monthlyMortgagePayment: property.mortgagePayment,
    monthlyRent: property.monthlyIncome,
    monthlyExpenses: property.monthlyExpenses,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet,
    yearBuilt: property.yearBuilt,
    notes: property.notes || '',
  };

  const handleSubmit = (data: AddPropertyFormData) => {
    // TODO: Update property in database/API
    console.log('Updated property data:', { id: propertyId, ...data });

    // For now, just show success and redirect
    alert('Property updated successfully!');
    router.push(`/properties/${propertyId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <Link
              href={`/properties/${propertyId}`}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Edit Property
              </h1>
              <p className="text-gray-600 mt-1">
                Update details for {property.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddPropertyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialFormData}
          isEditMode={true}
        />
      </div>
    </div>
  );
}

