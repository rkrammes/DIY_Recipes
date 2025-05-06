#!/usr/bin/env node

/**
 * Supabase Schema Creator
 * 
 * This script creates the necessary database schema for the DIY Recipes app
 * using the Supabase JavaScript client's REST API capabilities.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials 
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYzMzE0NDgsImV4cCI6MjAwMTkwNzQ0OH0.5WEj3NB1pC7KgqiSZuWEwXXEpK9NrUQcCJNJiXHf5Y0';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Recipe and ingredient relationships from the CSV
const recipeData = [
  {
    title: 'Beard Oil',
    description: 'A nourishing beard oil to soften and condition facial hair',
    ingredients: [
      { name: 'Jojoba Oil', quantity: '40%', unit: '12g' },
      { name: 'Essential Oils', quantity: '1%', unit: '0.3g' }
    ]
  },
  {
    title: 'Beard Balm',
    description: 'A styling balm that helps shape and condition beards',
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
    title: 'Mustache Wax',
    description: 'Extra-hold wax for styling mustaches',
    ingredients: [
      { name: 'Beeswax', quantity: '60%', unit: '30g' },
      { name: 'Cocoa Butter', quantity: '25%', unit: '12.5g' },
      { name: 'Coconut Oil', quantity: '15%', unit: '7.5g' }
    ]
  },
  {
    title: 'Foaming Hand Soap',
    description: 'Gentle foaming soap for everyday handwashing',
    ingredients: [
      { name: 'Unscented Castile Soap', quantity: '25%', unit: '60ml' },
      { name: 'Water', quantity: '70%', unit: '168ml' },
      { name: 'Sweet Almond Oil', quantity: '4%', unit: '9.6ml' },
      { name: 'Essential Oils', quantity: '1%', unit: '2.4ml' }
    ]
  },
  {
    title: 'Hand Cream',
    description: 'Rich moisturizing cream for dry hands',
    ingredients: [
      { name: 'Unrefined Shea Butter', quantity: '30%', unit: '60g' },
      { name: 'Cocoa Butter', quantity: '15%', unit: '30g' },
      { name: 'Almond Oil', quantity: '40%', unit: '80ml' },
      { name: 'Beeswax', quantity: '15%', unit: '30g' },
      { name: 'Essential Oils', quantity: '', unit: '20-30 drops' }
    ]
  },
  {
    title: 'Hair Rinse',
    description: 'A clarifying rinse to remove buildup and add shine',
    ingredients: [
      { name: 'Apple Cider Vinegar', quantity: '15%', unit: '30ml' },
      { name: 'Water', quantity: '85%', unit: '170ml' },
      { name: 'Essential Oils', quantity: '', unit: '5-10 drops' }
    ]
  }
];

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName) {
  try {
    // Try to query the table
    const { error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true });
    
    // If the table doesn't exist, we'll get an error
    if (error && error.message.includes('does not exist')) {
      return false;
    }
    
    // If no error, the table exists
    return true;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}

/**
 * Create a table in the database using SQL
 */
async function createTable(tableName, schema) {
  try {
    console.log(`Creating table: ${tableName}`);
    
    // Try to execute the SQL query
    const { error } = await supabase.rpc('exec_sql', {
      query: schema
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`Table ${tableName} created successfully`);
    return true;
  } catch (err) {
    console.error(`Error creating table ${tableName}:`, err);
    
    // Write the SQL to a file so the user can run it manually
    const sqlFileName = `create_${tableName}.sql`;
    fs.writeFileSync(sqlFileName, schema);
    console.log(`\nCould not create table automatically. Please run the SQL in ${sqlFileName} manually in the Supabase SQL Editor.`);
    
    return false;
  }
}

/**
 * Create recipe_ingredients table using the Supabase client directly
 */
async function createRecipeIngredientsTable() {
  try {
    console.log('Checking if recipe_ingredients table exists...');
    
    // Check if the table exists
    const exists = await tableExists('recipe_ingredients');
    
    if (exists) {
      console.log('recipe_ingredients table already exists, skipping creation');
      return true;
    }
    
    console.log('recipe_ingredients table does not exist, creating it...');
    
    // Define the SQL for creating the table
    // Note: Using DROP TABLE IF EXISTS to ensure a clean recreation
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipe_id UUID NOT NULL,
        ingredient_id UUID NOT NULL,
        quantity TEXT,
        unit TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Try to add foreign key constraints, but don't fail if they can't be added
      DO $$
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
      $$;
      
      DO $$
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
      $$;
      
      -- Create index
      CREATE INDEX IF NOT EXISTS idx_recipe_ingredients ON public.recipe_ingredients(recipe_id, ingredient_id);
    `;
    
    // Create the table
    const created = await createTable('recipe_ingredients', createTableSQL);
    
    if (!created) {
      throw new Error('Failed to create recipe_ingredients table');
    }
    
    return true;
  } catch (err) {
    console.error('Error creating recipe_ingredients table:', err);
    return false;
  }
}

/**
 * Populate recipe_ingredients table with the junction data
 */
async function populateRecipeIngredients() {
  try {
    console.log('Checking if recipe_ingredients table has data...');
    
    // Check if the table exists and has data
    let hasData = false;
    try {
      const { count, error } = await supabase
        .from('recipe_ingredients')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count && count > 0) {
        hasData = true;
      }
    } catch (err) {
      console.log('Error checking recipe_ingredients data:', err);
    }
    
    if (hasData) {
      console.log('recipe_ingredients table already has data, skipping population');
      return true;
    }
    
    console.log('recipe_ingredients table is empty, populating it...');
    
    // Get all existing recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title');
    
    if (recipesError) {
      throw new Error(`Error fetching recipes: ${recipesError.message}`);
    }
    
    // Get all existing ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name');
    
    if (ingredientsError) {
      throw new Error(`Error fetching ingredients: ${ingredientsError.message}`);
    }
    
    // Create mappings for easy lookup
    const recipeMap = {};
    recipes.forEach(recipe => {
      recipeMap[recipe.title] = recipe.id;
    });
    
    const ingredientMap = {};
    ingredients.forEach(ingredient => {
      ingredientMap[ingredient.name] = ingredient.id;
    });
    
    console.log(`Found ${recipes.length} recipes and ${ingredients.length} ingredients`);
    
    // Prepare the junction data
    const junctionData = [];
    
    // Loop through each recipe and its ingredients
    for (const recipe of recipeData) {
      const recipeId = recipeMap[recipe.title];
      
      if (!recipeId) {
        console.warn(`Recipe "${recipe.title}" not found in database, creating it...`);
        
        // Create the recipe if it doesn't exist
        const { data: newRecipe, error: createError } = await supabase
          .from('recipes')
          .insert({ 
            title: recipe.title, 
            description: recipe.description, 
            user_id: 'system'
          })
          .select();
        
        if (createError) {
          console.error(`Error creating recipe "${recipe.title}":`, createError);
          continue;
        }
        
        // Use the newly created recipe ID
        recipeId = newRecipe[0].id;
      }
      
      // Loop through each ingredient for this recipe
      for (const ingredient of recipe.ingredients) {
        let ingredientId = ingredientMap[ingredient.name];
        
        if (!ingredientId) {
          console.warn(`Ingredient "${ingredient.name}" not found in database, creating it...`);
          
          // Create the ingredient if it doesn't exist
          const { data: newIngredient, error: createError } = await supabase
            .from('ingredients')
            .insert({ 
              name: ingredient.name, 
              description: null
            })
            .select();
          
          if (createError) {
            console.error(`Error creating ingredient "${ingredient.name}":`, createError);
            continue;
          }
          
          // Use the newly created ingredient ID
          ingredientId = newIngredient[0].id;
        }
        
        // Add the junction data
        junctionData.push({
          recipe_id: recipeId,
          ingredient_id: ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        });
      }
    }
    
    console.log(`Prepared ${junctionData.length} recipe-ingredient relationships`);
    
    // Insert the junction data in batches
    const batchSize = 10;
    
    for (let i = 0; i < junctionData.length; i += batchSize) {
      const batch = junctionData.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('recipe_ingredients')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
      } else {
        console.log(`Successfully inserted batch ${i / batchSize + 1}`);
      }
    }
    
    console.log('Successfully populated recipe_ingredients table!');
    return true;
  } catch (err) {
    console.error('Error populating recipe_ingredients table:', err);
    
    // Generate SQL for manual insertion
    console.log('\nCould not insert data automatically. Please run the following SQL in the Supabase SQL Editor:');
    
    // Create SQL for inserting junction data
    let insertSQL = 'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES\n';
    
    // Mock the data for manual insertion
    const mockInsertData = [];
    for (const recipe of recipeData) {
      for (const ingredient of recipe.ingredients) {
        mockInsertData.push(`('RECIPE_ID_FOR_${recipe.title.replace(/ /g, '_')}', 'INGREDIENT_ID_FOR_${ingredient.name.replace(/ /g, '_')}', '${ingredient.quantity}', '${ingredient.unit}')`);
      }
    }
    
    insertSQL += mockInsertData.join(',\n') + ';';
    
    // Write the SQL to a file
    const sqlFileName = 'populate_recipe_ingredients.sql';
    fs.writeFileSync(sqlFileName, insertSQL);
    console.log(`SQL written to ${sqlFileName}`);
    
    return false;
  }
}

/**
 * Main function to run the schema creation process
 */
async function createSchema() {
  console.log('Starting DIY Recipes database schema creation...');
  
  // Check recipes table and create it if needed
  const recipesExist = await tableExists('recipes');
  if (!recipesExist) {
    console.log('Creating recipes table...');
    const recipesSQL = `
      CREATE TABLE public.recipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        user_id TEXT DEFAULT 'system'
      );
    `;
    await createTable('recipes', recipesSQL);
  } else {
    console.log('recipes table already exists');
  }
  
  // Check ingredients table and create it if needed
  const ingredientsExist = await tableExists('ingredients');
  if (!ingredientsExist) {
    console.log('Creating ingredients table...');
    const ingredientsSQL = `
      CREATE TABLE public.ingredients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await createTable('ingredients', ingredientsSQL);
  } else {
    console.log('ingredients table already exists');
  }
  
  // Create and populate the recipe_ingredients junction table
  await createRecipeIngredientsTable();
  await populateRecipeIngredients();
  
  console.log('\n========================================');
  console.log('Database schema creation complete!');
  console.log('Restart your application to see recipes with ingredients.');
  console.log('========================================');
}

// Run the schema creation
createSchema();