/**
 * Fix Recipe Ingredients
 * 
 * This script connects existing recipes with their ingredients.
 * It assumes recipes and ingredients already exist but relationships might be missing.
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
    { name: 'Carnauba Wax', quantity: '40', unit: '%' },
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
  
  // First, get all existing recipes
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
    
    // Clear existing ingredients first
    console.log(`Clearing existing ingredients for ${recipe.title}...`);
    const { error: deleteError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipe.id);
    
    if (deleteError) {
      console.error(`Error clearing ingredients for ${recipe.title}:`, deleteError);
    }
    
    // Add ingredients from our data
    for (const ingredient of recipeIngredients) {
      const ingredientId = ingredientMap[ingredient.name.toLowerCase()];
      
      if (!ingredientId) {
        console.log(`Ingredient "${ingredient.name}" not found in database, creating it...`);
        
        // Create the ingredient
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
        
        ingredientMap[ingredient.name.toLowerCase()] = newIngredient[0].id;
      }
      
      // Now add the relationship
      const { error: relationError } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipe.id,
          ingredient_id: ingredientMap[ingredient.name.toLowerCase()],
          quantity: ingredient.quantity,
          unit: ingredient.unit || '',
          created_at: new Date().toISOString()
        });
      
      if (relationError) {
        console.error(`Error linking "${ingredient.name}" to "${recipe.title}":`, relationError);
      } else {
        console.log(`Linked "${ingredient.name}" to "${recipe.title}"`);
      }
    }
    
    console.log(`Finished processing ${recipe.title}`);
  }
  
  console.log('Recipe ingredients fixed!');
};

// Run the script
fixRecipeIngredients().catch(error => {
  console.error('Fatal error:', error);
});