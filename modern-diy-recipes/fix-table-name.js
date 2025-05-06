// Fix Table Name in JavaScript Files
// This script searches for all occurrences of "recipe_ingredients" in JS files
// and replaces them with "recipeingredients" (the actual table name in your database)

const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

async function fixTableNames() {
  console.log('Searching for files that reference "recipe_ingredients"...');
  
  // Find all JavaScript files that might reference the table
  const jsFiles = await glob('src/**/*.{js,jsx,ts,tsx}');
  
  // Add additional files we know need fixing
  const additionalFiles = [
    'fix-recipe-ingredients.js',
    'check-recipe-ingredients.js'
  ];
  
  const allFiles = [...jsFiles, ...additionalFiles];
  
  console.log(`Found ${allFiles.length} potential files to check`);
  
  let modifiedFiles = 0;
  
  // Process each file
  for (const filePath of allFiles) {
    try {
      // Read file content
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip files that don't mention recipe_ingredients
      if (!content.includes('recipe_ingredients')) {
        continue;
      }
      
      // Replace table name
      const updatedContent = content
        // Replace in strings and identifiers, but not in comments or other text
        .replace(/(['"`])recipe_ingredients\1/g, '$1recipeingredients$1')
        .replace(/\.from\s*\(\s*['"`]recipe_ingredients['"`]\s*\)/g, '.from("recipeingredients")')
        .replace(/table\s*:\s*['"`]recipe_ingredients['"`]/g, 'table: "recipeingredients"');
      
      // Only write file if changes were made
      if (content !== updatedContent) {
        await fs.writeFile(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        modifiedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`\nDone! Modified ${modifiedFiles} files to use "recipeingredients" table name.`);
  
  if (modifiedFiles === 0) {
    console.log('No files were modified. This could mean either:');
    console.log('1. Your code already uses the correct table name');
    console.log('2. The table name references are in files not checked by this script');
    console.log('3. The table name is referenced in a way this script didn\'t catch');
  } else {
    console.log('\nYou may need to restart your application for changes to take effect.');
  }
  
  // Instructions for manual verification
  console.log('\nTo manually verify this fix:');
  console.log('1. Run "node check-recipe-ingredients.js" again to confirm it can access the table');
  console.log('2. Restart your application and check if ingredients now display properly');
}

// Run the function
fixTableNames().catch(error => {
  console.error('Fatal error:', error);
});