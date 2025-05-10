/**
 * This script initializes the user_preferences table in Supabase
 * Run it with:
 *
 * node src/Settings/setup-preferences-table.js
 *
 * IMPORTANT: This is a server-side only script that requires a service role key.
 * NEVER use service role keys in client-side code.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env.local first, then fall back to .env
const dotenvResult = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (dotenvResult.error) {
  console.log('No .env.local file found, trying .env');
  dotenv.config();
}

console.log('🔒 Database Setup - Admin Actions');
console.log('This script requires admin privileges to set up database tables.');
console.log('Remember: NEVER use service role keys in client-side code.');

// Log the loaded environment variables (without secrets)
console.log('\nChecking environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Not found');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Not found');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Not found');

// Get Supabase credentials from environment or .env file
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Only use service role key for this admin script
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.error('IMPORTANT: The service role key should only be used for server-side admin tasks');
  process.exit(1);
}

console.log('Found valid Supabase credentials, proceeding with setup...');

// Create Supabase client with admin privileges - only for this setup script
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function initializePreferencesTable() {
  try {
    console.log('Reading schema SQL file...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach if the RPC method failed
      console.log('Attempting alternative approach with individual statements...');
      
      // Split SQL into individual statements
      const statements = schemaSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Execute each statement individually
      for (const [index, statement] of statements.entries()) {
        console.log(`Executing statement ${index + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${index + 1}:`, error);
          console.log('Statement:', statement);
        }
      }
    }
    
    // Verify table was created
    console.log('Checking if user_preferences table exists...');
    const { data, error: checkError } = await supabase
      .from('user_preferences')
      .select('count', { count: 'exact', head: true });
    
    if (checkError) {
      console.error('Error checking user_preferences table:', checkError);
      return;
    }
    
    console.log('Successfully created user_preferences table!');
    console.log('You can now use persistent settings in the application.');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the initialization
initializePreferencesTable()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error running script:', err));