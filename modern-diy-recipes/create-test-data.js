/**
 * Create Test Recipe Data
 * 
 * This script creates test recipe data directly using the Supabase client.
 * It handles the user_id constraint by finding a valid user ID first.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Recipe data with ingredients from user-provided CSV
const recipeData = [
  {
    title: 'Beard Oil',
    description: 'A nourishing oil for beard care',
    instructions: 'Combine all ingredients in a glass bottle. Shake well before each use. Apply a few drops to palm, rub hands together, and massage through beard.',
    ingredients: [
      { name: 'Jojoba Oil', quantity: '40', unit: '%' },
      { name: 'Essential Oils', quantity: '1', unit: '%' }
    ]
  },
  {
    title: 'Beard Balm',
    description: 'A styling balm that conditions and shapes your beard',
    instructions: 'Melt beeswax, shea butter, cocoa butter, and mango butter in a double boiler. Remove from heat and stir in lanolin and arrowroot powder. Pour into containers and let cool.',
    ingredients: [
      { name: 'Beeswax', quantity: '33', unit: '%' },
      { name: 'Unrefined Shea Butter', quantity: '20', unit: '%' },
      { name: 'Cocoa Butter', quantity: '22', unit: '%' },
      { name: 'Unrefined Mango Butter', quantity: '15', unit: '%' },
      { name: 'Lanolin', quantity: '10', unit: '%' },
      { name: 'Arrowroot Powder', quantity: '5', unit: '%' }
    ]
  },
  {
    title: 'Mustache Wax',
    description: 'A strong-hold wax for styling mustaches',
    instructions: 'Melt carnauba wax in a double boiler. Add lanolin and jojoba oil, stirring until combined. Pour into small containers and let cool completely before use.',
    ingredients: [
      { name: 'Carnauba Wax', quantity: '40', unit: '%' },
      { name: 'Lanolin', quantity: '45', unit: '%' },
      { name: 'Jojoba Oil', quantity: '15', unit: '%' }
    ]
  },
  {
    title: 'Foaming Hand Soap',
    description: 'A gentle, natural foaming soap for everyday hand washing',
    instructions: 'Pour distilled water into a foaming soap dispenser. Add castile soap, sweet almond oil, and essential oils. Gently swirl to mix (do not shake vigorously).',
    ingredients: [
      { name: 'Distilled Water', quantity: '1', unit: 'cup' },
      { name: 'Liquid Castile Soap', quantity: '2', unit: 'tablespoons' },
      { name: 'Sweet Almond Oil', quantity: '1', unit: 'teaspoon' },
      { name: 'Essential Oils', quantity: '10-15', unit: 'drops' }
    ]
  },
  {
    title: 'Hand Cream',
    description: 'A rich, moisturizing cream for dry hands',
    instructions: 'Melt shea butter, cocoa butter, and beeswax in a double boiler. Remove from heat and add sweet almond oil and lanolin. Let cool slightly, then add essential oils. Pour into jars and cool completely.',
    ingredients: [
      { name: 'Unrefined Shea Butter', quantity: '40', unit: '%' },
      { name: 'Cocoa Butter', quantity: '25', unit: '%' },
      { name: 'Sweet Almond Oil', quantity: '20', unit: '%' },
      { name: 'Beeswax', quantity: '10', unit: '%' },
      { name: 'Lanolin', quantity: '5', unit: '%' },
      { name: 'Cedarwood Atlas Oil', quantity: '1', unit: '%' },
      { name: 'Bergaptene-Free Bergamot Oil', quantity: '1', unit: '%' }
    ]
  },
  {
    title: 'Hair Rinse',
    description: 'A clarifying rinse to remove buildup and add shine',
    instructions: 'Brew green tea with hot water and let cool. Mix in aloe vera juice and apple cider vinegar. Add essential oils and shake well. Apply to hair after shampooing, let sit for 2-3 minutes, then rinse with cool water.',
    ingredients: [
      { name: 'Water', quantity: '1', unit: 'cup' },
      { name: 'Green Tea', quantity: '2', unit: 'bags' },
      { name: 'Aloe Vera Juice', quantity: '1/2', unit: 'cup' },
      { name: 'Apple Cider Vinegar', quantity: '1/2', unit: 'cup' },
      { name: 'Rosemary Essential Oil', quantity: '10', unit: 'drops' },
      { name: 'Peppermint Essential Oil', quantity: '6', unit: 'drops' }
    ]
  }
];

// Main function to create test data
const createTestData = async () => {
  console.log('Creating test recipe data...');
  
  // Step 1: Find a valid user ID for recipes
  console.log('Looking for a valid user ID...');
  let userId;
  
  try {
    // Try to get existing users first
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers && authUsers.users && authUsers.users.length > 0) {
      userId = authUsers.users[0].id;
      console.log(`Found auth user ID: ${userId}`);
    } else {
      console.log('No auth users found, checking profiles table...');
      
      // Try to get from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!profilesError && profiles && profiles.length > 0) {
        userId = profiles[0].id;
        console.log(`Found profile ID: ${userId}`);
      } else {
        console.log('No profiles found, creating a UUID for user ID...');
        
        // Create a UUID if we can't find a real user ID
        userId = uuidv4();
        console.log(`Created UUID for user ID: ${userId}`);
        
        // Try to insert dummy user in profiles
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: 'test_user',
              created_at: new Date().toISOString()
            });
          
          if (!insertError) {
            console.log('Created dummy profile');
          } else {
            console.log('Could not create dummy profile:', insertError);
          }
        } catch (insertErr) {
          console.log('Exception creating dummy profile:', insertErr);
        }
      }
    }
  } catch (error) {
    console.error('Error finding valid user ID:', error);
    userId = uuidv4();
    console.log(`Created fallback UUID for user ID: ${userId}`);
  }
  
  // Step 2: Create recipes and ingredients directly
  console.log('Creating recipes with ingredients...');
  const ingredientMap = new Map(); // Track ingredients to avoid duplicates
  
  for (const recipe of recipeData) {
    try {
      console.log(`Creating recipe: ${recipe.title}`);
      
      // Create unique ID for recipe
      const recipeId = uuidv4();
      
      // Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          id: recipeId,
          title: recipe.title,
          description: recipe.description,
          instructions: recipe.instructions,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (recipeError) {
        console.error(`Error creating recipe "${recipe.title}":`, recipeError);
        continue;
      }
      
      console.log(`Created recipe: ${recipe.title}`);
      
      // Process ingredients
      console.log('Adding ingredients...');
      for (const ingredient of recipe.ingredients) {
        // Check if we already have this ingredient
        let ingredientId = ingredientMap.get(ingredient.name.toLowerCase());
        
        if (!ingredientId) {
          // Create new ingredient
          const { data: ingredientData, error: ingredientError } = await supabase
            .from('ingredients')
            .insert({
              name: ingredient.name,
              description: `Used in ${recipe.title}`,
              created_at: new Date().toISOString()
            })
            .select();
          
          if (ingredientError) {
            console.error(`Error creating ingredient "${ingredient.name}":`, ingredientError);
            continue;
          }
          
          ingredientId = ingredientData[0].id;
          ingredientMap.set(ingredient.name.toLowerCase(), ingredientId);
          console.log(`Created ingredient: ${ingredient.name}`);
        } else {
          console.log(`Using existing ingredient: ${ingredient.name}`);
        }
        
        // Create recipe-ingredient relationship
        const { error: relationError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            created_at: new Date().toISOString()
          });
        
        if (relationError) {
          console.error(`Error linking ingredient to recipe:`, relationError);
        } else {
          console.log(`Linked ingredient "${ingredient.name}" to recipe "${recipe.title}"`);
        }
      }
    } catch (error) {
      console.error(`Error processing recipe "${recipe.title}":`, error);
    }
  }
  
  console.log('Test data creation completed!');
};

// Run the main function
createTestData().catch(error => {
  console.error('Fatal error:', error);
});