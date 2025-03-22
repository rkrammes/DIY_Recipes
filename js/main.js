// main.js
import { initUI, renderRecipes, renderIngredients } from './ui.js';
import { supabaseClient } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize UI.
    initUI();

    // Load recipes.
    const { data: recipes, error: recipesError } = await supabaseClient
      .from('All_Recipes')
      .select('*');
    if (recipesError) {
      console.error('Error loading recipes:', recipesError);
    } else if (recipes && recipes.length > 0) {
      renderRecipes(recipes);
    } else {
      console.log('No recipes found.');
    }

    // Load ingredients.
    const { data: ingredients, error: ingredientsError } = await supabaseClient
      .from('Ingredients')
      .select('*');
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