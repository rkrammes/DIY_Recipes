import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Use environment variables for credentials. Check for Node's process.env, then for Vite's import.meta.env, and provide fallback defaults.
const env = (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const supabaseUrl = (typeof process !== 'undefined' && process.env.SUPABASE_URL) ? process.env.SUPABASE_URL : (env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co');
const supabaseKey = (typeof process !== 'undefined' && process.env.SUPABASE_KEY) ? process.env.SUPABASE_KEY : (env.VITE_SUPABASE_KEY || 'your-anon-key');

export const supabaseClient = createClient(supabaseUrl, supabaseKey);