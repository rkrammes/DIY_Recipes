import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Minimal database schema interface (optional, can be expanded or generated later)
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          created_at?: string;
          user_id?: string;
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
    };
  };
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set');
  throw new Error('Supabase URL is required');
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  throw new Error('Supabase Anon Key is required');
}
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);