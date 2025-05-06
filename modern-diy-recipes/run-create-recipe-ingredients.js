// Script to execute the create-recipe-ingredients.sql file
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE URL:', supabaseUrl);
console.log('ANON KEY PROVIDED:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runCreateRecipeIngredients() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-recipe-ingredients.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    
    console.log('Executing SQL script to create and populate recipe_ingredients table...');
    
    // Note: Direct SQL execution may not work with Supabase client
    // We need to use the SQL editor in the Supabase dashboard
    console.log('This script does not execute SQL directly as this requires admin privileges.');
    console.log('Please copy the contents of create-recipe-ingredients.sql and execute it in the Supabase SQL Editor.');
    console.log('\nHere is the SQL script:');
    console.log('----------------------------------------');
    console.log(sql.substring(0, 500) + '...\n[truncated for readability]\n');
    console.log('----------------------------------------');
    
    // As an alternative, try to create the table and populate it using the Supabase client
    console.log('\nAttempting to create table and populate data using the Supabase client...');
    
    // 1. Create the recipe_ingredients table
    try {
      // Note: This likely won't work but let's try
      const { error: createTableError } = await supabase.rpc('create_recipe_ingredients_table');
      if (createTableError) {
        console.log('Could not create table via RPC (expected):', createTableError.message);
        console.log('This is normal as the Supabase client typically cannot create tables.');
      } else {
        console.log('Successfully created recipe_ingredients table.');
      }
    } catch (err) {
      console.log('Error trying to create table (expected):', err.message);
    }
    
    console.log('\nPlease follow these steps:');
    console.log('1. Log in to your Supabase dashboard');
    console.log('2. Navigate to your project');
    console.log('3. Click on "SQL Editor" in the left sidebar');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the entire contents of create-recipe-ingredients.sql');
    console.log('6. Click "Run" to execute the script');
    console.log('7. Verify by running the check-recipe-ingredients.js script afterwards');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
runCreateRecipeIngredients();