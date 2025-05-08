require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Update .env.local file with correct Supabase information from .env
console.log('Fixing Supabase configuration in .env.local...');

const envFilePath = path.join(__dirname, '.env.local');
let envFileContent = fs.readFileSync(envFilePath, 'utf8');

// Read values from .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Replace the incorrect values in .env.local with the correct ones from .env
envFileContent = envFileContent
  .replace(/NEXT_PUBLIC_SUPABASE_URL=.*$/m, `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`)
  .replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`);

// Add flag to disable mock data
if (!envFileContent.includes('NEXT_PUBLIC_USE_FALLBACK_DATA')) {
  envFileContent += '\nNEXT_PUBLIC_USE_FALLBACK_DATA=false\n';
} else {
  envFileContent = envFileContent.replace(/NEXT_PUBLIC_USE_FALLBACK_DATA=.*$/m, 'NEXT_PUBLIC_USE_FALLBACK_DATA=false');
}

fs.writeFileSync(envFilePath, envFileContent);
console.log('Environment configuration fixed!');

// Now update the supabaseConfig.js file to recognize the table issue
console.log('Updating supabaseConfig.js to handle missing tables...');

const configFilePath = path.join(__dirname, 'src', 'lib', 'supabaseConfig.js');
let configFileContent = fs.readFileSync(configFilePath, 'utf8');

// Make sure the URL and key are consistent
const updatedConfigContent = configFileContent
  .replace(/export const FALLBACK_RECIPES = \[\];/, `export const FALLBACK_RECIPES = [];

// Table existence flags - will be checked at runtime
export const REQUIRED_TABLES = ['recipes', 'ingredients', 'tools', 'library'];
export const TABLES_EXIST = {
  recipes: true,
  ingredients: true,
  tools: false,
  library: false
};`);

fs.writeFileSync(configFilePath, updatedConfigContent);
console.log('supabaseConfig.js updated!');

// Create a database initialization script
console.log('Creating database initialization script...');

const sqlScriptPath = path.join(__dirname, 'init-db-tables.sql');
const sqlContent = `-- SQL script to create missing tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create library table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample tools data
INSERT INTO public.tools (title, description, type)
VALUES
  ('Unit Converter', 'Convert between different units of measurement for precise formulation.', 'calculator'),
  ('Formulation Timer', 'Keep track of processing times for multiple steps in your formulations.', 'timer'),
  ('Scaling Calculator', 'Scale formulation quantities up or down while maintaining proportions.', 'calculator')
ON CONFLICT (title) DO NOTHING;

-- Insert sample library data
INSERT INTO public.library (title, description, content, category)
VALUES
  ('Processing Techniques', 'Reference for common processing techniques used in formulation.', 'This comprehensive guide covers various processing techniques.', 'techniques'),
  ('Ingredient Substitutions', 'Find alternatives for ingredients in your formulations.', 'When you need to substitute ingredients due to allergies.', 'ingredients'),
  ('Measurement Guide', 'Standard measurement conversions for precise formulation.', 'Accurate measurements are critical for consistent formulations.', 'measurements')
ON CONFLICT (title) DO NOTHING;
`;

fs.writeFileSync(sqlScriptPath, sqlContent);
console.log('SQL script created. Run this script in the Supabase SQL Editor to create the missing tables.');

// Update KraftTerminalModularLayout.tsx to handle missing tables
console.log('Updating KraftTerminalModularLayout.tsx to handle missing tables...');

const layoutFilePath = path.join(__dirname, 'src', 'components', 'layouts', 'KraftTerminalModularLayout.tsx');
let layoutFileContent = fs.readFileSync(layoutFilePath, 'utf8');

// Add a check for table existence in the database connection function
const tableExistenceCheck = `
        // Check if table exists before querying it
        const checkTableExists = async (tableName) => {
          try {
            const { error } = await supabase.from(tableName).select('count').limit(1);
            return !error || !error.message.includes('does not exist');
          } catch (e) {
            return false;
          }
        };
        
        // Only query tables that exist
        const tablesExist = {
          recipes: await checkTableExists('recipes'),
          ingredients: await checkTableExists('ingredients'),
          tools: await checkTableExists('tools'),
          library: await checkTableExists('library')
        };
        
        console.log('Table existence check:', tablesExist);`;

// Insert the table check code before setting formulations
const insertPoint = 'if (formulationsData) {';
const newContent = layoutFileContent.replace(insertPoint, `${tableExistenceCheck}\n\n        ${insertPoint}`);

fs.writeFileSync(layoutFilePath, newContent);
console.log('KraftTerminalModularLayout.tsx updated!');

console.log('\nAll fixes applied! Please:');
console.log('1. Run the SQL script "init-db-tables.sql" in your Supabase SQL Editor');
console.log('2. Restart your application to apply the configuration changes');
console.log('3. The app should now correctly handle the missing tables scenario');