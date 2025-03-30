import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Determine Supabase credentials using environment variables if available, with fallback defaults.
const supabaseUrl = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL)
  ? process.env.SUPABASE_URL
  : (import.meta.env && import.meta.env.VITE_SUPABASE_URL
      ? import.meta.env.VITE_SUPABASE_URL
      : 'https://your-supabase-url.supabase.co');

const supabaseKey = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_KEY)
  ? process.env.SUPABASE_KEY
  : (import.meta.env && import.meta.env.VITE_SUPABASE_KEY
      ? import.meta.env.VITE_SUPABASE_KEY
      : 'your-anon-key');

export const supabaseClient = createClient(supabaseUrl, supabaseKey);