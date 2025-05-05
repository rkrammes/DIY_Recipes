import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Database schema type - essential for type safety in Supabase operations
interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_at: string;
          user_id: string;
          instructions?: string | null;
          notes?: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_at?: string;
          user_id: string;
          instructions?: string | null;
          notes?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          created_at?: string;
          user_id?: string;
          instructions?: string | null;
          notes?: string | null;
        };
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          ingredient_id: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          ingredient_id: string;
          quantity: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          recipe_id?: string;
          ingredient_id?: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
      };
      iterations: {
        Row: {
          id: string;
          recipe_id: string;
          notes: string;
          created_at: string;
          version: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          notes: string;
          created_at?: string;
          version?: number;
        };
        Update: {
          notes?: string;
          created_at?: string;
          version?: number;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Initialize the Supabase client
const createSupabaseClient = () => {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    throw new Error('Supabase URL is required');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    throw new Error('Supabase Anon Key is required');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      // Add retry logic for better network resilience
      fetch: (url, options = {}) => {
        const maxRetries = 3;
        let retryCount = 0;
        
        const fetchWithRetry = async (): Promise<Response> => {
          try {
            return await fetch(url, options);
          } catch (error) {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = 200 * Math.pow(2, retryCount); // Exponential backoff
              console.log(`Retrying fetch (${retryCount}/${maxRetries}) after ${delay}ms`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchWithRetry();
            }
            throw error;
          }
        };
        
        return fetchWithRetry();
      }
    }
  });
};

// Create and export a singleton Supabase client instance
const supabase = createSupabaseClient();

// Helper function for error handling
export const handleSupabaseError = (error: any) => {
  if (error) {
    console.error('Supabase error:', error.message || error);
    return {
      message: error.message || 'An error occurred with the database operation',
      status: error.status || 500
    };
  }
  return null;
};

export { supabase };