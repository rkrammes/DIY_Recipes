#!/usr/bin/env node

/**
 * Script to set up the recipe iterations database tables
 * This runs the SQL from create_recipe_iterations_table.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Setup Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if we have the required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Use service role key if available, otherwise fall back to anon key (with limited permissions)
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseKey);

async function main() {
  try {
    console.log('Setting up recipe iterations database tables...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create_recipe_iterations_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL statements
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // Check for permission issues
      if (error.message.includes('permission denied') && !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('\nPermission denied. You may need to use the service role key.');
        console.error('Set the SUPABASE_SERVICE_ROLE_KEY environment variable and try again.');
        console.error('Alternatively, you can run this SQL directly in the Supabase SQL editor.');
      }
      
      process.exit(1);
    }

    console.log('Recipe iterations database setup completed successfully!');
    
    // Verify the tables were created
    console.log('\nVerifying tables...');
    
    // Check recipe_iterations table
    const { data: iterationsData, error: iterationsError } = await supabase
      .from('recipe_iterations')
      .select('id')
      .limit(1);
      
    if (iterationsError) {
      console.error('Error verifying recipe_iterations table:', iterationsError);
    } else {
      console.log('✓ recipe_iterations table created successfully');
    }
    
    // Check iteration_ingredients table
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('iteration_ingredients')
      .select('id')
      .limit(1);
      
    if (ingredientsError) {
      console.error('Error verifying iteration_ingredients table:', ingredientsError);
    } else {
      console.log('✓ iteration_ingredients table created successfully');
    }
    
    console.log('\nYou can now use the recipe iteration system in the application.');
    console.log('Create your first recipe version to start tracking changes!');
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();