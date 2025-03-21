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
    } else if (recipes) {
      renderRecipes(recipes);
    }

    // Load ingredients.
    const { data: ingredients, error: ingredientsError } = await supabaseClient
      .from('Ingredients')
      .select('*');
    if (ingredientsError) {
      console.error('Error loading ingredients:', ingredientsError);
    } else if (ingredients) {
      renderIngredients(ingredients);
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
});