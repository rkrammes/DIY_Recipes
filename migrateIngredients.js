// migrateIngredients.js
import { supabaseClient } from './js/supabaseClient.js';
import { loadAllIngredients, addGlobalIngredient } from './js/api.js';

/**
 * Fetches all ingredients from the capitalized 'Ingredients' table
 * @returns {Promise<Array>} Array of ingredients from the capitalized table
 */
async function loadCapitalizedIngredients() {
  try {
    const { data, error } = await supabaseClient
      .from('Ingredients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error loading capitalized Ingredients:', error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} ingredients from capitalized 'Ingredients' table`);
    return data || [];
  } catch (error) {
    console.error('Error in loadCapitalizedIngredients:', error);
    return [];
  }
}

// Export the migration function for use in the HTML interface
export { migrateIngredients };

/**
 * Migrates ingredients from capitalized 'Ingredients' table to lowercase 'ingredients' table
 * Avoids creating duplicates by checking if ingredient name already exists
 */
async function migrateIngredients() {
  console.log('Starting ingredient migration...');
  
  // Step 1: Fetch all ingredients from both tables
  const capitalizedIngredients = await loadCapitalizedIngredients();
  const lowercaseIngredients = await loadAllIngredients();
  
  if (capitalizedIngredients.length === 0) {
    console.log('No ingredients found in capitalized Ingredients table. Nothing to migrate.');
    return;
  }
  
  console.log(`Found ${capitalizedIngredients.length} ingredients in capitalized 'Ingredients' table`);
  console.log(`Found ${lowercaseIngredients.length} ingredients in lowercase 'ingredients' table`);
  
  // Step 2: Create a set of existing ingredient names (case insensitive) for quick lookup
  const existingIngredientNames = new Set(
    lowercaseIngredients.map(ing => ing.name.toLowerCase())
  );
  
  // Step 3: Filter out ingredients that already exist in the lowercase table
  const ingredientsToMigrate = capitalizedIngredients.filter(
    ing => !existingIngredientNames.has(ing.name.toLowerCase())
  );
  
  console.log(`Found ${ingredientsToMigrate.length} ingredients to migrate`);
  
  // Step 4: Migrate each ingredient that doesn't already exist
  const migrationResults = {
    total: ingredientsToMigrate.length,
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const ingredient of ingredientsToMigrate) {
    try {
      console.log(`Migrating ingredient: ${ingredient.name}`);
      const newIngredient = await addGlobalIngredient(ingredient.name);
      
      if (newIngredient) {
        migrationResults.successful++;
        migrationResults.details.push({
          name: ingredient.name,
          status: 'success',
          newId: newIngredient.id
        });
        console.log(`Successfully migrated: ${ingredient.name} (ID: ${newIngredient.id})`);
      } else {
        migrationResults.failed++;
        migrationResults.details.push({
          name: ingredient.name,
          status: 'failed',
          error: 'Unknown error'
        });
        console.error(`Failed to migrate: ${ingredient.name}`);
      }
    } catch (error) {
      migrationResults.failed++;
      migrationResults.details.push({
        name: ingredient.name,
        status: 'failed',
        error: error.message
      });
      console.error(`Error migrating ingredient ${ingredient.name}:`, error);
    }
  }
  
  // Step 5: Log the final results
  console.log('\n--- Migration Results ---');
  console.log(`Total ingredients to migrate: ${migrationResults.total}`);
  console.log(`Successfully migrated: ${migrationResults.successful}`);
  console.log(`Failed to migrate: ${migrationResults.failed}`);
  
  if (migrationResults.details.length > 0) {
    console.log('\nDetailed Results:');
    migrationResults.details.forEach(detail => {
      console.log(`- ${detail.name}: ${detail.status}${detail.newId ? ` (New ID: ${detail.newId})` : ''}${detail.error ? ` (Error: ${detail.error})` : ''}`);
    });
  }
  
  return migrationResults;
}

// We'll use the HTML interface to run the migration
// This prevents automatic execution when imported