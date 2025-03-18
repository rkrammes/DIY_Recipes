// main.js
import { initAuth } from './auth.js';
import { initUI, renderRecipes, renderIngredients } from './ui.js';
import { loadRecipes, loadAllIngredients } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize authentication mechanisms and UI event listeners.
  initAuth();
  initUI();

  // Load data from Supabase.
  const recipes = await loadRecipes();
  const ingredients = await loadAllIngredients();

  // Render the data into the UI.
  renderRecipes(recipes);
  renderIngredients(ingredients);
});
