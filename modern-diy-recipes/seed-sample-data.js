const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample formulations data with realistic names and descriptions
const formulations = [
  {
    id: 'form-1',
    title: 'Lightweight Matte Moisturizer',
    description: 'A fast-absorbing daily moisturizer with a non-greasy finish.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    version: '1.2',
    status: 'published',
    instructions: 'Mix Phase A ingredients and heat to 75°C. Separately, combine Phase B ingredients and heat to 75°C. Slowly add Phase B to Phase A while stirring. Cool to 45°C, then add Phase C ingredients one by one while stirring gently. Continue stirring until mixture reaches room temperature.'
  },
  {
    id: 'form-2',
    title: 'Hydrating Facial Serum',
    description: 'Lightweight hyaluronic acid serum that deeply hydrates the skin.',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    version: '2.0',
    status: 'published',
    instructions: 'Combine water and glycerin in a beaker. Sprinkle hyaluronic acid powder slowly while stirring to avoid clumping. Let sit for 4 hours to fully hydrate. Add preservative and mix thoroughly.'
  },
  {
    id: 'form-3',
    title: 'Exfoliating Clay Mask',
    description: 'Kaolin clay mask with gentle fruit acids for weekly exfoliation.',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    version: '1.0',
    status: 'draft',
    instructions: 'Mix all dry ingredients in a bowl. In a separate container, combine all liquid ingredients. Slowly add liquid mixture to dry ingredients while stirring continuously until smooth. Package immediately.'
  },
  {
    id: 'form-4',
    title: 'Nourishing Hair Oil Blend',
    description: 'Rich oil blend for deep conditioning damaged hair.',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    version: '1.1',
    status: 'published',
    instructions: 'Measure all oils into a clean, dry container. Add essential oils if using. Mix gently by rotating the container. Let sit for 24 hours before first use to allow oils to fully blend.'
  },
  {
    id: 'form-5',
    title: 'Soothing Aloe Gel',
    description: 'Cooling aloe gel with chamomile for irritated skin.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    version: '1.3',
    status: 'published',
    instructions: 'Combine aloe vera gel and glycerin, stir gently. Add chamomile extract and preservative. Mix until uniform. Test pH and adjust to 5.5-6.0 if needed.'
  },
  {
    id: 'form-6',
    title: 'Balancing Facial Toner',
    description: 'Alcohol-free toner with witch hazel and rose water.',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    version: '1.0',
    status: 'draft',
    instructions: 'Mix all ingredients in a sterilized glass container. Stir gently to combine. Filter through a fine mesh strainer or coffee filter if necessary. Transfer to sterilized bottles.'
  },
  {
    id: 'form-7',
    title: 'Rejuvenating Night Cream',
    description: 'Rich night cream with peptides and botanical extracts.',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    version: '2.1',
    status: 'published',
    instructions: 'Combine oils and emulsifiers in Phase A and heat to 70°C. Combine water and water-soluble ingredients in Phase B and heat to 70°C. Slowly add Phase B to Phase A while stirring constantly. Cool to 45°C, then add heat-sensitive ingredients in Phase C. Continue stirring until cooled to room temperature.'
  }
];

// Sample ingredients data
const ingredients = [
  {
    id: 'ing-1',
    name: 'Aloe Vera Gel',
    description: 'Soothing base ingredient with hydrating properties',
    inci_name: 'Aloe Barbadensis Leaf Juice',
    category: 'botanical',
    properties: { hydrating: 9, soothing: 10, moisturizing: 7 }
  },
  {
    id: 'ing-2',
    name: 'Glycerin',
    description: 'Humectant that attracts moisture to the skin',
    inci_name: 'Glycerin',
    category: 'humectant',
    properties: { hydrating: 9, moisturizing: 8, occlusive: 3 }
  },
  {
    id: 'ing-3',
    name: 'Jojoba Oil',
    description: 'Lightweight oil similar to skin\'s natural sebum',
    inci_name: 'Simmondsia Chinensis Seed Oil',
    category: 'carrier oil',
    properties: { moisturizing: 8, occlusive: 6, conditioning: 7 }
  },
  {
    id: 'ing-4',
    name: 'Hyaluronic Acid',
    description: 'Powerful humectant that holds up to 1000x its weight in water',
    inci_name: 'Sodium Hyaluronate',
    category: 'humectant',
    properties: { hydrating: 10, plumping: 9, antiAging: 8 }
  },
  {
    id: 'ing-5',
    name: 'Kaolin Clay',
    description: 'Mild clay that absorbs excess oil without drying',
    inci_name: 'Kaolin',
    category: 'clay',
    properties: { absorbing: 8, detoxifying: 7, clarifying: 7 }
  },
  {
    id: 'ing-6',
    name: 'Rosehip Oil',
    description: 'Rich in vitamins and antioxidants for skin repair',
    inci_name: 'Rosa Canina Fruit Oil',
    category: 'carrier oil',
    properties: { regenerating: 8, nourishing: 9, antiAging: 7 }
  },
  {
    id: 'ing-7',
    name: 'Witch Hazel Extract',
    description: 'Natural astringent with soothing properties',
    inci_name: 'Hamamelis Virginiana Water',
    category: 'botanical',
    properties: { toning: 8, soothing: 6, clarifying: 7 }
  },
  {
    id: 'ing-8',
    name: 'Cetyl Alcohol',
    description: 'Emollient and thickener for creams and lotions',
    inci_name: 'Cetyl Alcohol',
    category: 'emollient',
    properties: { thickening: 8, stabilizing: 7, emollient: 6 }
  },
  {
    id: 'ing-9',
    name: 'Chamomile Extract',
    description: 'Calming botanical extract for sensitive skin',
    inci_name: 'Chamomilla Recutita Flower Extract',
    category: 'botanical',
    properties: { soothing: 9, antiInflammatory: 8, calming: 9 }
  },
  {
    id: 'ing-10',
    name: 'Peptide Complex',
    description: 'Anti-aging ingredient that supports collagen production',
    inci_name: 'Palmitoyl Tripeptide-1',
    category: 'active',
    properties: { antiAging: 9, firming: 8, regenerating: 8 }
  }
];

// Sample formulation-ingredient relationships
const formulation_ingredients = [
  // Lightweight Matte Moisturizer ingredients
  { formulation_id: 'form-1', ingredient_id: 'ing-1', quantity: 60, unit: 'g', notes: 'Base ingredient' },
  { formulation_id: 'form-1', ingredient_id: 'ing-2', quantity: 5, unit: 'g', notes: 'Humectant' },
  { formulation_id: 'form-1', ingredient_id: 'ing-3', quantity: 10, unit: 'g', notes: 'Lightweight emollient' },
  { formulation_id: 'form-1', ingredient_id: 'ing-8', quantity: 3, unit: 'g', notes: 'Thickener' },
  
  // Hydrating Facial Serum ingredients
  { formulation_id: 'form-2', ingredient_id: 'ing-1', quantity: 80, unit: 'g', notes: 'Base' },
  { formulation_id: 'form-2', ingredient_id: 'ing-2', quantity: 8, unit: 'g', notes: 'Humectant' },
  { formulation_id: 'form-2', ingredient_id: 'ing-4', quantity: 1, unit: 'g', notes: 'Primary active' },
  
  // Exfoliating Clay Mask ingredients
  { formulation_id: 'form-3', ingredient_id: 'ing-5', quantity: 40, unit: 'g', notes: 'Main active' },
  { formulation_id: 'form-3', ingredient_id: 'ing-1', quantity: 30, unit: 'g', notes: 'Soothing base' },
  { formulation_id: 'form-3', ingredient_id: 'ing-9', quantity: 2, unit: 'g', notes: 'Calming agent' },
  
  // Nourishing Hair Oil Blend ingredients
  { formulation_id: 'form-4', ingredient_id: 'ing-3', quantity: 40, unit: 'ml', notes: 'Light oil base' },
  { formulation_id: 'form-4', ingredient_id: 'ing-6', quantity: 10, unit: 'ml', notes: 'Reparative oil' },
  
  // Soothing Aloe Gel ingredients
  { formulation_id: 'form-5', ingredient_id: 'ing-1', quantity: 90, unit: 'g', notes: 'Main ingredient' },
  { formulation_id: 'form-5', ingredient_id: 'ing-2', quantity: 5, unit: 'g', notes: 'Humectant' },
  { formulation_id: 'form-5', ingredient_id: 'ing-9', quantity: 3, unit: 'g', notes: 'Soothing active' },
  
  // Balancing Facial Toner ingredients
  { formulation_id: 'form-6', ingredient_id: 'ing-7', quantity: 50, unit: 'ml', notes: 'Main active' },
  { formulation_id: 'form-6', ingredient_id: 'ing-1', quantity: 45, unit: 'ml', notes: 'Soothing base' },
  { formulation_id: 'form-6', ingredient_id: 'ing-2', quantity: 5, unit: 'ml', notes: 'Humectant' },
  
  // Rejuvenating Night Cream ingredients
  { formulation_id: 'form-7', ingredient_id: 'ing-8', quantity: 5, unit: 'g', notes: 'Thickener' },
  { formulation_id: 'form-7', ingredient_id: 'ing-6', quantity: 15, unit: 'g', notes: 'Nourishing oil' },
  { formulation_id: 'form-7', ingredient_id: 'ing-10', quantity: 2, unit: 'g', notes: 'Anti-aging active' },
  { formulation_id: 'form-7', ingredient_id: 'ing-2', quantity: 8, unit: 'g', notes: 'Humectant' }
];

// Sample iterations data (version history)
const iterations = [
  // Lightweight Matte Moisturizer versions
  {
    id: 'v-1-1',
    formulation_id: 'form-1',
    version_number: 1,
    title: 'Initial Formula',
    description: 'First attempt with basic ingredients',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    notes: 'Good texture but could be more hydrating',
    metrics: { absorption: 7, hydration: 6, longevity: 6 }
  },
  {
    id: 'v-1-2',
    formulation_id: 'form-1',
    version_number: 2,
    title: 'Improved Hydration',
    description: 'Increased glycerin percentage for better hydration',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: 'Better hydration but slightly tacky finish',
    metrics: { absorption: 7, hydration: 8, longevity: 7 }
  },
  {
    id: 'v-1-3',
    formulation_id: 'form-1',
    version_number: 3,
    title: 'Final Formula',
    description: 'Balanced formula with optimal hydration and finish',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'Excellent balance of hydration and finish',
    metrics: { absorption: 9, hydration: 8, longevity: 8 }
  },
  
  // Hydrating Facial Serum versions
  {
    id: 'v-2-1',
    formulation_id: 'form-2',
    version_number: 1,
    title: 'Basic Serum',
    description: 'Simple hyaluronic acid serum',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    notes: 'Good but could be more hydrating',
    metrics: { absorption: 8, hydration: 7, longevity: 6 }
  },
  {
    id: 'v-2-2',
    formulation_id: 'form-2',
    version_number: 2,
    title: 'Enhanced Formula',
    description: 'Added glycerin for better moisture retention',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Much better hydration and skin feel',
    metrics: { absorption: 9, hydration: 9, longevity: 8 }
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('Starting to seed the database...');
    
    // Create tables if they don't exist
    console.log('Creating tables if they don\'t exist...');
    
    // Create formulations table
    const { error: formulationsTableError } = await supabase.rpc('create_formulations_table_if_not_exists');
    if (formulationsTableError) {
      console.error('Error creating formulations table:', formulationsTableError);
      
      // Try direct SQL as fallback
      const { error: directFormulationsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS formulations (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          version TEXT,
          status TEXT,
          instructions TEXT
        )
      `);
      
      if (directFormulationsError) {
        console.error('Error with direct formulations table creation:', directFormulationsError);
      }
    }
    
    // Create ingredients table
    const { error: ingredientsTableError } = await supabase.rpc('create_ingredients_table_if_not_exists');
    if (ingredientsTableError) {
      console.error('Error creating ingredients table:', ingredientsTableError);
      
      // Try direct SQL as fallback
      const { error: directIngredientsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS ingredients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          inci_name TEXT,
          category TEXT,
          properties JSONB
        )
      `);
      
      if (directIngredientsError) {
        console.error('Error with direct ingredients table creation:', directIngredientsError);
      }
    }
    
    // Create formulation_ingredients junction table
    const { error: junctionTableError } = await supabase.rpc('create_formulation_ingredients_table_if_not_exists');
    if (junctionTableError) {
      console.error('Error creating formulation_ingredients table:', junctionTableError);
      
      // Try direct SQL as fallback
      const { error: directJunctionError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS formulation_ingredients (
          id SERIAL PRIMARY KEY,
          formulation_id TEXT REFERENCES formulations(id) ON DELETE CASCADE,
          ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
          quantity NUMERIC,
          unit TEXT,
          notes TEXT,
          UNIQUE(formulation_id, ingredient_id)
        )
      `);
      
      if (directJunctionError) {
        console.error('Error with direct formulation_ingredients table creation:', directJunctionError);
      }
    }
    
    // Create iterations table (version history)
    const { error: iterationsTableError } = await supabase.rpc('create_iterations_table_if_not_exists');
    if (iterationsTableError) {
      console.error('Error creating iterations table:', iterationsTableError);
      
      // Try direct SQL as fallback
      const { error: directIterationsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS iterations (
          id TEXT PRIMARY KEY,
          formulation_id TEXT REFERENCES formulations(id) ON DELETE CASCADE,
          version_number INTEGER,
          title TEXT,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          metrics JSONB,
          UNIQUE(formulation_id, version_number)
        )
      `);
      
      if (directIterationsError) {
        console.error('Error with direct iterations table creation:', directIterationsError);
      }
    }
    
    // Insert the sample data
    
    // Clear existing data first
    console.log('Clearing existing data...');
    
    // We need to clear in the correct order due to foreign key constraints
    const { error: clearIterationsError } = await supabase
      .from('iterations')
      .delete()
      .not('id', 'is', null);
    
    if (clearIterationsError) {
      console.error('Error clearing iterations:', clearIterationsError);
    }
    
    const { error: clearJunctionError } = await supabase
      .from('formulation_ingredients')
      .delete()
      .not('id', 'is', null);
    
    if (clearJunctionError) {
      console.error('Error clearing formulation_ingredients:', clearJunctionError);
    }
    
    const { error: clearFormulationsError } = await supabase
      .from('formulations')
      .delete()
      .not('id', 'is', null);
    
    if (clearFormulationsError) {
      console.error('Error clearing formulations:', clearFormulationsError);
    }
    
    const { error: clearIngredientsError } = await supabase
      .from('ingredients')
      .delete()
      .not('id', 'is', null);
    
    if (clearIngredientsError) {
      console.error('Error clearing ingredients:', clearIngredientsError);
    }
    
    // Insert new data
    console.log('Inserting formulations...');
    const { error: formulationsError } = await supabase
      .from('formulations')
      .insert(formulations);
    
    if (formulationsError) {
      console.error('Error inserting formulations:', formulationsError);
    } else {
      console.log(`Successfully inserted ${formulations.length} formulations`);
    }
    
    console.log('Inserting ingredients...');
    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .insert(ingredients);
    
    if (ingredientsError) {
      console.error('Error inserting ingredients:', ingredientsError);
    } else {
      console.log(`Successfully inserted ${ingredients.length} ingredients`);
    }
    
    console.log('Inserting formulation-ingredient relationships...');
    const { error: junctionError } = await supabase
      .from('formulation_ingredients')
      .insert(formulation_ingredients);
    
    if (junctionError) {
      console.error('Error inserting formulation_ingredients:', junctionError);
    } else {
      console.log(`Successfully inserted ${formulation_ingredients.length} formulation-ingredient relationships`);
    }
    
    console.log('Inserting iterations (version history)...');
    const { error: iterationsError } = await supabase
      .from('iterations')
      .insert(iterations);
    
    if (iterationsError) {
      console.error('Error inserting iterations:', iterationsError);
    } else {
      console.log(`Successfully inserted ${iterations.length} iterations`);
    }
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error in seed process:', error);
  }
}

// Run the seeding function
seedDatabase()
  .catch(console.error)
  .finally(() => {
    console.log('Seed script execution finished');
    process.exit(0);
  });