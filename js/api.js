import { supabaseClient } from './supabaseClient.js';

/**
 * Loads all recipes from the 'recipes' table.
 * @returns {Promise<Array>} A promise that resolves to an array of unique recipe objects, each containing its ingredients.
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
 * Loads all ingredients from the Ingredients table.
 * @returns {Array} Array of ingredients.
 */
export async function loadAllIngredients() {
  try {
    const { data, error } = await supabaseClient
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })
      .limit(1000); // Explicitly set limit to fetch all ingredients
    if (error) {
      console.error('Supabase error loading ingredients:', error);
      throw new Error(`Failed to load ingredients: ${error.message}`);
    }
    console.log('Fetched ingredients:', data); // Log fetched data
    console.log(`loadAllIngredients: Fetched ${data?.length || 0} ingredients. First few:`, data?.slice(0, 5).map(ing => ({ id: ing.id, name: ing.name }))); // Added detailed log
    return data || [];
  } catch (error) {
    console.error('Unexpected error in loadAllIngredients:', error);
    throw new Error(`Could not load ingredients. ${error.message}`);
  }
}

/**
 * Creates a new recipe with the provided name.
 * Inserts default values for ingredients, next_iteration, and suggestions.
 * @param {string} recipeName - Name of the new recipe.
 * @returns {object|null} The created recipe object, or null on error.
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
 * Adds a new global ingredient to the Ingredients table.
 * @param {string} newIngredientName - Name of the ingredient.
 * @returns {object|null} The created ingredient object, or null on error.
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
 * Removes a global ingredient from the Ingredients table.
 * @param {number} ingredientId - The ID of the ingredient to remove.
 * @returns {boolean} True if removed successfully.
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
 * Updates the ingredients for a specific recipe in the recipeingredients table.
 * Deletes existing entries and inserts new ones based on the provided list.
 * @param {string} recipeId - The UUID of the recipe to update.
 * @param {Array<object>} ingredients - Array of ingredient objects, each needing { id, quantity, unit, notes }. 'id' is the ingredient_id.
 * @returns {Promise<boolean>} True if successful, false otherwise.
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
 * Parses CSV data using Papa Parse.
 * @param {object} data - The data object from Papa Parse.
 * @returns {Array} Array of recipe objects.
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