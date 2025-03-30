import { initUI, renderRecipes, renderIngredients } from './ui.js';
import { supabaseClient } from './supabaseClient.js';

async function loadRecipes() {
  const response = await supabaseClient.from('Recipes').select('*');
  console.log("Recipes full response:", response);
  return response;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize UI.
    initUI();

    // Load recipes.
    const recipesResponse = await loadRecipes();
    console.log("Recipes full response:", recipesResponse);
    const { data: recipes, error: recipesError } = recipesResponse;
    if (recipesError) {
      console.error('Error loading recipes:', recipesError);
    } else if (recipes && recipes.length > 0) {
      renderRecipes(recipes);
    } else {
      console.log('No recipes found.');
    }

    // Load ingredients.
    const ingredientsResponse = await supabaseClient.from('Ingredients').select('*');
    console.log("Ingredients full response:", ingredientsResponse);
    const { data: ingredients, error: ingredientsError } = ingredientsResponse;
    if (ingredientsError) {
      console.error('Error loading ingredients:', ingredientsError);
    } else if (ingredients && ingredients.length > 0) {
      renderIngredients(ingredients);
    } else {
      console.log('No ingredients found.');
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
});