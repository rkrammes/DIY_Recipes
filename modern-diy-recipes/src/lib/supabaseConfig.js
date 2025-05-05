/**
 * Supabase Configuration - Constants and configuration for Supabase
 * 
 * This file contains the base configuration settings for connecting to Supabase.
 * It provides fallback endpoints for development if the environment variables are not set.
 */

// Supabase URL - Default to a development endpoint if not specified
export const SUPABASE_URL = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://xyzcompany.supabase.co';

// Supabase Anon Key - Default to a development key if not specified
export const SUPABASE_ANON_KEY = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocnJmZXlqenJmanVvaXB3enhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg5MDgwNjAsImV4cCI6MTk5NDQ4NDA2MH0.v9wAy4wcK4hSQ5GN8m6rj4pU5hQPKV-OAnQbL56jEDU';

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