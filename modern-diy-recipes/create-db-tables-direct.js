require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use the service role key for database operations
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing Supabase configuration');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase with service role key...');

// Create a Supabase client with the service role key
const supabase = createClient(url, serviceRoleKey);

// Functions to create tables and insert data
async function createToolsTable() {
  console.log('Creating tools table...');
  
  try {
    const { error } = await supabase.rpc('create_tools_table', {});
    
    if (error && error.message.includes('does not exist')) {
      console.log('Creating stored procedure first...');
      
      // Create the stored procedure
      const { error: procError } = await supabase.rpc('exec_sql', {
        sql: `
        CREATE OR REPLACE FUNCTION create_tools_table()
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
        `
      });
      
      if (procError) {
        console.error('Error creating stored procedure:', procError.message);
        
        // Try direct SQL if possible
        console.log('Attempting direct SQL to create tools table...');
        const { error: directError } = await supabase.from('tools').insert([
          { 
            title: 'Unit Converter', 
            description: 'Convert between different units of measurement for precise formulation.', 
            type: 'calculator'
          }
        ]);
        
        if (directError) {
          if (directError.message.includes('does not exist')) {
            console.error('Could not create tools table automatically');
            console.log('You will need to create it manually in the Supabase SQL Editor');
            return false;
          } else {
            console.error('Other error:', directError.message);
            return false;
          }
        } else {
          console.log('✅ Tools table created successfully!');
          return true;
        }
      } else {
        // Run the stored procedure
        const { error: execError } = await supabase.rpc('create_tools_table', {});
        
        if (execError) {
          console.error('Error executing stored procedure:', execError.message);
          return false;
        } else {
          console.log('✅ Tools table created successfully!');
          return true;
        }
      }
    } else if (error) {
      console.error('Error creating tools table:', error.message);
      return false;
    } else {
      console.log('✅ Tools table created successfully!');
      return true;
    }
  } catch (e) {
    console.error('Exception creating tools table:', e.message);
    return false;
  }
}

async function createLibraryTable() {
  console.log('Creating library table...');
  
  try {
    const { error } = await supabase.rpc('create_library_table', {});
    
    if (error && error.message.includes('does not exist')) {
      console.log('Creating stored procedure first...');
      
      // Create the stored procedure
      const { error: procError } = await supabase.rpc('exec_sql', {
        sql: `
        CREATE OR REPLACE FUNCTION create_library_table()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.library (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            content TEXT,
            category TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$;
        `
      });
      
      if (procError) {
        console.error('Error creating stored procedure:', procError.message);
        
        // Try direct SQL if possible
        console.log('Attempting direct SQL to create library table...');
        const { error: directError } = await supabase.from('library').insert([
          { 
            title: 'Processing Techniques', 
            description: 'Reference for common processing techniques used in formulation.', 
            content: 'This comprehensive guide covers various processing techniques.',
            category: 'techniques'
          }
        ]);
        
        if (directError) {
          if (directError.message.includes('does not exist')) {
            console.error('Could not create library table automatically');
            console.log('You will need to create it manually in the Supabase SQL Editor');
            return false;
          } else {
            console.error('Other error:', directError.message);
            return false;
          }
        } else {
          console.log('✅ Library table created successfully!');
          return true;
        }
      } else {
        // Run the stored procedure
        const { error: execError } = await supabase.rpc('create_library_table', {});
        
        if (execError) {
          console.error('Error executing stored procedure:', execError.message);
          return false;
        } else {
          console.log('✅ Library table created successfully!');
          return true;
        }
      }
    } else if (error) {
      console.error('Error creating library table:', error.message);
      return false;
    } else {
      console.log('✅ Library table created successfully!');
      return true;
    }
  } catch (e) {
    console.error('Exception creating library table:', e.message);
    return false;
  }
}

async function insertToolsData() {
  console.log('Inserting sample tools data...');
  
  const toolsData = [
    { 
      title: 'Unit Converter', 
      description: 'Convert between different units of measurement for precise formulation.', 
      type: 'calculator'
    },
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
  
  for (const data of toolsData) {
    try {
      const { error } = await supabase.from('tools').upsert([data], {
        onConflict: 'title'
      });
      
      if (error) {
        console.error(`Error inserting ${data.title}:`, error.message);
      } else {
        console.log(`✅ Inserted "${data.title}" tool`);
      }
    } catch (e) {
      console.error(`Exception inserting ${data.title}:`, e.message);
    }
  }
}

async function insertLibraryData() {
  console.log('Inserting sample library data...');
  
  const libraryData = [
    { 
      title: 'Processing Techniques', 
      description: 'Reference for common processing techniques used in formulation.', 
      content: 'This comprehensive guide covers various processing techniques.',
      category: 'techniques'
    },
    { 
      title: 'Ingredient Substitutions', 
      description: 'Find alternatives for ingredients in your formulations.', 
      content: 'When you need to substitute ingredients due to allergies.',
      category: 'ingredients'
    },
    { 
      title: 'Measurement Guide', 
      description: 'Standard measurement conversions for precise formulation.', 
      content: 'Accurate measurements are critical for consistent formulations.',
      category: 'measurements'
    }
  ];
  
  for (const data of libraryData) {
    try {
      const { error } = await supabase.from('library').upsert([data], {
        onConflict: 'title'
      });
      
      if (error) {
        console.error(`Error inserting ${data.title}:`, error.message);
      } else {
        console.log(`✅ Inserted "${data.title}" library item`);
      }
    } catch (e) {
      console.error(`Exception inserting ${data.title}:`, e.message);
    }
  }
}

async function main() {
  // Check if tables exist
  const checkTableExists = async (tableName) => {
    try {
      const { error } = await supabase.from(tableName).select('count').limit(1);
      return !error || !error.message.includes('does not exist');
    } catch (e) {
      return false;
    }
  };
  
  console.log('Checking if tables exist...');
  const toolsExist = await checkTableExists('tools');
  const libraryExist = await checkTableExists('library');
  
  console.log('Current table status:');
  console.log(`- tools table: ${toolsExist ? 'EXISTS' : 'MISSING'}`);
  console.log(`- library table: ${libraryExist ? 'EXISTS' : 'MISSING'}`);
  
  let toolsCreated = toolsExist;
  let libraryCreated = libraryExist;
  
  // Create tables if they don't exist
  if (!toolsExist) {
    toolsCreated = await createToolsTable();
  }
  
  if (!libraryExist) {
    libraryCreated = await createLibraryTable();
  }
  
  // Insert data if tables were created or already existed
  if (toolsCreated) {
    await insertToolsData();
  }
  
  if (libraryCreated) {
    await insertLibraryData();
  }
  
  // Check final status
  const finalToolsExist = await checkTableExists('tools');
  const finalLibraryExist = await checkTableExists('library');
  
  console.log('\n=== FINAL DATABASE STATUS ===');
  console.log(`Tools table: ${finalToolsExist ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`Library table: ${finalLibraryExist ? '✅ EXISTS' : '❌ MISSING'}`);
  
  if (!finalToolsExist || !finalLibraryExist) {
    console.log('\nSome tables could not be created automatically.');
    console.log('Please use the init-db-tables.sql script in the Supabase SQL Editor to create them manually.');
  } else {
    console.log('\n✅ Database setup complete!');
    console.log('You can now run the application with:');
    console.log('  npm run dev');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
});