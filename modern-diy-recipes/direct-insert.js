/**
 * Direct Insert Script
 * 
 * This script uses direct SQL queries to insert recipes and ingredients
 * directly into the database, bypassing any foreign key constraints.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Load environment variables
try {
  if (fs.existsSync('.env.local')) {
    require('dotenv').config({ path: '.env.local' });
  }
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
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

// Recipe data from the user
const recipeData = [
  {
    title: 'Beard Oil',
    description: 'A nourishing oil for beard care',
    instructions: 'Combine all ingredients in a glass bottle. Shake well before each use. Apply a few drops to palm, rub hands together, and massage through beard.',
    ingredients: [
      { name: 'Jojoba Oil', quantity: '40%', unit: 'ml' },
      { name: 'Essential Oils', quantity: '1%', unit: 'ml' }
    ]
  },
  {
    title: 'Beard Balm',
    description: 'A styling balm that conditions and shapes your beard',
    instructions: 'Melt beeswax, shea butter, cocoa butter, and mango butter in a double boiler. Remove from heat and stir in lanolin and arrowroot powder. Pour into containers and let cool.',
    ingredients: [
      { name: 'Beeswax', quantity: '33', unit: 'g' },
      { name: 'Unrefined Shea Butter', quantity: '20', unit: 'g' },
      { name: 'Cocoa Butter', quantity: '22', unit: 'g' },
      { name: 'Unrefined Mango Butter', quantity: '15', unit: 'g' },
      { name: 'Lanolin', quantity: '10', unit: 'g' },
      { name: 'Arrowroot Powder', quantity: '5', unit: 'g' }
    ]
  },
  {
    title: 'Mustache Wax',
    description: 'A strong-hold wax for styling mustaches',
    instructions: 'Melt carnauba wax in a double boiler. Add lanolin and jojoba oil, stirring until combined. Pour into small containers and let cool completely before use.',
    ingredients: [
      { name: 'Carnauba Wax', quantity: '40', unit: 'g' },
      { name: 'Lanolin', quantity: '45', unit: 'g' },
      { name: 'Jojoba Oil', quantity: '15', unit: 'g' }
    ]
  },
  {
    title: 'Foaming Hand Soap',
    description: 'A gentle, natural foaming soap for everyday hand washing',
    instructions: 'Pour distilled water into a foaming soap dispenser. Add castile soap, sweet almond oil, and essential oils. Gently swirl to mix (do not shake vigorously).',
    ingredients: [
      { name: 'Distilled Water', quantity: '1', unit: 'cup' },
      { name: 'Liquid Castile Soap', quantity: '2', unit: 'tbsp' },
      { name: 'Sweet Almond Oil', quantity: '1', unit: 'tsp' },
      { name: 'Essential Oils', quantity: '15', unit: 'drops' }
    ]
  },
  {
    title: 'Hand Cream',
    description: 'A rich, moisturizing cream for dry hands',
    instructions: 'Melt shea butter, cocoa butter, and beeswax in a double boiler. Remove from heat and add sweet almond oil and lanolin. Let cool slightly, then add essential oils. Pour into jars and cool completely.',
    ingredients: [
      { name: 'Unrefined Shea Butter', quantity: '40', unit: 'g' },
      { name: 'Cocoa Butter', quantity: '25', unit: 'g' },
      { name: 'Sweet Almond Oil', quantity: '20', unit: 'g' },
      { name: 'Beeswax', quantity: '10', unit: 'g' },
      { name: 'Lanolin', quantity: '5', unit: 'g' },
      { name: 'Cedarwood Atlas Oil', quantity: '1', unit: 'g' },
      { name: 'Bergaptene-Free Bergamot Oil', quantity: '1', unit: 'g' }
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

// Check if a table exists
const checkTable = async (tableName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true });
    
    return !error;
  } catch (err) {
    return false;
  }
};

// Create tables if needed
const createTables = async () => {
  console.log("Creating tables if needed...");
  
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS public.recipes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      user_id TEXT DEFAULT 'system',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS public.ingredients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      recipe_id UUID NOT NULL,
      ingredient_id UUID NOT NULL,
      quantity TEXT NOT NULL,
      unit TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  ];
  
  try {
    // Check if the execute_sql RPC is available
    const { error: rpcCheckError } = await supabase.rpc('list_functions');
    
    if (rpcCheckError) {
      console.error("Cannot check for functions - assuming execute_sql not available");
      console.log("Will try direct table operations instead.");
      
      // Check tables directly
      const recipesExists = await checkTable('recipes');
      const ingredientsExists = await checkTable('ingredients');
      const recipeIngredientsExists = await checkTable('recipe_ingredients');
      
      console.log(`Tables status:
- recipes: ${recipesExists ? 'exists' : 'missing'}
- ingredients: ${ingredientsExists ? 'exists' : 'missing'}
- recipe_ingredients: ${recipeIngredientsExists ? 'exists' : 'missing'}`);
      
      return;
    }
    
    for (const query of tableQueries) {
      const { error } = await supabase.rpc('execute_sql', { sql: query });
      if (error) {
        console.error(`Error executing SQL: ${query.substring(0, 50)}...`, error);
      }
    }
    
    console.log("Tables created or already exist");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

// Insert all recipe and ingredient data
const insertRecipes = async () => {
  console.log("Inserting recipe data...");
  
  // Track ingredients to avoid duplicates
  const ingredientIds = {};
  
  for (const recipe of recipeData) {
    try {
      // Create recipe
      const recipeId = uuidv4();
      console.log(`Processing recipe: ${recipe.title}`);
      
      // Insert recipe (first try standard insert)
      let recipeInserted = false;
      
      try {
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            id: recipeId,
            title: recipe.title,
            description: recipe.description,
            instructions: recipe.instructions,
            user_id: 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (!error) {
          recipeInserted = true;
          console.log(`Recipe inserted: ${recipe.title}`);
        } else {
          console.error(`Error inserting recipe:`, error);
        }
      } catch (err) {
        console.error(`Exception inserting recipe:`, err);
      }
      
      // If standard insert failed, try SQL insert
      if (!recipeInserted) {
        try {
          const sql = `
            INSERT INTO recipes (id, title, description, instructions, user_id, created_at, updated_at)
            VALUES (
              '${recipeId}',
              '${recipe.title.replace(/'/g, "''")}',
              '${recipe.description.replace(/'/g, "''")}',
              '${recipe.instructions.replace(/'/g, "''")}',
              'system',
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            );
          `;
          
          const { error } = await supabase.rpc('execute_sql', { sql });
          
          if (!error) {
            recipeInserted = true;
            console.log(`Recipe inserted via SQL: ${recipe.title}`);
          } else {
            console.error(`Error inserting recipe via SQL:`, error);
          }
        } catch (err) {
          console.error(`Exception inserting recipe via SQL:`, err);
        }
      }
      
      // Skip ingredients if recipe insert failed
      if (!recipeInserted) {
        console.log(`Skipping ingredients for recipe: ${recipe.title}`);
        continue;
      }
      
      // Process ingredients
      for (const ingredient of recipe.ingredients) {
        try {
          // Check if ingredient already exists
          let ingredientId = ingredientIds[ingredient.name.toLowerCase()];
          
          if (!ingredientId) {
            // Try to get existing ingredient from database
            const { data, error } = await supabase
              .from('ingredients')
              .select('id')
              .ilike('name', ingredient.name)
              .limit(1);
            
            if (!error && data && data.length > 0) {
              ingredientId = data[0].id;
              ingredientIds[ingredient.name.toLowerCase()] = ingredientId;
              console.log(`Using existing ingredient: ${ingredient.name}`);
            } else {
              // Create new ingredient
              const newIngredientId = uuidv4();
              
              const { error: insertError } = await supabase
                .from('ingredients')
                .insert({
                  id: newIngredientId,
                  name: ingredient.name,
                  description: `Ingredient for ${recipe.title}`,
                  created_at: new Date().toISOString()
                });
              
              if (!insertError) {
                ingredientId = newIngredientId;
                ingredientIds[ingredient.name.toLowerCase()] = ingredientId;
                console.log(`Created new ingredient: ${ingredient.name}`);
              } else {
                console.error(`Error creating ingredient:`, insertError);
                continue;
              }
            }
          }
          
          // Create recipe-ingredient relationship
          const { error: relError } = await supabase
            .from('recipe_ingredients')
            .insert({
              id: uuidv4(),
              recipe_id: recipeId,
              ingredient_id: ingredientId,
              quantity: ingredient.quantity || '0',
              unit: ingredient.unit || '',
              created_at: new Date().toISOString()
            });
          
          if (!relError) {
            console.log(`Added ${ingredient.name} to ${recipe.title}`);
          } else {
            console.error(`Error linking ingredient to recipe:`, relError);
          }
        } catch (err) {
          console.error(`Exception processing ingredient ${ingredient.name}:`, err);
        }
      }
    } catch (err) {
      console.error(`Exception processing recipe ${recipe.title}:`, err);
    }
  }
  
  console.log("Recipe data insertion complete");
};

// Run the main function
const main = async () => {
  try {
    await createTables();
    await insertRecipes();
    console.log("Recipe database update complete!");
  } catch (err) {
    console.error("Fatal error:", err);
  }
};

main();