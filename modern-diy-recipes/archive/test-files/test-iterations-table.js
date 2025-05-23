#!/usr/bin/env node

/**
 * Script to test if the recipe_iterations table exists in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Setup Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Testing if recipe_iterations table exists...');
  
  try {
    // Try to select from recipe_iterations table
    const { data: iterations, error: iterationsError } = await supabase
      .from('recipe_iterations')
      .select('id, recipe_id, version_number, title')
      .limit(5);
      
    if (iterationsError) {
      console.error('Error querying recipe_iterations table:', iterationsError.message);
      if (iterationsError.message.includes('does not exist')) {
        console.error('\nTable does not exist. The SQL setup was not completed successfully.');
        console.error('Please run the SQL commands again in Supabase SQL Editor.');
      }
    } else {
      console.log('✓ recipe_iterations table exists!');
      console.log(`Found ${iterations.length} iterations`);
      
      if (iterations.length > 0) {
        console.log('\nSample iterations:');
        iterations.forEach(iter => {
          console.log(`- Version ${iter.version_number}: "${iter.title}" (ID: ${iter.id})`);
        });
      }
    }
    
    // Try to select from iteration_ingredients table
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('iteration_ingredients')
      .select('id, iteration_id, ingredient_id')
      .limit(5);
      
    if (ingredientsError) {
      console.error('\nError querying iteration_ingredients table:', ingredientsError.message);
      if (ingredientsError.message.includes('does not exist')) {
        console.error('\nTable does not exist. The SQL setup was not completed successfully.');
        console.error('Please run the SQL commands again in Supabase SQL Editor.');
      }
    } else {
      console.log('✓ iteration_ingredients table exists!');
      console.log(`Found ${ingredients.length} iteration ingredients`);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main().catch(console.error);