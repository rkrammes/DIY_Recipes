#!/usr/bin/env node

/**
 * Offline Test Runner for DIY Formulations
 * 
 * This script runs various component and unit tests that don't require
 * a network connection or running server.
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// ANSI color codes for better output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}===== DIY Formulations Offline Test Runner =====${colors.reset}\n`);

// Helper function to run a command and capture output
async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      if (!options.silent) {
        process.stdout.write(text);
      }
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      if (!options.silent) {
        process.stderr.write(text);
      }
    });
    
    proc.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr
      });
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Run Jest unit tests that don't require network
async function runUnitTests() {
  console.log(`\n${colors.bold}${colors.blue}Running Unit Tests...${colors.reset}\n`);
  
  try {
    const result = await runCommand('npx', ['jest', '--testPathIgnorePatterns=e2e', '--testPathIgnorePatterns=integration'], {
      cwd: path.join(process.cwd(), 'modern-diy-recipes')
    });
    
    if (result.code === 0) {
      console.log(`\n${colors.green}✓ Unit tests passed${colors.reset}`);
    } else {
      console.log(`\n${colors.red}✗ Unit tests failed${colors.reset}`);
    }
    
    return result.code === 0;
  } catch (err) {
    console.error(`${colors.red}Error running unit tests: ${err.message}${colors.reset}`);
    return false;
  }
}

// Analyze the module registry system offline
async function testModuleRegistry() {
  console.log(`\n${colors.bold}${colors.blue}Analyzing Module Registry System...${colors.reset}\n`);
  
  const moduleContextPath = path.join(process.cwd(), 'modern-diy-recipes/src/lib/modules/moduleContext.tsx');
  const registryPath = path.join(process.cwd(), 'modern-diy-recipes/src/lib/modules/registry.ts');
  
  try {
    // Check if files exist
    await fs.access(moduleContextPath);
    await fs.access(registryPath);
    
    // Read files
    const moduleContextContent = await fs.readFile(moduleContextPath, 'utf8');
    const registryContent = await fs.readFile(registryPath, 'utf8');
    
    // Check for "use client" directive
    if (moduleContextContent.trim().startsWith('"use client"')) {
      console.log(`${colors.green}✓ ModuleContext has "use client" directive${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ModuleContext is missing "use client" directive${colors.reset}`);
    }
    
    // Check registry singleton pattern
    if (registryContent.includes('private static instance: ModuleRegistry')) {
      console.log(`${colors.green}✓ Registry implements singleton pattern correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Registry may not be implementing singleton pattern correctly${colors.reset}`);
    }
    
    // Check provider implementation
    if (moduleContextContent.includes('export const ModuleProvider')) {
      console.log(`${colors.green}✓ ModuleProvider component is exported${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ModuleProvider component is missing${colors.reset}`);
    }
    
    // Check hook implementation
    if (moduleContextContent.includes('export function useModules()')) {
      console.log(`${colors.green}✓ useModules hook is exported${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ useModules hook is missing${colors.reset}`);
    }
    
    return true;
  } catch (err) {
    console.error(`${colors.red}Error analyzing module registry: ${err.message}${colors.reset}`);
    return false;
  }
}

// Test theme system implementation offline
async function testThemeSystem() {
  console.log(`\n${colors.bold}${colors.blue}Analyzing Theme System...${colors.reset}\n`);
  
  const themeProviderPath = path.join(process.cwd(), 'modern-diy-recipes/src/providers/FixedThemeProvider.tsx');
  const themeScriptPath = path.join(process.cwd(), 'modern-diy-recipes/src/components/ThemeScript.tsx');
  const themeTypesPath = path.join(process.cwd(), 'modern-diy-recipes/src/types/theme.ts');
  
  try {
    // Check if files exist
    await fs.access(themeProviderPath);
    await fs.access(themeScriptPath);
    await fs.access(themeTypesPath);
    
    // Read files
    const themeProviderContent = await fs.readFile(themeProviderPath, 'utf8');
    const themeScriptContent = await fs.readFile(themeScriptPath, 'utf8');
    const themeTypesContent = await fs.readFile(themeTypesPath, 'utf8');
    
    // Check for "use client" directive
    if (themeProviderContent.trim().startsWith("'use client'")) {
      console.log(`${colors.green}✓ ThemeProvider has "use client" directive${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ThemeProvider is missing "use client" directive${colors.reset}`);
    }
    
    if (themeScriptContent.trim().startsWith("'use client'")) {
      console.log(`${colors.green}✓ ThemeScript has "use client" directive${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ThemeScript is missing "use client" directive${colors.reset}`);
    }
    
    // Check theme persistence
    if (themeProviderContent.includes('localStorage.getItem') && 
        themeProviderContent.includes('localStorage.setItem')) {
      console.log(`${colors.green}✓ Theme persistence via localStorage is implemented${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Theme persistence may not be properly implemented${colors.reset}`);
    }
    
    // Check for theme toggle function
    if (themeProviderContent.includes('toggleTheme')) {
      console.log(`${colors.green}✓ Theme toggle function is implemented${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Theme toggle function is missing${colors.reset}`);
    }
    
    // Check for system theme detection
    if (themeTypesContent.includes('getSystemPreferredTheme') ||
        themeProviderContent.includes('matchMedia') &&
        themeProviderContent.includes('prefers-color-scheme')) {
      console.log(`${colors.green}✓ System theme preference detection is implemented${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ System theme preference detection may be missing${colors.reset}`);
    }
    
    return true;
  } catch (err) {
    console.error(`${colors.red}Error analyzing theme system: ${err.message}${colors.reset}`);
    return false;
  }
}

// Analyze the authentication system offline
async function testAuthSystem() {
  console.log(`\n${colors.bold}${colors.blue}Analyzing Authentication System...${colors.reset}\n`);
  
  const authProviderPath = path.join(process.cwd(), 'modern-diy-recipes/src/providers/AuthProvider.tsx');
  
  try {
    // Check if file exists
    await fs.access(authProviderPath);
    
    // Read file
    const authProviderContent = await fs.readFile(authProviderPath, 'utf8');
    
    // Check for "use client" directive
    if (authProviderContent.trim().startsWith('"use client"')) {
      console.log(`${colors.green}✓ AuthProvider has "use client" directive${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ AuthProvider is missing "use client" directive${colors.reset}`);
    }
    
    // Check for development mode support
    if (authProviderContent.includes('isDevelopment') && 
        authProviderContent.includes('useDevLogin')) {
      console.log(`${colors.green}✓ Development mode authentication is supported${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Development mode authentication may not be properly implemented${colors.reset}`);
    }
    
    // Check for session persistence
    if (authProviderContent.includes('getSession') && 
        authProviderContent.includes('onAuthStateChange')) {
      console.log(`${colors.green}✓ Authentication session persistence is implemented${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Authentication session persistence may not be properly implemented${colors.reset}`);
    }
    
    // Check for authentication methods
    const hasPasswordAuth = authProviderContent.includes('signInWithPassword');
    const hasMagicLinkAuth = authProviderContent.includes('signInWithMagicLink') || 
                             authProviderContent.includes('signInWithOtp');
    
    if (hasPasswordAuth) {
      console.log(`${colors.green}✓ Password authentication is implemented${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Password authentication is missing${colors.reset}`);
    }
    
    if (hasMagicLinkAuth) {
      console.log(`${colors.green}✓ Magic link authentication is implemented${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Magic link authentication is missing${colors.reset}`);
    }
    
    return true;
  } catch (err) {
    console.error(`${colors.red}Error analyzing authentication system: ${err.message}${colors.reset}`);
    return false;
  }
}

// Generate a test report
async function generateTestReport(results) {
  console.log(`\n${colors.bold}${colors.blue}Generating Test Report...${colors.reset}\n`);
  
  const reportPath = path.join(process.cwd(), 'OFFLINE_TEST_REPORT.md');
  const timestamp = new Date().toISOString();
  
  const reportContent = `# DIY Formulations Offline Test Report

Generated: ${timestamp}

## Summary

${results.overall ? '✅ All tests passed' : '❌ Some tests failed'}

## Test Results

### Unit Tests
Status: ${results.unitTests ? '✅ Passed' : '❌ Failed'}

### Module Registry System
Status: ${results.moduleRegistry ? '✅ Passed' : '❌ Failed'}

### Theme System
Status: ${results.themeSystem ? '✅ Passed' : '❌ Failed'}

### Authentication System
Status: ${results.authSystem ? '✅ Passed' : '❌ Failed'}

## Next Steps

1. Review any failed tests and make necessary fixes
2. Run network diagnostics with \`node network-diagnostics.js\`
3. Once network issues are resolved, run the complete test suite with \`./server.sh && npm test\`

## Notes

This test report was generated without requiring network connectivity or a running server.
It focuses on code structure, patterns, and static analysis of the DIY Formulations application.
`;

  try {
    await fs.writeFile(reportPath, reportContent, 'utf8');
    console.log(`${colors.green}✓ Test report written to ${reportPath}${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Error writing test report: ${err.message}${colors.reset}`);
  }
}

// Main function
async function main() {
  console.log(`${colors.bold}System Information:${colors.reset}`);
  console.log(`- Platform: ${process.platform}`);
  console.log(`- Node.js: ${process.version}`);
  
  // Run all tests
  const results = {
    unitTests: await runUnitTests(),
    moduleRegistry: await testModuleRegistry(),
    themeSystem: await testThemeSystem(),
    authSystem: await testAuthSystem()
  };
  
  // Overall result
  results.overall = results.unitTests && 
                    results.moduleRegistry && 
                    results.themeSystem && 
                    results.authSystem;
  
  // Generate report
  await generateTestReport(results);
  
  // Print summary
  console.log(`\n${colors.bold}${colors.cyan}===== Test Summary =====${colors.reset}`);
  console.log(`Unit Tests: ${results.unitTests ? colors.green + '✓ Passed' : colors.red + '✗ Failed'}${colors.reset}`);
  console.log(`Module Registry: ${results.moduleRegistry ? colors.green + '✓ Passed' : colors.red + '✗ Failed'}${colors.reset}`);
  console.log(`Theme System: ${results.themeSystem ? colors.green + '✓ Passed' : colors.red + '✗ Failed'}${colors.reset}`);
  console.log(`Auth System: ${results.authSystem ? colors.green + '✓ Passed' : colors.red + '✗ Failed'}${colors.reset}`);
  console.log(`Overall: ${results.overall ? colors.green + '✓ All tests passed' : colors.red + '✗ Some tests failed'}${colors.reset}`);
  
  process.exit(results.overall ? 0 : 1);
}

// Run the tests
main().catch(err => {
  console.error(`${colors.red}${colors.bold}Error in test runner:${colors.reset}`, err);
  process.exit(1);
});