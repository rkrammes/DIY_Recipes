// migrateData.js - Script for migrating recipes and related data from the old system to the new Supabase project

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- Configuration ---
// Replace with the URL and Service Role Key for your NEW Supabase project
const NEW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_NEW_SUPABASE_URL'; // Using NEXT_PUBLIC_SUPABASE_URL from .env
const NEW_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_NEW_SUPABASE_SERVICE_ROLE_KEY'; // Assuming service role key is in .env

// Replace with the connection details for your OLD system's data source
// This is a placeholder. You will need to implement the logic to connect to and fetch data from your old system.
// Example placeholder assuming old data is in JSON files:
// import oldRecipesData from '../old-data/recipes.json';
// import oldCategoriesData from '../old-data/categories.json';
// import oldIngredientsData from '../old-data/ingredients.json';
// import oldUserData from '../old-data/users.json'; // Assuming user data is also available

// Initialize New Supabase client with Service Role Key for data insertion
const newSupabaseClient = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- Data Mapping and ID Tracking ---
// Objects to store mappings between old and new IDs
const userIdMap = new Map(); // Map old_user_id to new_user_id (from auth.users)
const ingredientIdMap = new Map(); // Map old_ingredient_id to new_ingredient_id
const recipeIdMap = new Map(); // Map old_recipe_id to new_recipe_id
const categoryIdMap = new Map(); // Map old_category_id to new_category_id
const tagIdMap = new Map(); // Map old_tag_id to new_tag_id
const collectionIdMap = new Map(); // Map old_collection_id to new_collection_id

/**
 * Fetches data from the old system.
 * These functions need to be implemented based on your old system's data source.
 * @returns {Promise<Array<Object>>} Array of data objects from the old system.
 */

// --- Migration Functions ---

/**
 * Migrates categories to the new Supabase 'categories' table.
 * @param {Array<Object>} oldCategories - Array of category objects from the old system.
 * @returns {Promise<Object>} Migration results summary.
 */
async function migrateCategories(oldCategories) {
  console.log('Starting category migration...');
  const migrationResults = { total: oldCategories.length, successful: 0, failed: 0, details: [] };

  for (const oldCategory of oldCategories) {
    try {
      // TODO: Map oldCategory fields to new schema
      const newCategoryData = {
        // name: oldCategory.name,
        // description: oldCategory.description,
        // created_at: oldCategory.created_at, // If available
      };

      const { data, error } = await newSupabaseClient
        .from('categories')
        .insert([newCategoryData])
        .select();

      if (error) {
        throw error;
      }

      categoryIdMap.set(oldCategory.old_category_id, data[0].id);
      migrationResults.successful++;
      migrationResults.details.push({ old_id: oldCategory.old_category_id, status: 'success', new_id: data[0].id });
      console.log(`Migrated category: ${oldCategory.old_category_id} -> ${data[0].id}`);

    } catch (error) {
      migrationResults.failed++;
      migrationResults.details.push({ old_id: oldCategory.old_category_id, status: 'failed', error: error.message });
      console.error(`Failed to migrate category ${oldCategory.old_category_id}:`, error);
    }
  }
  console.log('Category migration finished.');
  return migrationResults;
}

/**
 * Migrates tags to the new Supabase 'tags' table.
 * @param {Array<Object>} oldTags - Array of tag objects from the old system.
 * @returns {Promise<Object>} Migration results summary.
 */
async function migrateTags(oldTags) {
  console.log('Starting tag migration...');
  const migrationResults = { total: oldTags.length, successful: 0, failed: 0, details: [] };

  for (const oldTag of oldTags) {
    try {
      // TODO: Map oldTag fields to new schema
      const newTagData = {
        // name: oldTag.name,
        // user_id: userIdMap.get(oldTag.old_user_id), // Link to new user ID if applicable
        // created_at: oldTag.created_at, // If available
      };

      const { data, error } = await newSupabaseClient
        .from('tags')
        .insert([newTagData])
        .select();

      if (error) {
        throw error;
      }

      tagIdMap.set(oldTag.old_tag_id, data[0].id);
      migrationResults.successful++;
      migrationResults.details.push({ old_id: oldTag.old_tag_id, status: 'success', new_id: data[0].id });
      console.log(`Migrated tag: ${oldTag.old_tag_id} -> ${data[0].id}`);

    } catch (error) {
      migrationResults.failed++;
      migrationResults.details.push({ old_id: oldTag.old_tag_id, status: 'failed', error: error.message });
      console.error(`Failed to migrate tag ${oldTag.old_tag_id}:`, error);
    }
  }
  console.log('Tag migration finished.');
  return migrationResults;
}


/**
 * Migrates recipes to the new Supabase 'recipes' table.
 * @param {Array<Object>} oldRecipes - Array of recipe objects from the old system.
 * @returns {Promise<Object>} Migration results summary.
 */
async function migrateRecipes(oldRecipes) {
  console.log('Starting recipe migration...');
  const migrationResults = { total: oldRecipes.length, successful: 0, failed: 0, details: [] };

  for (const oldRecipe of oldRecipes) {
    try {
      // TODO: Map oldRecipe fields to new schema
      const newRecipeData = {
        // title: oldRecipe.title,
        // description: oldRecipe.description,
        // instructions: oldRecipe.instructions,
        // prep_time_minutes: oldRecipe.prep_time,
        // cook_time_minutes: oldRecipe.cook_time,
        // difficulty: oldRecipe.difficulty,
        // user_id: userIdMap.get(oldRecipe.old_user_id), // Link to new user ID
        // created_at: oldRecipe.created_at, // If available
        // updated_at: oldRecipe.updated_at, // If available
        // version: oldRecipe.version || 1,
      };

      const { data, error } = await newSupabaseClient
        .from('recipes')
        .insert([newRecipeData])
        .select();

      if (error) {
        throw error;
      }

      recipeIdMap.set(oldRecipe.old_recipe_id, data[0].id);
      migrationResults.successful++;
      migrationResults.details.push({ old_id: oldRecipe.old_recipe_id, status: 'success', new_id: data[0].id });
      console.log(`Migrated recipe: ${oldRecipe.old_recipe_id} -> ${data[0].id}`);

      // TODO: Migrate related data (ingredients, categories, tags, etc.) for this recipe
      // This will likely involve fetching related data for the current oldRecipe
      // and inserting into the linking tables using the new recipe ID and the corresponding new IDs
      // from the maps (ingredientIdMap, categoryIdMap, tagIdMap).

      /* Example for recipeingredients:
      const oldRecipeIngredients = await fetchOldRecipeIngredients(oldRecipe.old_recipe_id); // Implement this fetch
      const newRecipeIngredientsData = oldRecipeIngredients.map(ori => ({
        recipe_id: data[0].id, // New recipe ID
        ingredient_id: ingredientIdMap.get(ori.old_ingredient_id), // New ingredient ID
        quantity: ori.quantity,
        unit: ori.unit,
        notes: ori.notes,
      })).filter(item => item.ingredient_id); // Filter out if ingredient not migrated

      if (newRecipeIngredientsData.length > 0) {
        const { error: ingredientError } = await newSupabaseClient
          .from('recipeingredients')
          .insert(newRecipeIngredientsData);
        if (ingredientError) {
          console.error(`Error migrating ingredients for recipe ${data[0].id}:`, ingredientError);
          // Decide how to handle this error
        }
      }
      */

    } catch (error) {
      migrationResults.failed++;
      migrationResults.details.push({ old_id: oldRecipe.old_recipe_id, status: 'failed', error: error.message });
      console.error(`Failed to migrate recipe ${oldRecipe.old_recipe_id}:`, error);
    }
  }
  console.log('Recipe migration finished.');
  return migrationResults;
}

/**
 * Migrates user favorites to the new Supabase 'user_favorites' table.
 * Requires users and recipes to be migrated first to populate maps.
 * @param {Array<Object>} oldUserFavorites - Array of user favorite objects from the old system.
 * @returns {Promise<Object>} Migration results summary.
 */
async function migrateUserFavorites(oldUserFavorites) {
  console.log('Starting user favorites migration...');
  const migrationResults = { total: oldUserFavorites.length, successful: 0, failed: 0, details: [] };

  const newUserFavoritesData = oldUserFavorites
    .map(fav => ({
      user_id: userIdMap.get(fav.old_user_id),
      recipe_id: recipeIdMap.get(fav.old_recipe_id),
      created_at: fav.created_at, // If available
    }))
    .filter(item => item.user_id && item.recipe_id); // Only migrate if both user and recipe were migrated

  if (newUserFavoritesData.length > 0) {
    try {
      const { error } = await newSupabaseClient
        .from('user_favorites')
        .insert(newUserFavoritesData);

      if (error) {
        throw error;
      }
      migrationResults.successful = newUserFavoritesData.length;
      console.log(`Migrated ${newUserFavoritesData.length} user favorites.`);
    } catch (error) {
      migrationResults.failed = newUserFavoritesData.length; // Simple count for bulk insert
      console.error('Error migrating user favorites:', error);
    }
  } else {
    console.log('No user favorites to migrate (either no old data or no corresponding new users/recipes).');
  }

  console.log('User favorites migration finished.');
  return migrationResults;
}

/**
 * Migrates collections and collection recipes to the new Supabase tables.
 * Requires users and recipes to be migrated first to populate maps.
 * @param {Array<Object>} oldCollections - Array of collection objects from the old system.
 * @param {Array<Object>} oldCollectionRecipes - Array of collection recipe objects from the old system.
 * @returns {Promise<Object>} Migration results summary.
 */
async function migrateCollections(oldCollections, oldCollectionRecipes) {
  console.log('Starting collections migration...');
  const collectionMigrationResults = { total: oldCollections.length, successful: 0, failed: 0, details: [] };

  // Migrate collections first
  for (const oldCollection of oldCollections) {
    try {
      // TODO: Map oldCollection fields to new schema
      const newCollectionData = {
        // user_id: userIdMap.get(oldCollection.old_user_id),
        // name: oldCollection.name,
        // description: oldCollection.description,
        // created_at: oldCollection.created_at, // If available
        // updated_at: oldCollection.updated_at, // If available
      };

      if (!newCollectionData.user_id) {
          console.warn(`Skipping collection ${oldCollection.old_collection_id} as user was not migrated.`);
          collectionMigrationResults.failed++;
          collectionMigrationResults.details.push({ old_id: oldCollection.old_collection_id, status: 'skipped', error: 'User not migrated' });
          continue;
      }


      const { data, error } = await newSupabaseClient
        .from('collections')
        .insert([newCollectionData])
        .select();

      if (error) {
        throw error;
      }

      collectionIdMap.set(oldCollection.old_collection_id, data[0].id);
      collectionMigrationResults.successful++;
      collectionMigrationResults.details.push({ old_id: oldCollection.old_collection_id, status: 'success', new_id: data[0].id });
      console.log(`Migrated collection: ${oldCollection.old_collection_id} -> ${data[0].id}`);

    } catch (error) {
      collectionMigrationResults.failed++;
      collectionMigrationResults.details.push({ old_id: oldCollection.old_collection_id, status: 'failed', error: error.message });
      console.error(`Failed to migrate collection ${oldCollection.old_collection_id}:`, error);
    }
  }
  console.log('Collections migration finished.');

  console.log('Starting collection recipes migration...');
  const collectionRecipesMigrationResults = { total: oldCollectionRecipes.length, successful: 0, failed: 0, details: [] };

  const newCollectionRecipesData = oldCollectionRecipes
    .map(cr => ({
      collection_id: collectionIdMap.get(cr.old_collection_id),
      recipe_id: recipeIdMap.get(cr.old_recipe_id),
      added_at: cr.added_at, // If available
    }))
    .filter(item => item.collection_id && item.recipe_id); // Only migrate if both collection and recipe were migrated

  if (newCollectionRecipesData.length > 0) {
    try {
      const { error } = await newSupabaseClient
        .from('collection_recipes')
        .insert(newCollectionRecipesData);

      if (error) {
        throw error;
      }
      collectionRecipesMigrationResults.successful = newCollectionRecipesData.length;
      console.log(`Migrated ${newUserFavoritesData.length} collection recipes.`);
    } catch (error) {
      collectionRecipesMigrationResults.failed = newCollectionRecipesData.length; // Simple count for bulk insert
      console.error('Error migrating collection recipes:', error);
    }
  } else {
    console.log('No collection recipes to migrate (either no old data or no corresponding new collections/recipes).');
  }
  console.log('Collection recipes migration finished.');

  return { collections: collectionMigrationResults, collectionRecipes: collectionRecipesMigrationResults };
}


// Main execution function
async function runDataMigration() {
  console.log('Fetch and migration logic removed as migration appears complete.');


  console.log('\n--- Overall Data Migration Summary ---');
  console.log(`User ID Map Size: ${userIdMap.size}`);
  console.log(`Ingredient ID Map Size: ${ingredientIdMap.size}`);
  console.log(`Recipe ID Map Size: ${recipeIdMap.size}`);
  console.log(`Category ID Map Size: ${categoryIdMap.size}`);
  console.log(`Tag ID Map Size: ${tagIdMap.size}`);
  console.log(`Collection ID Map Size: ${collectionIdMap.size}`);
  console.log('Migration process finished. Review logs for detailed results.');
}

// Execute the migration process
runDataMigration()
  .then(() => {
    console.log('Data migration process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Data migration process failed:', error);
    process.exit(1);
  });