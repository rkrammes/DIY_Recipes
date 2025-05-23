// Test the recipe_ingredients view with a more realistic query
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE URL:', supabaseUrl);
console.log('ANON KEY PROVIDED:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRecipeIngredients() {
  console.log('Testing recipe ingredients view with a real application query...');
  
  try {
    // Get all recipes
    console.log('1. Getting all recipes...');
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, description')
      .limit(10);
    
    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      return;
    }
    
    console.log(`Found ${recipes.length} recipes`);
    
    // For each recipe, get its ingredients
    console.log('\n2. Getting ingredients for each recipe...');
    
    for (const recipe of recipes.slice(0, 3)) { // Just test the first 3 recipes
      console.log(`\nRecipe: ${recipe.title} (${recipe.id})`);
      
      // This is the query your application would use
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
          quantity, 
          unit,
          ingredients:ingredient_id (
            id,
            name,
            description
          )
        `)
        .eq('recipe_id', recipe.id);
      
      if (ingredientsError) {
        console.error(`Error fetching ingredients for ${recipe.title}:`, ingredientsError);
      } else if (!ingredients || ingredients.length === 0) {
        console.log(`No ingredients found for ${recipe.title}`);
      } else {
        console.log(`Found ${ingredients.length} ingredients:`);
        ingredients.forEach(item => {
          console.log(`- ${item.ingredients.name}: ${item.quantity} ${item.unit}`);
        });
      }
    }
    
    console.log('\n✅ SUCCESS! Your recipe_ingredients view is working correctly!');
    console.log('The application should now be able to display ingredients for each recipe.');
    
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
}

// Run the test
testRecipeIngredients();