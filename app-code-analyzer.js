#!/usr/bin/env node

/**
 * DIY Formulations Application Code Analyzer
 * 
 * This script performs static analysis of the application code
 * to verify patterns, structures, and potential issues without
 * requiring a running server.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for better output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}===== DIY Formulations Code Analyzer =====${colors.reset}\n`);

// Helper function to recursively read directory contents
async function readDirRecursive(dir, options = {}) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      // Skip node_modules, .next, and other non-source directories
      if (['node_modules', '.next', 'out', 'build', 'dist', '.git', 'coverage'].includes(dirent.name)) {
        return [];
      }
      return readDirRecursive(res, options);
    } else {
      // Filter by file extensions if specified
      if (options.extensions && !options.extensions.includes(path.extname(res))) {
        return [];
      }
      return res;
    }
  }));
  return Array.prototype.concat(...files);
}

// Function to check if file content contains a specific pattern
async function checkFilePattern(filePath, pattern, description, shouldExist = true) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const hasPattern = pattern instanceof RegExp ? 
      pattern.test(content) : 
      content.includes(pattern);
    
    if (shouldExist === hasPattern) {
      console.log(`${colors.green}✓ ${description}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ ${description}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}Error reading file ${filePath}: ${err.message}${colors.reset}`);
    return false;
  }
}

// Function to analyze a React component file
async function analyzeReactComponent(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing React component: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /['"]use client['"]/, description: `Has "use client" directive`, shouldExist: true },
    { pattern: /import React/i, description: 'Imports React', shouldExist: true },
    { pattern: /export (default|function|const) /i, description: 'Exports component', shouldExist: true },
    { pattern: /useState|useEffect|useContext|useRef|useCallback|useMemo/i, description: 'Uses React hooks', shouldExist: null }, // null means don't report
    { pattern: /createContext/i, description: 'Creates a context', shouldExist: null }
  ];
  
  const content = await fs.readFile(filePath, 'utf8');
  
  // Components with context creation should have "use client"
  if (content.includes('createContext')) {
    checks.find(c => c.pattern === /['"]use client['"]/).shouldExist = true;
  }
  
  // Components using hooks should have "use client"
  if (/useState|useEffect|useContext|useRef|useCallback|useMemo/i.test(content)) {
    checks.find(c => c.pattern === /['"]use client['"]/).shouldExist = true;
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    if (check.shouldExist === null) continue;
    
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Function to analyze React provider components
async function analyzeProviders(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing Provider: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /['"]use client['"]/, description: 'Has "use client" directive', shouldExist: true },
    { pattern: /createContext/i, description: 'Creates a context', shouldExist: true },
    { pattern: /Provider/i, description: 'Exports a Provider component', shouldExist: true },
    { pattern: /useContext/i, description: 'Includes a hook for using the context', shouldExist: true },
    { pattern: /value ?={/, description: 'Passes a value to the Provider', shouldExist: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Function to analyze React hooks
async function analyzeHooks(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing Hook: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /['"]use client['"]/, description: 'Has "use client" directive', shouldExist: true },
    { pattern: /^export function use[A-Z]/m, description: 'Exports a hook function', shouldExist: true },
    { pattern: /useState|useEffect|useContext|useRef|useCallback|useMemo/i, description: 'Uses other React hooks', shouldExist: true },
    { pattern: /return {/, description: 'Returns an object with values', shouldExist: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Function to analyze Next.js configuration
async function analyzeNextConfig(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing Next.js Configuration: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /nextConfig/, description: 'Defines Next.js configuration', shouldExist: true },
    { pattern: /webpack/, description: 'Customizes webpack configuration', shouldExist: null },
    { pattern: /experimental/, description: 'Uses experimental features', shouldExist: null },
    { pattern: /headers/, description: 'Defines custom headers', shouldExist: null },
    { pattern: /images/, description: 'Configures image optimization', shouldExist: null },
    { pattern: /export default nextConfig/, description: 'Exports the configuration', shouldExist: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    if (check.shouldExist === null) continue;
    
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Function to analyze the module registry
async function analyzeModuleRegistry(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing Module Registry: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /class ModuleRegistry/, description: 'Defines ModuleRegistry class', shouldExist: true },
    { pattern: /private static instance/, description: 'Implements singleton pattern', shouldExist: true },
    { pattern: /getInstance\(\)/, description: 'Has getInstance method', shouldExist: true },
    { pattern: /registerModule/, description: 'Has module registration method', shouldExist: true },
    { pattern: /isModuleEnabled/, description: 'Has module status check method', shouldExist: true },
    { pattern: /setModuleEnabled/, description: 'Has module enablement method', shouldExist: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Function to analyze the module context
async function analyzeModuleContext(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing Module Context: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /['"]use client['"]/, description: 'Has "use client" directive', shouldExist: true },
    { pattern: /createContext/, description: 'Creates a context', shouldExist: true },
    { pattern: /ModuleProvider/, description: 'Defines a ModuleProvider', shouldExist: true },
    { pattern: /useModules/, description: 'Exports useModules hook', shouldExist: true },
    { pattern: /useState/, description: 'Uses state management', shouldExist: true },
    { pattern: /useEffect/, description: 'Uses effect hooks', shouldExist: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Function to analyze theme system
async function analyzeThemeSystem(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n${colors.blue}Analyzing Theme System: ${fileName}${colors.reset}`);
  
  const checks = [
    { pattern: /['"]use client['"]/, description: 'Has "use client" directive', shouldExist: true },
    { pattern: /ThemeContext|ThemeProvider/, description: 'Defines theme context/provider', shouldExist: true },
    { pattern: /setTheme|toggleTheme/, description: 'Has theme switching functionality', shouldExist: true },
    { pattern: /localStorage/, description: 'Uses localStorage for persistence', shouldExist: true },
    { pattern: /matchMedia|prefers-color-scheme/, description: 'Detects system preferences', shouldExist: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    const result = await checkFilePattern(filePath, check.pattern, check.description, check.shouldExist);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// Generate a summary report
async function generateReport(results) {
  const timestamp = new Date().toISOString();
  
  const reportPath = path.join(__dirname, 'CODE_ANALYSIS_REPORT.md');
  const totalChecks = Object.values(results).reduce((sum, category) => sum + category.total, 0);
  const totalPassed = Object.values(results).reduce((sum, category) => sum + category.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, category) => sum + category.failed, 0);
  const passPercentage = totalChecks > 0 ? (totalPassed / totalChecks * 100).toFixed(2) : '0.00';
  
  const report = `# DIY Formulations Code Analysis Report

Generated: ${timestamp}

## Summary

- Total checks: ${totalChecks}
- Passed: ${totalPassed} (${passPercentage}%)
- Failed: ${totalFailed}

## Results by Category

| Category | Passed | Failed | Total | Success Rate |
|----------|--------|--------|-------|-------------|
${Object.entries(results).map(([category, { passed, failed, total }]) => {
  const successRate = total > 0 ? (passed / total * 100).toFixed(2) : '0.00';
  return `| ${category} | ${passed} | ${failed} | ${total} | ${successRate}% |`;
}).join('\n')}

## Analysis

### Key Strengths

- ${results.moduleRegistry.passed === results.moduleRegistry.total ? 
      'Module Registry correctly implements the singleton pattern and provides all necessary functionality.' : 
      'Partial implementation of Module Registry pattern detected.'}
- ${results.themeSystem.passed === results.themeSystem.total ? 
      'Theme system properly implements persistence, system detection, and theme switching.' : 
      'Theme system partially implemented with some missing features.'}
- ${results.hooks.passed === results.hooks.total ? 
      'React hooks follow best practices and properly use the "use client" directive.' : 
      'Some React hooks may need improvements for client-side rendering.'}

### Areas for Improvement

${results.components.failed > 0 ? '- Some React components are missing proper "use client" directives for client-side functionality.' : ''}
${results.providers.failed > 0 ? '- Provider components need adjustments to ensure proper context handling.' : ''}
${results.nextConfig.failed > 0 ? '- Next.js configuration may need updates to optimize for the current environment.' : ''}
${results.moduleContext.failed > 0 ? '- Module context implementation needs review to ensure proper client-side functionality.' : ''}

## Next Steps

1. ${results.components.failed > 0 ? 'Add "use client" directives to components that use React hooks or context.' : 'Verify component behavior in a running environment.'}
2. ${results.providers.failed > 0 ? 'Update provider components to ensure consistent context provision.' : 'Consider optimizing provider re-renders.'}
3. ${results.moduleRegistry.failed > 0 ? 'Fix Module Registry pattern implementation issues.' : 'Ensure module registry is properly initialized on application load.'}
4. ${results.themeSystem.failed > 0 ? 'Address theme system persistence and detection issues.' : 'Test theme system in different browser environments.'}

## Detailed Check Results

${Object.entries(results).flatMap(([category, data]) => {
  if (!data.details || data.details.length === 0) return [];
  return [
    `### ${category}`,
    '',
    ...data.details.map(detail => `- ${detail.success ? '✓' : '✗'} ${detail.description}`)
  ];
}).join('\n')}
`;

  await fs.writeFile(reportPath, report);
  console.log(`${colors.green}Report generated at ${reportPath}${colors.reset}`);
}

// Main execution function
async function main() {
  const appDir = path.join(__dirname, 'modern-diy-recipes');
  console.log(`${colors.yellow}Analyzing application code in: ${appDir}${colors.reset}\n`);
  
  const results = {
    components: { passed: 0, failed: 0, total: 0, details: [] },
    providers: { passed: 0, failed: 0, total: 0, details: [] },
    hooks: { passed: 0, failed: 0, total: 0, details: [] },
    nextConfig: { passed: 0, failed: 0, total: 0, details: [] },
    moduleRegistry: { passed: 0, failed: 0, total: 0, details: [] },
    moduleContext: { passed: 0, failed: 0, total: 0, details: [] },
    themeSystem: { passed: 0, failed: 0, total: 0, details: [] }
  };
  
  try {
    // Find and analyze React components
    const componentFiles = await readDirRecursive(path.join(appDir, 'src', 'components'), { extensions: ['.tsx', '.jsx'] });
    for (const file of componentFiles) {
      const componentResult = await analyzeReactComponent(file);
      results.components.passed += componentResult.passed;
      results.components.failed += componentResult.failed;
      results.components.total += componentResult.total;
    }
    
    // Find and analyze providers
    const providerFiles = await readDirRecursive(path.join(appDir, 'src', 'providers'), { extensions: ['.tsx', '.jsx'] });
    for (const file of providerFiles) {
      const providerResult = await analyzeProviders(file);
      results.providers.passed += providerResult.passed;
      results.providers.failed += providerResult.failed;
      results.providers.total += providerResult.total;
    }
    
    // Find and analyze hooks
    const hookFiles = await readDirRecursive(path.join(appDir, 'src', 'hooks'), { extensions: ['.ts', '.tsx', '.js', '.jsx'] });
    for (const file of hookFiles) {
      const hookResult = await analyzeHooks(file);
      results.hooks.passed += hookResult.passed;
      results.hooks.failed += hookResult.failed;
      results.hooks.total += hookResult.total;
    }
    
    // Analyze Next.js configuration
    const nextConfigFile = path.join(appDir, 'next.config.ts');
    if (await fs.access(nextConfigFile).then(() => true).catch(() => false)) {
      const nextConfigResult = await analyzeNextConfig(nextConfigFile);
      results.nextConfig.passed += nextConfigResult.passed;
      results.nextConfig.failed += nextConfigResult.failed;
      results.nextConfig.total += nextConfigResult.total;
    }
    
    // Analyze module registry
    const moduleRegistryFile = path.join(appDir, 'src', 'lib', 'modules', 'registry.ts');
    if (await fs.access(moduleRegistryFile).then(() => true).catch(() => false)) {
      const moduleRegistryResult = await analyzeModuleRegistry(moduleRegistryFile);
      results.moduleRegistry.passed += moduleRegistryResult.passed;
      results.moduleRegistry.failed += moduleRegistryResult.failed;
      results.moduleRegistry.total += moduleRegistryResult.total;
    }
    
    // Analyze module context
    const moduleContextFile = path.join(appDir, 'src', 'lib', 'modules', 'moduleContext.tsx');
    if (await fs.access(moduleContextFile).then(() => true).catch(() => false)) {
      const moduleContextResult = await analyzeModuleContext(moduleContextFile);
      results.moduleContext.passed += moduleContextResult.passed;
      results.moduleContext.failed += moduleContextResult.failed;
      results.moduleContext.total += moduleContextResult.total;
    }
    
    // Analyze theme system
    const themeProviderFile = path.join(appDir, 'src', 'providers', 'FixedThemeProvider.tsx');
    if (await fs.access(themeProviderFile).then(() => true).catch(() => false)) {
      const themeSystemResult = await analyzeThemeSystem(themeProviderFile);
      results.themeSystem.passed += themeSystemResult.passed;
      results.themeSystem.failed += themeSystemResult.failed;
      results.themeSystem.total += themeSystemResult.total;
    }
    
    // Generate report
    await generateReport(results);
    
    // Print summary
    console.log(`\n${colors.cyan}============= Summary ==============${colors.reset}`);
    console.log(`Components: ${results.components.passed}/${results.components.total}`);
    console.log(`Providers: ${results.providers.passed}/${results.providers.total}`);
    console.log(`Hooks: ${results.hooks.passed}/${results.hooks.total}`);
    console.log(`Next.js Config: ${results.nextConfig.passed}/${results.nextConfig.total}`);
    console.log(`Module Registry: ${results.moduleRegistry.passed}/${results.moduleRegistry.total}`);
    console.log(`Module Context: ${results.moduleContext.passed}/${results.moduleContext.total}`);
    console.log(`Theme System: ${results.themeSystem.passed}/${results.themeSystem.total}`);
    console.log(`${colors.cyan}====================================${colors.reset}`);
    
    const totalChecks = Object.values(results).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(results).reduce((sum, category) => sum + category.passed, 0);
    const passPercentage = totalChecks > 0 ? (totalPassed / totalChecks * 100).toFixed(2) : '0.00';
    
    console.log(`\n${colors.bold}Overall: ${totalPassed}/${totalChecks} checks passed (${passPercentage}%)${colors.reset}`);
    
    process.exit(0);
  } catch (err) {
    console.error(`${colors.red}Error analyzing code: ${err.message}${colors.reset}`);
    console.error(err);
    process.exit(1);
  }
}

// Run the code analyzer
main();