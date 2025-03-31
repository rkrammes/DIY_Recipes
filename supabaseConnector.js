/**
 * File: supabaseConnector.js
 * Project: Symbolkraft DIY Recipes Web App
 *
 * Description:
 *   This module facilitates communication with the Supabase backend.
 *   It is responsible for connecting to the Supabase database and providing functions
 *   to store, update, and retrieve data (such as recipes and ingredients).
 *
 * Big Picture:
 *   - Acts as the interface between the application and the Supabase database.
 *   - Ensures that structured data from modules like csvImporter.js is correctly stored.
 *   - Supports data retrieval for display on the front-end.
 *
 * Related Modules:
 *   - csvImporter.js: Supplies parsed CSV data for storage.
 *   - index.js: Utilizes this module to persist data in the backend.
 *
 * NOTE for ChatGPT & Developers:
 *   This module encapsulates all database interactions. Any changes to the Supabase data schema
 *   should be reflected in this module.
 *
 * Instructions for Integration:
 *   1. Copy and paste this file into your project as "supabaseConnector.js".
 *   2. Verify that your Supabase credentials are correctly set via environment variables.
 *   3. Test the provided functions to ensure data is correctly stored and retrieved.
 *   4. Commit the changes to your GitHub repository.
 *
 * Version: v1.0 | Last Updated: 2025-03-16
 * Author: [Your Name]
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_KEY);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Supabase credentials are not set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Stores an array of data objects into the Supabase database.
 *
 * @param {Array<Object>} data - An array of objects representing recipes or ingredients.
 * @returns {Promise<Object>} - A promise that resolves to the database response.
 *
 * Big Picture:
 *   This function takes structured data (for example, from csvImporter.js) and inserts it into the Supabase database.
 *   It ensures that all data is persisted for later retrieval and use in the application.
 */
async function storeData(data, ingredients) {
  try {
    // Insert the recipe data first
    console.log('Inserting into recipes table:', data);
    const { data: insertedData, error: recipeError } = await supabase
      .from('recipes')
      .insert(data)
    
    if (recipeError) {
      console.error('Error storing recipe data in Supabase:', recipeError);
      throw recipeError;
    }
// Insert the ingredients data into the recipeingredients table
const recipeId = insertedData[0].id;
const recipeIngredientsData = ingredients.filter(ingredient => ingredient.id).map(ingredient => ({
  recipe_id: recipeId,
  ingredient_id: ingredient.id,
  quantity: ingredient.quantity,
  unit: ingredient.unit,
  notes: ingredient.notes
}));
console.log('Inserting into recipeingredients table:', recipeIngredientsData);


    const { error: ingredientsError } = await supabase
      .from('recipeingredients')
      .insert(recipeIngredientsData);

    if (ingredientsError) {
      console.error('Error storing ingredients data in Supabase:', ingredientsError);
      throw ingredientsError;
    }

    return insertedData;
  } catch (error) {
    console.error('storeData error:', error);
    throw new Error('Failed to store data in Supabase.');
  }
}

/**
 * Retrieves data from the Supabase database.
 *
 * @param {string} table - The name of the table to retrieve data from.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of data objects.
 *
 * Big Picture:
 *   This function retrieves data from a specified table, allowing the application to display stored recipes or ingredients.
 */
async function getData(table) {
  try {
    const { data: retrievedData, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) {
      console.error('Error retrieving data from Supabase:', error);
      throw error;
    }
    
    return retrievedData;
  } catch (error) {
    console.error('getData error:', error);
    throw new Error('Failed to retrieve data from Supabase.');
  }
}

// Export the database interaction functions for use in other modules.
module.exports = {
  storeData,
  getData,
};
