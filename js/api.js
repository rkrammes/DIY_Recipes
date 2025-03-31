// api.js
import { supabaseClient } from './supabaseClient.js';

/**
 * Loads all recipes from the All_Recipes table.
 * @returns {Array} Array of recipes.
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
    return recipes || [];
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
      .from('Ingredients')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('Error loading ingredients:', error);
      return [];
    }
    console.log('Fetched ingredients:', data); // Log fetched data
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
export async function createNewRecipe(recipeName) {
  try {
    const { data, error } = await supabaseClient
      .from('recipes') // Corrected table name
      .insert([{
         name: recipeName,
         ingredients: [{ name: '', quantity: '', unit: '', notes: '' }],
         next_iteration: "", 
         suggestions: [] 
      }])
      .select();
    if (error) {
      console.error('Error creating new recipe:', error);
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in createNewRecipe:', error);
    throw error;
  }
}

/**
 * Adds a new ingredient to an existing recipe.
 * @param {object} recipe - The recipe object to update.
 * @param {object} ingredient - The ingredient object to add.
 * @returns {object} The updated recipe object.
 */
export async function addNewIngredientToRecipe(recipe, ingredient) {
  try {
    if (!recipe.ingredients) recipe.ingredients = [];
    console.log('Adding ingredient:', ingredient); // Log the ingredient being added
    recipe.ingredients.push(ingredient);
    const { error } = await supabaseClient
      .from('recipes') // Corrected table name
      .update({ ingredients: recipe.ingredients })
      .eq('id', recipe.id);
    if (error) {
      console.error('Error adding ingredient to recipe:', error);
      throw error;
    }
    return recipe;
  } catch (error) {
    console.error('Error in addNewIngredientToRecipe:', error);
    throw error;
  }
}

/**
 * Adds a new global ingredient to the Ingredients table.
 * @param {string} newIngredientName - Name of the ingredient.
 * @returns {object|null} The created ingredient object, or null on error.
 */
export async function addGlobalIngredient(newIngredientName) {
  try {
    const { data, error } = await supabaseClient
      .from('Ingredients')
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
 * Removes an ingredient from a recipe.
 * @param {object} recipe - The recipe object to update.
 * @param {number} ingredientIndex - The index of the ingredient to remove.
 * @returns {object} The updated recipe object.
 */
export async function removeIngredientFromRecipe(recipe, ingredientIndex) {
  try {
    recipe.ingredients.splice(ingredientIndex, 1);
    const { error } = await supabaseClient
      .from('recipes')
      .update({ ingredients: recipe.ingredients })
      .eq('id', recipe.id);
    if (error) {
      console.error('Error removing ingredient from recipe:', error);
      throw error;
    }
    return recipe;
  } catch (error) {
    console.error('Error in removeIngredientFromRecipe:', error);
    throw error;
  }
}

/**
 * Removes a global ingredient from the Ingredients table.
 * @param {number} ingredientId - The ID of the ingredient to remove.
 * @returns {boolean} True if removed successfully.
 */
export async function removeGlobalIngredient(ingredientId) {
  try {
    const { error } = await supabaseClient
      .from('Ingredients')
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