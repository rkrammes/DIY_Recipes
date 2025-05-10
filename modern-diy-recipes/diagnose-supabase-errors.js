/**
 * Supabase Connection Diagnostic Script
 * 
 * This script tests the Supabase connection independently of Next.js
 * to identify where exactly the failures are occurring.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Create a log directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create error log file
const errorLogPath = path.join(logDir, `supabase-error-${Date.now()}.log`);
const errorLog = fs.createWriteStream(errorLogPath, { flags: 'a' });

// Helper to log to both console and file
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (isError) {
    console.error(logMessage);
    errorLog.write(logMessage + '\n');
  } else {
    console.log(logMessage);
  }
}

// Extract Supabase config from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check environment variables
log('Checking Supabase environment variables:');
if (!supabaseUrl) {
  log('❌ NEXT_PUBLIC_SUPABASE_URL is missing', true);
} else {
  log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
}

if (!supabaseAnonKey) {
  log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', true);
} else {
  log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 15)}...`);
}

if (!supabaseServiceKey) {
  log('❌ SUPABASE_SERVICE_ROLE_KEY is missing', true);
} else {
  log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 15)}...`);
}

// Function to detect if a key is a service role key
function isServiceRoleKey(key) {
  return key && key.includes('"role":"service_role"');
}

// Check if anon key is actually a service role key
if (isServiceRoleKey(supabaseAnonKey)) {
  log('⚠️ WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a service role key!', true);
  log('This is a security risk. Client-side code should never use service role keys.', true);
}

// Create Supabase client with available credentials
let supabase;
try {
  if (supabaseUrl && supabaseAnonKey) {
    log('Creating Supabase client with anon key...');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    log('✅ Supabase client created successfully');
  } else {
    log('❌ Cannot create Supabase client due to missing configuration', true);
    process.exit(1);
  }
} catch (error) {
  log(`❌ Error creating Supabase client: ${error.message}`, true);
  process.exit(1);
}

// Test connection by querying tables
async function testTableExistence(tableName) {
  try {
    log(`Testing existence of '${tableName}' table...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST204') {
        log(`❌ Table '${tableName}' doesn't exist or is empty`, true);
        return false;
      } else {
        log(`❌ Error querying '${tableName}': ${error.message}`, true);
        log(`Error details: ${JSON.stringify(error)}`, true);
        return false;
      }
    }
    
    log(`✅ Table '${tableName}' exists and is accessible`);
    return true;
  } catch (error) {
    log(`❌ Exception querying '${tableName}': ${error.message}`, true);
    return false;
  }
}

// Function to test every required table
async function testAllTables() {
  const requiredTables = [
    'recipes',
    'ingredients',
    'recipe_ingredients',
    'iterations',
    'users',
    'user_preferences',
    'tools',
    'library'
  ];
  
  log('Testing all required tables...');
  
  const results = {};
  for (const table of requiredTables) {
    results[table] = await testTableExistence(table);
  }
  
  log('\nTable Existence Summary:');
  let allTablesExist = true;
  
  for (const [table, exists] of Object.entries(results)) {
    if (exists) {
      log(`✅ ${table}: Exists`);
    } else {
      log(`❌ ${table}: Missing`, true);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

// Test SQL execution function that may be missing
async function testExecSqlFunction() {
  try {
    log('Testing exec_sql function...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1 as test'
    });
    
    if (error) {
      log(`❌ exec_sql function error: ${error.message}`, true);
      log(`Error details: ${JSON.stringify(error)}`, true);
      return false;
    }
    
    log('✅ exec_sql function exists and works properly');
    return true;
  } catch (error) {
    log(`❌ Exception testing exec_sql: ${error.message}`, true);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  log('=== Supabase Connection Diagnostics ===');
  
  const tablesExist = await testAllTables();
  const execSqlWorks = await testExecSqlFunction();
  
  log('\n=== Diagnostic Summary ===');
  if (tablesExist) {
    log('✅ All required tables exist');
  } else {
    log('❌ Some required tables are missing', true);
  }
  
  if (execSqlWorks) {
    log('✅ SQL execution function is working');
  } else {
    log('❌ SQL execution function is missing or broken', true);
  }
  
  log('\n=== Recommendations ===');
  if (!tablesExist) {
    log('1. Create missing tables using the Supabase dashboard SQL editor');
    log('   See table structure in database.sql or create-tables-fixed.js');
  }
  
  if (!execSqlWorks) {
    log('1. Create the exec_sql function in the Supabase dashboard:');
    log(`
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;
    `);
  }
  
  if (isServiceRoleKey(supabaseAnonKey)) {
    log('1. Replace the anon key in .env.local with a proper anon/public key');
    log('2. DO NOT use service role keys in client-side code');
  }
  
  log('\nDiagnostic results saved to:', errorLogPath);
}

// Run the diagnostics
runDiagnostics().catch(err => {
  log(`Unhandled error: ${err.message}`, true);
  process.exit(1);
});