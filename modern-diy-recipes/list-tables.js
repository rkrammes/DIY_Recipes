// Script to list all tables in the Supabase database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE URL:', supabaseUrl);
console.log('ANON KEY PROVIDED:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log('Listing all tables in the Supabase database...');
  
  try {
    // Query the information_schema.tables to get all tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.error('Error querying information_schema:', error);
      
      // Alternative approach - test for expected tables
      console.log('\nTrying alternative approach - testing for known tables:');
      
      const tables = ['recipes', 'ingredients', 'recipe_ingredients', 'iterations', 
                      'development_tasks', 'development_decisions', 'integration_status'];
      
      for (const table of tables) {
        try {
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.log(`❌ Table '${table}' likely doesn't exist:`, countError.message);
          } else {
            console.log(`✅ Table '${table}' exists`);
          }
        } catch (tableError) {
          console.log(`❌ Table '${table}' likely doesn't exist:`, tableError.message);
        }
      }
      
    } else {
      console.log('Tables in the database:');
      data.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
      
      // Get count of records in each table
      for (const row of data) {
        const tableName = row.table_name;
        try {
          const { data: countData, error: countError } = await supabase
            .from(tableName)
            .select('count', { count: 'exact', head: true });
          
          const count = countError ? 'Error counting' : countData;
          console.log(`  ${tableName}: ${count} records`);
        } catch (countError) {
          console.log(`  ${tableName}: Error counting records`);
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error during table listing:', error);
  }
}

// Run the function
listTables();