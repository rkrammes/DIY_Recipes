// Script to delete duplicate recipes from Supabase
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

async function deleteDuplicateRecipes() {
  console.log('Finding duplicate recipes...');
  
  try {
    // First, get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, created_at')
      .order('created_at', { ascending: false }); // Most recent first
    
    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      return;
    }
    
    console.log(`Found ${recipes.length} total recipes`);
    
    // Group recipes by title
    const recipesByTitle = {};
    recipes.forEach(recipe => {
      if (!recipesByTitle[recipe.title]) {
        recipesByTitle[recipe.title] = [];
      }
      recipesByTitle[recipe.title].push(recipe);
    });
    
    // Find duplicates (any title with more than one recipe)
    const duplicateGroups = Object.entries(recipesByTitle)
      .filter(([title, recipeList]) => recipeList.length > 1)
      .map(([title, recipeList]) => ({
        title,
        recipes: recipeList,
        count: recipeList.length
      }));
    
    console.log(`\nFound ${duplicateGroups.length} recipe titles with duplicates:`);
    duplicateGroups.forEach(group => {
      console.log(`- "${group.title}": ${group.count} copies`);
    });
    
    if (duplicateGroups.length === 0) {
      console.log('No duplicates found!');
      return;
    }
    
    // For each group of duplicates, check which ones have ingredients
    console.log('\nChecking which recipes have ingredients...');
    
    const recipesToDelete = [];
    const recipesToKeep = [];
    
    for (const group of duplicateGroups) {
      console.log(`\nChecking recipes for "${group.title}":`);
      
      // Create a list of recipe IDs and ingredients
      const recipeStatuses = [];
      
      for (const recipe of group.recipes) {
        // Check if this recipe has ingredients in the recipe_ingredients table
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select('id')
          .eq('recipe_id', recipe.id);
        
        if (ingredientsError) {
          console.error(`Error checking ingredients for ${recipe.id}:`, ingredientsError);
          continue;
        }
        
        const hasIngredients = ingredientsData && ingredientsData.length > 0;
        recipeStatuses.push({
          id: recipe.id,
          title: recipe.title,
          created_at: recipe.created_at,
          hasIngredients,
          ingredientCount: ingredientsData ? ingredientsData.length : 0
        });
        
        console.log(`- Recipe ${recipe.id}: ${hasIngredients ? `✅ Has ${ingredientsData.length} ingredients` : '❌ No ingredients'}`);
      }
      
      // Sort by whether they have ingredients, then by most recent
      recipeStatuses.sort((a, b) => {
        if (a.hasIngredients && !b.hasIngredients) return -1;
        if (!a.hasIngredients && b.hasIngredients) return 1;
        // If both have same ingredient status, keep the newer one
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Keep the first recipe in the sorted list (has ingredients or most recent)
      const toKeep = recipeStatuses[0];
      recipesToKeep.push(toKeep);
      
      // Delete all others
      const toDelete = recipeStatuses.slice(1);
      recipesToDelete.push(...toDelete);
      
      console.log(`\nFor "${group.title}":`);
      console.log(`- KEEPING: ${toKeep.id} (${toKeep.hasIngredients ? `Has ${toKeep.ingredientCount} ingredients` : 'Most recent'})`);
      toDelete.forEach(recipe => {
        console.log(`- DELETING: ${recipe.id} ${recipe.hasIngredients ? `(Has ${recipe.ingredientCount} ingredients)` : '(No ingredients)'}`);
      });
    }
    
    // Now ask for confirmation before deleting
    console.log('\n----------------------------------------');
    console.log(`SUMMARY: Found ${recipesToDelete.length} duplicate recipes to delete`);
    console.log('----------------------------------------');
    
    // Print unique recipe titles that will be affected
    const affectedTitles = [...new Set(recipesToDelete.map(r => r.title))];
    console.log('\nRecipe titles affected:');
    affectedTitles.forEach(title => console.log(`- ${title}`));
    
    // Ask for confirmation
    console.log('\nDo you want to delete these recipes? Type "yes" to confirm:');
    process.stdout.write('> ');
    
    // Read from standard input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('Proceeding with deletion...');
        
        // Delete the duplicate recipes
        for (const recipe of recipesToDelete) {
          // First delete recipe_ingredients entries
          console.log(`Deleting recipe_ingredients for ${recipe.id} (${recipe.title})...`);
          const { error: deleteIngredientsError } = await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', recipe.id);
          
          if (deleteIngredientsError) {
            console.error(`Error deleting recipe_ingredients for ${recipe.id}:`, deleteIngredientsError);
          }
          
          // Then delete the recipe
          console.log(`Deleting recipe ${recipe.id} (${recipe.title})...`);
          const { error: deleteRecipeError } = await supabase
            .from('recipes')
            .delete()
            .eq('id', recipe.id);
          
          if (deleteRecipeError) {
            console.error(`Error deleting recipe ${recipe.id}:`, deleteRecipeError);
          } else {
            console.log(`✅ Successfully deleted recipe ${recipe.id}`);
          }
        }
        
        console.log('\nDeletion complete!');
        
        // Verify the deletions
        const { data: remainingRecipes, error: verifyError } = await supabase
          .from('recipes')
          .select('id, title')
          .order('title');
        
        if (verifyError) {
          console.error('Error verifying recipes after deletion:', verifyError);
        } else {
          console.log(`\nRemaining recipes (${remainingRecipes.length}):`);
          remainingRecipes.forEach(recipe => {
            console.log(`- ${recipe.title}`);
          });
        }
      } else {
        console.log('Deletion cancelled.');
      }
      
      readline.close();
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
deleteDuplicateRecipes();