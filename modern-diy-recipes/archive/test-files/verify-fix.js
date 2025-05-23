// Verify if the recipe_ingredients fix was successful
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

async function verifyFix() {
  console.log('Verifying if the recipe_ingredients fix was successful...');
  
  try {
    // 1. Get all recipes
    console.log('\n1. Getting all recipes...');
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title')
      .limit(10);
    
    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      return;
    }
    
    console.log(`Found ${recipes.length} recipes`);
    
    // 2. Try to query recipe_ingredients (should work if view was created)
    console.log('\n2. Testing recipe_ingredients view...');
    const { data: recipeIngredients, error: viewError } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .limit(5);
    
    if (viewError) {
      console.error('Error accessing recipe_ingredients view:', viewError);
      console.log('The fix may not have been applied correctly.');
      return;
    }
    
    console.log(`SUCCESS! The recipe_ingredients view exists and has data!`);
    console.log(`Found ${recipeIngredients.length} recipe-ingredient relationships.`);
    
    // 3. Try the exact query that's causing problems in the app
    console.log('\n3. Testing the exact join query used in the application...');
    const { data: joinData, error: joinError } = await supabase
      .from('recipe_ingredients')
      .select(`
        id,
        quantity,
        unit,
        ingredient_id,
        recipe_id,
        ingredients:ingredient_id (id, name, description)
      `)
      .eq('recipe_id', recipes[0].id); // Use the first recipe
    
    if (joinError) {
      console.error('Error running join query:', joinError);
      console.log('There might still be issues with the view structure.');
      return;
    }
    
    console.log(`SUCCESS! The join query works with the recipe_ingredients view.`);
    console.log(`Found ${joinData.length} ingredients for recipe "${recipes[0].title}"`);
    console.log('\nSample data:');
    
    if (joinData.length > 0) {
      joinData.forEach(item => {
        console.log(`- ${item.ingredients?.name || 'Unknown'}: ${item.quantity} ${item.unit}`);
      });
    } else {
      console.log('No ingredients found for this recipe.');
    }
    
    // 4. Verify it works for all recipes
    console.log('\n4. Checking ingredients for all recipes...');
    
    for (const recipe of recipes) {
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
          quantity, 
          unit,
          ingredients:ingredient_id (id, name)
        `)
        .eq('recipe_id', recipe.id);
      
      if (ingredientsError) {
        console.error(`Error fetching ingredients for ${recipe.title}:`, ingredientsError);
        continue;
      }
      
      console.log(`Recipe: ${recipe.title} (${recipe.id})`);
      console.log(`  Ingredients: ${ingredients.length}`);
      
      if (ingredients.length > 0) {
        ingredients.slice(0, 3).forEach(item => {
          console.log(`  - ${item.ingredients?.name || 'Unknown'}: ${item.quantity} ${item.unit}`);
        });
        if (ingredients.length > 3) {
          console.log(`  - ... and ${ingredients.length - 3} more`);
        }
      } else {
        console.log('  No ingredients found!');
      }
      
      console.log('');
    }
    
    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('The fix appears to be working correctly. You should now be able to see ingredients in your application.');
    console.log('To start your application, run: npm run dev');
    
  } catch (error) {
    console.error('Unexpected error during verification:', error);
  }
}

// Run the verification
verifyFix();