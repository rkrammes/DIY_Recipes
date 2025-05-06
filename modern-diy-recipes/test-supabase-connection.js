/**
 * Comprehensive test of Supabase connection and tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase clients with both keys
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Testing Supabase connection...\n');
  
  // 1. Test basic connection
  console.log('1. Testing basic connection to Supabase...');
  try {
    const { data, error } = await supabaseAnon.from('recipes').select('count');
    if (error) {
      console.error('❌ Connection test failed (anonymous key):', error.message);
    } else {
      console.log('✅ Connection test successful (anonymous key)');
    }
  } catch (err) {
    console.error('❌ Connection test threw an exception (anonymous key):', err.message);
  }

  try {
    const { data, error } = await supabaseService.from('recipes').select('count');
    if (error) {
      console.error('❌ Connection test failed (service role key):', error.message);
    } else {
      console.log('✅ Connection test successful (service role key)');
    }
  } catch (err) {
    console.error('❌ Connection test threw an exception (service role key):', err.message);
  }
  
  // 2. Test recipes table
  console.log('\n2. Testing recipes table...');
  try {
    const { data, error } = await supabaseAnon.from('recipes').select('id, title').limit(5);
    if (error) {
      console.error('❌ Recipes table test failed:', error.message);
    } else {
      console.log(`✅ Recipes table test successful: ${data.length} rows retrieved`);
      if (data.length > 0) {
        console.log('  First recipe:', data[0]);
      }
    }
  } catch (err) {
    console.error('❌ Recipes table test threw an exception:', err.message);
  }
  
  // 3. Test recipe_iterations table
  console.log('\n3. Testing recipe_iterations table...');
  try {
    const { data, error } = await supabaseAnon.from('recipe_iterations').select('id, recipe_id, version_number').limit(5);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ recipe_iterations table does not exist. Run SQL setup script.');
      } else {
        console.error('❌ recipe_iterations table test failed:', error.message);
      }
    } else {
      console.log(`✅ recipe_iterations table test successful: ${data.length} rows retrieved`);
      if (data.length > 0) {
        console.log('  First iteration:', data[0]);
      } else {
        console.log('  No iterations found, but table exists');
      }
    }
  } catch (err) {
    console.error('❌ recipe_iterations table test threw an exception:', err.message);
  }
  
  // 4. Test iteration_ingredients table
  console.log('\n4. Testing iteration_ingredients table...');
  try {
    const { data, error } = await supabaseAnon.from('iteration_ingredients').select('id, iteration_id, ingredient_id').limit(5);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ iteration_ingredients table does not exist. Run SQL setup script.');
      } else {
        console.error('❌ iteration_ingredients table test failed:', error.message);
      }
    } else {
      console.log(`✅ iteration_ingredients table test successful: ${data.length} rows retrieved`);
      if (data.length > 0) {
        console.log('  First iteration ingredient:', data[0]);
      } else {
        console.log('  No iteration ingredients found, but table exists');
      }
    }
  } catch (err) {
    console.error('❌ iteration_ingredients table test threw an exception:', err.message);
  }
  
  // 5. Test network latency
  console.log('\n5. Testing network latency...');
  try {
    console.time('Network latency');
    await supabaseAnon.from('recipes').select('count');
    console.timeEnd('Network latency');
  } catch (err) {
    console.error('❌ Network latency test failed:', err.message);
  }
  
  console.log('\nTest completed.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
});
EOL < /dev/null