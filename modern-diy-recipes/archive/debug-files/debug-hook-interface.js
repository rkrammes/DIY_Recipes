/**
 * Debug script that simulates the behavior of the useRecipeIteration hook
 * to verify it's working correctly with the database.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Setup Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulate the hook's fetchIterations function
async function fetchIterations(recipeId) {
  console.log(`Fetching iterations for recipe ${recipeId}...`);
  
  try {
    const { data, error } = await supabase
      .from('recipe_iterations')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching iterations:', error.message);
      return [];
    } else {
      console.log(`Retrieved ${data.length} iterations`);
      
      if (data.length > 0) {
        console.log('First iteration:', {
          id: data[0].id,
          version: data[0].version_number,
          title: data[0].title
        });
        
        // Try to fetch ingredients for this iteration
        await fetchIterationIngredients(data[0].id);
      }
      
      return data;
    }
  } catch (err) {
    console.error('Exception fetching iterations:', err.message);
    return [];
  }
}

// Simulate the hook's fetchIterationIngredients function
async function fetchIterationIngredients(iterationId) {
  console.log(`Fetching ingredients for iteration ${iterationId}...`);
  
  try {
    const { data, error } = await supabase
      .from('iteration_ingredients')
      .select(`
        id,
        quantity,
        unit,
        notes,
        ingredients(id, name, description)
      `)
      .eq('iteration_id', iterationId);

    if (error) {
      console.error('Error fetching iteration ingredients:', error.message);
      return [];
    } else {
      console.log(`Retrieved ${data.length} ingredients`);
      
      if (data.length > 0) {
        // Check the structure of the first ingredient
        console.log('First ingredient data structure:', JSON.stringify(data[0], null, 2));
        
        // Verify we can access the nested ingredient data
        if (data[0].ingredients) {
          console.log('Ingredient access works. Sample:', {
            id: data[0].ingredients.id,
            name: data[0].ingredients.name
          });
        } else {
          console.error('Cannot access ingredients property - check join query');
        }
      }
      
      return data;
    }
  } catch (err) {
    console.error('Exception fetching iteration ingredients:', err.message);
    return [];
  }
}

// Main test function
async function main() {
  // First get a recipe ID
  console.log('Finding a recipe ID to test with...');
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, title')
    .limit(1);
    
  if (recipesError) {
    console.error('Error fetching recipes:', recipesError.message);
    return;
  }
  
  if (!recipes || recipes.length === 0) {
    console.error('No recipes found');
    return;
  }
  
  const recipeId = recipes[0].id;
  console.log(`Using recipe: ${recipes[0].title} (${recipeId})`);
  
  // Test the iteration functions
  const iterations = await fetchIterations(recipeId);
  
  // If there are no iterations, create one
  if (iterations.length === 0) {
    console.log('No iterations found. Creating a new one...');
    
    try {
      const timestamp = new Date().toISOString();
      
      const newIterationData = {
        recipe_id: recipeId,
        version_number: 1,
        title: recipes[0].title,
        description: 'Test iteration created by debug script',
        created_at: timestamp,
        notes: 'Debug notes',
      };
      
      const { data, error } = await supabase
        .from('recipe_iterations')
        .insert([newIterationData])
        .select();
        
      if (error) {
        console.error('Error creating new iteration:', error.message);
      } else {
        console.log('Created new iteration:', data[0]);
      }
    } catch (err) {
      console.error('Exception creating iteration:', err.message);
    }
  }
  
  console.log('Test completed');
}

main().catch(console.error);