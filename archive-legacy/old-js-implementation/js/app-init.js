import { initAuthUI, updateAuthButton, setEditModeFields } from './auth-ui.js';
import { initRecipeListUI, renderRecipes } from './recipe-list-ui.js';
import { initGlobalIngredientUI, renderGlobalIngredients } from './global-ingredient-ui.js';
import { initIterationUI } from './iteration-ui.js';
import { supabaseClient } from './supabaseClient.js';
import { loadRecipes, loadAllIngredients } from './api.js';

/**
 * Global UI state
 */
window.isLoggedIn = false;
window.recipesCache = [];
window.currentRecipe = null;

/**
 * Initialize the entire UI.
 */
export async function initUI() {
  console.log('Initializing DIY Recipes UI...');

  initAuthUI();
  initRecipeListUI();
  initGlobalIngredientUI();
  initIterationUI();

  await reloadData();

  updateAuthButton();
  setEditModeFields();
}

/**
 * Reload recipes and ingredients from backend.
 */
export async function reloadData() {
  try {
    const [recipes, ingredients] = await Promise.all([
      loadRecipes(),
      loadAllIngredients()
    ]);

    window.recipesCache = recipes || [];
    window.allIngredients = ingredients || [];

    renderRecipes(window.recipesCache);
    renderGlobalIngredients(window.allIngredients);
  } catch (err) {
    console.error('Error reloading data:', err);
  }
}