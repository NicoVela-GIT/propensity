/**
 * Supabase Client Configuration
 * 
 * This file creates and exports a Supabase client instance
 * that can be used throughout the application.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let _supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client (lazy initialization)
 * This ensures environment variables are loaded before creating the client
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // We'll add auth later
    },
  });

  return _supabaseClient;
}

/**
 * Supabase client instance
 * 
 * This client can be used in both client and server components.
 * It uses the anon key which has limited permissions based on RLS policies.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});

/**
 * Check if Supabase is enabled
 * 
 * This allows us to gradually migrate from mock data to Supabase
 * without breaking existing functionality.
 */
export const isSupabaseEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
};
