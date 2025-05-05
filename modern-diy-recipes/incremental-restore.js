#!/usr/bin/env node

/**
 * Incremental feature restoration script
 * 
 * This script helps restore features incrementally after 
 * achieving stability with the minimal test environment.
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Log restoration steps
const RESTORE_LOG = path.join(__dirname, 'restore.log');
let restoreLog = [];

// Components to restore incrementally
const COMPONENTS = [
  {
    name: 'Basic Theme Provider (minimal)',
    status: '✅ Active (minimal version)',
    path: '/providers/SimpleThemeProvider.tsx',
    dependencies: []
  },
  {
    name: 'CSS Animations (minimal)',
    status: '✅ Active (minimal version)',
    path: '/lib/animation/simple-motion.ts',
    dependencies: ['/providers/SimpleThemeProvider.tsx']
  },
  {
    name: 'Full Theme Provider',
    status: '❌ Disabled (potential stability issue)',
    path: '/providers/ThemeProvider.tsx',
    dependencies: ['/lib/animation/motion.ts']
  },
  {
    name: 'Framer Motion Animations',
    status: '❌ Disabled (potential stability issue)',
    path: '/lib/animation/motion.ts',
    dependencies: []
  },
  {
    name: 'Audio System',
    status: '❌ Disabled (potential stability issue)',
    path: '/lib/audio/core.ts',
    dependencies: ['/providers/ThemeProvider.tsx']
  }
];

// Print header
console.log('\n=== DIY Recipes - Incremental Feature Restoration ===\n');
console.log('This utility helps restore features incrementally after achieving stability\n');

// Function to display component status
function displayComponents() {
  console.log('\nComponent Status:\n');
  COMPONENTS.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name}`);
    console.log(`   Status: ${component.status}`);
    console.log(`   Path: ${component.path}`);
    console.log(`   Dependencies: ${component.dependencies.length ? component.dependencies.join(', ') : 'None'}`);
    console.log('');
  });
}

// Function to test server startup
async function testServerStartup() {
  console.log('\n🧪 Testing server startup...');
  
  try {
    // Clear cache
    if (fs.existsSync(path.join(__dirname, '.next'))) {
      fs.rmSync(path.join(__dirname, '.next'), { recursive: true, force: true });
    }
    
    // Start server with timeout
    const startTime = Date.now();
    execSync('npm run dev -- --no-open', { 
      timeout: 20000, // 20 second timeout
      stdio: 'ignore'
    });
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Server started successfully in ${duration.toFixed(2)} seconds`);
    return true;
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    return false;
  } finally {
    // Kill any running Next.js processes
    try {
      execSync('pkill -f "node.*next"', { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors if no process found
    }
  }
}

// Main menu
function showMainMenu() {
  displayComponents();
  
  console.log('\nOptions:');
  console.log('1. Test current configuration');
  console.log('2. Enable a disabled component');
  console.log('3. Create backup of current stable configuration');
  console.log('4. View restore log');
  console.log('5. Exit');
  
  rl.question('\nEnter your choice (1-5): ', async (choice) => {
    switch (choice) {
      case '1':
        await testServerStartup();
        rl.question('\nPress Enter to continue...', () => showMainMenu());
        break;
      case '2':
        showEnableMenu();
        break;
      case '3':
        createBackup();
        break;
      case '4':
        viewRestoreLog();
        break;
      case '5':
        console.log('\nExiting...');
        rl.close();
        break;
      default:
        console.log('\n❌ Invalid choice. Please try again.');
        showMainMenu();
    }
  });
}

// Component enable menu
function showEnableMenu() {
  const disabledComponents = COMPONENTS.filter(c => c.status.includes('❌'));
  
  if (disabledComponents.length === 0) {
    console.log('\n✅ All components are already enabled!');
    rl.question('\nPress Enter to continue...', () => showMainMenu());
    return;
  }
  
  console.log('\nDisabled Components:');
  disabledComponents.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name}`);
  });
  
  rl.question('\nEnter component number to enable (or 0 to go back): ', (choice) => {
    const index = parseInt(choice) - 1;
    
    if (choice === '0') {
      showMainMenu();
      return;
    }
    
    if (isNaN(index) || index < 0 || index >= disabledComponents.length) {
      console.log('\n❌ Invalid choice. Please try again.');
      showEnableMenu();
      return;
    }
    
    const component = disabledComponents[index];
    
    // Check if dependencies are enabled
    const missingDeps = component.dependencies.filter(dep => {
      const depComponent = COMPONENTS.find(c => c.path === dep);
      return depComponent && depComponent.status.includes('❌');
    });
    
    if (missingDeps.length > 0) {
      console.log('\n⚠️ Cannot enable this component yet. Missing dependencies:');
      missingDeps.forEach(dep => {
        const depComponent = COMPONENTS.find(c => c.path === dep);
        console.log(`   - ${depComponent ? depComponent.name : dep}`);
      });
      rl.question('\nPress Enter to continue...', () => showEnableMenu());
      return;
    }
    
    // Log restoration step
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Enabled: ${component.name} (${component.path})`;
    restoreLog.push(logEntry);
    fs.appendFileSync(RESTORE_LOG, logEntry + '\n');
    
    // Update component status
    const mainIndex = COMPONENTS.findIndex(c => c.path === component.path);
    COMPONENTS[mainIndex].status = '✅ Enabled (previously disabled)';
    
    console.log(`\n✅ Enabled ${component.name}`);
    console.log('Now test the server to ensure stability is maintained.');
    
    rl.question('\nPress Enter to continue...', () => showMainMenu());
  });
}

// Create backup of stable configuration
function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupDir = path.join(__dirname, `stable-backup-${timestamp}`);
  
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Copy stable files
    COMPONENTS.forEach(component => {
      const sourcePath = path.join(__dirname, component.path);
      const targetPath = path.join(backupDir, component.path);
      
      if (fs.existsSync(sourcePath)) {
        // Create directory structure
        const targetDir = path.dirname(targetPath);
        fs.mkdirSync(targetDir, { recursive: true });
        
        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
    
    // Also backup minimal test environment
    const minimalTestPath = path.join(__dirname, '/app/minimal-test');
    const minimalTestBackupPath = path.join(backupDir, '/app/minimal-test');
    
    if (fs.existsSync(minimalTestPath)) {
      // Copy directory recursively
      fs.mkdirSync(minimalTestBackupPath, { recursive: true });
      
      fs.readdirSync(minimalTestPath).forEach(file => {
        const sourcePath = path.join(minimalTestPath, file);
        const targetPath = path.join(minimalTestBackupPath, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, targetPath);
        }
      });
    }
    
    console.log(`\n✅ Created backup at: ${backupDir}`);
    
    // Log backup
    const logEntry = `[${new Date().toISOString()}] Created backup: ${backupDir}`;
    restoreLog.push(logEntry);
    fs.appendFileSync(RESTORE_LOG, logEntry + '\n');
  } catch (error) {
    console.error(`\n❌ Error creating backup: ${error.message}`);
  }
  
  rl.question('\nPress Enter to continue...', () => showMainMenu());
}

// View restore log
function viewRestoreLog() {
  console.log('\n=== Restoration Log ===\n');
  
  if (fs.existsSync(RESTORE_LOG)) {
    const logContent = fs.readFileSync(RESTORE_LOG, 'utf8');
    console.log(logContent || 'No restore actions logged yet.');
  } else {
    console.log('No restore log found. No actions have been taken yet.');
  }
  
  rl.question('\nPress Enter to continue...', () => showMainMenu());
}

// Initialize log file if it doesn't exist
if (!fs.existsSync(RESTORE_LOG)) {
  const initLog = `[${new Date().toISOString()}] Incremental Restoration Started\n`;
  fs.writeFileSync(RESTORE_LOG, initLog);
  restoreLog.push(initLog);
}

// Start the program
showMainMenu();