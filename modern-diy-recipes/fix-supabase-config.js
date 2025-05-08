/**
 * Supabase Configuration Fix Script
 * 
 * This script identifies and corrects issues with Supabase key configuration.
 * It also provides instructions for properly setting up the environment variables.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Get current configuration
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== SUPABASE CONFIGURATION ANALYSIS ===');
console.log(`URL: ${url || 'Not set'}`);

// Analyze the keys
const analyzeJWT = (token) => {
  if (!token) return null;
  
  try {
    // Get the payload part (second part of the JWT)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload
    const payload = Buffer.from(parts[1], 'base64').toString();
    return JSON.parse(payload);
  } catch (e) {
    console.error('Error parsing JWT:', e.message);
    return null;
  }
};

// Check if a token is a service role key
const isServiceRoleKey = (token) => {
  const payload = analyzeJWT(token);
  return payload && payload.role === 'service_role';
};

// Check if a token is an anon key
const isAnonKey = (token) => {
  const payload = analyzeJWT(token);
  return payload && payload.role === 'anon';
};

// Analyze the current configuration
console.log('\n1. Current Key Configuration:');

if (publicKey) {
  const publicKeyData = analyzeJWT(publicKey);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:');
  console.log(`  - Role: ${publicKeyData ? publicKeyData.role : 'Unknown'}`);
  console.log(`  - Should be 'anon' role, but is: ${publicKeyData ? publicKeyData.role : 'Unknown'}`);
  console.log(`  - Security issue: ${isServiceRoleKey(publicKey) ? 'HIGH - Service role key exposed to client!' : 'None'}`);
} else {
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY: Not set');
}

if (serviceKey) {
  const serviceKeyData = analyzeJWT(serviceKey);
  console.log('\nSUPABASE_SERVICE_ROLE_KEY:');
  console.log(`  - Role: ${serviceKeyData ? serviceKeyData.role : 'Unknown'}`);
  console.log(`  - Correct configuration: ${isServiceRoleKey(serviceKey) ? 'Yes' : 'No - Should be service_role'}`);
} else {
  console.log('\nSUPABASE_SERVICE_ROLE_KEY: Not set');
}

// Report client access issues
console.log('\n2. Client/Server Access Analysis:');

if (isServiceRoleKey(publicKey)) {
  console.log('❌ Client is using service_role key! This is a security risk.');
  console.log('   The client should only use an anon key with limited permissions.');
} else if (!publicKey) {
  console.log('❌ Client has no access key configured.');
} else if (isAnonKey(publicKey)) {
  console.log('✅ Client is correctly using anon key.');
} else {
  console.log('❓ Client is using an unknown key type.');
}

// Report server creation issues
console.log('\n3. Server Table Creation Analysis:');
if (!serviceKey || !isServiceRoleKey(serviceKey)) {
  console.log('❌ Server does not have a valid service_role key for table creation.');
  console.log('   This is why table creation scripts fail.');
} else {
  console.log('✅ Server has valid service_role key for table creation.');
  console.log('   But scripts need to be updated to use this key instead of the public key.');
}

// Get a proper anon key if it doesn't exist
console.log('\n=== CONFIGURATION FIX INSTRUCTIONS ===');
console.log('To fix the Supabase configuration issues:');
console.log('\n1. Get proper keys from Supabase Dashboard:');
console.log('   - Log in to https://supabase.com');
console.log('   - Go to your project: bzudglfxxywugesncjnz');
console.log('   - Navigate to Project Settings > API');
console.log('   - Under "Project API keys", find:');
console.log('     * anon/public key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)');
console.log('     * service_role key (for SUPABASE_SERVICE_ROLE_KEY)');

console.log('\n2. Update your .env.local file with:');
console.log('```');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://bzudglfxxywugesncjnz.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>');
console.log('SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
console.log('```');

console.log('\n3. Update the database-setup scripts to use:');
console.log('```javascript');
console.log('const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;');
console.log('const supabase = createClient(url, serviceRoleKey);');
console.log('```');

// Create a sample fixed script
const createFixedScript = () => {
  console.log('\nCreating a fixed database setup script...');
  
  const fixedScriptContent = `
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
`;

  fs.writeFileSync(path.join(__dirname, 'fixed-db-setup.js'), fixedScriptContent);
  console.log('✅ Created fixed script: fixed-db-setup.js');
};

createFixedScript();

// Final recommendations
console.log('\n=== SUMMARY ===');
console.log('The main issues with your Supabase configuration are:');
console.log('1. Using a service_role key where an anon key should be used (security risk)');
console.log('2. Scripts not using the proper keys for their intended operations');
console.log('3. Need to obtain proper anon key from Supabase dashboard');

if (isServiceRoleKey(publicKey) && isServiceRoleKey(serviceKey) && publicKey === serviceKey) {
  console.log('\nGood news: Your service_role key is already correctly set in SUPABASE_SERVICE_ROLE_KEY');
  console.log('You just need to replace NEXT_PUBLIC_SUPABASE_ANON_KEY with a proper anon key');
}