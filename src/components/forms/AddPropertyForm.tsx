'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Building2,
  DollarSign,
  Home,
  FileText,
  CalendarIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import FormSection from './FormSection';
import { cn } from '@/lib/utils';
import {
  addPropertySchema,
  AddPropertyFormData,
  addPropertyDefaultValues,
  propertyTypes,
  propertyTypeLabels,
  usStates,
} from '@/lib/validations';

interface AddPropertyFormProps {
  onSubmit: (data: AddPropertyFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AddPropertyFormData>;
  isEditMode?: boolean;
}

export default function AddPropertyForm({
  onSubmit,
  onCancel,
  initialData,
  isEditMode = false,
}: AddPropertyFormProps) {
  // Merge initial data with defaults for edit mode
  const formDefaults = initialData
    ? { ...addPropertyDefaultValues, ...initialData }
    : addPropertyDefaultValues;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: formDefaults,
  });

  const purchaseDate = watch('purchaseDate');
  const selectedState = watch('state');
  const selectedPropertyType = watch('propertyType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: Property Information */}
      <FormSection
        title="Property Information"
        icon={<Building2 className="w-5 h-5" />}
        delay={0}
      >
        <div className="space-y-4">
          {/* Property Address - Full Width */}
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Property Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Enter street address"
              className={cn(
                'mt-1.5',
                errors.address && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* City & State - Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Enter city"
                className={cn(
                  'mt-1.5',
                  errors.city && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedState}
                onValueChange={(value) => setValue('state', value)}
              >
                <SelectTrigger
                  className={cn(
                    'mt-1.5',
                    errors.state && 'border-red-500 focus-visible:ring-red-500'
                  )}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {usStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* ZIP Code & Property Type - Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                ZIP Code
              </Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                placeholder="Enter ZIP code"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700">
                Property Type
              </Label>
              <Select
                value={selectedPropertyType}
                onValueChange={(value: typeof propertyTypes[number]) =>
                  setValue('propertyType', value)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {propertyTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section 2: Financial Details */}
      <FormSection
        title="Financial Details"
        icon={<DollarSign className="w-5 h-5" />}
        delay={100}
      >
        <div className="space-y-4">
          {/* Purchase Price & Purchase Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchasePrice" className="text-sm font-medium text-gray-700">
                Purchase Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="purchasePrice"
                  type="number"
                  {...register('purchasePrice')}
                  placeholder="0"
                  className={cn(
                    'pl-7',
                    errors.purchasePrice && 'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-500">{errors.purchasePrice.message}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Purchase Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full mt-1.5 justify-start text-left font-normal',
                      !purchaseDate && 'text-muted-foreground',
                      errors.purchaseDate && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {purchaseDate ? format(purchaseDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={(date) => date && setValue('purchaseDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.purchaseDate && (
                <p className="mt-1 text-sm text-red-500">{errors.purchaseDate.message}</p>
              )}
            </div>
          </div>

          {/* Down Payment & Current Estimated Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="downPayment" className="text-sm font-medium text-gray-700">
                Down Payment
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="downPayment"
                  type="number"
                  {...register('downPayment')}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="currentEstimatedValue" className="text-sm font-medium text-gray-700">
                Current Estimated Value
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="currentEstimatedValue"
                  type="number"
                  {...register('currentEstimatedValue')}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Current Mortgage Balance & Monthly Mortgage Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentMortgageBalance" className="text-sm font-medium text-gray-700">
                Current Mortgage Balance
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="currentMortgageBalance"
                  type="number"
                  {...register('currentMortgageBalance')}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="monthlyMortgagePayment" className="text-sm font-medium text-gray-700">
                Monthly Mortgage Payment
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="monthlyMortgagePayment"
                  type="number"
                  {...register('monthlyMortgagePayment')}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interestRate" className="text-sm font-medium text-gray-700">
                Interest Rate (APR)
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="interestRate"
                  type="number"
                  step="0.001"
                  {...register('interestRate')}
                  placeholder="e.g. 4.5"
                  className={cn(
                    'pr-8',
                    errors.interestRate && 'border-red-500 focus-visible:ring-red-500'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.interestRate && (
                <p className="mt-1 text-sm text-red-500">{errors.interestRate.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Used for refinance opportunity alerts
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section 3: Rental Information */}
      <FormSection
        title="Rental Information"
        icon={<Home className="w-5 h-5" />}
        delay={200}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyRent" className="text-sm font-medium text-gray-700">
              Monthly Rent
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="monthlyRent"
                type="number"
                {...register('monthlyRent')}
                placeholder="0"
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="monthlyExpenses" className="text-sm font-medium text-gray-700">
              Monthly Expenses
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="monthlyExpenses"
                type="number"
                {...register('monthlyExpenses')}
                placeholder="0"
                className="pl-7"
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section 4: Property Details */}
      <FormSection
        title="Property Details"
        icon={<FileText className="w-5 h-5" />}
        delay={300}
      >
        <div className="space-y-4">
          {/* Bedrooms, Bathrooms, Square Feet - Three Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700">
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                type="number"
                {...register('bedrooms')}
                placeholder="0"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700">
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                type="number"
                {...register('bathrooms')}
                placeholder="0"
                step="0.5"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="squareFeet" className="text-sm font-medium text-gray-700">
                Square Feet
              </Label>
              <Input
                id="squareFeet"
                type="number"
                {...register('squareFeet')}
                placeholder="0"
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Year Built & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yearBuilt" className="text-sm font-medium text-gray-700">
                Year Built
              </Label>
              <Input
                id="yearBuilt"
                type="number"
                {...register('yearBuilt')}
                placeholder="e.g. 1990"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes about the property..."
                className="mt-1.5 min-h-[80px]"
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 btn-press"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6 bg-blue-600 hover:bg-blue-700 btn-press"
        >
          {isSubmitting
            ? 'Saving...'
            : isEditMode
            ? 'Save Changes'
            : 'Save Property'}
        </Button>
      </div>
    </form>
  );
}
