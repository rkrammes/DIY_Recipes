// supabaseClient.js
// Updated for browser compatibility using the "+esm" syntax with a specific Supabase version

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mjk5MDAsImV4cCI6MjA1NzQwNTkwMH0.yYBWuD_bzfyh72URflGqJbn-lIwrZ6oAznxVocgxOm8';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
