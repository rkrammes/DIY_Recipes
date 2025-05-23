#!/usr/bin/env node

/**
 * Script to debug the useRecipeIteration hook
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

async function debugHook() {
  console.log('Debugging useRecipeIteration hook...');

  try {
    // Get a recipe ID
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
    console.log(`Testing with recipe ID: ${recipeId} (${recipes[0].title})`);

    // 1. Try to fetch iterations
    console.log('\nFetching iterations:');
    try {
      const { data: iterations, error } = await supabase
        .from('recipe_iterations')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching iterations:', error);
        if (error.message.includes('relation "public.recipe_iterations" does not exist')) {
          console.error('This suggests the table does not exist or is not accessible');
        }
      } else {
        console.log(`✓ Found ${iterations.length} iterations`);
        
        if (iterations.length > 0) {
          console.log('First iteration:', {
            id: iterations[0].id,
            version: iterations[0].version_number,
            title: iterations[0].title,
          });

          // 2. Try to fetch iteration ingredients
          const iterationId = iterations[0].id;
          console.log('\nFetching iteration ingredients:');
          const { data: ingredients, error: ingredientsError } = await supabase
            .from('iteration_ingredients')
            .select(`
              id,
              quantity,
              unit,
              notes,
              ingredients(id, name, description)
            `)
            .eq('iteration_id', iterationId);

          if (ingredientsError) {
            console.error('Error fetching iteration ingredients:', ingredientsError);
          } else {
            console.log(`✓ Found ${ingredients.length} ingredients for iteration ${iterationId}`);
            
            if (ingredients.length > 0) {
              console.log('Sample ingredient:', ingredients[0]);
            }
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchIterations:', err);
    }

    // 3. Try to create a new iteration
    console.log('\nCreating a new iteration:');
    try {
      const timestamp = new Date().toISOString();
      const { data: recipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (!recipe) {
        console.error('Could not fetch recipe details');
        return;
      }

      const { data: existingIterations } = await supabase
        .from('recipe_iterations')
        .select('version_number')
        .eq('recipe_id', recipeId)
        .order('version_number', { ascending: false })
        .limit(1);

      const latestVersionNumber = existingIterations?.length > 0 ? existingIterations[0].version_number : 0;

      const newIterationData = {
        recipe_id: recipeId,
        version_number: latestVersionNumber + 1,
        title: `${recipe.title} (TEST VERSION)`,
        description: recipe.description,
        created_at: timestamp,
        notes: 'Test note created by debug script',
        metrics: null,
        instructions: recipe.instructions
      };

      const { data: createdIteration, error } = await supabase
        .from('recipe_iterations')
        .insert([newIterationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating new iteration:', error);
      } else {
        console.log('✓ Created new iteration:', {
          id: createdIteration.id,
          version: createdIteration.version_number,
          title: createdIteration.title
        });

        // 4. Try to update iteration details
        console.log('\nUpdating iteration details:');
        const { data: updatedIteration, error: updateError } = await supabase
          .from('recipe_iterations')
          .update({
            notes: 'Updated test note from debug script',
          })
          .eq('id', createdIteration.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating iteration:', updateError);
        } else {
          console.log('✓ Updated iteration:', {
            id: updatedIteration.id,
            notes: updatedIteration.notes
          });
        }
      }
    } catch (err) {
      console.error('Unexpected error in createNewIteration:', err);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

debugHook().catch(console.error);