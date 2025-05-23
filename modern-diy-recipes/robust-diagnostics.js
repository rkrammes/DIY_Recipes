/**
 * Robust Diagnostics for Kraft AI Application
 * 
 * This script runs a thorough diagnostic on the application and Supabase connection
 * to identify exactly what's working and what's not.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Setup logging
const logFile = path.join(__dirname, 'logs', `diagnostics-${Date.now()}.log`);
const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
};

// Create logs directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'));
}

// Logging function
function log(message, level = LOG_LEVELS.INFO) {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (level === LOG_LEVELS.ERROR) {
    console.error('\x1b[31m' + formattedMessage + '\x1b[0m'); // Red
  } else if (level === LOG_LEVELS.WARNING) {
    console.warn('\x1b[33m' + formattedMessage + '\x1b[0m');  // Yellow
  } else if (level === LOG_LEVELS.SUCCESS) {
    console.log('\x1b[32m' + formattedMessage + '\x1b[0m');   // Green
  } else {
    console.log(formattedMessage);
  }
  
  // Also write to log file
  fs.appendFileSync(logFile, formattedMessage + '\n');
}

// Start diagnostics
log('Starting Kraft AI Diagnostics');
log(`Log file: ${logFile}`);

// Check process information
log('Process Info:');
log(`- Node Version: ${process.version}`);
log(`- Platform: ${process.platform}`);
log(`- Working Directory: ${process.cwd()}`);

// Check environment variables
log('\nChecking Environment Variables:');
const ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_UI_MODE',
  'NEXT_PUBLIC_USE_MOCK_DATA',
  'NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA'
];

let missingVars = 0;
ENV_VARS.forEach(varName => {
  if (process.env[varName]) {
    const value = varName.includes('KEY') 
      ? process.env[varName].substring(0, 10) + '...' 
      : process.env[varName];
    log(`- ${varName}: ${value}`, LOG_LEVELS.SUCCESS);
  } else {
    log(`- ${varName}: MISSING`, LOG_LEVELS.ERROR);
    missingVars++;
  }
});

if (missingVars > 0) {
  log(`${missingVars} environment variables are missing`, LOG_LEVELS.WARNING);
} else {
  log('All required environment variables are present', LOG_LEVELS.SUCCESS);
}

// Helper function to check if a service role key is being used as anon key
function detectServiceRoleKey(key) {
  if (!key) return false;
  return key.includes('"role":"service_role"');
}

// Check if anon key is actually a service role key
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (detectServiceRoleKey(anonKey)) {
  log('WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a service role key!', LOG_LEVELS.ERROR);
  log('This is a security risk - client-side code should never use service role keys', LOG_LEVELS.ERROR);
}

// Test Supabase connection
log('\nTesting Supabase Connection:');
async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('Cannot test Supabase connection due to missing URL or key', LOG_LEVELS.ERROR);
    return false;
  }
  
  try {
    log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    log('Supabase client created successfully', LOG_LEVELS.SUCCESS);
    
    // Test auth status
    log('Checking authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      log(`Auth error: ${authError.message}`, LOG_LEVELS.ERROR);
    } else if (authData?.session) {
      log(`Authenticated as: ${authData.session.user.email}`, LOG_LEVELS.SUCCESS);
    } else {
      log('Not authenticated (anonymous)', LOG_LEVELS.INFO);
    }
    
    // Test required tables
    log('\nChecking required tables:');
    const tables = [
      'recipes',
      'ingredients',
      'recipe_ingredients', 
      'iterations',
      'users',
      'user_preferences',
      'tools',
      'library'
    ];
    
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          log(`- ${table}: ERROR - ${error.message}`, LOG_LEVELS.ERROR);
          allTablesExist = false;
        } else {
          log(`- ${table}: OK`, LOG_LEVELS.SUCCESS);
        }
      } catch (err) {
        log(`- ${table}: EXCEPTION - ${err.message}`, LOG_LEVELS.ERROR);
        allTablesExist = false;
      }
    }
    
    // Test exec_sql function
    log('\nChecking exec_sql function:');
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1 as test' });
      
      if (error) {
        log(`exec_sql error: ${error.message}`, LOG_LEVELS.ERROR);
      } else {
        log('exec_sql function is working correctly', LOG_LEVELS.SUCCESS);
      }
    } catch (err) {
      log(`exec_sql exception: ${err.message}`, LOG_LEVELS.ERROR);
    }
    
    return allTablesExist;
  } catch (err) {
    log(`Supabase connection failed: ${err.message}`, LOG_LEVELS.ERROR);
    return false;
  }
}

// Test port 3000 to see if anything is running
function testPort3000() {
  return new Promise((resolve) => {
    log('\nChecking if port 3000 is already in use:');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'HEAD',
      timeout: 2000
    }, (res) => {
      log(`Port 3000 is in use. Status: ${res.statusCode}`, LOG_LEVELS.WARNING);
      resolve(true);
    });
    
    req.on('error', () => {
      log('Port 3000 is available', LOG_LEVELS.SUCCESS);
      resolve(false);
    });
    
    req.on('timeout', () => {
      log('Port 3000 check timed out', LOG_LEVELS.WARNING);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  try {
    const portInUse = await testPort3000();
    
    if (!portInUse) {
      const supabaseOk = await testSupabase();
      
      log('\nDiagnostic Summary:');
      log(`Environment Variables: ${missingVars === 0 ? 'OK' : 'ISSUES FOUND'}`, 
        missingVars === 0 ? LOG_LEVELS.SUCCESS : LOG_LEVELS.WARNING);
        
      log(`Supabase Connection: ${supabaseOk ? 'OK' : 'ISSUES FOUND'}`,
        supabaseOk ? LOG_LEVELS.SUCCESS : LOG_LEVELS.WARNING);
      
      log(`Port 3000 Available: YES`, LOG_LEVELS.SUCCESS);
      
      if (supabaseOk) {
        log('\nThe application should be able to run with real data on port 3000', LOG_LEVELS.SUCCESS);
      } else {
        log('\nThe application will likely crash when using real data due to Supabase issues', LOG_LEVELS.WARNING);
        log('Recommendation: Use mock data until Supabase issues are fixed', LOG_LEVELS.INFO);
      }
    }
    
    log('\nDiagnostics complete. See log file for details:');
    log(logFile);
    
  } catch (err) {
    log(`Unexpected error during diagnostics: ${err.message}`, LOG_LEVELS.ERROR);
    log(`Stack trace: ${err.stack}`, LOG_LEVELS.ERROR);
  }
}

runAllTests();