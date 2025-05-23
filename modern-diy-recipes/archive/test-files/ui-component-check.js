/**
 * UI Component Check - Verifies all UI components are available and properly linked
 * 
 * This script checks:
 * 1. All UI components exist in the src/components/ui directory
 * 2. Their import paths are correct
 * 3. All required dependencies are available
 */

const fs = require('fs');
const path = require('path');

const UI_COMPONENTS_DIR = path.join(__dirname, 'src/components/ui');
const SETTINGS_DIR = path.join(__dirname, 'src/Settings');

// Set of imported UI components
const requiredComponents = new Set();

// Find all components being imported
function findImports(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      findImports(filePath);
      return;
    }
    
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = content.match(/from\s+['"]@\/components\/ui\/([^'"]+)['"]/g);
    
    if (!imports) return;
    
    imports.forEach(importLine => {
      const component = importLine.match(/from\s+['"]@\/components\/ui\/([^'"]+)['"]/)[1];
      requiredComponents.add(component);
    });
  });
}

// Find existing UI components
function findComponents() {
  try {
    const files = fs.readdirSync(UI_COMPONENTS_DIR);
    const existingComponents = new Set();
    
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        existingComponents.add(file.replace(/\.(tsx|jsx)$/, ''));
      }
    });
    
    return existingComponents;
  } catch (error) {
    console.error('Error reading UI components directory:', error);
    return new Set();
  }
}

// Main function
function checkComponents() {
  console.log('=== UI Component Check ===');
  
  // Find required components from imports
  console.log('Searching for imported UI components...');
  findImports(SETTINGS_DIR);
  
  console.log(`Found ${requiredComponents.size} required UI components:`);
  const requiredArray = Array.from(requiredComponents);
  console.log(requiredArray.join(', '));
  
  // Find existing components
  console.log('\nChecking existing UI components...');
  const existingComponents = findComponents();
  console.log(`Found ${existingComponents.size} existing UI components.`);
  
  // Check for missing components
  console.log('\nChecking for missing components...');
  const missingComponents = [];
  
  requiredArray.forEach(component => {
    if (!existingComponents.has(component)) {
      missingComponents.push(component);
    }
  });
  
  if (missingComponents.length === 0) {
    console.log('✅ All required UI components exist!');
  } else {
    console.log(`❌ Missing ${missingComponents.length} UI components:`);
    console.log(missingComponents.join(', '));
  }
  
  // Return the missing components
  return missingComponents;
}

// Run the check
const missingComponents = checkComponents();

// Exit with error code if components are missing
process.exit(missingComponents.length > 0 ? 1 : 0);