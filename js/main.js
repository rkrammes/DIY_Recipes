// main.js

// Import necessary functions from ui.js
import { initUI, renderRecipes, renderIngredients } from './ui.js';
import { createClient } from '@supabase/supabase-js';

// Set up your Supabase client.
// Replace these placeholders with your actual Supabase URL and anon key.
const supabaseUrl = 'https://your-supabase-url';
const supabaseKey = 'your-anon-key';
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI components and event listeners.
  initUI();

  // Example: Load recipes from your Supabase table "All_Recipes"
  const { data: recipes, error: recipesError } = await supabaseClient
    .from('All_Recipes')
    .select('*');

  if (recipesError) {
    console.error('Error loading recipes:', recipesError);
  } else if (recipes) {
    renderRecipes(recipes);
  }

  // Optionally, load ingredients if your application requires it.
  const { data: ingredients, error: ingredientsError } = await supabaseClient
    .from('Ingredients')
    .select('*');

  if (ingredientsError) {
    console.error('Error loading ingredients:', ingredientsError);
  } else if (ingredients) {
    renderIngredients(ingredients);
  }
});