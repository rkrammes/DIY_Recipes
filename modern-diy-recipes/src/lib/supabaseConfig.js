/**
 * Supabase Configuration - Constants and configuration for Supabase
 *
 * This file contains the base configuration settings for connecting to Supabase.
 * IMPORTANT: Never expose service role keys in client-side code
 */

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

// Supabase URL for client-side connections
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Supabase Anon Key (public) for client-side connections
// This is safe to use in browser code - it has limited permissions via Row Level Security
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag to detect if we have valid configuration
export const hasValidConfig = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

// Flag for development fallbacks
export const hasFallbackConfig = isDevelopment && !hasValidConfig;

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

// No fallback recipes - we don't want any mock data
export const FALLBACK_RECIPES = [];

// Table existence flags - will be checked at runtime
export const REQUIRED_TABLES = ['recipes', 'ingredients', 'tools', 'library'];
export const TABLES_EXIST = {
  recipes: true,
  ingredients: true,
  tools: false,
  library: false
};

// Define API endpoints for direct fetch fallbacks if Supabase client fails
export const ENDPOINTS = {
  recipes: {
    list: '/api/recipes',
    detail: (id) => `/api/recipes/${id}`,
    ingredients: (id) => `/api/recipes/${id}/ingredients`,
    iterations: (id) => `/api/recipes/${id}/iterations`,
  },
  ingredients: {
    list: '/api/ingredients',
    detail: (id) => `/api/ingredients/${id}`,
  },
};