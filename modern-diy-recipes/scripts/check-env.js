#!/usr/bin/env node

/**
 * Environment Checker Script
 * 
 * Run this script to check the environment configuration and validate
 * that all required environment variables are set correctly.
 * 
 * Usage: node scripts/check-env.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Import the environment validator
const { getEnvironmentStatus, validateClientEnvironment, validateServerEnvironment, validateFeatureFlags } = require('../dist/lib/environmentValidator');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// Print a separator line
function printSeparator() {
  console.log('\n' + colors.gray + '─'.repeat(50) + colors.reset + '\n');
}

// Print a header
function printHeader(text) {
  console.log(colors.bold + colors.blue + text + colors.reset + '\n');
}

// Print a success message
function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
}

// Print a warning message
function printWarning(text) {
  console.log(colors.yellow + '⚠ ' + text + colors.reset);
}

// Print an error message
function printError(text) {
  console.log(colors.red + '✕ ' + text + colors.reset);
}

// Check environment status
async function checkEnvironment() {
  printHeader('Environment Configuration Check');
  
  // Get environment status
  const status = getEnvironmentStatus();
  
  // Print environment info
  console.log(colors.cyan + 'Environment:' + colors.reset + ' ' + status.environment);
  console.log(colors.cyan + 'Development Mode:' + colors.reset + ' ' + (status.isDevelopment ? 'Yes' : 'No'));
  
  printSeparator();
  printHeader('Supabase Configuration');
  
  // Check Supabase configuration
  const clientEnvValid = validateClientEnvironment();
  if (clientEnvValid) {
    printSuccess('Client environment is valid');
  } else {
    printError('Client environment is invalid');
    console.log(colors.gray + 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' + colors.reset);
  }
  
  // Check server environment
  const serverEnvValid = validateServerEnvironment();
  if (serverEnvValid) {
    printSuccess('Server environment is valid');
  } else {
    printWarning('Server environment is incomplete');
    console.log(colors.gray + 'Missing SUPABASE_SERVICE_ROLE_KEY (only needed for admin operations)' + colors.reset);
  }
  
  printSeparator();
  printHeader('Feature Flags');
  
  // Check feature flags
  const featureFlagsValid = validateFeatureFlags();
  if (featureFlagsValid) {
    printSuccess('Feature flags configuration is valid');
  } else {
    printError('Feature flags configuration has conflicts');
    console.log(colors.gray + 'Check for contradictory flags (e.g., terminal-ui and document-mode)' + colors.reset);
  }
  
  // Print enabled features
  console.log('\n' + colors.cyan + 'Enabled Features:' + colors.reset);
  const enabledFeatures = Object.entries(status.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
  
  if (enabledFeatures.length > 0) {
    enabledFeatures.forEach(feature => {
      console.log('  ' + colors.green + '✓ ' + feature + colors.reset);
    });
  } else {
    console.log('  ' + colors.gray + 'No features enabled' + colors.reset);
  }
  
  printSeparator();
  
  // Overall status
  if (clientEnvValid && featureFlagsValid) {
    printSuccess('Overall configuration is valid');
    return true;
  } else {
    printError('Configuration issues detected - see above for details');
    return false;
  }
}

// Run the check
checkEnvironment()
  .then(valid => {
    process.exit(valid ? 0 : 1);
  })
  .catch(error => {
    console.error(colors.red + 'Error checking environment:' + colors.reset, error);
    process.exit(1);
  });