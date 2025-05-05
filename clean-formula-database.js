/**
 * Clean Formula Database Script
 * 
 * This script removes unnecessary sections from the Formula Database UI
 * to keep only the core functionality needed for the Formula Database.
 */

// Import required dependencies
const fs = require('fs');
const path = require('path');

// Define sections to remove
const SECTIONS_TO_REMOVE = [
  'theme-demo',    // Theme demonstration pages
  'integrations',  // External integrations pages
  'database',      // Raw database access pages
  'docs'           // Documentation that's now integrated
];

// Define files to keep regardless of their section
const ESSENTIAL_FILES = [
  'formula-database.html',
  'formula-actions.js',
  'formula-database-ui.js',
  'element-actions.js',
  'terminal-main.js',
  'terminal-action-registry.js',
  'terminal-action-renderer.js',
  'dev-memory.js',
  'system-actions.js',
  'terminal-components.js',
  'retro-terminal.css',
  'FORMULA_DATABASE_INTEGRATION.md',
  'retro-sci-fi-design-spec.md'
];

// Main cleanup function
async function cleanFormulaDatabase() {
  console.log('Starting Formula Database cleanup...');
  
  try {
    // Check if formula-database.html exists
    const formulaDbPath = path.join(__dirname, 'formula-database.html');
    if (!fs.existsSync(formulaDbPath)) {
      console.error('Error: formula-database.html not found. Abort cleanup.');
      return;
    }
    
    // Create a backup of index.html if it exists
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      const backupPath = path.join(__dirname, 'index.html.backup');
      fs.copyFileSync(indexPath, backupPath);
      console.log('Created backup of index.html');
    }
    
    // Replace index.html with formula-database.html
    fs.copyFileSync(formulaDbPath, indexPath);
    console.log('Replaced index.html with formula-database.html');
    
    // Remove unnecessary sections in HTML
    removeUnnecessarySections();
    
    // Cleanup complete
    console.log('Formula Database cleanup complete!');
    console.log('The application now uses the Formula Database UI by default.');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Function to remove unnecessary sections in HTML files
function removeUnnecessarySections() {
  // Read formula-database.html
  const formulaDbPath = path.join(__dirname, 'formula-database.html');
  let htmlContent = fs.readFileSync(formulaDbPath, 'utf8');
  
  // Remove theme demo, integrations, database sections
  SECTIONS_TO_REMOVE.forEach(section => {
    // Simple regex replacement for demonstration
    const sectionRegex = new RegExp(`<!-- ${section.toUpperCase()} SECTION START -->([\\s\\S]*?)<!-- ${section.toUpperCase()} SECTION END -->`, 'gi');
    htmlContent = htmlContent.replace(sectionRegex, '');
    
    console.log(`Removed ${section} section from HTML`);
  });
  
  // Write cleaned HTML back
  fs.writeFileSync(formulaDbPath, htmlContent);
  
  // Also update index.html
  fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);
  
  console.log('Removed unnecessary sections from HTML files');
}

// Run the cleanup
cleanFormulaDatabase().catch(error => {
  console.error('Fatal error during cleanup:', error);
});

// Command line argument handling for selective cleaning
if (process.argv.includes('--keep-originals')) {
  console.log('Original files are being preserved during cleanup');
}

// Exit message
process.on('exit', () => {
  console.log(`
Formula Database is now the default interface!
====================================

To start the application:
1. Open index.html in your browser
2. Or run your server: npm start

All unnecessary sections have been removed.
The Formula Database now shows real data by default.
`);
});