'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddPropertyForm } from '@/components/forms';
import { getPropertyById as getPropertyByIdService, updateProperty as updatePropertyService } from '@/lib/supabase/services/property.service';
import { AddPropertyFormData } from '@/lib/validations';
import type { Property } from '@/lib/types';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPropertyByIdService(propertyId).then(data => {
      setProperty(data);
      setLoading(false);
    });
  }, [propertyId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

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
    interestRate: property.interestRate,
    monthlyRent: property.monthlyIncome,
    monthlyExpenses: property.monthlyExpenses,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet,
    yearBuilt: property.yearBuilt,
    notes: property.notes || '',
  };

  const handleSubmit = async (data: AddPropertyFormData) => {
    try {
      // Update the property using the service layer
      // This will use Supabase if enabled, otherwise mock data
      await updatePropertyService(propertyId, {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        propertyType: data.propertyType,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        downPayment: data.downPayment,
        currentValue: data.currentEstimatedValue || property?.currentValue || 0,
        mortgageBalance: data.currentMortgageBalance,
        mortgagePayment: data.monthlyMortgagePayment,
        interestRate: data.interestRate,
        monthlyIncome: data.monthlyRent || 0,
        monthlyExpenses: data.monthlyExpenses,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFeet: data.squareFeet,
        yearBuilt: data.yearBuilt,
        notes: data.notes,
      });

      const isSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
      
      if (isSupabase) {
        alert('✅ Property updated successfully!\n\nChanges have been saved to the database.');
      } else {
        alert('✅ Property updated successfully!\n\n⚠️ Note: Changes are stored in memory only and will reset on page refresh.\n\nTo enable permanent storage, set NEXT_PUBLIC_USE_SUPABASE=true in .env.local');
      }

      router.push(`/properties/${propertyId}`);
    } catch (error) {
      console.error('Error updating property:', error);
      alert('❌ Error: Failed to update property. Please try again.');
    }
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

