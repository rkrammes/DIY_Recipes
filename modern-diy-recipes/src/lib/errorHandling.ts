/**
 * Error handling utilities for Supabase and API calls
 * Provides consistent error handling and user-friendly messages
 */

// Known table missing errors from Supabase
const MISSING_TABLE_MESSAGES = [
  'relation "public.recipe_iterations" does not exist',
  'relation "public.recipe_ai_suggestions" does not exist',
  'relation "public.iterations" does not exist',
  'relation "public.ai_suggestions" does not exist',
];

/**
 * Checks if an error is a known missing table error
 * @param error The error to check
 * @returns True if the error is a known missing table error
 */
export function isMissingTableError(error: any): boolean {
  if (!error) return false;
  
  // Check for Supabase-specific error format
  if (error.message && typeof error.message === 'string') {
    return MISSING_TABLE_MESSAGES.some(msg => error.message.includes(msg));
  }
  
  // Check for string error
  if (typeof error === 'string') {
    return MISSING_TABLE_MESSAGES.some(msg => error.includes(msg));
  }
  
  return false;
}

/**
 * Safely handles Supabase errors with graceful fallbacks
 * @param error The error from Supabase
 * @param context Optional context for error logging 
 * @returns Friendly error message and error data
 */
export function handleApiError(error: any, context: string = 'API') {
  // Check for missing table errors
  if (isMissingTableError(error)) {
    console.warn(`${context}: Missing table error, using fallback:`, error);
    return {
      message: "Some data is temporarily unavailable. Using fallback.",
      status: 404,
      isMissingTable: true
    };
  }
  
  // Handle basic error object
  const baseError = error && error.message ? {
    message: error.message,
    status: error.status || 500
  } : null;
  
  // Log and return the error
  console.warn(`${context} error:`, error);
  return baseError || {
    message: "An unexpected error occurred. Using fallback data.",
    status: 500
  };
}

/**
 * Get a user-friendly error message for display
 * @param error The error object or string
 * @returns A user-friendly error message
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "An unknown error occurred";
  
  // Handle string errors
  if (typeof error === 'string') return error;
  
  // Handle missing table errors
  if (isMissingTableError(error)) {
    return "Some features are temporarily unavailable";
  }
  
  // Handle object errors
  if (error.message) return error.message;
  
  // Fall back to generic message
  return "There was a problem communicating with the server";
}