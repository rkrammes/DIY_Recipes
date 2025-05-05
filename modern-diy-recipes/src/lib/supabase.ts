import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  MAX_RETRIES,
  BASE_RETRY_DELAY
} from './supabaseConfig';

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
  try {
    // Use the Supabase URL and key from configuration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase URL and Anon Key are required');
    }

    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        // Add retry logic for better network resilience
        fetch: (url, options = {}) => {
          let retryCount = 0;
          
          const fetchWithRetry = async (): Promise<Response> => {
            try {
              return await fetch(url, options);
            } catch (error) {
              if (retryCount < MAX_RETRIES) {
                retryCount++;
                const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
                console.log(`Retrying fetch (${retryCount}/${MAX_RETRIES}) after ${delay}ms`);
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
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    console.error('No mock data fallback available');
    throw new Error('Failed to initialize Supabase client. Supabase URL and Anon Key are required.');
  }
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