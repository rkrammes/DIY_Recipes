#!/usr/bin/env node

/**
 * Create Recipe_Ingredients Table Script
 * 
 * This script uses the Supabase REST API to create the recipe_ingredients table
 * and populate it with the necessary relationships.
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYzMzE0NDgsImV4cCI6MjAwMTkwNzQ0OH0.5WEj3NB1pC7KgqiSZuWEwXXEpK9NrUQcCJNJiXHf5Y0';

// Helper function to make Supabase REST API calls
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase API error: ${response.status} ${text}`);
  }
  
  return response.json();
}

async function createAndPopulateTable() {
  try {
    console.log('Setting up recipe_ingredients table via Supabase REST API...');
    
    // 1. Create the recipe_ingredients table with PostgreSQL
    try {
      console.log('Creating recipe_ingredients table...');
      await supabaseRequest('/rest/v1/rpc/create_recipe_ingredients_table', {
        method: 'POST',
        body: JSON.stringify({})
      });
      console.log('Table created successfully!');
    } catch (createError) {
      console.error('Error creating table:', createError.message);
      
      // If the RPC function doesn't exist, try to use a different approach
      console.log('Trying alternative approach via create_tables stored procedure...');
      try {
        await supabaseRequest('/rest/v1/rpc/create_tables', {
          method: 'POST',
          body: JSON.stringify({})
        });
      } catch (altError) {
        console.error('Alternative approach failed:', altError.message);
        console.log('Continuing with existing tables...');
      }
    }
    
    // 2. Get existing recipes
    console.log('Fetching recipes...');
    const recipes = await supabaseRequest('/rest/v1/recipes?select=id,title');
    console.log(`Found ${recipes.length} recipes`);
    
    // 3. Get existing ingredients
    console.log('Fetching ingredients...');
    const ingredients = await supabaseRequest('/rest/v1/ingredients?select=id,name');
    console.log(`Found ${ingredients.length} ingredients`);
    
    // 4. Create mappings for easy lookup
    const recipeMap = {};
    recipes.forEach(recipe => {
      recipeMap[recipe.title] = recipe.id;
    });
    
    const ingredientMap = {};
    ingredients.forEach(ingredient => {
      ingredientMap[ingredient.name] = ingredient.id;
    });
    
    // 5. Define the relationships
    const relationships = [
      // Beard Oil
      { recipe: 'Beard Oil', ingredient: 'Jojoba Oil', quantity: '40%', unit: '12g' },
      { recipe: 'Beard Oil', ingredient: 'Essential Oils', quantity: '1%', unit: '0.3g' },
      
      // Beard Balm
      { recipe: 'Beard Balm', ingredient: 'Beeswax', quantity: '33%', unit: '19.8g' },
      { recipe: 'Beard Balm', ingredient: 'Unrefined Shea Butter', quantity: '20%', unit: '12g' },
      { recipe: 'Beard Balm', ingredient: 'Cocoa Butter', quantity: '22%', unit: '13.2g' },
      { recipe: 'Beard Balm', ingredient: 'Unrefined Mango Butter', quantity: '15%', unit: '9g' },
      { recipe: 'Beard Balm', ingredient: 'Lanolin', quantity: '10%', unit: '6g' },
      { recipe: 'Beard Balm', ingredient: 'Arrowroot Powder', quantity: '5%', unit: '3g' },
      
      // Mustache Wax
      { recipe: 'Mustache Wax', ingredient: 'Beeswax', quantity: '60%', unit: '30g' },
      { recipe: 'Mustache Wax', ingredient: 'Cocoa Butter', quantity: '25%', unit: '12.5g' },
      { recipe: 'Mustache Wax', ingredient: 'Coconut Oil', quantity: '15%', unit: '7.5g' },
      
      // Foaming Hand Soap
      { recipe: 'Foaming Hand Soap', ingredient: 'Unscented Castile Soap', quantity: '25%', unit: '60ml' },
      { recipe: 'Foaming Hand Soap', ingredient: 'Water', quantity: '70%', unit: '168ml' },
      { recipe: 'Foaming Hand Soap', ingredient: 'Sweet Almond Oil', quantity: '4%', unit: '9.6ml' },
      { recipe: 'Foaming Hand Soap', ingredient: 'Essential Oils', quantity: '1%', unit: '2.4ml' },
      
      // Hand Cream
      { recipe: 'Hand Cream', ingredient: 'Unrefined Shea Butter', quantity: '30%', unit: '60g' },
      { recipe: 'Hand Cream', ingredient: 'Cocoa Butter', quantity: '15%', unit: '30g' },
      { recipe: 'Hand Cream', ingredient: 'Almond Oil', quantity: '40%', unit: '80ml' },
      { recipe: 'Hand Cream', ingredient: 'Beeswax', quantity: '15%', unit: '30g' },
      { recipe: 'Hand Cream', ingredient: 'Essential Oils', quantity: '', unit: '20-30 drops' },
      
      // Hair Rinse
      { recipe: 'Hair Rinse', ingredient: 'Apple Cider Vinegar', quantity: '15%', unit: '30ml' },
      { recipe: 'Hair Rinse', ingredient: 'Water', quantity: '85%', unit: '170ml' },
      { recipe: 'Hair Rinse', ingredient: 'Essential Oils', quantity: '', unit: '5-10 drops' }
    ];
    
    // 6. Use the Admin UI approach to create the junction table directly
    console.log('Creating recipe_ingredients junction table directly using SQL...');
    
    // 6.1 Create table using Admin UI script
    const createTableSql = `
    -- Create recipe_ingredients junction table with function approach
    CREATE OR REPLACE FUNCTION create_recipe_ingredients() RETURNS VOID AS $$
    BEGIN
      -- Create the table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipe_id UUID NOT NULL,
        ingredient_id UUID NOT NULL,
        quantity TEXT,
        unit TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Add foreign key constraints if possible
      BEGIN
        ALTER TABLE public.recipe_ingredients 
          ADD CONSTRAINT fk_recipe 
          FOREIGN KEY (recipe_id) 
          REFERENCES public.recipes(id) 
          ON DELETE CASCADE;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Could not add foreign key constraint for recipes: %', SQLERRM;
      END;
      
      BEGIN
        ALTER TABLE public.recipe_ingredients 
          ADD CONSTRAINT fk_ingredient 
          FOREIGN KEY (ingredient_id) 
          REFERENCES public.ingredients(id) 
          ON DELETE RESTRICT;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Could not add foreign key constraint for ingredients: %', SQLERRM;
      END;
      
      -- Create index
      CREATE INDEX IF NOT EXISTS idx_recipe_ingredients 
        ON public.recipe_ingredients(recipe_id, ingredient_id);
    END;
    $$ LANGUAGE plpgsql;

    -- Execute the function
    SELECT create_recipe_ingredients();
    `;
    
    // 6.2 Execute the SQL script through the SQL editor interface
    console.log('Please execute the following SQL in the Supabase SQL Editor:');
    console.log(createTableSql);
    
    // 7. Try to check existing tables and create the most basic version of the table
    console.log('\nAttempting direct table creation via REST API...');
    try {
      // Try to get meta information to see if table exists
      await supabaseRequest('/rest/v1/recipe_ingredients?select=count=exact', {
        method: 'HEAD'
      });
      console.log('Recipe_ingredients table already exists!');
    } catch (headError) {
      // If table doesn't exist, we need to create it
      if (headError.message.includes('42P01') || headError.message.includes('not exist')) {
        console.log('Table does not exist, trying to create it via direct API calls...');
        
        // Create a simple script file for the admin to run
        console.log(`
IMPORTANT: Since we can't create the table directly via the API, please run
the following SQL script in the Supabase SQL Editor:

CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate with sample data
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES 
`);
        
        // Generate the INSERT statements
        let insertStatements = [];
        for (const rel of relationships) {
          const recipeId = recipeMap[rel.recipe];
          const ingredientId = ingredientMap[rel.ingredient];
          
          if (recipeId && ingredientId) {
            insertStatements.push(`('${recipeId}', '${ingredientId}', '${rel.quantity}', '${rel.unit}')`);
          }
        }
        
        console.log(insertStatements.join(',\n') + ';');
      }
    }
    
    console.log('\nNext steps:');
    console.log('1. Run the SQL script in the Supabase SQL Editor if needed');
    console.log('2. Restart the application to see the recipes with ingredients');
    
  } catch (error) {
    console.error('Error setting up recipe_ingredients table:', error);
  }
}

// Run the main function
createAndPopulateTable();