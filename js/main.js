import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Use environment variables for credentials. If running in a Node environment, process.env will be available.
// In browser environments with Vite, use import.meta.env for environment variables.
const supabaseUrl = typeof process !== 'undefined' && process.env.SUPABASE_URL ? process.env.SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = typeof process !== 'undefined' && process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY : import.meta.env.VITE_SUPABASE_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseKey);