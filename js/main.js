// main.js
import { initAuth } from './auth.js';
import { initUI } from './ui.js';
import { loadRecipes, loadAllIngredients } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize authentication mechanisms and listen for auth changes.
  initAuth();

  // Set up UI event listeners, theme handling, and other DOM interactions.
  initUI();

  // Load initial data from your backend (recipes and ingredients).
  await loadRecipes();
  await loadAllIngredients();
});
