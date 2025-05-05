// Simple script to test Supabase connection
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

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic query
    console.log('Testing recipes table...');
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('count', { count: 'exact', head: true });
      
    if (recipeError) {
      console.error('❌ Error querying recipes:', recipeError);
    } else {
      console.log('✅ Successfully connected to recipes table:', recipeData);
    }
    
    // Test ingredients table
    console.log('Testing ingredients table...');
    const { data: ingredientData, error: ingredientError } = await supabase
      .from('ingredients')
      .select('count', { count: 'exact', head: true });
      
    if (ingredientError) {
      console.error('❌ Error querying ingredients:', ingredientError);
    } else {
      console.log('✅ Successfully connected to ingredients table:', ingredientData);
    }
    
    // Test a full query to get all recipes
    console.log('Testing full recipe query...');
    const { data: allRecipes, error: allRecipesError } = await supabase
      .from('recipes')
      .select('id, title')
      .limit(5);
      
    if (allRecipesError) {
      console.error('❌ Error querying all recipes:', allRecipesError);
    } else {
      console.log('✅ Successfully queried recipes:');
      console.log(allRecipes);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during Supabase connection test:', error);
  }
}

// Run the test
testConnection();