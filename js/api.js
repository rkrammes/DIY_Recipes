import { supabaseClient } from './supabaseClient.js';
import {
  checkIngredientCompatibility,
  estimatePH,
  calculateShelfLife
} from './recipe-analysis.js';

/**
 * Loads all recipes from the 'recipes' table.
 *
 * Filters out duplicate recipes based on ID.
 *
 * @returns {Promise<Object[]>} Resolves with an array of unique recipe objects.
 * @throws {Error} If fetching recipes from Supabase fails.
 */
export async function loadRecipes() {
  try {
    const { data: recipes, error } = await supabaseClient
      .from('recipes')
      .select('*');
    if (error) {
      console.error('Supabase error loading recipes:', error);
      throw new Error(`Failed to load recipes: ${error.message}`);
    }
    console.log('Fetched recipes:', recipes); // Log fetched data
    console.log('Filtering out duplicates by recipe id...');
    console.log('Raw recipes from Supabase before filtering:', JSON.stringify(recipes)); // Added log
    // Filter duplicates based on recipe id
    const uniqueRecipes = Array.from(new Map((recipes || []).map(item => [item.id, item])).values());
    console.log('Unique recipes (after filtering):', uniqueRecipes);
    return uniqueRecipes;
  } catch (error) {
    console.error('Unexpected error in loadRecipes:', error);
    // Re-throw the original error or a new one wrapping it
    throw new Error(`Could not load recipes. ${error.message}`);
  }
}

/**
 * Loads all ingredients from the 'ingredients' table.
 *
 * @returns {Promise<Object[]>} Resolves with an array of ingredient objects (possibly empty).
 * @throws {Error} If fetching ingredients from Supabase fails.
 */
export async function loadAllIngredients() {
  try {
    // Try to fetch with ordering first
    try {
      console.log('Attempting to fetch ingredients with ordering');
      const { data, error } = await supabaseClient
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true })
        .limit(1000);
      
      if (!error) {
        console.log('Fetched ingredients with ordering:', data);
        console.log(`loadAllIngredients: Fetched ${data?.length || 0} ingredients with ordering. First few:`,
          data?.slice(0, 5).map(ing => ({ id: ing.id, name: ing.name })));
        
        // Sort the data manually just to be sure
        const sortedData = [...(data || [])].sort((a, b) =>
          (a.name || '').localeCompare(b.name || ''));
        
        return sortedData;
      }
    } catch (orderError) {
      console.warn('Error using order method, falling back to basic select:', orderError);
      // Fall through to basic select
    }
    
    // Fallback: basic select without ordering
    console.log('Falling back to basic select without ordering');
    const { data, error } = await supabaseClient
      .from('ingredients')
      .select('*');
    
    if (error) {
      console.error('Supabase error loading ingredients:', error);
      throw new Error(`Failed to load ingredients: ${error.message}`);
    }
    
    console.log('Fetched ingredients without ordering:', data);
    console.log(`loadAllIngredients: Fetched ${data?.length || 0} ingredients without ordering. First few:`,
      data?.slice(0, 5).map(ing => ({ id: ing.id, name: ing.name })));
    
    // Sort the data manually since we couldn't use .order()
    const sortedData = [...(data || [])].sort((a, b) =>
      (a.name || '').localeCompare(b.name || ''));
    
    return sortedData;
  } catch (error) {
    console.error('Unexpected error in loadAllIngredients:', error);
    throw new Error(`Could not load ingredients. ${error.message}`);
  }
}

/**
 * Creates a new recipe with the given name.
 *
 * Sets initial default values such as version number.
 *
 * @param {string} recipeName - Name of the new recipe.
 * @returns {Promise<Object|null>} Resolves with the created recipe object, or null if insertion failed.
 * @throws {Error} If recipe creation encounters an error.
 */
export async function createNewRecipe(recipeName) { // Removed ingredients parameter
  try {
    console.log('createNewRecipe called with recipeName:', recipeName);
    // Basic recipe data - other fields can be added/updated later via editing
    const recipeData = {
      title: recipeName,
      // Set defaults for potentially non-nullable fields if needed by your schema
      // e.g., description: '', instructions: '', version: 1
      version: 1 // Start at version 1
    };
    const { data, error } = await supabaseClient
      .from('recipes')
      .insert([ recipeData ])
      .select();

    if (error) {
      console.error('Supabase error creating new recipe:', error);
      throw new Error(`Failed to create recipe: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Unexpected error in createNewRecipe:', error);
    // Throw a new error for consistency, even if it was already thrown
    throw new Error(`Could not create new recipe. ${error.message}`);
  }
}

// Removed obsolete addNewIngredientToRecipe function

/**
 * Adds a new global ingredient to the 'ingredients' table.
 *
 * @param {string} newIngredientName - Name of the new ingredient.
 * @param {string|null} [description=null] - Optional description of the ingredient.
 * @returns {Promise<Object|null>} Resolves with the created ingredient object, or null if insertion failed.
 * @throws {Error} If insertion into Supabase fails.
 */
export async function addGlobalIngredient(newIngredientName, description = null) { // Added optional description
  try {
    const { data, error } = await supabaseClient
      .from('ingredients')
      .insert([{ name: newIngredientName, description: description }]) // Include description
      .select();
    if (error) {
      console.error('Supabase error adding global ingredient:', error);
      throw new Error(`Failed to add global ingredient: ${error.message}`);
    }
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Unexpected error in addGlobalIngredient:', error);
    throw new Error(`Could not add global ingredient. ${error.message}`);
  }
}

// Removed obsolete removeIngredientFromRecipe function

/**
 * Removes a global ingredient from the 'ingredients' table.
 *
 * @param {number} ingredientId - The ID of the ingredient to remove.
 * @returns {Promise<boolean>} Resolves with true if removed successfully.
 * @throws {Error} If deletion from Supabase fails.
 */
export async function removeGlobalIngredient(ingredientId) {
  try {
    const { error } = await supabaseClient
      .from('ingredients')
      .delete()
      .eq('id', ingredientId);
    if (error) {
      console.error('Supabase error removing global ingredient:', error);
      throw new Error(`Failed to remove global ingredient: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error('Unexpected error in removeGlobalIngredient:', error);
    throw new Error(`Could not remove global ingredient. ${error.message}`);
  }
}
/**
 * Updates the ingredients for a specific recipe in the 'recipeingredients' table.
 *
 * Deletes existing entries and inserts new ones based on the provided list.
 *
 * @param {string} recipeId - The UUID of the recipe to update.
 * @param {Array<{id: number, quantity: number, unit: string, notes: string}>} ingredients - Array of ingredient objects.
 * @returns {Promise<boolean>} Resolves with true if update succeeded.
 * @throws {Error} If any Supabase operation fails.
 */
export async function updateRecipeIngredients(recipeId, ingredients) {
  console.log(`Updating ingredients for recipe ${recipeId}`);
  console.log(`Ingredients data:`, JSON.stringify(ingredients, null, 2));
  
  if (!recipeId) {
    console.error('updateRecipeIngredients: Missing recipeId parameter');
    return false;
  }
  
  if (!ingredients || !Array.isArray(ingredients)) {
    console.error('updateRecipeIngredients: Invalid ingredients parameter', ingredients);
    return false;
  }
  
  try {
    // Step 1: Delete existing ingredients for this recipe
    console.log(`Step 1: Deleting existing ingredients for recipe ${recipeId}`);
    const { error: deleteError } = await supabaseClient
      .from('recipeingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) {
      console.error('Supabase error deleting old ingredients:', deleteError);
      throw new Error(`Failed to delete old ingredients: ${deleteError.message}`);
    }
    console.log(`Successfully deleted old ingredients for recipe ${recipeId}`);

    // Step 2: Insert new ingredients if there are any
    if (ingredients && ingredients.length > 0) {
      console.log(`Step 2: Preparing to insert ${ingredients.length} ingredients for recipe ${recipeId}`);
      
      // Validate each ingredient has required fields
      const validIngredients = ingredients.filter(ing => {
        if (!ing.id) {
          console.error('Missing ingredient_id for ingredient:', ing);
          return false;
        }
        return true;
      });
      
      console.log(`${validIngredients.length} of ${ingredients.length} ingredients are valid for insertion`);
      
      const ingredientsToInsert = validIngredients.map(ing => {
        const mappedIngredient = {
          recipe_id: recipeId,
          ingredient_id: ing.id, // The 'id' from the UI data is the ingredient_id
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        };
        console.log(`Mapped ingredient for insertion:`, mappedIngredient);
        return mappedIngredient;
      });

      console.log(`Inserting new ingredients for recipe ${recipeId}:`, JSON.stringify(ingredientsToInsert, null, 2));
      const { data: insertData, error: insertError } = await supabaseClient
        .from('recipeingredients')
        .insert(ingredientsToInsert)
        .select();

      if (insertError) {
        console.error('Supabase error inserting new ingredients:', insertError);
        throw new Error(`Failed to insert new ingredients: ${insertError.message}`);
      }
      console.log(`Successfully inserted ${ingredientsToInsert.length} new ingredients for recipe ${recipeId}`);
      console.log(`Insert response data:`, insertData);
    } else {
      console.log(`No new ingredients to insert for recipe ${recipeId}.`);
    }

    return true; // Indicate success
  } catch (error) {
    console.error(`Error during updateRecipeIngredients for recipe ${recipeId}:`, error);
    // Throw a consolidated error message
    throw new Error(`Failed to update ingredients for recipe ${recipeId}. ${error.message}`);
  }
}


/**
 * Parses CSV data using Papa Parse format.
 *
 * @param {object} data - The data object returned by Papa Parse, containing `.data` as rows.
 * @returns {Array<Object>} Array of parsed recipe objects.
 */
export function parseCSVData(data) {
  const rows = data.data;
  if (rows.length < 2) return [];
  const header = rows[0].map((col) => col.trim());
  const nameIndex = header.indexOf('name');
  const ingredientsIndex = header.indexOf('ingredients'); // Keep 'name' for now, but 'title' is used in DB
  if (nameIndex === -1 || ingredientsIndex === -1) { // Check for 'name' column for compatibility
    throw new Error('CSV parsing error: CSV must have at least "name" and "ingredients" columns.');
  }
  const recipeArray = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    const recipe = {
      name: row[nameIndex],
      ingredients: JSON.parse(row[ingredientsIndex] || '[]'),
    };
    recipeArray.push(recipe);
  }
  return recipeArray;
}

/**
 * Imports recipes from a CSV file.
 * @param {File} file - The CSV file to import.
 * @returns {Promise} Resolves to true when complete.
 */
export async function importCSVFile(file) {
    const requiredColumns = ['name', 'ingredients'];
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: async function (results) {
        try {
          const recipes = parseCSVData(results);
          for (const recipe of recipes) {
            const { data, error } = await supabaseClient
              .from('recipes') // Corrected table name
              .insert([{
                name: recipe.name,
                ingredients: recipe.ingredients,
                next_iteration: "",
                suggestions: [] 
              }])
              .select();
            if (error) {
              console.error(`Error importing recipe "${recipe.name}":`, error);
              // Stop import on first error and reject the promise
              reject(new Error(`Failed to import recipe "${recipe.name}": ${error.message}`));
              return; // Exit the loop and function
            }
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      },
      header: false,
    });
  });
}

/* ================================
   Phase 1 Data Model Enhancements
   ================================ */

// Batch Record schema example
export function createBatchRecord({
  batchId,
  recipeId,
  createdAt = new Date().toISOString(),
  size,
  notes = '',
  results = {}
}) {
  return {
    batch_id: batchId,
    recipe_id: recipeId,
    created_at: createdAt,
    size,
    notes,
    results
  };
}

// Ingredient substitution map structure
export function createSubstitutionMap(substitutions = {}) {
  // substitutions: { 'ingredient_id': ['sub_id1', 'sub_id2'] }
  return substitutions;
}

// Cost calculation structure
export function createCostStructure({
  ingredientCosts = {}, // { ingredient_id: { costPerUnit, unit } }
  totalCost = 0,
  breakdown = {}
}) {
  return {
    ingredientCosts,
    totalCost,
    breakdown
  };
}

// Version tracking helpers
export function incrementRecipeVersion(recipe) {
  recipe.version = (recipe.version || 1) + 1;
  return recipe.version;
}

/* ================================
   Phase 1 API Stubs
   ================================ */

// Save batch record (stub)
export async function saveBatchRecord(batchRecord) {
  console.log('Saving batch record:', batchRecord);
  // TODO: Implement Supabase insert to 'batches' table
  return true;
}

// Fetch batch records for a recipe (stub)
export async function fetchBatchRecords(recipeId) {
  console.log('Fetching batch records for recipe:', recipeId);
  // TODO: Implement Supabase query from 'batches' table
  return [];
}

// Save substitution map (stub)
export async function saveSubstitutionMap(recipeId, substitutionMap) {
  console.log('Saving substitution map for recipe:', recipeId, substitutionMap);
  // TODO: Implement Supabase update to 'recipes' or separate table
  return true;
}

// Fetch substitution map (stub)
export async function fetchSubstitutionMap(recipeId) {
  console.log('Fetching substitution map for recipe:', recipeId);
  // TODO: Implement Supabase fetch
  return {};
}

// Calculate cost (stub)
export function calculateRecipeCost(recipe, ingredientPrices) {
  console.log('Calculating cost for recipe:', recipe, ingredientPrices);
  // TODO: Implement actual calculation
  return createCostStructure({});
}

/* ================================
   Phase 3: Advanced Analysis API
   ================================ */

// Analyze ingredient compatibility and pH
export function analyzeIngredients(recipe) {
  const compatible = checkIngredientCompatibility(recipe.ingredients);
  const pH = estimatePH(recipe.ingredients);
  return { compatible, pH };
}

// Get recipe timeline as list of steps
export function getRecipeTimeline(recipe) {
  return recipe.steps?.map((step, idx) => ({
    stepNumber: idx + 1,
    description: step.description,
    duration: step.duration || null
  })) || [];
}

// Get batch history (placeholder, assumes recipe.batches)
export function getBatchHistory(recipe) {
  return recipe.batches || [];
}

// Estimate shelf-life based on ingredients
export function estimateShelfLife(recipe) {
  return calculateShelfLife(recipe.ingredients);
}