/**
 * Supabase Configuration - Constants and configuration for Supabase
 *
 * This file contains the base configuration settings for connecting to Supabase.
 * IMPORTANT: Never expose service role keys in client-side code
 */

import { isFeatureEnabled, validateClientEnvironment } from './environmentValidator';

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

// Supabase URL for client-side connections
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Supabase Anon Key (public) for client-side connections
// This is safe to use in browser code - it has limited permissions via Row Level Security
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check for service role key accidentally used in the anon key field
// Service role keys contain "service_role" in the JWT payload
export const isServiceKey = SUPABASE_ANON_KEY?.includes('"role":"service_role"') || false;

// Log a warning if it looks like a service role key is being used in public code
if (isServiceKey) {
  console.error('⚠️ SECURITY WARNING: Service role key detected in NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('This is a security risk - service role keys should never be exposed in client-side code.');
  console.error('Please use the correct anon/public key in your .env.local file.');

  if (isDevelopment) {
    console.warn('Continuing in development mode with limited functionality');
  }
}

// Flag to detect if we have valid configuration
export const hasValidConfig = !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !isServiceKey;

// Flag for development fallbacks - uses environment validator for more comprehensive checks
export const hasFallbackConfig = isDevelopment && (!hasValidConfig || isFeatureEnabled('fallback-data'));

// Maximum retry count for Supabase requests
export const MAX_RETRIES = 3;

// Timeout for Supabase requests (in milliseconds)
export const REQUEST_TIMEOUT = 15000;

// Cache duration (in milliseconds) - 5 minutes
export const CACHE_DURATION = 5 * 60 * 1000;

// Endpoint retries status codes - which status codes should trigger retries
export const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Retry backoff multiplier - how much to increase delay between retries
export const RETRY_BACKOFF_MULTIPLIER = 1.5;

// Base delay for first retry (in milliseconds)
export const BASE_RETRY_DELAY = 200;

// No fallback recipes - we don't want any mock data by default
export const FALLBACK_RECIPES: any[] = [];

// Table existence flags - will be checked at runtime
export const REQUIRED_TABLES = ['recipes', 'ingredients', 'recipe_ingredients', 'iterations', 'users', 'user_preferences'];

export const TABLES_EXIST = {
  recipes: true,
  ingredients: true,
  recipe_ingredients: true,
  iterations: true,
  users: true,
  user_preferences: true,
  tools: false,
  library: false
};

// Define API endpoints for direct fetch fallbacks if Supabase client fails
export const ENDPOINTS = {
  recipes: {
    list: '/api/recipes',
    detail: (id: string) => `/api/recipes/${id}`,
    ingredients: (id: string) => `/api/recipes/${id}/ingredients`,
    iterations: (id: string) => `/api/recipes/${id}/iterations`,
  },
  ingredients: {
    list: '/api/ingredients',
    detail: (id: string) => `/api/ingredients/${id}`,
  },
  user: {
    preferences: '/api/user/preferences',
    profile: '/api/user/profile',
  }
};

/**
 * Helper function to determine if a specific Supabase feature is available
 * based on configuration and feature flags
 */
export function hasSupabaseFeature(featureName: string): boolean {
  // If no valid Supabase configuration, no features are available
  // unless we're in development mode with fallbacks
  if (!hasValidConfig && !hasFallbackConfig) {
    return false;
  }
  
  // Check for specific features
  switch (featureName) {
    case 'auth':
      return hasValidConfig || isDevelopment;
      
    case 'storage':
      return hasValidConfig; // Mock storage is not implemented
      
    case 'realtime':
      return hasValidConfig; // Mock realtime is not implemented
      
    case 'functions':
      return hasValidConfig; // Mock functions not implemented
      
    case 'recipes':
    case 'ingredients':
    case 'preferences':
      return true; // These are available in both real and mock implementations
      
    default:
      return false;
  }
}

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  hasValidConfig,
  hasFallbackConfig,
  MAX_RETRIES,
  REQUEST_TIMEOUT,
  CACHE_DURATION,
  RETRY_STATUS_CODES,
  RETRY_BACKOFF_MULTIPLIER,
  BASE_RETRY_DELAY,
  REQUIRED_TABLES,
  TABLES_EXIST,
  ENDPOINTS,
  hasSupabaseFeature
};