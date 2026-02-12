/**
 * Database Types
 * 
 * TypeScript types that match the Supabase database schema.
 * These ensure type safety when querying the database.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          address: string
          city: string
          state: string
          zip_code: string | null
          property_type: string
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          year_built: number | null
          purchase_price: number
          purchase_date: string
          closing_costs: number | null
          monthly_expenses_override: number | null
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          city: string
          state: string
          zip_code?: string | null
          property_type: string
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          year_built?: number | null
          purchase_price: number
          purchase_date: string
          closing_costs?: number | null
          monthly_expenses_override?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string | null
          property_type?: string
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          year_built?: number | null
          purchase_price?: number
          purchase_date?: string
          closing_costs?: number | null
          monthly_expenses_override?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      capital_structures: {
        Row: {
          property_id: string
          cash_invested: number
          loan_amount: number
          total_acquisition_cost: number
          created_at: string
        }
        Insert: {
          property_id: string
          cash_invested: number
          loan_amount: number
          total_acquisition_cost: number
          created_at?: string
        }
        Update: {
          property_id?: string
          cash_invested?: number
          loan_amount?: number
          total_acquisition_cost?: number
          created_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          property_id: string | null
          loan_type: string
          original_principal: number
          interest_rate: number
          term_months: number
          origination_date: string
          monthly_payment: number
          status: string
          paid_off_date: string | null
          replaced_by_loan_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          loan_type: string
          original_principal: number
          interest_rate: number
          term_months: number
          origination_date: string
          monthly_payment: number
          status?: string
          paid_off_date?: string | null
          replaced_by_loan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          loan_type?: string
          original_principal?: number
          interest_rate?: number
          term_months?: number
          origination_date?: string
          monthly_payment?: number
          status?: string
          paid_off_date?: string | null
          replaced_by_loan_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      valuation_snapshots: {
        Row: {
          id: string
          property_id: string | null
          effective_date: string
          estimated_value: number
          source: string
          confidence: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          effective_date: string
          estimated_value: number
          source: string
          confidence: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          effective_date?: string
          estimated_value?: number
          source?: string
          confidence?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      loan_balance_snapshots: {
        Row: {
          id: string
          loan_id: string | null
          effective_date: string
          principal_balance: number
          source: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          loan_id?: string | null
          effective_date: string
          principal_balance: number
          source: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          loan_id?: string | null
          effective_date?: string
          principal_balance?: number
          source?: string
          notes?: string | null
          created_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          property_id: string | null
          tenant_name: string | null
          lease_type: string
          start_date: string
          end_date: string | null
          monthly_rent: number
          security_deposit: number | null
          status: string
          renewal_reminder_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          tenant_name?: string | null
          lease_type: string
          start_date: string
          end_date?: string | null
          monthly_rent: number
          security_deposit?: number | null
          status?: string
          renewal_reminder_days?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          tenant_name?: string | null
          lease_type?: string
          start_date?: string
          end_date?: string | null
          monthly_rent?: number
          security_deposit?: number | null
          status?: string
          renewal_reminder_days?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          property_id: string | null
          effective_date: string
          category: string
          amount: number
          is_recurring: boolean | null
          recurrence_pattern: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          effective_date: string
          category: string
          amount: number
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          effective_date?: string
          category?: string
          amount?: number
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
