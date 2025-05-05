/**
 * Database Diagnostics Script
 * 
 * This script checks the Supabase database structure and reports any issues.
 * It will also offer to create missing tables and populate them with sample data.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { FALLBACK_RECIPES } = require('./src/lib/supabaseConfig');
const readline = require('readline');

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

// Interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Check if a table exists in the database
async function tableExists(tableName) {
  try {
    // This query will return an error if the table doesn't exist
    const { data, error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`Table "${tableName}" does not exist:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking table "${tableName}":`, error);
    return false;
  }
}

// Create recipes table
async function createRecipesTable() {
  // SQL for creating recipes table
  const sql = `
    CREATE TABLE IF NOT EXISTS recipes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_id UUID NOT NULL
    );
  `;
  
  try {
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      console.error('Error creating recipes table:', error);
      return false;
    }
    console.log('Recipes table created successfully');
    return true;
  } catch (error) {
    console.error('Exception creating recipes table:', error);
    return false;
  }
}

// Create ingredients table
async function createIngredientsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ingredients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      console.error('Error creating ingredients table:', error);
      return false;
    }
    console.log('Ingredients table created successfully');
    return true;
  } catch (error) {
    console.error('Exception creating ingredients table:', error);
    return false;
  }
}

// Create recipe_ingredients table
async function createRecipeIngredientsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
      quantity NUMERIC NOT NULL,
      unit TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      console.error('Error creating recipe_ingredients table:', error);
      return false;
    }
    console.log('Recipe_ingredients table created successfully');
    return true;
  } catch (error) {
    console.error('Exception creating recipe_ingredients table:', error);
    return false;
  }
}

// Create iterations table
async function createIterationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS iterations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      console.error('Error creating iterations table:', error);
      return false;
    }
    console.log('Iterations table created successfully');
    return true;
  } catch (error) {
    console.error('Exception creating iterations table:', error);
    return false;
  }
}

// Insert recipe data
async function insertRecipes() {
  // Use the fallback recipes as sample data
  for (const recipe of FALLBACK_RECIPES) {
    // Insert recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        created_at: recipe.created_at,
        user_id: recipe.user_id || '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single();
    
    if (recipeError) {
      console.error(`Error inserting recipe "${recipe.title}":`, recipeError);
      continue;
    }
    
    console.log(`Inserted recipe: ${recipe.title}`);
    
    // Insert ingredients first
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      for (const ing of recipe.ingredients) {
        // Insert ingredient
        const { data: ingData, error: ingError } = await supabase
          .from('ingredients')
          .insert({
            id: ing.id,
            name: ing.name,
            description: ing.description || null
          })
          .select()
          .single();
        
        if (ingError) {
          console.error(`Error inserting ingredient "${ing.name}":`, ingError);
          continue;
        }
        
        console.log(`Inserted ingredient: ${ing.name}`);
        
        // Insert recipe_ingredient junction
        const { error: riError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipe.id,
            ingredient_id: ing.id,
            quantity: ing.quantity || 0,
            unit: ing.unit || ''
          });
        
        if (riError) {
          console.error(`Error linking ingredient "${ing.name}" to recipe:`, riError);
        } else {
          console.log(`Linked ingredient "${ing.name}" to recipe "${recipe.title}"`);
        }
      }
    }
  }
}

// Main function to check database and take action
async function main() {
  console.log('Checking database structure...');
  
  // Check tables
  const recipesExists = await tableExists('recipes');
  const ingredientsExists = await tableExists('ingredients');
  const recipeIngredientsExists = await tableExists('recipe_ingredients');
  const iterationsExists = await tableExists('iterations');
  
  // Display status
  console.log('\nDatabase Status:');
  console.log(`- recipes table: ${recipesExists ? '✅ exists' : '❌ missing'}`);
  console.log(`- ingredients table: ${ingredientsExists ? '✅ exists' : '❌ missing'}`);
  console.log(`- recipe_ingredients table: ${recipeIngredientsExists ? '✅ exists' : '❌ missing'}`);
  console.log(`- iterations table: ${iterationsExists ? '✅ exists' : '❌ missing'}`);
  
  if (recipesExists && ingredientsExists && recipeIngredientsExists && iterationsExists) {
    console.log('\nAll required tables exist. Would you like to check for data? (y/n)');
    const checkData = await prompt('> ');
    
    if (checkData === 'y') {
      // Check for data in recipes table
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('count', { count: 'exact', head: true });
      
      if (recipesError) {
        console.error('Error counting recipes:', recipesError);
      } else {
        console.log(`\nFound ${recipesData.count} recipes in the database`);
        
        if (recipesData.count === 0) {
          console.log('Would you like to insert sample recipe data? (y/n)');
          const insertData = await prompt('> ');
          
          if (insertData === 'y') {
            await insertRecipes();
          }
        }
      }
    }
  } else {
    console.log('\nSome tables are missing. Would you like to create them? (y/n)');
    const createTables = await prompt('> ');
    
    if (createTables === 'y') {
      if (!recipesExists) await createRecipesTable();
      if (!ingredientsExists) await createIngredientsTable();
      if (!recipeIngredientsExists) await createRecipeIngredientsTable();
      if (!iterationsExists) await createIterationsTable();
      
      console.log('\nWould you like to insert sample recipe data? (y/n)');
      const insertData = await prompt('> ');
      
      if (insertData === 'y') {
        await insertRecipes();
      }
    }
  }
  
  console.log('\nDiagnostics completed.');
  rl.close();
}

// Start the script
main().catch(error => {
  console.error('Unhandled error:', error);
  rl.close();
  process.exit(1);
});