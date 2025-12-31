'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AddPropertyForm } from '@/components/forms';
import { AddPropertyFormData } from '@/lib/validations';

export default function AddPropertyPage() {
  const router = useRouter();

  const handleSubmit = (data: AddPropertyFormData) => {
    // TODO: Send data to API/Supabase
    console.log('Property data:', data);
    
    // For now, just redirect to properties page
    // In production, this would save to database first
    alert('Property saved successfully!');
    router.push('/properties');
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
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Add New Property
              </h1>
              <p className="text-gray-600 mt-1">
                Add a property to your investment portfolio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

