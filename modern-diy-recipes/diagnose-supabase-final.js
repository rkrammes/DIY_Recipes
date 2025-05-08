require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection with:');
console.log('URL:', url);
console.log('Key starts with:', key?.substring(0, 20) + '...');
console.log('Key appears to be a', key.includes('service_role') ? 'SERVICE ROLE KEY (Has table creation permission)' : 'ANON KEY (Limited permissions)');

const supabase = createClient(url, key);

async function fixPermissionsIssue() {
  // Create a fixed environment file with the correct permissions setup
  console.log('\nCREATING A PERMISSIONS FIX...');

  // 1. Get our current .env.local content
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env.local');
  
  // Read current .env.local file
  let envContent;
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Read current .env.local file successfully');
  } catch (err) {
    console.error('Could not read .env.local file:', err.message);
    return;
  }
  
  // Get the service role key from the .env file
  const serviceRoleKeyMatch = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    .match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  
  if (!serviceRoleKeyMatch) {
    console.error('Could not find SUPABASE_SERVICE_ROLE_KEY in .env file');
    return;
  }
  
  const serviceRoleKey = serviceRoleKeyMatch[1];
  console.log('Found service role key in .env file');
  
  // Create a new .env.local.bak file with the correct service role key for table creation
  const newEnvContent = envContent.replace(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY=.+/,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${serviceRoleKey}`
  );
  
  // Add a force no mock data flag if it doesn't exist
  const updatedContent = newEnvContent.includes('NEXT_PUBLIC_USE_FALLBACK_DATA')
    ? newEnvContent.replace(/NEXT_PUBLIC_USE_FALLBACK_DATA=.+/, 'NEXT_PUBLIC_USE_FALLBACK_DATA=false')
    : newEnvContent + '\nNEXT_PUBLIC_USE_FALLBACK_DATA=false\n';
  
  // Write the new content to a backup file
  try {
    fs.writeFileSync(envPath + '.with-service-role', updatedContent);
    console.log('Created .env.local.with-service-role file with service role key');
    console.log('\n=============================================');
    console.log('DIAGNOSIS COMPLETE:');
    console.log('1. The tools and library tables DO NOT EXIST');
    console.log('2. You are using an ANON KEY which cannot create tables');
    console.log('3. A temporary file with service role permissions has been created');
    console.log('\nRECOMMENDATIONS:');
    console.log('1. TEMPORARY FIX: Rename .env.local.with-service-role to .env.local');
    console.log('   - This will allow the app to create tables, but is less secure');
    console.log('   - Run the app once to create the tables, then switch back');
    console.log('2. BETTER FIX: Execute init-db-tables.sql in Supabase SQL Editor');
    console.log('   - This is more secure but requires direct database access');
    console.log('=============================================');
  } catch (err) {
    console.error('Could not write to .env.local.with-service-role file:', err.message);
  }
}

async function checkTables() {
  console.log('\nCHECKING FOR MISSING TABLES...');
  
  // Try to access the tools table
  const { error: toolsError } = await supabase
    .from('tools')
    .select('count')
    .limit(1);
  
  // Try to access the library table
  const { error: libraryError } = await supabase
    .from('library')
    .select('count')
    .limit(1);
  
  if (toolsError && toolsError.message.includes('does not exist')) {
    console.log('The tools table does not exist');
  }
  
  if (libraryError && libraryError.message.includes('does not exist')) {
    console.log('The library table does not exist');
  }
  
  if ((toolsError && toolsError.message.includes('does not exist')) ||
      (libraryError && libraryError.message.includes('does not exist'))) {
    await fixPermissionsIssue();
  } else {
    console.log('All required tables exist!');
  }
}

checkTables();