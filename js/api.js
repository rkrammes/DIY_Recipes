import ApiClient from './api-client.js';
import ErrorHandler from './error-handler.js';
import { handleApiResponse } from './response-handler.js';
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
  const recipes = await handleApiResponse(
    ApiClient.recipes.getAll(),
    (data) => {
      console.log('Fetched recipes:', data);
    },
    (error) => {
      console.warn('Failed to load recipes:', error);
    }
  );

  console.log('Filtering out duplicates by recipe id...');
  console.log('Raw recipes from API before filtering:', JSON.stringify(recipes));

  const uniqueRecipes = Array.from(new Map((recipes || []).map(item => [item.id, item])).values());

  console.log('Unique recipes (after filtering):', uniqueRecipes);

  return uniqueRecipes;
}

/**
 * Loads all ingredients from the 'ingredients' table.
 *
 * @returns {Promise<Object[]>} Resolves with an array of ingredient objects (possibly empty).
 * @throws {Error} If fetching ingredients from Supabase fails.
 */
export async function loadAllIngredients() {
  const ingredients = await handleApiResponse(
    ApiClient.ingredients.getAll(),
    (data) => {
      console.log('Fetched ingredients:', data);
    },
    (error) => {
      console.warn('Failed to load ingredients:', error);
    }
  );

  const sortedData = [...(ingredients || [])]
    .filter(item => item && typeof item === 'object') // Filter out null/undefined values
    .sort((a, b) =>
      ((a && a.name) || '').localeCompare((b && b.name) || '')
    );

  console.log('Sorted ingredients:', sortedData);

  return sortedData;
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
export async function createNewRecipe(recipeName) {
  const recipeData = {
    title: recipeName,
    version: 1
  };

  const result = await handleApiResponse(
    ApiClient.recipes.create(recipeData),
    (data) => {
      console.log('Created recipe:', data);
    },
    (error) => {
      console.warn('Failed to create recipe:', error);
    }
  );

  if (result && result.length > 0) {
    return result[0];
  }
  return null;
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
export async function addGlobalIngredient(newIngredientName, description = null) {
  const ingredientData = {
    name: newIngredientName,
    description: description
  };

  const result = await handleApiResponse(
    ApiClient.ingredients.create(ingredientData),
    (data) => {
      console.log('Added ingredient:', data);
    },
    (error) => {
      console.warn('Failed to add ingredient:', error);
    }
  );

  if (result && result.length > 0) {
    return result[0];
  }
  return null;
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
  const result = await handleApiResponse(
    ApiClient.ingredients.delete(ingredientId),
    () => {
      console.log(`Removed ingredient ${ingredientId}`);
    },
    (error) => {
      console.warn('Failed to remove ingredient:', error);
    }
  );

  return result === true;
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
    // Use the centralized ApiClient instead of direct supabaseClient access
    const { data, error } = await ApiClient.recipeIngredients.update(recipeId, ingredients);
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully updated ingredients for recipe ${recipeId}`);
    return true; // Indicate success
  } catch (error) {
    ErrorHandler.logError(error, { component: 'updateRecipeIngredients', recipeId });
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
              ErrorHandler.handleApiError(error, `Failed to import recipe "${recipe.name}".`);
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