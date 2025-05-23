/**
 * Simple test of Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('recipes').select('count');
    const duration = Date.now() - start;
    
    if (error) {
      console.error('Connection failed:', error.message);
      return false;
    }
    
    console.log('Connection successful!');
    console.log('Response time:', duration, 'ms');
    return true;
  } catch (err) {
    console.error('Connection error:', err.message);
    return false;
  }
}

async function testTables() {
  console.log('\nTesting database tables...');
  
  // Test recipes table
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title')
      .limit(1);
      
    if (error) {
      console.error('Recipes table error:', error.message);
    } else {
      console.log('Recipes table OK:', data.length > 0 ? 'Has data' : 'Empty');
    }
  } catch (err) {
    console.error('Recipes query error:', err.message);
  }
  
  // Test recipe_iterations table
  try {
    const { data, error } = await supabase
      .from('recipe_iterations')
      .select('id, recipe_id')
      .limit(1);
      
    if (error) {
      console.error('recipe_iterations table error:', error.message);
    } else {
      console.log('recipe_iterations table OK:', data.length > 0 ? 'Has data' : 'Empty');
    }
  } catch (err) {
    console.error('recipe_iterations query error:', err.message);
  }
}

async function main() {
  const connected = await testConnection();
  if (connected) {
    await testTables();
  }
  console.log('\nTest completed');
}

main().catch(console.error);