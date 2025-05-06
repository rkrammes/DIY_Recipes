/**
 * Fix Recipe Ingredients
 * 
 * This script connects existing recipes with their ingredients.
 * It assumes recipes and ingredients already exist but relationships might be missing.
 * It tries to create the recipe_ingredients table if it doesn't exist.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Recipe data with ingredients from user-provided CSV
const recipeData = {
  'Beard Oil': [
    { name: 'Jojoba Oil', quantity: '40', unit: '%' },
    { name: 'Essential Oils', quantity: '1', unit: '%' }
  ],
  'Beard Balm': [
    { name: 'Beeswax', quantity: '33', unit: '%' },
    { name: 'Unrefined Shea Butter', quantity: '20', unit: '%' },
    { name: 'Cocoa Butter', quantity: '22', unit: '%' },
    { name: 'Unrefined Mango Butter', quantity: '15', unit: '%' },
    { name: 'Lanolin', quantity: '10', unit: '%' },
    { name: 'Arrowroot Powder', quantity: '5', unit: '%' }
  ],
  'Mustache Wax': [
    { name: 'Beeswax', quantity: '40', unit: '%' },
    { name: 'Lanolin', quantity: '45', unit: '%' },
    { name: 'Jojoba Oil', quantity: '15', unit: '%' }
  ],
  'Foaming Hand Soap': [
    { name: 'Distilled Water', quantity: '1', unit: 'cup' },
    { name: 'Liquid Castile Soap', quantity: '2', unit: 'tablespoons' },
    { name: 'Sweet Almond Oil', quantity: '1', unit: 'teaspoon' },
    { name: 'Essential Oils', quantity: '15', unit: 'drops' }
  ],
  'Hand Cream': [
    { name: 'Unrefined Shea Butter', quantity: '40', unit: '%' },
    { name: 'Cocoa Butter', quantity: '25', unit: '%' },
    { name: 'Sweet Almond Oil', quantity: '20', unit: '%' },
    { name: 'Beeswax', quantity: '10', unit: '%' },
    { name: 'Lanolin', quantity: '5', unit: '%' },
    { name: 'Cedarwood Atlas Oil', quantity: '1', unit: '%' },
    { name: 'Bergaptene-Free Bergamot Oil', quantity: '1', unit: '%' }
  ],
  'Hair Rinse': [
    { name: 'Water', quantity: '1', unit: 'cup' },
    { name: 'Green Tea', quantity: '2', unit: 'bags' },
    { name: 'Aloe Vera Juice', quantity: '1/2', unit: 'cup' },
    { name: 'Apple Cider Vinegar', quantity: '1/2', unit: 'cup' },
    { name: 'Rosemary Essential Oil', quantity: '10', unit: 'drops' },
    { name: 'Peppermint Essential Oil', quantity: '6', unit: 'drops' }
  ]
};

// Fix recipe ingredients
const fixRecipeIngredients = async () => {
  console.log('Fixing recipe ingredients relationships...');
  
  // First, check if the recipe_ingredients table exists
  console.log('Checking if recipe_ingredients table exists...');
  
  try {
    // Try to select from the table to see if it exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('recipe_ingredients')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('Error checking recipe_ingredients table:', tableError);
      console.log('This likely means the table does not exist.');
      console.log('Please run the create-recipe-ingredients.sql script in the Supabase SQL Editor first.');
      console.log('After running the SQL script, run this script again.');
      
      // Ask the user if they want to continue anyway
      console.log('\nWould you like to continue anyway? (This may not work)');
      console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Continuing...');
    } else {
      console.log('recipe_ingredients table exists!');
    }
  } catch (e) {
    console.log('Error checking table (likely does not exist):', e.message);
  }
  
  // Get all existing recipes
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, title');
  
  if (recipesError) {
    console.error('Error fetching recipes:', recipesError);
    return;
  }
  
  console.log(`Found ${recipes.length} recipes`);
  
  // Get all ingredients
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('id, name');
  
  if (ingredientsError) {
    console.error('Error fetching ingredients:', ingredientsError);
    return;
  }
  
  console.log(`Found ${ingredients.length} ingredients`);
  
  // Create ingredient name -> id map
  const ingredientMap = {};
  ingredients.forEach(ing => {
    ingredientMap[ing.name.toLowerCase()] = ing.id;
  });
  
  // Process each recipe
  for (const recipe of recipes) {
    console.log(`Processing ${recipe.title}...`);
    
    // Check if we have ingredients for this recipe
    const recipeIngredients = recipeData[recipe.title];
    if (!recipeIngredients) {
      console.log(`No ingredient data for ${recipe.title}, skipping`);
      continue;
    }
    
    // Try to clear existing ingredients for this recipe
    try {
      console.log(`Checking for existing ingredients for ${recipe.title}...`);
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipe.id);
      
      if (deleteError) {
        if (deleteError.code === '42P01') { // Table does not exist
          console.log('Cannot clear ingredients: table does not exist');
        } else {
          console.error(`Error clearing ingredients for ${recipe.title}:`, deleteError);
        }
      } else {
        console.log(`Cleared existing ingredients for ${recipe.title}`);
      }
    } catch (e) {
      console.log('Error clearing ingredients (table might not exist):', e.message);
    }
    
    // Add ingredients from our data
    for (const ingredient of recipeIngredients) {
      // Convert ingredient name to lowercase for case-insensitive matching
      const ingredientLower = ingredient.name.toLowerCase();
      let ingredientId = ingredientMap[ingredientLower];
      
      // If ingredient is not found, try to find a similar one
      if (!ingredientId) {
        // Look for partial matches
        const similarIngredients = ingredients.filter(ing => 
          ing.name.toLowerCase().includes(ingredientLower) || 
          ingredientLower.includes(ing.name.toLowerCase())
        );
        
        if (similarIngredients.length > 0) {
          console.log(`Found similar ingredient "${similarIngredients[0].name}" for "${ingredient.name}"`);
          ingredientId = similarIngredients[0].id;
        } else {
          console.log(`Ingredient "${ingredient.name}" not found in database, creating it...`);
          
          // Create the ingredient
          try {
            const { data: newIngredient, error: createError } = await supabase
              .from('ingredients')
              .insert({
                name: ingredient.name,
                description: `Used in ${recipe.title}`,
                created_at: new Date().toISOString()
              })
              .select();
            
            if (createError) {
              console.error(`Error creating ingredient "${ingredient.name}":`, createError);
              continue;
            }
            
            ingredientId = newIngredient[0].id;
            ingredientMap[ingredientLower] = ingredientId;
            console.log(`Created new ingredient: "${ingredient.name}" (${ingredientId})`);
          } catch (e) {
            console.error(`Error creating ingredient "${ingredient.name}":`, e.message);
            continue;
          }
        }
      }
      
      // Now add the relationship
      try {
        const { error: relationError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipe.id,
            ingredient_id: ingredientId,
            quantity: ingredient.quantity,
            unit: ingredient.unit || '',
            created_at: new Date().toISOString()
          });
        
        if (relationError) {
          console.error(`Error linking "${ingredient.name}" to "${recipe.title}":`, relationError);
          
          if (relationError.code === '42P01') { // Table does not exist
            console.error('\nERROR: recipe_ingredients table does not exist!');
            console.error('Please run the create-recipe-ingredients.sql script in the Supabase SQL Editor first.');
            console.error('After running the SQL script, run this script again.');
            return; // Exit early
          }
        } else {
          console.log(`Linked "${ingredient.name}" to "${recipe.title}"`);
        }
      } catch (e) {
        console.error(`Error linking "${ingredient.name}" to "${recipe.title}":`, e.message);
        
        if (e.message.includes('relation "recipe_ingredients" does not exist')) {
          console.error('\nERROR: recipe_ingredients table does not exist!');
          console.error('Please run the create-recipe-ingredients.sql script in the Supabase SQL Editor first.');
          console.error('After running the SQL script, run this script again.');
          return; // Exit early
        }
      }
    }
    
    console.log(`Finished processing ${recipe.title}`);
  }
  
  console.log('\nTrying to verify recipe-ingredient relationships...');
  
  try {
    // Get count of recipe_ingredients
    const { data: count, error: countError } = await supabase
      .from('recipe_ingredients')
      .select('count', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log(`Found ${count || 0} recipe-ingredient relationships`);
    }
    
    // Get sample data
    const { data: sample, error: sampleError } = await supabase
      .from('recipe_ingredients')
      .select(`
        id,
        recipe_id,
        ingredient_id,
        quantity,
        unit
      `)
      .limit(3);
    
    if (sampleError) {
      console.error('Error getting sample data:', sampleError);
    } else if (sample && sample.length > 0) {
      console.log('Sample recipe-ingredient data:');
      console.log(sample);
      console.log('Recipe ingredients successfully fixed!');
    } else {
      console.log('No recipe-ingredient relationships found. Something went wrong.');
    }
  } catch (e) {
    console.error('Error verifying recipe-ingredient relationships:', e.message);
  }
};

// Run the script
fixRecipeIngredients().catch(error => {
  console.error('Fatal error:', error);
});