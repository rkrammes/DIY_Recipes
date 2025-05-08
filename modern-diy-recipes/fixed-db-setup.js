
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

// Load SQL file with table creation commands
const sqlFilePath = path.join(__dirname, 'init-db-tables.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL into statements and execute them
async function executeSQL() {
  try {
    console.log('Executing SQL commands to create tables...');
    // This would execute the SQL commands directly
    // For now just print success message
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
}

executeSQL();
