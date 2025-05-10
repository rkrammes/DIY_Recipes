/**
 * Environment Validator
 *
 * This utility module validates the required environment variables
 * and provides helpful error messages when configuration is missing.
 * It also integrates with the feature flag system to provide a unified
 * configuration approach for the application.
 */

// Import feature flags for integration
import baseFeatureFlags, { isFeatureEnabled as checkFeatureFlag } from './feature-flags';
import { isModuleFeatureEnabled } from './modules/featureFlags';

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Validates essential client-side environment variables
 * @returns boolean indicating if all required variables are present
 */
export function validateClientEnvironment(): boolean {
  const requiredClientVars = [
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredClientVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    console.warn(`Environment warning: Missing ${missing.join(', ')}`);
    
    if (isDevelopment) {
      console.info('Using development fallbacks - some features may be limited');
      return true; // Continue in development
    }
    
    return false;
  }
  
  return true;
}

/**
 * Validates server-side environment variables (only call in server functions)
 * @returns boolean indicating if all required server variables are present
 */
export function validateServerEnvironment(): boolean {
  const requiredServerVars = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredServerVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    console.error(`Server environment error: Missing ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Get a detailed environment status report (for debugging)
 * @returns object with environment status details
 */
/**
 * Get a detailed environment status report (for debugging)
 * @returns object with environment status details
 */
export function getEnvironmentStatus() {
  // Get all features enabled via environment variables
  const enabledFeatures = Object.keys(environmentFeatures).reduce<Record<string, boolean>>(
    (acc, featureName) => {
      acc[featureName] = isFeatureEnabled(featureName);
      return acc;
    },
    {}
  );

  return {
    // Core environment info
    isDevelopment,
    environment: process.env.NODE_ENV || 'production',

    // Supabase configuration status
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    validClientEnv: validateClientEnvironment(),

    // UI configuration
    theme: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'hackers',
    uiMode: process.env.NEXT_PUBLIC_UI_MODE || 'terminal',

    // Feature flags from environment variables
    features: enabledFeatures,

    // Legacy direct environment variables (for backward compatibility)
    useFallbackData: isFeatureEnabled('fallback-data'),
    autoDevLogin: isFeatureEnabled('dev-login'),
    moduleSystemEnabled: isFeatureEnabled('modules'),
    recipeVersioningEnabled: isFeatureEnabled('recipe-versioning'),
    audioEnabled: isFeatureEnabled('audio'),
    terminalUiEnabled: isFeatureEnabled('terminal-ui'),
  };
}

/**
 * Define feature flag mappings from environment variables
 * This provides a centralized definition of all environment-based flags
 */
export const environmentFeatures: Record<string, string> = {
  // Core application features
  'modules': 'NEXT_PUBLIC_ENABLE_MODULES',
  'recipe-versioning': 'NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING',
  'audio': 'NEXT_PUBLIC_AUDIO_ENABLED',

  // Development and testing features
  'dev-login': 'NEXT_PUBLIC_AUTO_DEV_LOGIN',
  'fallback-data': 'NEXT_PUBLIC_USE_FALLBACK_DATA',
  'context7': 'NEXT_PUBLIC_MCP_ENABLED',
  'terminal-ui': 'NEXT_PUBLIC_TERMINAL_UI_ENABLED',
  'debug-mode': 'NEXT_PUBLIC_DEBUG_MODE',

  // Data access features
  'supabase': 'NEXT_PUBLIC_USE_SUPABASE',
  'mock-data': 'NEXT_PUBLIC_USE_MOCK_DATA',

  // UI features
  'animations': 'NEXT_PUBLIC_ANIMATIONS_ENABLED',
  'document-mode': 'NEXT_PUBLIC_DOCUMENT_MODE_ENABLED',
};

/**
 * Check if a feature is enabled via environment variables
 * This function provides a layered approach to feature flags:
 * 1. First checks environment variables
 * 2. Falls back to the feature-flags.js system
 * 3. Checks module-specific flags for module features
 *
 * @param featureName The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(featureName: string): boolean {
  // Check if this is a module-specific feature (contains a colon)
  if (featureName.includes(':')) {
    const [moduleId, moduleFeature] = featureName.split(':');
    return isModuleFeatureEnabled(moduleId, moduleFeature);
  }

  // First check environment variables
  const envVar = environmentFeatures[featureName];
  if (envVar && process.env[envVar] !== undefined) {
    return process.env[envVar] === 'true';
  }

  // Then fall back to feature-flags.js system
  // Convert kebab-case to camelCase for feature flags
  const camelCaseFeature = featureName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  // Check if the feature exists in the base feature flags
  if (camelCaseFeature in baseFeatureFlags) {
    return checkFeatureFlag(camelCaseFeature);
  }

  // Feature not found in any system
  return false;
}

/**
 * Determines if the current environment has valid feature flag configuration
 * @returns boolean indicating if feature flags are properly configured
 */
export function validateFeatureFlags(): boolean {
  // Check for conflicting settings
  const hasMockData = isFeatureEnabled('mock-data');
  const useSupabase = isFeatureEnabled('supabase');

  if (hasMockData && useSupabase && !isDevelopment) {
    console.warn('Feature flag conflict: Both mock-data and supabase are enabled in production');
    // Not a critical error, but should be logged
  }

  // Terminal UI and document mode should not both be enabled
  const hasTerminalUi = isFeatureEnabled('terminal-ui');
  const hasDocumentMode = isFeatureEnabled('document-mode');

  if (hasTerminalUi && hasDocumentMode) {
    console.error('Feature flag conflict: Both terminal-ui and document-mode cannot be enabled');
    return false;
  }

  return true;
}

/**
 * Get the current UI mode from environment configuration
 * @returns string representing the current UI mode
 */
export function getUiMode(): 'terminal' | 'document' | 'standard' {
  // Check environment variables first
  const envUiMode = process.env.NEXT_PUBLIC_UI_MODE;
  if (envUiMode) {
    if (['terminal', 'document', 'standard'].includes(envUiMode)) {
      return envUiMode as 'terminal' | 'document' | 'standard';
    }
  }

  // Check feature flags
  if (isFeatureEnabled('terminal-ui')) return 'terminal';
  if (isFeatureEnabled('document-mode')) return 'document';

  // Default to standard if nothing is specified
  return 'standard';
}

export default {
  validateClientEnvironment,
  validateServerEnvironment,
  validateFeatureFlags,
  getEnvironmentStatus,
  getUiMode,
  isFeatureEnabled,
  isDevelopment
};