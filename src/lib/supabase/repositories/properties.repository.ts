/**
 * Properties Repository
 * 
 * Handles all database operations for properties and related entities.
 * This layer abstracts Supabase queries and provides a clean API.
 */

import { supabase } from '../client';
import type { Database } from '../database.types';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

type CapitalStructureRow = Database['public']['Tables']['capital_structures']['Row'];
type CapitalStructureInsert = Database['public']['Tables']['capital_structures']['Insert'];

type LoanRow = Database['public']['Tables']['loans']['Row'];
type LoanInsert = Database['public']['Tables']['loans']['Insert'];

type ValuationSnapshotRow = Database['public']['Tables']['valuation_snapshots']['Row'];
type ValuationSnapshotInsert = Database['public']['Tables']['valuation_snapshots']['Insert'];

type LoanBalanceSnapshotRow = Database['public']['Tables']['loan_balance_snapshots']['Row'];
type LoanBalanceSnapshotInsert = Database['public']['Tables']['loan_balance_snapshots']['Insert'];

type LeaseRow = Database['public']['Tables']['leases']['Row'];
type LeaseInsert = Database['public']['Tables']['leases']['Insert'];

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

/**
 * Complete property data with all related entities
 */
export interface PropertyWithRelations {
  property: PropertyRow;
  capitalStructure: CapitalStructureRow | null;
  loans: LoanRow[];
  valuations: ValuationSnapshotRow[];
  loanBalances: LoanBalanceSnapshotRow[];
  leases: LeaseRow[];
  expenses: ExpenseRow[];
}

/**
 * Get all properties with their related data
 */
export async function getAllProperties(): Promise<PropertyWithRelations[]> {
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (propertiesError) {
    console.error('Error fetching properties:', propertiesError);
    throw new Error('Failed to fetch properties');
  }

  if (!properties || properties.length === 0) {
    return [];
  }

  // Fetch all related data in parallel
  const propertyIds = properties.map(p => p.id);

  const [
    { data: capitalStructures },
    { data: loans },
    { data: valuations },
    { data: loanBalances },
    { data: leases },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('capital_structures').select('*').in('property_id', propertyIds),
    supabase.from('loans').select('*').in('property_id', propertyIds),
    supabase.from('valuation_snapshots').select('*').in('property_id', propertyIds).order('effective_date', { ascending: false }),
    supabase.from('loan_balance_snapshots').select('*'),
    supabase.from('leases').select('*').in('property_id', propertyIds).order('start_date', { ascending: false }),
    supabase.from('expenses').select('*').in('property_id', propertyIds).order('effective_date', { ascending: false }),
  ]);

  // Group related data by property
  return properties.map(property => ({
    property,
    capitalStructure: capitalStructures?.find(cs => cs.property_id === property.id) || null,
    loans: loans?.filter(l => l.property_id === property.id) || [],
    valuations: valuations?.filter(v => v.property_id === property.id) || [],
    loanBalances: loanBalances?.filter(lb => {
      const loanIds = loans?.filter(l => l.property_id === property.id).map(l => l.id) || [];
      return lb.loan_id && loanIds.includes(lb.loan_id);
    }) || [],
    leases: leases?.filter(l => l.property_id === property.id) || [],
    expenses: expenses?.filter(e => e.property_id === property.id) || [],
  }));
}

/**
 * Get a single property by ID with all related data
 */
export async function getPropertyById(id: string): Promise<PropertyWithRelations | null> {
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (propertyError || !property) {
    console.error('Error fetching property:', propertyError);
    return null;
  }

  // Fetch all related data in parallel
  const [
    { data: capitalStructure },
    { data: loans },
    { data: valuations },
    { data: loanBalances },
    { data: leases },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('capital_structures').select('*').eq('property_id', id).single(),
    supabase.from('loans').select('*').eq('property_id', id),
    supabase.from('valuation_snapshots').select('*').eq('property_id', id).order('effective_date', { ascending: false }),
    supabase.from('loan_balance_snapshots').select('*'),
    supabase.from('leases').select('*').eq('property_id', id).order('start_date', { ascending: false }),
    supabase.from('expenses').select('*').eq('property_id', id).order('effective_date', { ascending: false }),
  ]);

  const loanIds = loans?.map(l => l.id) || [];
  const filteredLoanBalances = loanBalances?.filter(lb => lb.loan_id && loanIds.includes(lb.loan_id)) || [];

  return {
    property,
    capitalStructure: capitalStructure || null,
    loans: loans || [],
    valuations: valuations || [],
    loanBalances: filteredLoanBalances,
    leases: leases || [],
    expenses: expenses || [],
  };
}

/**
 * Create a new property with all related data
 */
export async function createProperty(data: {
  property: PropertyInsert;
  capitalStructure: Omit<CapitalStructureInsert, 'property_id'>;
  loan?: Omit<LoanInsert, 'property_id'>;
  initialValuation: Omit<ValuationSnapshotInsert, 'property_id'>;
  initialLoanBalance?: Omit<LoanBalanceSnapshotInsert, 'loan_id'>;
  lease?: Omit<LeaseInsert, 'property_id'>;
}): Promise<PropertyWithRelations> {
  // 1. Create property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert(data.property)
    .select()
    .single();

  if (propertyError || !property) {
    console.error('Error creating property:', propertyError);
    throw new Error('Failed to create property');
  }

  // 2. Create capital structure
  const { error: capitalError } = await supabase
    .from('capital_structures')
    .insert({
      property_id: property.id,
      ...data.capitalStructure,
    });

  if (capitalError) {
    console.error('Error creating capital structure:', capitalError);
    throw new Error('Failed to create capital structure');
  }

  // 3. Create initial valuation
  const { error: valuationError } = await supabase
    .from('valuation_snapshots')
    .insert({
      property_id: property.id,
      ...data.initialValuation,
    });

  if (valuationError) {
    console.error('Error creating valuation:', valuationError);
    throw new Error('Failed to create valuation');
  }

  // 4. Create loan if provided
  let loanId: string | undefined;
  if (data.loan) {
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .insert({
        property_id: property.id,
        ...data.loan,
      })
      .select()
      .single();

    if (loanError || !loan) {
      console.error('Error creating loan:', loanError);
      throw new Error('Failed to create loan');
    }

    loanId = loan.id;

    // 5. Create initial loan balance if provided
    if (data.initialLoanBalance) {
      const { error: loanBalanceError } = await supabase
        .from('loan_balance_snapshots')
        .insert({
          loan_id: loanId,
          ...data.initialLoanBalance,
        });

      if (loanBalanceError) {
        console.error('Error creating loan balance:', loanBalanceError);
        throw new Error('Failed to create loan balance');
      }
    }
  }

  // 6. Create lease if provided
  if (data.lease) {
    const { error: leaseError } = await supabase
      .from('leases')
      .insert({
        property_id: property.id,
        ...data.lease,
      });

    if (leaseError) {
      console.error('Error creating lease:', leaseError);
      throw new Error('Failed to create lease');
    }
  }

  // Fetch and return the complete property data
  const result = await getPropertyById(property.id);
  if (!result) {
    throw new Error('Failed to fetch created property');
  }

  return result;
}

/**
 * Update a property
 */
export async function updateProperty(
  id: string,
  updates: PropertyUpdate
): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from('properties')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property');
  }

  return data;
}

/**
 * Delete a property (cascades to all related data)
 */
export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property');
  }
}

/**
 * Add a new valuation snapshot
 */
export async function addValuationSnapshot(
  data: ValuationSnapshotInsert
): Promise<ValuationSnapshotRow> {
  const { data: valuation, error } = await supabase
    .from('valuation_snapshots')
    .insert(data)
    .select()
    .single();

  if (error || !valuation) {
    console.error('Error adding valuation:', error);
    throw new Error('Failed to add valuation');
  }

  return valuation;
}

/**
 * Add a new loan balance snapshot
 */
export async function addLoanBalanceSnapshot(
  data: LoanBalanceSnapshotInsert
): Promise<LoanBalanceSnapshotRow> {
  const { data: balance, error } = await supabase
    .from('loan_balance_snapshots')
    .insert(data)
    .select()
    .single();

  if (error || !balance) {
    console.error('Error adding loan balance:', error);
    throw new Error('Failed to add loan balance');
  }

  return balance;
}

/**
 * Update a lease
 */
export async function updateLease(
  id: string,
  updates: Partial<LeaseInsert>
): Promise<LeaseRow> {
  const { data, error } = await supabase
    .from('leases')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating lease:', error);
    throw new Error('Failed to update lease');
  }

  return data;
}

/**
 * Add an expense
 */
export async function addExpense(
  data: ExpenseInsert
): Promise<ExpenseRow> {
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert(data)
    .select()
    .single();

  if (error || !expense) {
    console.error('Error adding expense:', error);
    throw new Error('Failed to add expense');
  }

  return expense;
}

/**
 * Get properties for a specific alert batch slot
 * Used for hourly distributed alert generation
 * 
 * @param batchSlot - Hour of day (0-23) to fetch properties for
 * @returns Array of properties assigned to this batch slot
 */
export async function getPropertiesByBatchSlot(batchSlot: number): Promise<PropertyWithRelations[]> {
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('alert_batch_slot', batchSlot)
    .order('created_at', { ascending: false });

  if (propertiesError) {
    console.error('Error fetching properties:', propertiesError);
    throw new Error('Failed to fetch properties');
  }

  if (!properties || properties.length === 0) {
    return [];
  }

  // Fetch all related data in parallel
  const propertyIds = properties.map(p => p.id);

  const [
    { data: capitalStructures },
    { data: loans },
    { data: valuations },
    { data: loanBalances },
    { data: leases },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('capital_structures').select('*').in('property_id', propertyIds),
    supabase.from('loans').select('*').in('property_id', propertyIds),
    supabase.from('valuation_snapshots').select('*').in('property_id', propertyIds).order('effective_date', { ascending: false }),
    supabase.from('loan_balance_snapshots').select('*'),
    supabase.from('leases').select('*').in('property_id', propertyIds).order('start_date', { ascending: false }),
    supabase.from('expenses').select('*').in('property_id', propertyIds).order('effective_date', { ascending: false }),
  ]);

  // Group related data by property
  return properties.map(property => ({
    property,
    capitalStructure: capitalStructures?.find(cs => cs.property_id === property.id) || null,
    loans: loans?.filter(l => l.property_id === property.id) || [],
    valuations: valuations?.filter(v => v.property_id === property.id) || [],
    loanBalances: loanBalances?.filter(lb => {
      const loanIds = loans?.filter(l => l.property_id === property.id).map(l => l.id) || [];
      return lb.loan_id && loanIds.includes(lb.loan_id);
    }) || [],
    leases: leases?.filter(l => l.property_id === property.id) || [],
    expenses: expenses?.filter(e => e.property_id === property.id) || [],
  }));
}
