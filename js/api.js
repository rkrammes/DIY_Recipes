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
      console.error('Error loading recipes:', error);
      return [];
    }
    console.log('Fetched recipes:', recipes); // Log fetched data
    console.log('Filtering out duplicates by recipe id...');
    console.log('Raw recipes from Supabase before filtering:', JSON.stringify(recipes)); // Added log
    // Filter duplicates based on recipe id
    const uniqueRecipes = Array.from(new Map((recipes || []).map(item => [item.id, item])).values());
    console.log('Unique recipes (after filtering):', uniqueRecipes);
    return uniqueRecipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
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
      console.error('Error loading ingredients:', error);
      return [];
    }
    console.log('Fetched ingredients:', data); // Log fetched data
    console.log(`loadAllIngredients: Fetched ${data?.length || 0} ingredients. First few:`, data?.slice(0, 5).map(ing => ({ id: ing.id, name: ing.name }))); // Added detailed log
    return data || [];
  } catch (error) {
    console.error('Error loading ingredients:', error);
    return [];
  }
}

/**
 * Creates a new recipe with the provided name.
 * Inserts default values for ingredients, next_iteration, and suggestions.
 * @param {string} recipeName - Name of the new recipe.
 * @returns {object|null} The created recipe object, or null on error.
 */
export async function createNewRecipe(recipeName, ingredients) {
  try {
    console.log('createNewRecipe called with recipeName:', recipeName, 'ingredients:', ingredients);
    const recipeData = {
      title: recipeName, // Corrected column name from 'name' to 'title'
      instructions: "" // Added default empty string to satisfy NOT NULL constraint
    };
    // Removed next_iteration, suggestions, and ingredients assignment
    // as these columns don't exist or are handled differently.

    const { data, error } = await supabaseClient
      .from('recipes')
      .insert([ recipeData ])
      .select();

    if (error) {
      console.error('Error in createNewRecipe (Supabase insert):', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in createNewRecipe:', error);
    throw error;
  }
}

// Removed obsolete addNewIngredientToRecipe function

/**
 * Adds a new global ingredient to the Ingredients table.
 * @param {string} newIngredientName - Name of the ingredient.
 * @returns {object|null} The created ingredient object, or null on error.
 */
export async function addGlobalIngredient(newIngredientName) {
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
      console.error('Error removing global ingredient:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error in removeGlobalIngredient:', error);
    throw error;
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
  console.log(`Updating ingredients for recipe ${recipeId}:`, ingredients);
  try {
    // Step 1: Delete existing ingredients for this recipe
    const { error: deleteError } = await supabaseClient
      .from('recipeingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) {
      console.error('Error deleting old ingredients:', deleteError);
      throw deleteError; // Re-throw to be caught by the outer catch block
    }
    console.log(`Successfully deleted old ingredients for recipe ${recipeId}`);

    // Step 2: Insert new ingredients if there are any
    if (ingredients && ingredients.length > 0) {
      const ingredientsToInsert = ingredients.map(ing => ({
        recipe_id: recipeId,
        ingredient_id: ing.id, // The 'id' from the UI data is the ingredient_id
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes
      }));

      console.log(`Inserting new ingredients for recipe ${recipeId}:`, ingredientsToInsert);
      const { error: insertError } = await supabaseClient
        .from('recipeingredients')
        .insert(ingredientsToInsert);

      if (insertError) {
        console.error('Error inserting new ingredients:', insertError);
        throw insertError; // Re-throw
      }
      console.log(`Successfully inserted ${ingredientsToInsert.length} new ingredients for recipe ${recipeId}`);
    } else {
      console.log(`No new ingredients to insert for recipe ${recipeId}.`);
    }

    return true; // Indicate success
  } catch (error) {
    console.error(`Error in updateRecipeIngredients for recipe ${recipeId}:`, error);
    // Consider how to handle partial failures (e.g., delete succeeded, insert failed)
    // For now, just return false to indicate the overall operation failed.
    return false; // Indicate failure
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
  const ingredientsIndex = header.indexOf('ingredients');
  if (nameIndex === -1 || ingredientsIndex === -1) {
    alert('CSV must have at least "name" and "ingredients" columns.');
    return [];
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
              console.error('Error importing recipe:', error);
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