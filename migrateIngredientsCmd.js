#!/usr/bin/env node

// migrateIngredientsCmd.js - Command line version of the migration script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the actual Supabase URL and the PUBLIC ANONYMOUS KEY
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mjk5MDAsImV4cCI6MjA1NzQwNTkwMH0.yYBWuD_bzfyh72URflGqJbn-lIwrZ6oAznxVocgxOm8';

// Initialize Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches all ingredients from the capitalized 'Ingredients' table
 * @returns {Promise<Array>} Array of ingredients from the capitalized table
 */
async function loadCapitalizedIngredients() {
  try {
    const { data, error } = await supabaseClient
      .from('Ingredients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error loading capitalized Ingredients:', error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} ingredients from capitalized 'Ingredients' table`);
    return data || [];
  } catch (error) {
    console.error('Error in loadCapitalizedIngredients:', error);
    return [];
  }
}

/**
 * Loads all ingredients from the lowercase 'ingredients' table
 * @returns {Array} Array of ingredients
 */
async function loadAllIngredients() {
  try {
    const { data, error } = await supabaseClient
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })
      .limit(1000); // Explicitly set limit to fetch all ingredients
    if (error) {
      console.error('Error loading ingredients:', error);
      return [];
    }
    console.log(`Fetched ${data?.length || 0} ingredients from lowercase 'ingredients' table`);
    return data || [];
  } catch (error) {
    console.error('Error loading ingredients:', error);
    return [];
  }
}

/**
 * Adds a new global ingredient to the lowercase 'ingredients' table
 * @param {string} newIngredientName - Name of the ingredient
 * @returns {object|null} The created ingredient object, or null on error
 */
async function addGlobalIngredient(newIngredientName) {
  try {
    const { data, error } = await supabaseClient
      .from('ingredients')
      .insert([{ name: newIngredientName }])
      .select();
    if (error) {
      console.error('Error adding global ingredient:', error);
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in addGlobalIngredient:', error);
    throw error;
  }
}

/**
 * Migrates ingredients from capitalized 'Ingredients' table to lowercase 'ingredients' table
 * Avoids creating duplicates by checking if ingredient name already exists
 */
async function migrateIngredients() {
  console.log('Starting ingredient migration...');
  
  // Step 1: Fetch all ingredients from both tables
  const capitalizedIngredients = await loadCapitalizedIngredients();
  const lowercaseIngredients = await loadAllIngredients();
  
  if (capitalizedIngredients.length === 0) {
    console.log('No ingredients found in capitalized Ingredients table. Nothing to migrate.');
    return;
  }
  
  console.log(`Found ${capitalizedIngredients.length} ingredients in capitalized 'Ingredients' table`);
  console.log(`Found ${lowercaseIngredients.length} ingredients in lowercase 'ingredients' table`);
  
  // Step 2: Create a set of existing ingredient names (case insensitive) for quick lookup
  const existingIngredientNames = new Set(
    lowercaseIngredients.map(ing => ing.name.toLowerCase())
  );
  
  // Step 3: Filter out ingredients that already exist in the lowercase table
  const ingredientsToMigrate = capitalizedIngredients.filter(
    ing => !existingIngredientNames.has(ing.name.toLowerCase())
  );
  
  console.log(`Found ${ingredientsToMigrate.length} ingredients to migrate`);
  
  // Step 4: Migrate each ingredient that doesn't already exist
  const migrationResults = {
    total: ingredientsToMigrate.length,
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const ingredient of ingredientsToMigrate) {
    try {
      console.log(`Migrating ingredient: ${ingredient.name}`);
      const newIngredient = await addGlobalIngredient(ingredient.name);
      
      if (newIngredient) {
        migrationResults.successful++;
        migrationResults.details.push({
          name: ingredient.name,
          status: 'success',
          newId: newIngredient.id
        });
        console.log(`Successfully migrated: ${ingredient.name} (ID: ${newIngredient.id})`);
      } else {
        migrationResults.failed++;
        migrationResults.details.push({
          name: ingredient.name,
          status: 'failed',
          error: 'Unknown error'
        });
        console.error(`Failed to migrate: ${ingredient.name}`);
      }
    } catch (error) {
      migrationResults.failed++;
      migrationResults.details.push({
        name: ingredient.name,
        status: 'failed',
        error: error.message
      });
      console.error(`Error migrating ingredient ${ingredient.name}:`, error);
    }
  }
  
  // Step 5: Log the final results
  console.log('\n--- Migration Results ---');
  console.log(`Total ingredients to migrate: ${migrationResults.total}`);
  console.log(`Successfully migrated: ${migrationResults.successful}`);
  console.log(`Failed to migrate: ${migrationResults.failed}`);
  
  if (migrationResults.details.length > 0) {
    console.log('\nDetailed Results:');
    migrationResults.details.forEach(detail => {
      console.log(`- ${detail.name}: ${detail.status}${detail.newId ? ` (New ID: ${detail.newId})` : ''}${detail.error ? ` (Error: ${detail.error})` : ''}`);
    });
  }
  
  return migrationResults;
}

// Execute the migration
migrateIngredients()
  .then(results => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });