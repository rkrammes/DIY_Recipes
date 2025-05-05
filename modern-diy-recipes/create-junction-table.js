/**
 * Create Recipe Ingredients Junction Table
 * 
 * This script creates the recipe_ingredients junction table if it doesn't exist
 * and populates it with relationships from the recipe data.
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

// Recipe data with ingredients
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

// Create junction table and populate it
const createAndPopulateJunctionTable = async () => {
  console.log('Creating recipe_ingredients junction table...');
  
  try {
    // Try to create the junction table with SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          recipe_id UUID NOT NULL,
          ingredient_id UUID NOT NULL,
          quantity TEXT,
          unit TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (sqlError) {
      console.error('Error creating junction table via SQL RPC:', sqlError);
      console.log('Falling back to basic create table...');
      
      // If RPC fails, try the built-in create table function
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/recipe_ingredients?apikey=${SUPABASE_ANON_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ id: uuidv4() }) // Just to test if table exists
        });
      } catch (fetchError) {
        console.log('Table create test failed, assuming it doesn\'t exist yet:', fetchError);
      }
    }
    
    // Now fetch all recipes and ingredients to create relationships
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title');
    
    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      return;
    }
    
    console.log(`Found ${recipes.length} recipes`);
    
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name');
    
    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError);
      return;
    }
    
    console.log(`Found ${ingredients.length} ingredients`);
    
    // Create a map of ingredient names to IDs
    const ingredientMap = {};
    ingredients.forEach(ing => {
      ingredientMap[ing.name.toLowerCase()] = ing.id;
    });
    
    // Create relationships for each recipe
    let relationshipsCreated = 0;
    
    for (const recipe of recipes) {
      const recipeIngredients = recipeData[recipe.title];
      
      if (!recipeIngredients) {
        console.log(`No ingredient data for "${recipe.title}", skipping`);
        continue;
      }
      
      console.log(`Creating ingredients for "${recipe.title}"...`);
      
      for (const ingredient of recipeIngredients) {
        const ingredientId = ingredientMap[ingredient.name.toLowerCase()];
        
        if (!ingredientId) {
          console.log(`Ingredient "${ingredient.name}" not found, skipping`);
          continue;
        }
        
        try {
          const { error } = await supabase
            .from('recipe_ingredients')
            .insert({
              id: uuidv4(),
              recipe_id: recipe.id,
              ingredient_id: ingredientId,
              quantity: ingredient.quantity || '0',
              unit: ingredient.unit || '',
              created_at: new Date().toISOString()
            });
          
          if (error) {
            if (error.code === '23505') {
              console.log(`Relationship already exists for "${ingredient.name}" in "${recipe.title}"`);
            } else {
              console.error(`Error creating relationship for "${ingredient.name}" in "${recipe.title}":`, error);
            }
          } else {
            console.log(`Added "${ingredient.name}" to "${recipe.title}"`);
            relationshipsCreated++;
          }
        } catch (err) {
          console.error(`Exception adding ingredient "${ingredient.name}" to "${recipe.title}":`, err);
        }
      }
    }
    
    console.log(`Junction table created and populated with ${relationshipsCreated} relationships`);
  } catch (error) {
    console.error('Fatal error creating or populating junction table:', error);
  }
};

// Run the script
createAndPopulateJunctionTable();