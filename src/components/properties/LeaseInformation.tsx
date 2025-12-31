'use client';

import { FileText, Calendar, DollarSign, Bell, AlertTriangle } from 'lucide-react';
import { Property, getLeaseExpirationDate, getDaysUntilLeaseExpiration } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeaseInformationProps {
  property: Property;
}

const leaseTypeLabels: Record<string, string> = {
  'month-to-month': 'Month-to-Month',
  'semi-annual': 'Semi-Annual (6 months)',
  'annual': 'Annual (12 months)',
  'custom': 'Custom',
};

export default function LeaseInformation({ property }: LeaseInformationProps) {
  const lease = property.lease;
  
  if (!lease) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lease Information</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500">No lease information available.</p>
          <button className="mt-4 text-blue-600 font-medium hover:text-blue-700">
            + Add Lease Details
          </button>
        </div>
      </div>
    );
  }

  const expirationDate = getLeaseExpirationDate(lease);
  const daysUntilExpiration = getDaysUntilLeaseExpiration(lease);
  const isExpiringSoon = daysUntilExpiration <= lease.reminderDays && daysUntilExpiration > 0;
  const isExpired = daysUntilExpiration <= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      {/* Section Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <FileText className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Lease Information</h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Lease Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Lease Type</p>
            <p className="text-lg font-semibold text-gray-900">
              {leaseTypeLabels[lease.type] || lease.type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Rent</p>
            <p className="text-lg font-semibold text-green-600">
              ${lease.currentRent.toLocaleString()}/month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Lease Start</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(lease.startDate), 'M/d/yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Lease Expires</p>
              <p className={cn(
                'font-semibold',
                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-900'
              )}>
                {format(expirationDate, 'M/d/yyyy')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Reminder</p>
            <p className="font-medium text-gray-900">
              {lease.reminderDays} days before expiration
            </p>
          </div>
        </div>

        {/* Expiration Warning */}
        {(isExpiringSoon || isExpired) && (
          <div className={cn(
            'flex items-center gap-3 p-4 rounded-lg',
            isExpired ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'
          )}>
            <AlertTriangle className={cn(
              'w-5 h-5 flex-shrink-0',
              isExpired ? 'text-red-500' : 'text-yellow-500'
            )} />
            <p className={cn(
              'text-sm font-medium',
              isExpired ? 'text-red-700' : 'text-yellow-700'
            )}>
              {isExpired 
                ? 'Lease has expired. Consider renewing or updating tenant information.'
                : `Lease expires in ${daysUntilExpiration} days`}
            </p>
          </div>
        )}

        {/* Vacant Notice */}
        {lease.isVacant && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 mt-4">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">
              Property is currently vacant
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

