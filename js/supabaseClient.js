// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase URL and Anon Key (Note: The anon key is public, but keep any service role keys secure)
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mjk5MDAsImV4cCI6MjA1NzQwNTkwMH0.yYBWuD_bzfyh72URflGqJbn-lIwrZ6oAznxVocgxOm8';

// Create and export the Supabase client instance
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
