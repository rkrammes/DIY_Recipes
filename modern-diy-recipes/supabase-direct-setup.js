// This script executes SQL directly to Supabase via REST API
// It uses the service role key for authorization
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

// Get Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase configuration. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Prepare SQL files
const functionsSql = fs.readFileSync(path.join(__dirname, 'create-supabase-functions.sql'), 'utf8');
const databaseSql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

// Function to execute SQL via REST API
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    // Extract the actual domain without https://
    const domain = SUPABASE_URL.replace('https://', '');
    
    const options = {
      hostname: domain,
      path: '/rest/v1/rpc/execute_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (e) {
            resolve(data); // Return raw data if not JSON
          }
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify({
      sql: sql
    }));
    
    req.end();
  });
}

// Function to check if a table exists
async function tableExists(tableName) {
  try {
    const result = await executeSql(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      );
    `);
    
    return result && result.exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
}

// Split SQL into individual statements and execute
function executeSqlBatch(sql) {
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  return statements.reduce((promise, statement) => {
    return promise.then(() => {
      console.log(`Executing SQL: ${statement.substring(0, 80)}...`);
      return executeSql(statement);
    }).catch(error => {
      console.error(`Error executing SQL: ${error.message}`);
      console.error(`Failed statement: ${statement}`);
    });
  }, Promise.resolve());
}

// Main function
async function setupDatabase() {
  try {
    // Step 1: Test basic connectivity to the Supabase REST API
    console.log('Testing connection to Supabase...');
    try {
      await executeSql('SELECT 1 as test');
      console.log('✅ Connection successful!');
    } catch (error) {
      if (error.message.includes('execute_sql')) {
        console.log('⚠️ execute_sql function not found. Creating functions first...');
        
        // Create functions via direct API call
        // This part might be tricky and might need to be done manually in the SQL editor
        console.error('❌ Please run create-supabase-functions.sql in the Supabase SQL Editor first');
        process.exit(1);
      } else {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
      }
    }
    
    // Step 2: Check if tables exist
    console.log('\nChecking if tables exist...');
    const tablesExist = {
      recipes: await tableExists('recipes'),
      ingredients: await tableExists('ingredients'),
      recipe_ingredients: await tableExists('recipe_ingredients'),
      tools: await tableExists('tools'),
      library: await tableExists('library')
    };
    
    console.log('Current table status:');
    Object.entries(tablesExist).forEach(([table, exists]) => {
      console.log(`- ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });
    
    // Step 3: Execute database SQL if tables are missing
    if (!tablesExist.recipes || !tablesExist.ingredients || !tablesExist.recipe_ingredients || 
        !tablesExist.tools || !tablesExist.library) {
      console.log('\nSetting up missing tables...');
      await executeSqlBatch(databaseSql);
      console.log('✅ Database setup complete!');
    } else {
      console.log('\n✅ All tables exist. No database changes needed.');
    }
    
    // Step 4: Verify tables
    console.log('\nVerifying tables...');
    const tables = ['recipes', 'ingredients', 'recipe_ingredients', 'tools', 'library'];
    for (const table of tables) {
      try {
        const result = await executeSql(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`- ${table}: ${result.count} records`);
      } catch (error) {
        console.error(`❌ Error verifying ${table}:`, error.message);
      }
    }
    
    console.log('\n🎉 Database configuration complete! You can now run the application.');
    console.log('Start with: npm run dev');
    console.log('Access at: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the setup
setupDatabase();
