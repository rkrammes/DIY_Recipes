#!/usr/bin/env node

/**
 * Supabase SQL Runner
 * 
 * This script helps execute the recipe_ingredients_setup SQL
 * directly against your Supabase database.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'recipe_ingredients_setup.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Configuration for Supabase
// Note: In a production app, these would come from environment variables
// For now, using the public, read-only anon key which is safe to include
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYzMzE0NDgsImV4cCI6MjAwMTkwNzQ0OH0.5WEj3NB1pC7KgqiSZuWEwXXEpK9NrUQcCJNJiXHf5Y0';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to run SQL directly via the REST API
async function runSql(sqlStatement) {
  try {
    console.log('Executing SQL via Supabase REST API...');
    
    // Try to use rpc function if available
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sqlStatement
    });
    
    if (error) {
      console.error('Error executing SQL via RPC:', error);
      throw error;
    }
    
    console.log('SQL executed successfully!');
    return data;
  } catch (error) {
    console.error('Failed to run SQL via RPC:', error);
    
    // If the RPC method fails, we'll need to provide instructions for manual execution
    console.log('\n========================================');
    console.log('Unable to execute SQL directly from this script.');
    console.log('Please run the SQL manually through the Supabase Dashboard:');
    console.log('\n1. Log in to your Supabase Dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Copy and paste the SQL from recipe_ingredients_setup.sql');
    console.log('4. Click "Run" to execute the SQL');
    console.log('5. Restart your application');
    console.log('========================================\n');
    
    return null;
  }
}

// Function to check if recipe_ingredients table exists and has data
async function checkRecipeIngredients() {
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .limit(5);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        return { exists: false, hasData: false, error: error.message };
      }
      return { exists: true, hasData: false, error: error.message };
    }
    
    return { exists: true, hasData: data && data.length > 0, data };
  } catch (error) {
    return { exists: false, hasData: false, error: error.message };
  }
}

// Function to check if a SQL Server-side function exists
async function checkSqlFunction(functionName) {
  try {
    // Using Postgres system tables to check for the function
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT EXISTS (
          SELECT 1 
          FROM pg_proc 
          WHERE proname = '${functionName}'
        );
      `
    });
    
    if (error) {
      console.log(`Could not check if function ${functionName} exists:`, error.message);
      return false;
    }
    
    return data && data[0] && data[0].exists;
  } catch (error) {
    console.log(`Error checking function ${functionName}:`, error.message);
    return false;
  }
}

// Main function to run the setup
async function main() {
  console.log('Starting DIY Recipes Supabase Setup...');
  
  // First check if the table already exists and has data
  const tableCheck = await checkRecipeIngredients();
  console.log('Table check result:', tableCheck);
  
  if (tableCheck.exists && tableCheck.hasData) {
    console.log('Recipe_ingredients table already exists and has data!');
    console.log('Sample data:', tableCheck.data);
    console.log('\nSetup is already complete. Your recipes should display with ingredients.');
    return;
  }
  
  // Check if the helper function exists
  const functionExists = await checkSqlFunction('get_recipe_with_ingredients');
  
  if (functionExists) {
    console.log('The helper function already exists.');
  }
  
  console.log(`Table exists: ${tableCheck.exists}, Has data: ${tableCheck.hasData}, Function exists: ${functionExists}`);
  
  if (!tableCheck.exists || !tableCheck.hasData || !functionExists) {
    // Try to run the SQL script
    console.log('Running the SQL setup script...');
    await runSql(sql);
    
    // Check again to see if the table exists now
    const afterCheck = await checkRecipeIngredients();
    
    if (afterCheck.exists && afterCheck.hasData) {
      console.log('\n========================================');
      console.log('SETUP COMPLETE! Your recipes should now display with ingredients.');
      console.log('Sample data:', afterCheck.data);
      console.log('========================================\n');
    } else {
      console.log('\n========================================');
      console.log('SETUP MAY NOT BE COMPLETE.');
      console.log('Please follow the manual instructions to run the SQL script.');
      console.log('========================================\n');
    }
  }
}

// Run the script
main()
  .catch(error => {
    console.error('Error running setup:', error);
  });