#!/usr/bin/env node

/**
 * Direct Junction Table Creator
 * 
 * This script creates the recipe_ingredients junction table 
 * using direct SQL queries via the Supabase client.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYzMzE0NDgsImV4cCI6MjAwMTkwNzQ0OH0.5WEj3NB1pC7KgqiSZuWEwXXEpK9NrUQcCJNJiXHf5Y0';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Recipe data from the CSV
const recipeData = [
  {
    name: 'Beard Oil',
    ingredients: [
      { name: 'Jojoba Oil', quantity: '40%', unit: '12g' },
      { name: 'Essential Oils', quantity: '1%', unit: '0.3g' }
    ]
  },
  {
    name: 'Beard Balm',
    ingredients: [
      { name: 'Beeswax', quantity: '33%', unit: '19.8g' },
      { name: 'Unrefined Shea Butter', quantity: '20%', unit: '12g' },
      { name: 'Cocoa Butter', quantity: '22%', unit: '13.2g' },
      { name: 'Unrefined Mango Butter', quantity: '15%', unit: '9g' },
      { name: 'Lanolin', quantity: '10%', unit: '6g' },
      { name: 'Arrowroot Powder', quantity: '5%', unit: '3g' }
    ]
  },
  {
    name: 'Mustache Wax',
    ingredients: [
      { name: 'Beeswax', quantity: '60%', unit: '30g' },
      { name: 'Cocoa Butter', quantity: '25%', unit: '12.5g' },
      { name: 'Coconut Oil', quantity: '15%', unit: '7.5g' }
    ]
  },
  {
    name: 'Foaming Hand Soap',
    ingredients: [
      { name: 'Unscented Castile Soap', quantity: '25%', unit: '60ml' },
      { name: 'Water', quantity: '70%', unit: '168ml' },
      { name: 'Sweet Almond Oil', quantity: '4%', unit: '9.6ml' },
      { name: 'Essential Oils', quantity: '1%', unit: '2.4ml' }
    ]
  },
  {
    name: 'Hand Cream',
    ingredients: [
      { name: 'Unrefined Shea Butter', quantity: '30%', unit: '60g' },
      { name: 'Cocoa Butter', quantity: '15%', unit: '30g' },
      { name: 'Almond Oil', quantity: '40%', unit: '80ml' },
      { name: 'Beeswax', quantity: '15%', unit: '30g' },
      { name: 'Essential Oils', quantity: '', unit: '20-30 drops' }
    ]
  },
  {
    name: 'Hair Rinse',
    ingredients: [
      { name: 'Apple Cider Vinegar', quantity: '15%', unit: '30ml' },
      { name: 'Water', quantity: '85%', unit: '170ml' },
      { name: 'Essential Oils', quantity: '', unit: '5-10 drops' }
    ]
  }
];

// Function to check if a table exists
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true });
    
    if (error && error.message.includes('does not exist')) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error.message);
    return false;
  }
}

// Function to create the recipe_ingredients table
async function createRecipeIngredientsTable() {
  try {
    console.log('Checking if recipe_ingredients table exists...');
    
    const exists = await tableExists('recipe_ingredients');
    
    if (exists) {
      console.log('recipe_ingredients table already exists');
      return true;
    }
    
    console.log('Creating recipe_ingredients table...');
    
    try {
      // Try creating the table using the supabase object's createTable method if available
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recipe_id UUID NOT NULL,
            ingredient_id UUID NOT NULL,
            quantity TEXT,
            unit TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `
      });
      
      if (error) {
        throw error;
      }
      
      console.log('recipe_ingredients table created!');
      return true;
    } catch (error) {
      console.error('Error creating recipe_ingredients table:', error.message);
      console.log('\nPlease create the table manually in the Supabase Dashboard.');
      return false;
    }
  } catch (error) {
    console.error('Error in createRecipeIngredientsTable:', error.message);
    return false;
  }
}

// Function to populate recipe_ingredients table
async function populateRecipeIngredients() {
  try {
    console.log('Fetching existing recipes...');
    
    // Get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title');
    
    if (recipesError) {
      throw new Error(`Error fetching recipes: ${recipesError.message}`);
    }
    
    console.log(`Found ${recipes.length} recipes`);
    
    // Create a map of recipe titles to IDs
    const recipeMap = {};
    recipes.forEach(recipe => {
      recipeMap[recipe.title] = recipe.id;
    });
    
    console.log('Fetching existing ingredients...');
    
    // Get all ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name');
    
    if (ingredientsError) {
      throw new Error(`Error fetching ingredients: ${ingredientsError.message}`);
    }
    
    console.log(`Found ${ingredients.length} ingredients`);
    
    // Create a map of ingredient names to IDs
    const ingredientMap = {};
    ingredients.forEach(ingredient => {
      ingredientMap[ingredient.name] = ingredient.id;
    });
    
    // Check if we have any recipe_ingredients data already
    const { data: existingData, error: existingError } = await supabase
      .from('recipe_ingredients')
      .select('count', { count: 'exact', head: true });
    
    if (!existingError && existingData && existingData.count > 0) {
      console.log(`recipe_ingredients table already has ${existingData.count} rows`);
      return true;
    }
    
    console.log('Populating recipe_ingredients table...');
    
    // Process each recipe from our data
    for (const recipe of recipeData) {
      const recipeId = recipeMap[recipe.name];
      
      if (!recipeId) {
        console.warn(`Recipe "${recipe.name}" not found in database`);
        continue;
      }
      
      // Insert each ingredient relationship
      for (const ing of recipe.ingredients) {
        const ingredientId = ingredientMap[ing.name];
        
        if (!ingredientId) {
          console.warn(`Ingredient "${ing.name}" not found in database`);
          continue;
        }
        
        // Insert the relationship
        const { error: insertError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            quantity: ing.quantity,
            unit: ing.unit
          });
        
        if (insertError) {
          console.error(`Error inserting relationship for ${recipe.name} - ${ing.name}:`, insertError.message);
        } else {
          console.log(`Added relationship: ${recipe.name} - ${ing.name}`);
        }
      }
    }
    
    console.log('recipe_ingredients table populated successfully!');
    return true;
  } catch (error) {
    console.error('Error populating recipe_ingredients:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting recipe_ingredients table creation...');
  
  const tableCreated = await createRecipeIngredientsTable();
  
  if (tableCreated) {
    await populateRecipeIngredients();
    
    // Check if we have data now
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .limit(5);
    
    if (!error && data && data.length > 0) {
      console.log('\n========================================');
      console.log('SETUP COMPLETE! Your recipes should now display with ingredients.');
      console.log('Sample data:', data);
      console.log('========================================\n');
    } else {
      console.log('\nSetup may not be complete. Please check the logs for errors.');
      
      if (error) {
        console.error('Error checking recipe_ingredients data:', error.message);
      }
    }
  } else {
    console.log('\nCould not create recipe_ingredients table automatically.');
    console.log('Please follow the instructions in SUPABASE_SETUP_INSTRUCTIONS.md to set up the database manually.');
  }
}

// Run the script
main()
  .catch(error => {
    console.error('An unexpected error occurred:', error);
  });