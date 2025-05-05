/**
 * Test Local API Script
 * 
 * This script tests the local API endpoints and verifies that ingredients
 * are properly associated with recipes.
 */

const fetch = require('node-fetch');
const { FALLBACK_RECIPES } = require('./src/lib/supabaseConfig');

// API base URL
const API_BASE_URL = 'http://localhost:3005';

// Helper function to make API requests
async function fetchApi(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Test that the API is running
async function testApiStatus() {
  console.log('Testing API status...');
  const status = await fetchApi('/api/status');
  if (status) {
    console.log('✅ API is running:', status);
    return true;
  } else {
    console.log('❌ API is not running or returned an error');
    return false;
  }
}

// Test getting all recipes
async function testGetRecipes() {
  console.log('\nTesting GET /api/recipes...');
  const recipes = await fetchApi('/api/recipes');
  if (recipes && Array.isArray(recipes)) {
    console.log(`✅ Got ${recipes.length} recipes`);
    
    // Print recipe titles
    recipes.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.title} (ID: ${recipe.id.substring(0, 8)}...)`);
    });
    
    return recipes;
  } else {
    console.log('❌ Failed to get recipes or response is not an array');
    return [];
  }
}

// Test getting a specific recipe
async function testGetRecipe(recipeId) {
  console.log(`\nTesting GET /api/recipes/${recipeId}...`);
  const recipe = await fetchApi(`/api/recipes/${recipeId}`);
  if (recipe) {
    console.log(`✅ Got recipe: ${recipe.title}`);
    console.log(`  - Description: ${recipe.description || 'N/A'}`);
    console.log(`  - Created: ${new Date(recipe.created_at).toLocaleString()}`);
    
    // Check if recipe has ingredients
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      console.log(`  - Ingredients: ${recipe.ingredients.length}`);
      
      // Print ingredient details
      recipe.ingredients.forEach((ing, index) => {
        console.log(`    ${index + 1}. ${ing.name}: ${ing.quantity} ${ing.unit}`);
      });
    } else {
      console.log('  - Ingredients: None');
    }
    
    return recipe;
  } else {
    console.log(`❌ Failed to get recipe with ID ${recipeId}`);
    return null;
  }
}

// Test getting ingredients for a recipe
async function testGetRecipeIngredients(recipeId) {
  console.log(`\nTesting GET /api/recipes/${recipeId}/ingredients...`);
  const ingredients = await fetchApi(`/api/recipes/${recipeId}/ingredients`);
  if (ingredients && Array.isArray(ingredients)) {
    console.log(`✅ Got ${ingredients.length} ingredients for recipe`);
    
    // Print ingredient details
    ingredients.forEach((ing, index) => {
      console.log(`  ${index + 1}. ID: ${ing.id.substring(0, 8)}..., Quantity: ${ing.quantity} ${ing.unit}`);
    });
    
    return ingredients;
  } else {
    console.log(`❌ Failed to get ingredients for recipe with ID ${recipeId}`);
    return [];
  }
}

// Main function to run all tests
async function main() {
  console.log('===== LOCAL API TEST =====');
  
  // Check if API is running
  const apiRunning = await testApiStatus();
  if (!apiRunning) {
    console.error('\n❌ API is not running. Start it with: node recipe-api-server.js');
    return;
  }
  
  // Get all recipes
  const recipes = await testGetRecipes();
  if (recipes.length === 0) {
    console.error('\n❌ No recipes found. Make sure the API server is configured correctly.');
    return;
  }
  
  // Test a few individual recipes
  console.log('\nTesting individual recipes:');
  
  // Use the first recipe from the list
  const firstRecipeId = recipes[0].id;
  await testGetRecipe(firstRecipeId);
  await testGetRecipeIngredients(firstRecipeId);
  
  // Use a recipe ID from the fallback recipes if available
  if (FALLBACK_RECIPES.length > 0) {
    const fallbackRecipeId = FALLBACK_RECIPES[0].id;
    await testGetRecipe(fallbackRecipeId);
    await testGetRecipeIngredients(fallbackRecipeId);
  }
  
  console.log('\n✅ API tests completed.');
}

// Run the tests
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});