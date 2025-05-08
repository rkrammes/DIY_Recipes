require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use the proper keys for table creation
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing Supabase configuration');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env or .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase with proper service role key...');
console.log('URL:', url);

// Create Supabase client with service role key for table creation
const supabase = createClient(url, serviceRoleKey);

// Check if a table exists
async function tableExists(tableName) {
  try {
    const { error } = await supabase.from(tableName).select('count').limit(1);
    return !error || !error.message.includes('does not exist');
  } catch (e) {
    return false;
  }
}

// Read the SQL file with table creation commands
const sqlFilePath = path.join(__dirname, 'init-db-tables.sql');
let sqlContent;

try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`SQL file loaded: ${sqlFilePath}`);
} catch (error) {
  console.error(`Error reading SQL file: ${error.message}`);
  process.exit(1);
}

// Create tables if they don't exist
async function createTablesIfNeeded() {
  try {
    console.log('Checking if tables exist...');
    
    const tablesExist = {
      tools: await tableExists('tools'),
      library: await tableExists('library')
    };
    
    console.log('Current table status:');
    console.log(`- tools: ${tablesExist.tools ? 'EXISTS' : 'MISSING'}`);
    console.log(`- library: ${tablesExist.library ? 'EXISTS' : 'MISSING'}`);
    
    if (!tablesExist.tools || !tablesExist.library) {
      console.log('\nAttempting to create missing tables...');
      
      // Try creating tools table with direct insert
      if (!tablesExist.tools) {
        console.log('Creating tools table with sample data...');
        // Try to insert - if the table doesn't exist, this will fail
        try {
          const { error } = await supabase.from('tools').insert([
            { 
              title: 'Terminal Compiler', 
              description: 'Compiles terminal sequences with optimized output', 
              type: 'development' 
            }
          ]);
          
          if (error) {
            console.log(`Error: ${error.message}`);
            console.log('Table needs to be created with SQL first...');
          } else {
            console.log('✅ Tools table created and populated successfully!');
          }
        } catch (e) {
          console.error(`Error creating tools table: ${e.message}`);
        }
      }
      
      // Try creating library table with direct insert
      if (!tablesExist.library) {
        console.log('Creating library table with sample data...');
        try {
          const { error } = await supabase.from('library').insert([
            { 
              title: 'Terminal Interface Guide', 
              description: 'Guide for terminal interface conventions', 
              content: 'The terminal interface follows standard VT100 conventions.', 
              category: 'documentation'
            }
          ]);
          
          if (error) {
            console.log(`Error: ${error.message}`);
            console.log('Table needs to be created with SQL first...');
          } else {
            console.log('✅ Library table created and populated successfully!');
          }
        } catch (e) {
          console.error(`Error creating library table: ${e.message}`);
        }
      }
      
      // Since direct inserts might fail, try executing SQL directly
      if ((!tablesExist.tools || !tablesExist.library) && sqlContent) {
        console.log('\nExecuting SQL directly to create tables...');
        try {
          // This is where you would execute the SQL directly
          // Supabase REST API doesn't directly support executing arbitrary SQL
          // We would need to create a function in Supabase to execute the SQL
          
          console.log('\nIMPORTANT: Since we cannot execute SQL directly via the API,');
          console.log('you will need to execute the SQL in the Supabase SQL Editor:');
          console.log('1. Log in to https://supabase.com');
          console.log('2. Go to your project: bzudglfxxywugesncjnz');
          console.log('3. Navigate to the SQL Editor');
          console.log(`4. Copy and paste the contents of ${sqlFilePath}`);
          console.log('5. Run the SQL');
          
          // Output first few lines of SQL for reference
          const sqlPreview = sqlContent.split('\n').slice(0, 10).join('\n');
          console.log('\nSQL preview:');
          console.log('```sql');
          console.log(sqlPreview + '...');
          console.log('```');
        } catch (error) {
          console.error(`Error executing SQL: ${error.message}`);
        }
      }
    } else {
      console.log('\n✅ All required tables already exist!');
    }
    
    // Check if the tables have data
    if (tablesExist.tools) {
      const { data: toolsData, error: toolsError } = await supabase.from('tools').select('count');
      if (!toolsError && toolsData && toolsData.length > 0) {
        console.log(`Tools table has ${toolsData[0].count} records`);
      } else {
        console.log('Tools table exists but may be empty');
      }
    }
    
    if (tablesExist.library) {
      const { data: libraryData, error: libraryError } = await supabase.from('library').select('count');
      if (!libraryError && libraryData && libraryData.length > 0) {
        console.log(`Library table has ${libraryData[0].count} records`);
      } else {
        console.log('Library table exists but may be empty');
      }
    }
    
    // Final status update
    console.log('\n=== DATABASE STATUS SUMMARY ===');
    const finalToolsExists = await tableExists('tools');
    const finalLibraryExists = await tableExists('library');
    
    console.log(`Tools table: ${finalToolsExists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`Library table: ${finalLibraryExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!finalToolsExists || !finalLibraryExists) {
      console.log('\nSome tables are still missing. Use the Supabase SQL Editor to create them.');
      console.log('The KraftTerminalModularLayout component is designed to handle missing tables gracefully.');
    } else {
      console.log('\nAll tables exist! The application should work with real data.');
    }
  } catch (error) {
    console.error('Error during table creation:', error.message);
  }
}

// Run the function
createTablesIfNeeded();