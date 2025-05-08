require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase config from env
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase configuration in .env or .env.local');
  process.exit(1);
}

console.log('Supabase URL:', url);
console.log('Using key starting with:', key.substring(0, 10) + '...');

if (key.includes('service_role')) {
  console.log('Using SERVICE ROLE key - should have table creation permissions');
} else {
  console.log('Using ANON key - likely has limited permissions');
}

// Create Supabase client
const supabase = createClient(url, key);

// Simple function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const { error } = await supabase.from(tableName).select('count').limit(1);
    return !error || !error.message.includes('does not exist');
  } catch (e) {
    return false;
  }
}

// Create a simple insert function
async function insertIntoTable(tableName, data) {
  try {
    const { error } = await supabase.from(tableName).insert([data]);
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Exception inserting into ${tableName}:`, e.message);
    return false;
  }
}

async function setupDatabase() {
  try {
    // Check which tables exist
    const tablesExist = {
      tools: await checkTableExists('tools'),
      library: await checkTableExists('library')
    };
    
    console.log('Current database status:');
    console.log(`- tools table: ${tablesExist.tools ? 'EXISTS' : 'MISSING'}`);
    console.log(`- library table: ${tablesExist.library ? 'EXISTS' : 'MISSING'}`);
    
    let toolsSuccess = tablesExist.tools;
    let librarySuccess = tablesExist.library;
    
    // If tools table doesn't exist, try to create it with a direct insert
    if (!tablesExist.tools) {
      console.log('\nAttempting to create tools table with direct insert...');
      const toolsData = {
        title: 'Unit Converter', 
        description: 'Convert between different units of measurement for precise formulation.', 
        type: 'calculator'
      };
      
      toolsSuccess = await insertIntoTable('tools', toolsData);
      
      if (toolsSuccess) {
        console.log('✅ Tools table created successfully!');
        
        // Add more tools data
        const moreToolsData = [
          {
            title: 'Formulation Timer', 
            description: 'Keep track of processing times for multiple steps in your formulations.', 
            type: 'timer'
          },
          {
            title: 'Scaling Calculator', 
            description: 'Scale formulation quantities up or down while maintaining proportions.', 
            type: 'calculator'
          }
        ];
        
        for (const data of moreToolsData) {
          await insertIntoTable('tools', data);
        }
        
        console.log('Added more sample tools data');
      } else {
        console.log('❌ Failed to create tools table');
      }
    }
    
    // If library table doesn't exist, try to create it with a direct insert
    if (!tablesExist.library) {
      console.log('\nAttempting to create library table with direct insert...');
      const libraryData = {
        title: 'Processing Techniques', 
        description: 'Reference for common processing techniques used in formulation.', 
        content: 'This comprehensive guide covers various processing techniques.', 
        category: 'techniques'
      };
      
      librarySuccess = await insertIntoTable('library', libraryData);
      
      if (librarySuccess) {
        console.log('✅ Library table created successfully!');
        
        // Add more library data
        const moreLibraryData = [
          {
            title: 'Ingredient Substitutions', 
            description: 'Find alternatives for ingredients in your formulations.', 
            content: 'When you need to substitute ingredients due to allergies or preferences.', 
            category: 'ingredients'
          },
          {
            title: 'Measurement Guide', 
            description: 'Standard measurement conversions for precise formulation.', 
            content: 'Accurate measurements are critical for consistent formulations.', 
            category: 'measurements'
          }
        ];
        
        for (const data of moreLibraryData) {
          await insertIntoTable('library', data);
        }
        
        console.log('Added more sample library data');
      } else {
        console.log('❌ Failed to create library table');
      }
    }
    
    // Final status
    console.log('\n=== FINAL DATABASE STATUS ===');
    console.log(`Tools table: ${toolsSuccess ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`Library table: ${librarySuccess ? 'AVAILABLE' : 'MISSING'}`);
    console.log('');
    
    if (!toolsSuccess || !librarySuccess) {
      console.log('Some tables could not be created.');
      console.log('IMPORTANT: The KraftTerminalModularLayout has been updated to handle missing');
      console.log('tables gracefully. The application will still work, but with limited data.');
      console.log('\nTo manually create the tables, run the SQL in the Supabase SQL Editor:');
      console.log('  - Navigate to your Supabase project');
      console.log('  - Go to the SQL Editor');
      console.log(`  - Copy and paste the contents of ${path.join(__dirname, 'init-db-tables.sql')}`);
      console.log('  - Run the SQL');
    } else {
      console.log('✅ All tables are available and populated with data!');
      console.log('The KraftTerminalModularLayout will now show real data from Supabase.');
    }
    
    return { toolsSuccess, librarySuccess };
  } catch (error) {
    console.error('Error setting up database:', error.message);
    return { toolsSuccess: false, librarySuccess: false };
  }
}

// Run the setup
setupDatabase();