/**
 * Environment Check Utility
 * 
 * This utility provides a way to check the environment configuration
 * in development mode. It can be used to diagnose environment issues
 * and ensure that the application is properly configured.
 */

import { getEnvironmentStatus, validateFeatureFlags, getUiMode } from '@/lib/environmentValidator';

/**
 * Check the environment configuration and log warnings/errors
 * @returns boolean indicating if the environment is valid
 */
export function checkEnvironment(): boolean {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Environment check skipped in non-development mode');
    return true;
  }
  
  let isValid = true;
  
  // Get environment status
  const status = getEnvironmentStatus();
  
  // Check Supabase configuration
  if (!status.validClientEnv) {
    console.error('⚠️ Supabase client environment is not correctly configured');
    console.info('Add missing environment variables to .env.local:');
    
    if (status.supabaseUrl === 'Missing') {
      console.info('- NEXT_PUBLIC_SUPABASE_URL');
    }
    
    if (status.supabaseAnonKey === 'Missing') {
      console.info('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    isValid = false;
  }
  
  // Check feature flags for conflicts
  if (!validateFeatureFlags()) {
    console.error('⚠️ Feature flag conflicts detected');
    console.info('Check your environment variables for conflicting settings');
    isValid = false;
  }
  
  // Log current environment configuration
  console.info('\n----- Environment Configuration -----');
  console.info(`Mode: ${status.environment}`);
  console.info(`UI Mode: ${getUiMode()}`);
  console.info(`Theme: ${status.theme}`);
  console.info('\nEnabled Features:');
  
  // Log enabled features
  Object.entries(status.features)
    .filter(([_, enabled]) => enabled)
    .forEach(([feature]) => {
      console.info(`- ${feature}`);
    });
  
  console.info('\n------------------------------------\n');
  
  return isValid;
}

/**
 * Generate a compact representation of the environment status for logging
 * @returns string containing a compact environment status summary
 */
export function getEnvironmentSummary(): string {
  const status = getEnvironmentStatus();
  const uiMode = getUiMode();
  
  const enabledFeatures = Object.entries(status.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature)
    .join(', ');
  
  return `ENV: ${status.environment} | UI: ${uiMode} | DB: ${status.supabaseUrl !== 'Missing' ? 'Supabase' : 'Mock'} | Features: ${enabledFeatures}`;
}

export default {
  checkEnvironment,
  getEnvironmentSummary
};