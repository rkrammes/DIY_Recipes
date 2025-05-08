require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection with:');
console.log('URL:', url);
console.log('Key starts with:', key?.substring(0, 20) + '...');
console.log('Key appears to be a', key.includes('service_role') ? 'SERVICE ROLE KEY' : 'ANON KEY');

const supabase = createClient(url, key);

async function checkPermissions() {
  // Test 1: Read access to existing tables
  console.log('\nTEST 1: Reading existing tables...');
  const { data: recipesData, error: recipesError } = await supabase
    .from('recipes')
    .select('count')
    .limit(1);
  
  console.log('Read from recipes:', recipesError ? 'FAILED' : 'SUCCESS');
  if (recipesError) console.error(' - Error:', recipesError.message);
  
  // Test 2: Attempt to create a temporary test table
  console.log('\nTEST 2: Attempting to create a test table...');
  
  try {
    const { error: createError } = await supabase.rpc('create_test_table');
    console.log('Create table RPC:', createError ? 'FAILED' : 'SUCCESS');
    if (createError) {
      console.error(' - Error:', createError.message);
      console.log(' - This is expected if using anon key or if RPC function doesn\'t exist');
      
      // Alternative test: Try to insert into an existing table
      console.log('\nTEST 3: Attempting to insert a row into recipes...');
      const { error: insertError } = await supabase
        .from('recipes')
        .insert({
          title: 'Test Recipe (Will be deleted)',
          description: 'This is a test recipe to check insert permissions'
        });
      
      console.log('Insert into recipes:', insertError ? 'FAILED' : 'SUCCESS');
      if (insertError) console.error(' - Error:', insertError.message);
    }
  } catch (err) {
    console.error('Error in test:', err.message);
  }
  
  // Test 4: See if tools and library tables exist
  console.log('\nTEST 4: Checking if tools and library tables exist...');
  
  const { data: toolsData, error: toolsError } = await supabase
    .from('tools')
    .select('count')
    .limit(1);
  
  console.log('Read from tools:', toolsError ? 'FAILED' : 'SUCCESS');
  if (toolsError && toolsError.message.includes('does not exist')) {
    console.log(' - Table does not exist');
  } else if (toolsError) {
    console.error(' - Error:', toolsError.message);
  }
  
  const { data: libraryData, error: libraryError } = await supabase
    .from('library')
    .select('count')
    .limit(1);
  
  console.log('Read from library:', libraryError ? 'FAILED' : 'SUCCESS');
  if (libraryError && libraryError.message.includes('does not exist')) {
    console.log(' - Table does not exist');
  } else if (libraryError) {
    console.error(' - Error:', libraryError.message);
  }
  
  console.log('\nDIAGNOSIS:');
  if (toolsError && toolsError.message.includes('does not exist') &&
      libraryError && libraryError.message.includes('does not exist')) {
    console.log('1. The tools and library tables DO NOT EXIST');
    console.log('2. SQL commands need to be run to create these tables');
    console.log('3. Execute the init-db-tables.sql script in the Supabase SQL Editor');
  }
  
  const canRead = !recipesError;
  const canWrite = !insertError;
  
  console.log('\nPERMISSIONS SUMMARY:');
  console.log('- Read Access:', canRead ? 'YES' : 'NO');
  console.log('- Write Access:', canWrite ? 'YES' : 'NO');
  
  if (!canWrite) {
    console.log('\nRECOMMENDATIONS:');
    console.log('1. Check if you are using an anonymous key instead of service key');
    console.log('2. Verify Row Level Security (RLS) policies for the tables');
    console.log('3. Consider using service_role key for admin operations if appropriate');
  }
}

checkPermissions();