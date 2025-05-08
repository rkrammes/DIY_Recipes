// Simple script to test Supabase connectivity
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

console.log('Testing Supabase connectivity');
console.log('URL:', SUPABASE_URL);

// Test with anon key
if (SUPABASE_ANON_KEY) {
  console.log('\n1. Testing with anon key...');
  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  async function testAnonKey() {
    try {
      const { data, error } = await supabaseAnon.from('recipes').select('count').limit(1);
      if (error) {
        console.error('❌ Anon key test failed:', error.message);
      } else {
        console.log('✅ Anon key connection successful!');
      }
    } catch (e) {
      console.error('❌ Anon key test exception:', e.message);
    }
  }
  
  testAnonKey();
}

// Test with service role key
if (SUPABASE_SERVICE_KEY) {
  console.log('\n2. Testing with service role key...');
  const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  async function testServiceKey() {
    try {
      const { data, error } = await supabaseService.from('recipes').select('count').limit(1);
      if (error) {
        console.error('❌ Service key test failed:', error.message);
      } else {
        console.log('✅ Service key connection successful!');
        
        // Check tables
        console.log('\nChecking tables with service key:');
        const tables = ['recipes', 'ingredients', 'recipe_ingredients', 'tools', 'library'];
        
        for (const table of tables) {
          try {
            const { data, error } = await supabaseService.from(table).select('count');
            if (error) {
              console.log(`- ${table}: ❌ ERROR (${error.message})`);
            } else {
              console.log(`- ${table}: ✅ OK (${data[0].count} records)`);
            }
          } catch (e) {
            console.log(`- ${table}: ❌ EXCEPTION (${e.message})`);
          }
        }
      }
    } catch (e) {
      console.error('❌ Service key test exception:', e.message);
    }
  }
  
  testServiceKey();
}
