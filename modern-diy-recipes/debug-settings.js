/**
 * Settings Debug Tool
 * 
 * This script helps diagnose issues with the Settings module by:
 * 1. Checking Supabase connection
 * 2. Verifying the user_preferences table exists
 * 3. Testing localStorage persistence
 * 4. Verifying theme application
 * 
 * Run with: node debug-settings.js
 */

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment');
  console.error('Please check your .env file or environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Debug checks
async function debugSettings() {
  console.log(`${colors.blue}=== Settings Module Debug Tool ===${colors.reset}\n`);
  
  // Step 1: Check Supabase connection
  console.log(`${colors.cyan}Checking Supabase connection...${colors.reset}`);
  try {
    const { data, error } = await supabase.from('user_preferences').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`${colors.red}❌ The user_preferences table does not exist${colors.reset}`);
        console.log('   You need to create the table first using the schema.sql file:');
        console.log('   1. Go to Supabase SQL Editor');
        console.log('   2. Paste the contents of src/Settings/database/schema.sql');
        console.log('   3. Run the query');
      } else {
        console.log(`${colors.red}❌ Error connecting to Supabase: ${error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}✅ Connected to Supabase successfully${colors.reset}`);
      console.log(`   Found ${data || 0} user preference records`);
    }
  } catch (err) {
    console.log(`${colors.red}❌ Failed to connect to Supabase: ${err.message}${colors.reset}`);
  }
  
  // Step 2: Check the schema
  console.log(`\n${colors.cyan}Checking database schema...${colors.reset}`);
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log(`${colors.red}❌ Could not check schema: ${error.message}${colors.reset}`);
    } else if (!data || data.length === 0) {
      console.log(`${colors.yellow}⚠️ No preference records found, cannot check schema${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Found preference record with schema:${colors.reset}`);
      const record = data[0];
      const fields = Object.keys(record);
      
      // Check required fields
      const requiredFields = ['id', 'user_id', 'theme', 'audio_enabled', 'volume', 'created_at', 'updated_at'];
      const missingFields = requiredFields.filter(field => !fields.includes(field));
      
      if (missingFields.length > 0) {
        console.log(`${colors.yellow}⚠️ Schema is missing required fields: ${missingFields.join(', ')}${colors.reset}`);
        console.log('   Please check the schema.sql file and update the table');
      } else {
        console.log(`${colors.green}✅ Schema contains all required fields${colors.reset}`);
      }
      
      console.log('   Fields:', fields.join(', '));
    }
  } catch (err) {
    console.log(`${colors.red}❌ Failed to check schema: ${err.message}${colors.reset}`);
  }
  
  // Step 3: Test browser integration with Puppeteer
  console.log(`\n${colors.cyan}Testing browser integration...${colors.reset}`);
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--window-size=1280,800'],
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    
    const page = await browser.newPage();
    
    // Clear localStorage first
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    
    // Load the settings page
    console.log('   Loading settings page...');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle0' });
    
    // Get the current theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    
    console.log(`   Initial theme: ${initialTheme}`);
    
    // Test localStorage persistence
    console.log('   Testing localStorage persistence...');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dystopia');
      localStorage.setItem('audioEnabled', 'true');
    });
    
    // Reload the page
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Check if theme was loaded from localStorage
    const localStorageTheme = await page.evaluate(() => {
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        localStorage: localStorage.getItem('theme'),
        audioEnabled: localStorage.getItem('audioEnabled')
      };
    });
    
    if (localStorageTheme.theme === 'dystopia' && localStorageTheme.localStorage === 'dystopia') {
      console.log(`${colors.green}✅ Theme persistence working correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Theme not persisting correctly${colors.reset}`);
      console.log(`   Theme attribute: ${localStorageTheme.theme}`);
      console.log(`   localStorage theme: ${localStorageTheme.localStorage}`);
    }
    
    // Take a screenshot for visual verification
    const screenshotPath = 'test-artifacts/settings-test/debug-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   Screenshot saved to ${screenshotPath}`);
    
    await browser.close();
  } catch (err) {
    console.log(`${colors.red}❌ Browser integration test failed: ${err.message}${colors.reset}`);
  }
  
  // Step 4: Check settings files
  console.log(`\n${colors.cyan}Checking settings files...${colors.reset}`);
  
  const requiredFiles = [
    'src/Settings/providers/UserPreferencesProvider.tsx',
    'src/Settings/hooks/useUserPreferences.ts',
    'src/Settings/components/ThemeSettings.tsx',
    'src/Settings/database/schema.sql',
    'src/app/settings/page.tsx',
    'src/app/api/settings/theme/route.ts'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    try {
      if (fs.existsSync(file)) {
        console.log(`${colors.green}✅ ${file} exists${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${file} does not exist${colors.reset}`);
        allFilesExist = false;
      }
    } catch (err) {
      console.log(`${colors.red}❌ Error checking ${file}: ${err.message}${colors.reset}`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log(`${colors.green}✅ All required files exist${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Some required files are missing${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${colors.blue}=== Debug Summary ===${colors.reset}`);
  console.log('If you are experiencing issues with the Settings module, please check:');
  console.log('1. Supabase connection and configuration');
  console.log('2. user_preferences table schema');
  console.log('3. Provider and hook implementation');
  console.log('4. Browser localStorage integration');
  console.log('\nFor detailed testing, run the test scripts:');
  console.log('./test-settings.sh');
}

// Run the debug checks
debugSettings()
  .then(() => {
    console.log(`\n${colors.green}Debug checks completed${colors.reset}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`\n${colors.red}Error during debug checks: ${err.message}${colors.reset}`);
    process.exit(1);
  });