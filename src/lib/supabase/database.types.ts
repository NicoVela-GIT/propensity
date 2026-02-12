export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          parameters: Json
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          parameters?: Json
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          parameters?: Json
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      capital_structures: {
        Row: {
          cash_invested: number
          created_at: string | null
          loan_amount: number
          property_id: string
          total_acquisition_cost: number
        }
        Insert: {
          cash_invested: number
          created_at?: string | null
          loan_amount: number
          property_id: string
          total_acquisition_cost: number
        }
        Update: {
          cash_invested?: number
          created_at?: string | null
          loan_amount?: number
          property_id?: string
          total_acquisition_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "capital_structures_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          effective_date: string
          id: string
          is_recurring: boolean | null
          property_id: string | null
          recurrence_pattern: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          effective_date: string
          id?: string
          is_recurring?: boolean | null
          property_id?: string | null
          recurrence_pattern?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          effective_date?: string
          id?: string
          is_recurring?: boolean | null
          property_id?: string | null
          recurrence_pattern?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_alerts: {
        Row: {
          action_deadline: string | null
          created_at: string | null
          description: string
          estimated_value: number | null
          id: string
          metadata: Json | null
          property_id: string | null
          rule_id: string | null
          severity: string
          title: string
          triggered_at: string
        }
        Insert: {
          action_deadline?: string | null
          created_at?: string | null
          description: string
          estimated_value?: number | null
          id: string
          metadata?: Json | null
          property_id?: string | null
          rule_id?: string | null
          severity: string
          title: string
          triggered_at: string
        }
        Update: {
          action_deadline?: string | null
          created_at?: string | null
          description?: string
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
          rule_id?: string | null
          severity?: string
          title?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          lease_type: string
          monthly_rent: number
          property_id: string | null
          renewal_reminder_days: number | null
          security_deposit: number | null
          start_date: string
          status: string
          tenant_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          lease_type: string
          monthly_rent: number
          property_id?: string | null
          renewal_reminder_days?: number | null
          security_deposit?: number | null
          start_date: string
          status?: string
          tenant_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          lease_type?: string
          monthly_rent?: number
          property_id?: string | null
          renewal_reminder_days?: number | null
          security_deposit?: number | null
          start_date?: string
          status?: string
          tenant_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_balance_snapshots: {
        Row: {
          created_at: string | null
          effective_date: string
          id: string
          loan_id: string | null
          notes: string | null
          principal_balance: number
          source: string
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: string
          loan_id?: string | null
          notes?: string | null
          principal_balance: number
          source: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: string
          loan_id?: string | null
          notes?: string | null
          principal_balance?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_balance_snapshots_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string | null
          id: string
          interest_rate: number
          loan_type: string
          monthly_payment: number
          original_principal: number
          origination_date: string
          paid_off_date: string | null
          property_id: string | null
          replaced_by_loan_id: string | null
          status: string
          term_months: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_rate: number
          loan_type: string
          monthly_payment: number
          original_principal: number
          origination_date: string
          paid_off_date?: string | null
          property_id?: string | null
          replaced_by_loan_id?: string | null
          status?: string
          term_months: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_rate?: number
          loan_type?: string
          monthly_payment?: number
          original_principal?: number
          origination_date?: string
          paid_off_date?: string | null
          property_id?: string | null
          replaced_by_loan_id?: string | null
          status?: string
          term_months?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_replaced_by_loan_id_fkey"
            columns: ["replaced_by_loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          created_at: string | null
          data_type: string
          effective_date: string
          id: string
          metadata: Json | null
          region_code: string
          region_type: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          data_type: string
          effective_date: string
          id?: string
          metadata?: Json | null
          region_code: string
          region_type: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          data_type?: string
          effective_date?: string
          id?: string
          metadata?: Json | null
          region_code?: string
          region_type?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          alert_batch_slot: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          closing_costs: number | null
          created_at: string | null
          id: string
          image_url: string | null
          monthly_expenses_override: number | null
          notes: string | null
          property_type: string
          purchase_date: string
          purchase_price: number
          square_feet: number | null
          state: string
          updated_at: string | null
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address: string
          alert_batch_slot?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          closing_costs?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          monthly_expenses_override?: number | null
          notes?: string | null
          property_type: string
          purchase_date: string
          purchase_price: number
          square_feet?: number | null
          state: string
          updated_at?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          alert_batch_slot?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          closing_costs?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          monthly_expenses_override?: number | null
          notes?: string | null
          property_type?: string
          purchase_date?: string
          purchase_price?: number
          square_feet?: number | null
          state?: string
          updated_at?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_alert_state: {
        Row: {
          alert_id: string
          created_at: string | null
          dismissed_at: string | null
          is_dismissed: boolean | null
          is_read: boolean | null
          updated_at: string | null
        }
        Insert: {
          alert_id: string
          created_at?: string | null
          dismissed_at?: string | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alert_id?: string
          created_at?: string | null
          dismissed_at?: string | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_state_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: true
            referencedRelation: "generated_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      valuation_snapshots: {
        Row: {
          confidence: string
          created_at: string | null
          effective_date: string
          estimated_value: number
          id: string
          metadata: Json | null
          property_id: string | null
          source: string
        }
        Insert: {
          confidence: string
          created_at?: string | null
          effective_date: string
          estimated_value: number
          id?: string
          metadata?: Json | null
          property_id?: string | null
          source: string
        }
        Update: {
          confidence?: string
          created_at?: string | null
          effective_date?: string
          estimated_value?: number
          id?: string
          metadata?: Json | null
          property_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "valuation_snapshots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
