require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to get service role key from .env file
let serviceRoleKey;
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const serviceRoleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  if (serviceRoleKeyMatch) {
    serviceRoleKey = serviceRoleKeyMatch[1];
    console.log('Using service role key from .env file');
  }
} catch (err) {
  console.log('Could not read service role key from .env file, falling back to anon key');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Connecting to Supabase...');
console.log('URL:', url);
console.log('Using key type:', serviceRoleKey ? 'SERVICE ROLE (full permissions)' : 'ANON KEY (limited permissions)');

// Create Supabase client
const supabase = createClient(url, key);

async function createTables() {
  try {
    console.log('Creating missing tables...');
    
    // Check if tables exist before creating them
    const checkTableExists = async (tableName) => {
      try {
        const { error } = await supabase.from(tableName).select('count').limit(1);
        return !error || !error.message.includes('does not exist');
      } catch (e) {
        return false;
      }
    };
    
    const toolsExist = await checkTableExists('tools');
    const libraryExist = await checkTableExists('library');
    
    console.log('Table existence check:', {
      tools: toolsExist ? 'EXISTS' : 'MISSING',
      library: libraryExist ? 'EXISTS' : 'MISSING'
    });
    
    // Only create tables if they don't exist
    let toolsCreated = toolsExist;
    let libraryCreated = libraryExist;
    
    if (!toolsExist) {
      console.log('Creating tools table...');
      try {
        // Create tools table using direct SQL
        const { error } = await supabase.rpc('pg_create_tools_table', {});
        
        if (error && error.message && error.message.includes('does not exist')) {
          console.log('Creating pg_create_tools_table function first...');
          
          // Create the function to create the tools table
          const createFunctionSQL = `
            CREATE OR REPLACE FUNCTION pg_create_tools_table()
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              CREATE TABLE IF NOT EXISTS public.tools (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title TEXT NOT NULL,
                description TEXT,
                type TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            END;
            $$;
          `;
          
          // Execute raw SQL directly via the postgREST API
          const headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'params=single-object'
          };
          
          const body = {
            query: createFunctionSQL
          };
          
          const response = await fetch(`${url}/rest/v1/rpc/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
          });
          
          if (!response.ok) {
            const responseText = await response.text();
            console.error('Error creating function:', responseText);
          } else {
            console.log('Function created successfully, trying to create table...');
            
            // Try direct insert to force table creation
            const { error: insertError } = await supabase.from('tools').insert([
              { 
                title: 'Unit Converter', 
                description: 'Convert between different units of measurement for precise formulation.',
                type: 'calculator'
              }
            ]);
            
            if (insertError && insertError.message && insertError.message.includes('does not exist')) {
              console.error('Tools table could not be created');
              toolsCreated = false;
            } else {
              console.log('Tools table created successfully');
              toolsCreated = true;
            }
          }
        } else if (error) {
          console.error('Error creating tools table:', error.message);
          toolsCreated = false;
        } else {
          console.log('Tools table created successfully');
          toolsCreated = true;
        }
      } catch (err) {
        console.error('Error trying to create tools table:', err.message);
        toolsCreated = false;
      }
    }
    
    // Try to create library table directly
    console.log('Creating library table...');
    try {
      // Direct table creation for library - insert sample data with auto-created table
      const { error: libraryInsertError } = await supabase.from('library').insert([
        { 
          title: 'Processing Techniques', 
          description: 'Reference for common processing techniques used in formulation.',
          content: 'This comprehensive guide covers various processing techniques.',
          category: 'techniques'
        }
      ]);
      
      if (libraryInsertError) {
        console.log('Library insert error (expected if table does not exist):', libraryInsertError.message);
      } else {
        console.log('Library table appears to be created and working successfully!');
      }
    } catch (err) {
      console.error('Error trying to create library table:', err.message);
    }
    
    // Check if the tables exist before trying to insert more data
    console.log('Checking if tables exist to insert more sample data...');
    
    const toolsExist = !insertError;
    let libraryExist = false;
    
    try {
      // Try a simple query to see if the library table exists
      const { data, error } = await supabase.from('library').select('count').limit(1);
      libraryExist = !error || !error.message.includes('does not exist');
    } catch (e) {
      console.log('Error checking library table existence:', e.message);
      libraryExist = false;
    }
    
    // Only try to insert more tools data if the table exists
    if (toolsExist) {
      console.log('Inserting additional tools data...');
      const { error: toolsDataError } = await supabase.from('tools').insert([
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
      ]);
      
      if (toolsDataError) {
        console.error('Error inserting additional tools data:', toolsDataError.message);
      } else {
        console.log('Additional tools data inserted successfully!');
      }
    } else {
      console.log('Skipping additional tools data - table does not exist.');
    }
    
    // Only try to insert more library data if the table exists
    if (libraryExist) {
      console.log('Inserting additional library data...');
      const { error: libraryDataError } = await supabase.from('library').insert([
        { 
          title: 'Ingredient Substitutions', 
          description: 'Find alternatives for ingredients in your formulations.',
          content: 'When you need to substitute ingredients due to allergies, availability or preference, this guide provides equivalent options.',
          category: 'ingredients'
        },
        { 
          title: 'Measurement Guide', 
          description: 'Standard measurement conversions for precise formulation.',
          content: 'Accurate measurements are critical for consistent formulations.',
          category: 'measurements'
        }
      ]);
      
      if (libraryDataError) {
        console.error('Error inserting additional library data:', libraryDataError.message);
      } else {
        console.log('Additional library data inserted successfully!');
      }
    } else {
      console.log('Skipping additional library data - table does not exist.');
    }
    
    console.log('\n========= DATABASE SETUP SUMMARY =========');
    console.log('Tools table: ' + (toolsExist ? 'EXISTS/CREATED' : 'MISSING - Run SQL manually'));
    console.log('Library table: ' + (libraryExist ? 'EXISTS/CREATED' : 'MISSING - Run SQL manually'));
    console.log('');
    console.log('If tables are missing, you need to run the init-db-tables.sql file directly in the Supabase SQL Editor.');
    console.log('The KraftTerminalModularLayout component has been updated to handle missing tables gracefully.');
    console.log('=========================================');
  } catch (error) {
    console.error('Database setup failed:', error.message);
  }
}

createTables();