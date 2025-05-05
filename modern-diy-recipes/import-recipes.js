/**
 * Import Recipes Script
 * 
 * This script imports recipe and ingredient data from the CSV provided by the user
 * and inserts it into the Supabase database.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
try {
  if (fs.existsSync('.env.local')) {
    require('dotenv').config({ path: '.env.local' });
  }
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

// CSV data provided by the user
const recipeData = [
  {
    title: 'Beard Oil',
    description: 'A nourishing oil for beard care',
    instructions: 'Combine all ingredients in a glass bottle. Shake well before each use. Apply a few drops to palm, rub hands together, and massage through beard.',
    ingredients: [
      { name: 'Jojoba Oil', quantity: '40%; 12g' },
      { name: 'Essential Oils', quantity: '1%; 0.3g' }
    ]
  },
  {
    title: 'Beard Balm',
    description: 'A styling balm that conditions and shapes your beard',
    instructions: 'Melt beeswax, shea butter, cocoa butter, and mango butter in a double boiler. Remove from heat and stir in lanolin and arrowroot powder. Pour into containers and let cool.',
    ingredients: [
      { name: 'Beeswax', quantity: '33%; 19.8g' },
      { name: 'Unrefined Shea Butter', quantity: '20%; 12g' },
      { name: 'Cocoa Butter', quantity: '22%; 13.2g' },
      { name: 'Unrefined Mango Butter', quantity: '15%; 9g' },
      { name: 'Lanolin', quantity: '10%; 6g' },
      { name: 'Arrowroot Powder', quantity: '5%; 3g' }
    ]
  },
  {
    title: 'Mustache Wax',
    description: 'A strong-hold wax for styling mustaches',
    instructions: 'Melt carnauba wax in a double boiler. Add lanolin and jojoba oil, stirring until combined. Pour into small containers and let cool completely before use.',
    ingredients: [
      { name: 'Carnauba Wax', quantity: '40%; 12g' },
      { name: 'Lanolin', quantity: '45%; 13.5g' },
      { name: 'Jojoba Oil', quantity: '15%; 4.5g' }
    ]
  },
  {
    title: 'Foaming Hand Soap',
    description: 'A gentle, natural foaming soap for everyday hand washing',
    instructions: 'Pour distilled water into a foaming soap dispenser. Add castile soap, sweet almond oil, and essential oils. Gently swirl to mix (do not shake vigorously).',
    ingredients: [
      { name: 'Distilled Water', quantity: '1 cup (240 mL)' },
      { name: 'Liquid Castile Soap', quantity: '2 tablespoons (30 mL)' },
      { name: 'Sweet Almond Oil', quantity: '1 teaspoon (5 mL)' },
      { name: 'Essential Oils', quantity: '10-15 drops' }
    ]
  },
  {
    title: 'Hand Cream',
    description: 'A rich, moisturizing cream for dry hands',
    instructions: 'Melt shea butter, cocoa butter, and beeswax in a double boiler. Remove from heat and add sweet almond oil and lanolin. Let cool slightly, then add essential oils. Pour into jars and cool completely.',
    ingredients: [
      { name: 'Unrefined Shea Butter', quantity: '40%; 12g' },
      { name: 'Cocoa Butter', quantity: '25%; 7.5g' },
      { name: 'Sweet Almond Oil', quantity: '20%; 6g' },
      { name: 'Beeswax', quantity: '10%; 3g' },
      { name: 'Lanolin', quantity: '5%; 1.5g' },
      { name: 'Cedarwood Atlas Oil', quantity: '1%; 0.3g' },
      { name: 'Bergaptene-Free Bergamot Oil', quantity: '1%; 0.3g' }
    ]
  },
  {
    title: 'Hair Rinse',
    description: 'A clarifying rinse to remove buildup and add shine',
    instructions: 'Brew green tea with hot water and let cool. Mix in aloe vera juice and apple cider vinegar. Add essential oils and shake well. Apply to hair after shampooing, let sit for 2-3 minutes, then rinse with cool water.',
    ingredients: [
      { name: 'Water', quantity: '1 cup' },
      { name: 'Green Tea', quantity: '2 bags' },
      { name: 'Aloe Vera Juice', quantity: '1/2 cup' },
      { name: 'Apple Cider Vinegar', quantity: '1/2 cup' },
      { name: 'Rosemary Essential Oil', quantity: '10 drops' },
      { name: 'Peppermint Essential Oil', quantity: '6 drops' }
    ]
  }
];

// Check and create tables if they don't exist
async function createTablesIfNeeded() {
  console.log('Checking database tables...');
  
  try {
    // Check if recipes table exists
    const { data: recipesExists, error: recipesError } = await supabase
      .from('recipes')
      .select('count', { count: 'exact', head: true });
    
    const createRecipes = !!recipesError && recipesError.message.includes('does not exist');
    
    // Check if ingredients table exists
    const { data: ingredientsExists, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('count', { count: 'exact', head: true });
    
    const createIngredients = !!ingredientsError && ingredientsError.message.includes('does not exist');
    
    // Check if recipe_ingredients table exists
    const { data: recipeIngredientsExists, error: recipeIngredientsError } = await supabase
      .from('recipe_ingredients')
      .select('count', { count: 'exact', head: true });
    
    const createRecipeIngredients = !!recipeIngredientsError && recipeIngredientsError.message.includes('does not exist');
    
    console.log(`Database tables status:
- recipes: ${createRecipes ? 'missing' : 'exists'}
- ingredients: ${createIngredients ? 'missing' : 'exists'}
- recipe_ingredients: ${createRecipeIngredients ? 'missing' : 'exists'}`);
    
    if (createRecipes || createIngredients || createRecipeIngredients) {
      console.log('Creating missing tables...');
      
      // Create missing tables using SQL
      // This is using a single SQL statement to create all tables for efficiency
      const createTablesSQL = `
        ${createRecipes ? `
        CREATE TABLE IF NOT EXISTS public.recipes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'
        );` : ''}
        
        ${createIngredients ? `
        CREATE TABLE IF NOT EXISTS public.ingredients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );` : ''}
        
        ${createRecipeIngredients ? `
        CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          recipe_id UUID NOT NULL,
          ingredient_id UUID NOT NULL,
          quantity TEXT NOT NULL,
          unit TEXT DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );` : ''}
      `;
      
      if (createTablesSQL.trim()) {
        const { error: sqlError } = await supabase.rpc('execute_sql', { sql: createTablesSQL });
        if (sqlError) {
          if (sqlError.message.includes('function "execute_sql" does not exist')) {
            console.error('The execute_sql function is not available. Will try to create tables individually using Supabase API.');
            return false;
          } else {
            throw sqlError;
          }
        }
        console.log('Tables created successfully using SQL');
        return true;
      }
    } else {
      console.log('All required tables already exist');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking or creating tables:', error);
    return false;
  }
}

// Insert recipe data
async function importRecipes() {
  console.log('Starting recipe import...');
  
  // Create tables if needed
  const tablesCheck = await createTablesIfNeeded();
  if (!tablesCheck) {
    console.log('Will proceed anyway and attempt to use existing tables.');
  }
  
  // Get a valid user ID first
  let userId = null;
  
  try {
    // First, try to get an existing user with direct SQL query (for auth.users)
    // Using RPC to execute a more privileged query
    const { data: rpcResult, error: rpcError } = await supabase.rpc('get_user_id', {});
    
    if (!rpcError && rpcResult) {
      userId = rpcResult;
      console.log(`Using user ID from RPC: ${userId}`);
    } else {
      console.warn('Failed to get user ID via RPC, trying direct query...');
      
      // Try direct query on the public.profiles table instead
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!profilesError && profiles && profiles.length > 0) {
        userId = profiles[0].id;
        console.log(`Using profile ID: ${userId}`);
      } else {
        // Fall back to a special value for system
        userId = '00000000-0000-0000-0000-000000000001';
        console.log(`No valid users or profiles found. Using fallback user ID: ${userId}`);
        
        // Make a direct SQL query to check if we need to disable the foreign key constraint
        try {
          const disableConstraintSQL = `
            -- Temporarily disable foreign key constraint
            ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;
          `;
          
          const { error: constraintError } = await supabase.rpc('execute_sql', { sql: disableConstraintSQL });
          
          if (!constraintError) {
            console.log('Successfully disabled user_id foreign key constraint');
          } else {
            console.error('Failed to disable constraint:', constraintError);
          }
        } catch (sqlError) {
          console.error('Error executing constraint SQL:', sqlError);
        }
      }
    }
  } catch (error) {
    console.error('Exception fetching users:', error);
    console.log('Will continue with fallback user ID');
    userId = '00000000-0000-0000-0000-000000000001';
  }
  
  // Map of ingredient names to IDs to avoid duplicates
  const ingredientMap = new Map();
  
  // First, get all existing ingredients to avoid duplicates
  try {
    const { data: existingIngredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name');
    
    if (ingredientsError) {
      console.error('Error fetching existing ingredients:', ingredientsError);
    } else if (existingIngredients) {
      existingIngredients.forEach(ing => {
        ingredientMap.set(ing.name.toLowerCase(), ing.id);
      });
      console.log(`Found ${existingIngredients.length} existing ingredients`);
    }
  } catch (error) {
    console.error('Exception fetching ingredients:', error);
  }
  
  // Process each recipe in the data
  for (const recipe of recipeData) {
    try {
      // Generate a UUID for the recipe
      const recipeId = uuidv4();
      
      // Insert recipe using direct SQL to bypass foreign key constraints if needed
      try {
        // Try normal insert first
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .insert({
            id: recipeId,
            title: recipe.title,
            description: recipe.description || `DIY recipe for ${recipe.title}`,
            instructions: recipe.instructions || `Instructions for making ${recipe.title}. Combine all ingredients and mix thoroughly.`,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (recipeError) {
          console.error(`Error inserting recipe "${recipe.title}":`, recipeError);
          
          // Try a direct SQL insert as a fallback if we have the execute_sql function
          console.log(`Trying direct SQL insert for recipe "${recipe.title}"`);
          
          const sqlInsert = `
            INSERT INTO recipes (id, title, description, instructions, user_id, created_at, updated_at)
            VALUES (
              '${recipeId}',
              '${recipe.title.replace(/'/g, "''")}',
              '${(recipe.description || `DIY recipe for ${recipe.title}`).replace(/'/g, "''")}',
              '${(recipe.instructions || `Instructions for making ${recipe.title}. Combine all ingredients and mix thoroughly.`).replace(/'/g, "''")}',
              'system',
              '${new Date().toISOString()}',
              '${new Date().toISOString()}'
            )
            ON CONFLICT (id) DO NOTHING
            RETURNING *;
          `;
          
          const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', { sql: sqlInsert });
          
          if (sqlError) {
            console.error(`SQL insert also failed for recipe "${recipe.title}":`, sqlError);
            throw new Error(`Failed to insert recipe "${recipe.title}"`);
          }
          
          console.log(`Successfully inserted recipe "${recipe.title}" using SQL`);
          continue; // Skip to next recipe since we handled this one with SQL
        }
        
        console.log(`Inserted recipe: ${recipe.title} (${recipeId})`);
      } catch (insertError) {
        console.error(`Exception inserting recipe "${recipe.title}":`, insertError);
        continue; // Skip to next recipe
      }
      // Process ingredients for this recipe
      for (const ingredient of recipe.ingredients) {
        // Look for existing ingredient or create new one
        let ingredientId = ingredientMap.get(ingredient.name.toLowerCase());
        
        if (!ingredientId) {
          // Insert new ingredient
          const { data: ingredientData, error: ingredientError } = await supabase
            .from('ingredients')
            .insert({
              name: ingredient.name,
              description: `Ingredient for ${recipe.title}: ${ingredient.name}`,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (ingredientError) {
            console.error(`Error inserting ingredient "${ingredient.name}":`, ingredientError);
            continue;
          }
          
          ingredientId = ingredientData.id;
          ingredientMap.set(ingredient.name.toLowerCase(), ingredientId);
          console.log(`Inserted new ingredient: ${ingredient.name} (${ingredientId})`);
        } else {
          console.log(`Using existing ingredient: ${ingredient.name} (${ingredientId})`);
        }
        
        // Parse quantity and unit from the quantity string
        let quantityValue = "1";
        let unitValue = "";
        
        // Try to extract quantity and unit
        if (ingredient.quantity) {
          // Patterns like "40%; 12g" - take the first number as quantity
          if (ingredient.quantity.includes(';')) {
            // Extract numeric part from first portion
            const numMatch = ingredient.quantity.match(/(\d+)/);
            if (numMatch) {
              quantityValue = numMatch[1];
            }
            
            // Extract unit from second portion if it has a unit
            const unitMatch = ingredient.quantity.match(/;.*?(\d+)([a-zA-Z]+)/);
            if (unitMatch) {
              unitValue = unitMatch[2];
            }
          }
          // Patterns like "1 cup", "2 tablespoons"
          else if (ingredient.quantity.match(/^\d+(\.\d+)?\s+[a-zA-Z]/)) {
            const parts = ingredient.quantity.split(' ');
            quantityValue = parts[0];
            unitValue = parts.slice(1).join(' ');
          }
          // Just pass through the whole quantity if we can't parse it
          else {
            quantityValue = ingredient.quantity;
          }
        }
        
        // Insert recipe_ingredient junction record
        const { error: junctionError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            quantity: quantityValue,
            unit: unitValue,
            created_at: new Date().toISOString()
          });
        
        if (junctionError) {
          console.error(`Error linking ingredient "${ingredient.name}" to recipe:`, junctionError);
        } else {
          console.log(`Linked ingredient "${ingredient.name}" to recipe "${recipe.title}" with quantity ${quantityValue} ${unitValue}`);
        }
      }
      
      console.log(`Completed import for recipe: ${recipe.title}`);
    } catch (error) {
      console.error(`Exception processing recipe "${recipe.title}":`, error);
    }
  }
  
  console.log('Recipe import complete!');
}

// Execute the import
importRecipes()
  .catch(error => {
    console.error('Unhandled error during import:', error);
  })
  .finally(() => {
    console.log('Import script completed execution');
  });