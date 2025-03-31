// supabaseClient.js
// Updated for browser compatibility using the "+esm" syntax with a specific Supabase version

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
