// main.js
import { initAuth } from './auth.js';
import { initUI } from './ui.js';
import { loadRecipes, loadAllIngredients } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  initAuth();
  initUI();
  
  // Load initial data from Supabase.
  const recipes = await loadRecipes();
  const ingredients = await loadAllIngredients();
  // Render data (ui.js exports renderRecipes and renderIngredients).
  import('./ui.js').then(module => {
    module.renderRecipes(recipes);
    module.renderIngredients(ingredients);
  });
});