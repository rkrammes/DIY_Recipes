#!/usr/bin/env node

/**
 * Direct test script to verify error handling in useRecipeIteration
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

// Function to test the hook's error handling
async function testHookErrorHandling() {
  console.log('Testing useRecipeIteration error handling...');
  
  try {
    // 1. Get a recipe ID
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title')
      .limit(1);
      
    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      return;
    }
    
    if (!recipes || recipes.length === 0) {
      console.error('No recipes found');
      return;
    }
    
    const recipeId = recipes[0].id;
    console.log(`Using recipe ID: ${recipeId} (${recipes[0].title})`);
    
    // 2. Run a raw SQL query to check the recipe_iterations table
    console.log('\nChecking recipe_iterations table:');
    const { data: tableCheck, error: tableError } = await supabase.rpc(
      'exec_sql', 
      { 
        sql_query: `
          SELECT table_name, column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'recipe_iterations' 
          ORDER BY ordinal_position;
        ` 
      }
    );
    
    if (tableError) {
      console.error('Error checking recipe_iterations table:', tableError);
    } else if (!tableCheck || tableCheck.length === 0) {
      console.error('Table recipe_iterations does not exist');
    } else {
      console.log('Table recipe_iterations structure:');
      console.table(tableCheck);
      
      // 3. Check if there are any iterations for this recipe
      console.log('\nChecking iterations for recipe:');
      const { data: iterations, error: iterationsError } = await supabase
        .from('recipe_iterations')
        .select('id, version_number, title')
        .eq('recipe_id', recipeId);
        
      if (iterationsError) {
        console.error('Error fetching iterations:', iterationsError);
      } else {
        console.log(`Found ${iterations.length} iterations for recipe ${recipeId}`);
        if (iterations.length > 0) {
          console.table(iterations);
        }
      }
    }
    
    // 4. Test the error handling in a similar way to useRecipeIteration
    console.log('\nTesting error handling for fetching iterations:');
    try {
      const { data, error } = await supabase
        .from('recipe_iterations')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('version_number', { ascending: false });

      if (error) {
        if (error.message && error.message.includes('relation "public.recipe_iterations" does not exist')) {
          console.error('ERROR: Recipe iterations table does not exist! This is the error being shown in the UI.');
          return;
        } else {
          console.error('Other error fetching iterations:', error.message);
        }
      } else {
        console.log(`✓ Successfully fetched ${data.length} iterations - this should be working in the UI!`);
      }
    } catch (err) {
      console.error('Unexpected error in fetchIterations:', err);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testHookErrorHandling().catch(console.error);