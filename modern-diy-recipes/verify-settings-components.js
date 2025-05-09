/**
 * Simple verification script to check that our Settings components are properly implemented
 * without requiring a running server.
 */

// Import core modules
const fs = require('fs');
const path = require('path');

// Define paths to check
const paths = {
  settingsDir: './src/Settings',
  settingsIndexFile: './src/Settings/index.tsx',
  settingsPageFile: './src/app/settings/page.tsx',
  userPreferencesProvider: './src/Settings/providers/UserPreferencesProvider.tsx',
  componentsDir: './src/Settings/components',
  databaseDir: './src/Settings/database',
  schemaFile: './src/Settings/database/schema.sql',
  hooksDir: './src/Settings/hooks',
  uiComponents: [
    './src/components/ui/switch.tsx',
    './src/components/ui/slider.tsx',
    './src/components/ui/tabs.tsx'
  ]
};

// Check if directories exist
function checkDirectory(dirPath) {
  try {
    const fullPath = path.resolve(dirPath);
    return {
      exists: fs.existsSync(fullPath),
      isDirectory: fs.existsSync(fullPath) ? fs.statSync(fullPath).isDirectory() : false,
      path: fullPath
    };
  } catch (err) {
    return { exists: false, isDirectory: false, path: dirPath, error: err.message };
  }
}

// Check if files exist
function checkFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    return {
      exists: fs.existsSync(fullPath),
      isFile: fs.existsSync(fullPath) ? fs.statSync(fullPath).isFile() : false,
      path: fullPath,
      content: fs.existsSync(fullPath) && fs.statSync(fullPath).isFile() 
               ? fs.readFileSync(fullPath, 'utf8').slice(0, 100) + '...' // Show first 100 chars
               : null
    };
  } catch (err) {
    return { exists: false, isFile: false, path: filePath, error: err.message };
  }
}

// Run verification
function verifySettingsComponents() {
  console.log('Verifying Settings module components...\n');
  
  // Check directories
  console.log('Checking directories:');
  const dirResults = {
    settingsDir: checkDirectory(paths.settingsDir),
    componentsDir: checkDirectory(paths.componentsDir),
    databaseDir: checkDirectory(paths.databaseDir),
    hooksDir: checkDirectory(paths.hooksDir)
  };
  
  Object.entries(dirResults).forEach(([name, result]) => {
    console.log(`  ${name}: ${result.exists && result.isDirectory ? '✅' : '❌'}`);
    if (!result.exists) {
      console.log(`    Path does not exist: ${result.path}`);
    } else if (!result.isDirectory) {
      console.log(`    Path exists but is not a directory: ${result.path}`);
    }
  });
  
  // Check files
  console.log('\nChecking files:');
  const fileResults = {
    settingsIndexFile: checkFile(paths.settingsIndexFile),
    settingsPageFile: checkFile(paths.settingsPageFile),
    userPreferencesProvider: checkFile(paths.userPreferencesProvider),
    schemaFile: checkFile(paths.schemaFile)
  };
  
  Object.entries(fileResults).forEach(([name, result]) => {
    console.log(`  ${name}: ${result.exists && result.isFile ? '✅' : '❌'}`);
    if (!result.exists) {
      console.log(`    File does not exist: ${result.path}`);
    } else if (!result.isFile) {
      console.log(`    Path exists but is not a file: ${result.path}`);
    } else {
      console.log(`    Preview: ${result.content}`);
    }
  });
  
  // Check UI components
  console.log('\nChecking UI components:');
  paths.uiComponents.forEach(componentPath => {
    const result = checkFile(componentPath);
    const name = path.basename(componentPath);
    console.log(`  ${name}: ${result.exists && result.isFile ? '✅' : '❌'}`);
    if (!result.exists) {
      console.log(`    File does not exist: ${result.path}`);
    } else if (!result.isFile) {
      console.log(`    Path exists but is not a file: ${result.path}`);
    } else {
      console.log(`    Preview: ${result.content}`);
    }
  });
  
  // Check component files in Settings/components
  if (dirResults.componentsDir.exists && dirResults.componentsDir.isDirectory) {
    console.log('\nChecking Settings component files:');
    try {
      const componentsPath = path.resolve(paths.componentsDir);
      const componentFiles = fs.readdirSync(componentsPath)
        .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
      
      componentFiles.forEach(file => {
        const filePath = path.join(componentsPath, file);
        console.log(`  ${file}: ✅`);
      });
      
      if (componentFiles.length === 0) {
        console.log('  No component files found');
      }
    } catch (err) {
      console.error('  Error reading components directory:', err.message);
    }
  }
  
  console.log('\nVerification complete!');
}

// Run the verification
verifySettingsComponents();