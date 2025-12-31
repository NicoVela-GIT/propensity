import { z } from 'zod';

// Property types enum
export const propertyTypes = [
  'single-family',
  'multi-family',
  'condo',
  'townhouse',
  'commercial',
] as const;

export const propertyTypeLabels: Record<typeof propertyTypes[number], string> = {
  'single-family': 'Single Family',
  'multi-family': 'Multi-Family',
  'condo': 'Condo',
  'townhouse': 'Townhouse',
  'commercial': 'Commercial',
};

// US States for dropdown
export const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

// Add Property form validation schema
export const addPropertySchema = z.object({
  // Property Information
  address: z.string().min(1, 'Property address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().optional(),
  propertyType: z.enum(propertyTypes, {
    errorMap: () => ({ message: 'Please select a property type' }),
  }),

  // Financial Details
  purchasePrice: z.coerce.number().min(1, 'Purchase price is required'),
  purchaseDate: z.date({
    required_error: 'Purchase date is required',
  }),
  downPayment: z.coerce.number().min(0).optional(),
  currentEstimatedValue: z.coerce.number().min(0).optional(),
  currentMortgageBalance: z.coerce.number().min(0).optional(),
  monthlyMortgagePayment: z.coerce.number().min(0).optional(),

  // Rental Information
  monthlyRent: z.coerce.number().min(0).optional(),
  monthlyExpenses: z.coerce.number().min(0).optional(),

  // Property Details
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  squareFeet: z.coerce.number().min(0).optional(),
  yearBuilt: z.coerce.number().min(1800).max(new Date().getFullYear()).optional(),
  notes: z.string().optional(),
});

export type AddPropertyFormData = z.infer<typeof addPropertySchema>;

// Default values for the form
export const addPropertyDefaultValues: Partial<AddPropertyFormData> = {
  address: '',
  city: '',
  state: '',
  zipCode: '',
  propertyType: 'single-family',
  purchasePrice: undefined,
  purchaseDate: undefined,
  downPayment: undefined,
  currentEstimatedValue: undefined,
  currentMortgageBalance: undefined,
  monthlyMortgagePayment: undefined,
  monthlyRent: undefined,
  monthlyExpenses: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  squareFeet: undefined,
  yearBuilt: undefined,
  notes: '',
};

