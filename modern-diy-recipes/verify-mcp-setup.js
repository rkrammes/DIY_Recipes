/**
 * Verify MCP Setup
 * 
 * This script checks that all necessary components for the Supabase MCP integration are in place.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Verifying Supabase MCP setup...');

// Check required files
const requiredFiles = [
  'mcp-servers/supabase-mcp-server.cjs',
  'supabase_mcp_config.toml',
  '.env.local',
  '.env.supabase-mcp',
  'start-supabase-mcp.js',
  'dev-with-mcp.js'
];

const missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.log('✅ Run "npm run setup-supabase-mcp" to copy necessary files');
} else {
  console.log('✅ All required files are present');
}

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_DEV_USER_EMAIL',
  'NEXT_PUBLIC_DEV_USER_PASSWORD',
  'NEXT_PUBLIC_MCP_SUPABASE_PORT',
  'NEXT_PUBLIC_USE_SUPABASE_MCP'
];

const missingEnvVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
}

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.log('✅ Make sure these variables are defined in .env.local');
} else {
  console.log('✅ All required environment variables are defined');
}

// Suggest next steps
console.log('\n🚀 Next steps:');
console.log('1. Run "npm run setup-supabase-mcp" to copy server files (if needed)');
console.log('2. Run "npm run dev-with-mcp" to start the application with Supabase MCP');
console.log('3. Visit http://localhost:3000 in your browser');
console.log('\n🔐 In development mode:');
console.log('- The dev user will be automatically logged in');
console.log('- Edit mode toggle is available in the navigation bar');

// Check if we're ready to go
if (missingFiles.length === 0 && missingEnvVars.length === 0) {
  console.log('\n✨ Setup complete! You\'re ready to use Supabase MCP with DIY Recipes');
}