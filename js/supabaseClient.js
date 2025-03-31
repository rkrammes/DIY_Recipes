// supabaseClient.js
// Updated for browser compatibility using the "+esm" syntax with a specific Supabase version
// Hardcoding credentials for direct browser use (ensure ANON key is used)

import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and the PUBLIC ANONYMOUS KEY
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mjk5MDAsImV4cCI6MjA1NzQwNTkwMH0.yYBWuD_bzfyh72URflGqJbn-lIwrZ6oAznxVocgxOm8';

// Ensure the URL and Key are provided
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Cannot initialize Supabase client.');
  // Optionally throw an error or handle this case appropriately
  // throw new Error('Supabase credentials missing.');
}

// Export the single, correctly configured client instance
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized.'); // Add log to confirm initialization
