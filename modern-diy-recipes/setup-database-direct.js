#!/usr/bin/env node

/**
 * Direct Database Setup Script for DIY Recipes
 * 
 * This script creates the necessary tables and relationships for the DIY Recipes application
 * using the Supabase JavaScript client directly.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file if available
dotenv.config();

// Get Supabase credentials from environment or use defaults
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYzMzE0NDgsImV4cCI6MjAwMTkwNzQ0OH0.5WEj3NB1pC7KgqiSZuWEwXXEpK9NrUQcCJNJiXHf5Y0';

// Path to SQL script
const SQL_SCRIPT_PATH = path.join(__dirname, 'supabase-setup.sql');

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Load the SQL script
const sqlScript = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');

async function setupDatabase() {
  console.log('Setting up DIY Recipes database tables...');
  console.log(`Using Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Execute the SQL script for table creation and data import
    const { data, error } = await supabase.rpc('exec_sql', { query: sqlScript });
    
    if (error) {
      console.error('Error executing SQL script:', error);
      
      // Fall back to individual statements if RPC method fails
      console.log('Falling back to checking and creating individual tables...');
      
      // Check if recipes table exists
      const { error: recipesError } = await supabase
        .from('recipes')
        .select('count(*)', { count: 'exact', head: true });
      
      if (recipesError && recipesError.message.includes('relation "recipes" does not exist')) {
        console.log('Creating recipes table...');
        await supabase.rpc('exec_sql', {
          query: `
            CREATE TABLE public.recipes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title TEXT NOT NULL,
              description TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              user_id TEXT DEFAULT 'system'
            );
            
            CREATE INDEX idx_recipes_title ON public.recipes(title);
          `
        });
      }
      
      // Check if ingredients table exists
      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .select('count(*)', { count: 'exact', head: true });
      
      if (ingredientsError && ingredientsError.message.includes('relation "ingredients" does not exist')) {
        console.log('Creating ingredients table...');
        await supabase.rpc('exec_sql', {
          query: `
            CREATE TABLE public.ingredients (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              description TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE UNIQUE INDEX idx_ingredients_name ON public.ingredients(name);
          `
        });
      }
      
      // Check if recipe_ingredients junction table exists
      const { error: junctionError } = await supabase
        .from('recipe_ingredients')
        .select('count(*)', { count: 'exact', head: true });
      
      if (junctionError && junctionError.message.includes('relation "recipe_ingredients" does not exist')) {
        console.log('Creating recipe_ingredients junction table...');
        await supabase.rpc('exec_sql', {
          query: `
            CREATE TABLE public.recipe_ingredients (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
              ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
              quantity TEXT,
              unit TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX idx_recipe_ingredients ON public.recipe_ingredients(recipe_id, ingredient_id);
          `
        });
      }
      
      // Check if recipes table has data
      const { data: recipesCount, error: countError } = await supabase
        .from('recipes')
        .select('count(*)', { count: 'exact', head: true });
      
      // If no recipes, insert sample data
      if (!countError && recipesCount && recipesCount.count === 0) {
        console.log('Inserting sample recipe data...');
        
        // Direct SQL approach for sample data since you provided a full script
        await supabase.rpc('exec_sql', {
          query: `
          -- Insert sample recipes
          INSERT INTO public.recipes (id, title, description) VALUES
              (gen_random_uuid(), 'Beard Oil', 'A nourishing beard oil to soften and condition facial hair'),
              (gen_random_uuid(), 'Beard Balm', 'A styling balm that helps shape and condition beards'),
              (gen_random_uuid(), 'Mustache Wax', 'Extra-hold wax for styling mustaches'),
              (gen_random_uuid(), 'Foaming Hand Soap', 'Gentle foaming soap for everyday handwashing'),
              (gen_random_uuid(), 'Hand Cream', 'Rich moisturizing cream for dry hands'),
              (gen_random_uuid(), 'Hair Rinse', 'A clarifying rinse to remove buildup and add shine');
          
          -- Insert ingredients
          INSERT INTO public.ingredients (id, name, description) VALUES
              (gen_random_uuid(), 'Jojoba Oil', 'Lightweight moisturizing oil similar to skin''s natural sebum'),
              (gen_random_uuid(), 'Essential Oils', 'Concentrated plant extracts for fragrance and benefits'),
              (gen_random_uuid(), 'Beeswax', 'Natural wax that provides structure and hold'),
              (gen_random_uuid(), 'Unrefined Shea Butter', 'Rich moisturizer with natural vitamins'),
              (gen_random_uuid(), 'Cocoa Butter', 'Emollient that melts at body temperature'),
              (gen_random_uuid(), 'Unrefined Mango Butter', 'Soft butter with good moisturizing properties'),
              (gen_random_uuid(), 'Lanolin', 'Natural wax from sheep''s wool that conditions skin'),
              (gen_random_uuid(), 'Arrowroot Powder', 'Natural starch that helps reduce greasiness'),
              (gen_random_uuid(), 'Coconut Oil', 'Moisturizing oil that adds shine'),
              (gen_random_uuid(), 'Unscented Castile Soap', 'Plant-based soap concentrate'),
              (gen_random_uuid(), 'Water', 'Purified water for diluting'),
              (gen_random_uuid(), 'Sweet Almond Oil', 'Light, moisturizing carrier oil'),
              (gen_random_uuid(), 'Almond Oil', 'Nourishing oil rich in vitamin E'),
              (gen_random_uuid(), 'Apple Cider Vinegar', 'Fermented apple juice that balances pH')
          ON CONFLICT (name) DO NOTHING;
          `
        });
        
        // Now handle the recipe-ingredient relationships with JavaScript
        // Get recipe IDs
        const { data: recipes } = await supabase
          .from('recipes')
          .select('id, title');
        
        // Get ingredient IDs
        const { data: ingredients } = await supabase
          .from('ingredients')
          .select('id, name');
        
        if (recipes && ingredients) {
          console.log('Creating recipe-ingredient relationships...');
          
          // Create a mapping for easy lookups
          const recipeMap = {};
          recipes.forEach(recipe => {
            recipeMap[recipe.title] = recipe.id;
          });
          
          const ingredientMap = {};
          ingredients.forEach(ingredient => {
            ingredientMap[ingredient.name] = ingredient.id;
          });
          
          // Define relationships from your SQL script
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
          
          // Insert relationships
          for (const rel of relationships) {
            const recipeId = recipeMap[rel.recipe];
            const ingredientId = ingredientMap[rel.ingredient];
            
            if (recipeId && ingredientId) {
              const { data, error } = await supabase
                .from('recipe_ingredients')
                .insert({
                  recipe_id: recipeId,
                  ingredient_id: ingredientId,
                  quantity: rel.quantity,
                  unit: rel.unit
                });
              
              if (error) console.error(`Error inserting relationship for ${rel.recipe} + ${rel.ingredient}:`, error);
            } else {
              console.warn(`Could not find recipe "${rel.recipe}" or ingredient "${rel.ingredient}"`);
            }
          }
        }
      }
    } else {
      console.log('SQL script executed successfully!');
    }
    
    // Verify tables were created
    const tables = ['recipes', 'ingredients', 'recipe_ingredients'];
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error checking table ${table}:`, error);
      } else {
        console.log(`Table ${table} exists and has ${count} rows`);
      }
    }
    
    console.log('\nDatabase setup complete!');
    console.log('Your recipes should now display with ingredients when you restart the app.');
    
  } catch (err) {
    console.error('Unexpected error during database setup:', err);
  }
}

// Run the function
setupDatabase();