require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Attempting to connect to Supabase...');
console.log('URL:', url);
console.log('Key starts with:', key?.substring(0, 15) + '...');

// Create Supabase client
const supabase = createClient(url, key);

// Simple function to test if a table exists and has data
async function checkTable(tableName) {
  try {
    console.log(`Checking table '${tableName}'...`);
    const { data, error } = await supabase.from(tableName).select('count').limit(1);
    
    if (error) {
      console.error(`Error checking table ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`Table '${tableName}' exists.`);
    return true;
  } catch (err) {
    console.error(`Unexpected error checking ${tableName}:`, err.message);
    return false;
  }
}

async function runDiagnostics() {
  // Try a basic health check
  console.log('Running basic health check...');
  try {
    const tables = ['recipes', 'ingredients', 'tools', 'library'];
    let atLeastOneTableExists = false;
    
    for (const table of tables) {
      const exists = await checkTable(table);
      if (exists) atLeastOneTableExists = true;
    }
    
    if (!atLeastOneTableExists) {
      console.log('DIAGNOSIS: None of the required tables exist in the database.');
      console.log('ACTION REQUIRED: Run the database.sql script to create the tables.');
    } else {
      console.log('At least one table exists in the database.');
    }
    
  } catch (error) {
    console.error('Diagnostics failed:', error.message);
  }
}

runDiagnostics();