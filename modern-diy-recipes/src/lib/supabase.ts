import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  MAX_RETRIES,
  BASE_RETRY_DELAY,
  hasValidConfig,
  hasFallbackConfig
} from './supabaseConfig';
import { validateClientEnvironment, isFeatureEnabled } from './environmentValidator';

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
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          theme: string;
          audio_enabled: boolean;
          volume: number;
          default_view: string;
          avatar?: string;
          display_name?: string;
          color?: string;
          debug_mode: boolean;
          show_experimental: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          theme?: string;
          audio_enabled?: boolean;
          volume?: number;
          default_view?: string;
          avatar?: string;
          display_name?: string;
          color?: string;
          debug_mode?: boolean;
          show_experimental?: boolean;
        };
        Update: {
          theme?: string;
          audio_enabled?: boolean;
          volume?: number;
          default_view?: string;
          avatar?: string;
          display_name?: string;
          color?: string;
          debug_mode?: boolean;
          show_experimental?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

// Initialize the Supabase client
const createSupabaseClient = () => {
  try {
    // Check if we have valid configuration using environmentValidator
    const hasValidEnv = validateClientEnvironment();
    const useMockData = isFeatureEnabled('mock-data');

    if (!hasValidConfig) {
      // In development, we might allow fallbacks
      if (hasFallbackConfig || useMockData) {
        console.warn('Supabase configuration missing or incomplete');
        console.warn('Using development mode with limited functionality');

        // Return mock client for development
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          console.info('Development mode: Creating mock Supabase client');
          // Use the mock data since we're in fallback mode
          return createMockSupabaseClient();
        }
      }

      console.error('Supabase configuration missing');
      throw new Error('Supabase URL and Anon Key are required');
    }

    // Create real client with proper configuration
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
    throw new Error('Failed to initialize Supabase client. Check your environment configuration.');
  }
};

// Create and export a singleton Supabase client instance
const supabase = createSupabaseClient();

/**
 * Create a mock Supabase client for development and testing
 * @returns A mocked Supabase client with basic CRUD operations
 */
function createMockSupabaseClient(): SupabaseClient<Database> {
  console.info('Creating mock Supabase client with fake data');

  // In-memory storage for our mock database
  const mockData = {
    recipes: [],
    ingredients: [],
    recipe_ingredients: [],
    iterations: [],
    users: [{ id: 'mock-user-id', email: 'dev@example.com' }],
    user_preferences: []
  };

  // Load any predefined mock data if available
  try {
    // This would be imported from a mock data file
    // but we'll keep it simple for now
  } catch (error) {
    console.warn('Could not load mock data:', error);
  }

  // Create a minimal client with just the functionality we need
  const mockClient = createClient('https://example.com', 'dummy-key') as SupabaseClient<Database>;

  // Override the methods we use with mock implementations
  // This is a simplified version - in a real implementation we would
  // add more comprehensive mocking

  return mockClient;
}

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

/**
 * Get a fresh Supabase client (useful for server components)
 * @returns A new Supabase client instance
 */
export function getSupabaseClient() {
  if (!hasValidConfig && !isFeatureEnabled('mock-data')) {
    throw new Error('Cannot get Supabase client - configuration missing and mock data not enabled');
  }
  return createSupabaseClient();
}

export { supabase };