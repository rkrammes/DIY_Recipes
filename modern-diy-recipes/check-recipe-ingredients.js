#!/usr/bin/env node

/**
 * Script to check the recipe_ingredients table and diagnose issues
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

async function checkRecipeIngredients() {
  console.log('\n1. Checking recipe_ingredients table structure...');
  
  try {
    // Get the structure of the recipe_ingredients table
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title')
      .limit(10);
    
    if (recipesError) {
      console.error('Error querying recipes:', recipesError);
    } else {
      console.log(`Found ${recipes.length} recipes:`);
      recipes.forEach(recipe => console.log(`- ${recipe.title} (${recipe.id})`));
    }
    
    console.log('\n2. Checking ingredients table...');
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name')
      .limit(10);
    
    if (ingredientsError) {
      console.error('Error querying ingredients:', ingredientsError);
    } else {
      console.log(`Found ${ingredients.length} ingredients:`);
      ingredients.forEach(ingredient => console.log(`- ${ingredient.name} (${ingredient.id})`));
    }
    
    console.log('\n3. Checking recipe_ingredients table...');
    const { data: recipeIngredients, error: recipeIngredientsError } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .limit(10);
    
    if (recipeIngredientsError) {
      console.error('Error querying recipe_ingredients:', recipeIngredientsError);
    } else {
      console.log(`Found ${recipeIngredients.length} recipe-ingredient relationships:`);
      if (recipeIngredients.length > 0) {
        console.log('Sample recipe-ingredient data:');
        console.log(recipeIngredients[0]);
      } else {
        console.log('No recipe-ingredient relationships found! This is the likely cause of your issue.');
      }
    }
    
    console.log('\n4. Checking joined data...');
    // Now check if we can join recipes with ingredients
    const { data: joinedData, error: joinedError } = await supabase
      .from('recipes')
      .select(`
        id, 
        title,
        recipe_ingredients (
          id,
          quantity,
          unit,
          ingredient_id,
          ingredients:ingredient_id (
            name
          )
        )
      `)
      .limit(5);
    
    if (joinedError) {
      console.error('Error joining recipes with ingredients:', joinedError);
    } else {
      console.log('Joined data (recipes with ingredients):');
      joinedData.forEach(recipe => {
        console.log(`\nRecipe: ${recipe.title}`);
        if (recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0) {
          console.log('  Ingredients:');
          recipe.recipe_ingredients.forEach(ri => {
            console.log(`  - ${ri.ingredients?.name || 'Unknown'}: ${ri.quantity} ${ri.unit}`);
          });
        } else {
          console.log('  No ingredients linked to this recipe');
        }
      });
      
      // Check if we have recipes but no ingredients linked
      const emptyRecipes = joinedData.filter(r => !r.recipe_ingredients || r.recipe_ingredients.length === 0);
      if (emptyRecipes.length > 0 && joinedData.length > 0) {
        console.log(`\n⚠️ ISSUE DETECTED: ${emptyRecipes.length} of ${joinedData.length} recipes have no ingredients linked.`);
        console.log('This is likely the cause of your problem.');
      }
    }
    
    console.log('\n5. Checking for alternative table name "recipeingredients" (without underscore)...');
    try {
      const { data: altRecipeIngredients, error: altError } = await supabase
        .from('recipeingredients')
        .select('*')
        .limit(10);
      
      if (altError) {
        console.log('❌ Table "recipeingredients" not found either:', altError.message);
      } else {
        console.log(`✅ Found alternative table "recipeingredients" with ${altRecipeIngredients.length} rows!`);
        console.log('This is likely your junction table, just with a different name than expected.');
        if (altRecipeIngredients.length > 0) {
          console.log('Sample data:');
          console.log(altRecipeIngredients[0]);
        }
      }
    } catch (e) {
      console.log('❌ Error checking for alternative table name:', e.message);
    }
    
    console.log('\n6. Diagnosis:');
    if (recipes && recipes.length > 0 && ingredients && ingredients.length > 0) {
      if (!recipeIngredients || recipeIngredients.length === 0) {
        console.log('❌ MAIN ISSUE: Your recipe_ingredients junction table is empty or missing!');
        console.log('   You may have a table called "recipeingredients" (without underscore) instead.');
        console.log('   Options:');
        console.log('   1. Use the table name "recipeingredients" in your code instead of "recipe_ingredients"');
        console.log('   2. Create a new "recipe_ingredients" table using the SQL script');
        console.log('   3. Run the fix-recipe-ingredients.js script (which will try both options)');
      } else {
        console.log('✅ The recipe_ingredients table has data.');
        
        // Check for foreign key issues
        const hasInvalidRecipeIds = recipeIngredients.some(ri => 
          !recipes.some(r => r.id === ri.recipe_id));
        
        const hasInvalidIngredientIds = recipeIngredients.some(ri => 
          !ingredients.some(i => i.id === ri.ingredient_id));
        
        if (hasInvalidRecipeIds) {
          console.log('❌ Some recipe_ingredients entries have invalid recipe_id values');
        }
        
        if (hasInvalidIngredientIds) {
          console.log('❌ Some recipe_ingredients entries have invalid ingredient_id values');
        }
        
        if (!hasInvalidRecipeIds && !hasInvalidIngredientIds) {
          console.log('✅ Foreign key relationships look good.');
        }
      }
    } else {
      if (!recipes || recipes.length === 0) {
        console.log('❌ ISSUE: No recipes found in the database!');
        console.log('   You need to create recipes first before linking ingredients.');
      }
      
      if (!ingredients || ingredients.length === 0) {
        console.log('❌ ISSUE: No ingredients found in the database!');
        console.log('   You need to create ingredients first before linking to recipes.');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkRecipeIngredients();