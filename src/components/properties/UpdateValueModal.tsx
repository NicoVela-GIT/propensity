'use client';

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UpdateValueModalProps {
  propertyId: string;
  currentValue: number;
  address: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newValue: number, source: 'manual' | 'zillow' | 'redfin') => Promise<void>;
}

export default function UpdateValueModal({
  propertyId,
  currentValue,
  address,
  isOpen,
  onClose,
  onUpdate,
}: UpdateValueModalProps) {
  const [value, setValue] = useState(currentValue.toString());
  const [source, setSource] = useState<'manual' | 'zillow' | 'redfin'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid value');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(numValue, source);
      onClose();
    } catch (err) {
      setError('Failed to update value. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Update Property Value</h2>
                <p className="text-sm text-gray-500">{address}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Value */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${currentValue.toLocaleString()}
              </p>
            </div>

            {/* New Value Input */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                New Estimated Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSource('manual')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    source === 'manual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setSource('zillow')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    source === 'zillow'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Zillow
                </button>
                <button
                  type="button"
                  onClick={() => setSource('redfin')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    source === 'redfin'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Redfin
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select the source of this valuation for tracking purposes
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Value'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
