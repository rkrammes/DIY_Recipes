/**
 * Standardized Supabase error handling utilities
 * Provides consistent error handling for Supabase operations
 */

import { PostgrestError } from "@supabase/supabase-js";

/**
 * Different types of Supabase errors that can occur
 */
export enum SupabaseErrorType {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  QUERY = 'query',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * Structured error object for Supabase operations
 */
export interface StructuredSupabaseError {
  type: SupabaseErrorType;
  message: string;
  status: number;
  code?: string;
  details?: any;
  original?: any;
}

/**
 * Categorizes a Supabase PostgrestError into a specific error type
 */
export function categorizeSupabaseError(error: PostgrestError | null): SupabaseErrorType {
  if (!error) return SupabaseErrorType.UNKNOWN;

  const { code, message, details } = error;
  
  // Connection errors
  if (code === '20001' || message.includes('connection') || message.includes('unreachable')) {
    return SupabaseErrorType.CONNECTION;
  }
  
  // Authentication errors
  if (
    code === '42501' || 
    message.includes('permission') || 
    message.includes('not authorized') ||
    message.includes('authentication')
  ) {
    return SupabaseErrorType.AUTHENTICATION;
  }
  
  // Not found errors
  if (code === '22023' || message.includes('not found') || error.status === 404) {
    return SupabaseErrorType.NOT_FOUND;
  }
  
  // Validation errors
  if (
    code?.startsWith('23') || // Constraint violations
    message.includes('violates') ||
    message.includes('invalid')
  ) {
    return SupabaseErrorType.VALIDATION;
  }
  
  // Permission errors
  if (code === '42501' || message.includes('permission denied')) {
    return SupabaseErrorType.PERMISSION;
  }
  
  // Rate limiting
  if (code === '429' || message.includes('rate limit')) {
    return SupabaseErrorType.RATE_LIMIT;
  }
  
  // Server errors
  if (error.status >= 500 || code?.startsWith('XX')) {
    return SupabaseErrorType.SERVER;
  }
  
  // Query errors - most common category, so check last
  if (
    code?.startsWith('42') || // Syntax error or access rule violation
    message.includes('syntax') ||
    message.includes('query')
  ) {
    return SupabaseErrorType.QUERY;
  }
  
  return SupabaseErrorType.UNKNOWN;
}

/**
 * Converts a Supabase error into a structured error object
 */
export function structureSupabaseError(error: PostgrestError | Error | unknown): StructuredSupabaseError {
  // Handle PostgrestError
  if (error && typeof error === 'object' && 'code' in error) {
    const postgrestError = error as PostgrestError;
    const errorType = categorizeSupabaseError(postgrestError);
    
    // Map error type to appropriate HTTP status
    let status = postgrestError.status || 500;
    
    // Override with more accurate status codes based on error type
    switch (errorType) {
      case SupabaseErrorType.CONNECTION:
        status = 503; // Service Unavailable
        break;
      case SupabaseErrorType.AUTHENTICATION:
        status = 401; // Unauthorized
        break;
      case SupabaseErrorType.PERMISSION:
        status = 403; // Forbidden
        break;
      case SupabaseErrorType.NOT_FOUND:
        status = 404; // Not Found
        break;
      case SupabaseErrorType.VALIDATION:
        status = 400; // Bad Request
        break;
      case SupabaseErrorType.RATE_LIMIT:
        status = 429; // Too Many Requests
        break;
      case SupabaseErrorType.QUERY:
        status = 400; // Bad Request
        break;
      case SupabaseErrorType.SERVER:
        status = 500; // Internal Server Error
        break;
      default:
        status = 500;
    }
    
    return {
      type: errorType,
      message: postgrestError.message || 'An unknown error occurred',
      status,
      code: postgrestError.code,
      details: postgrestError.details,
      original: postgrestError
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: SupabaseErrorType.UNKNOWN,
      message: error.message || 'An unknown error occurred',
      status: 500,
      details: error.stack,
      original: error
    };
  }
  
  // Handle unknown error types
  return {
    type: SupabaseErrorType.UNKNOWN,
    message: 'An unknown error occurred',
    status: 500,
    details: error,
    original: error
  };
}

/**
 * Map of error types to user-friendly messages
 */
export const userFriendlyErrorMessages: Record<SupabaseErrorType, string> = {
  [SupabaseErrorType.CONNECTION]: 'Database connection failed. Please try again later.',
  [SupabaseErrorType.AUTHENTICATION]: 'Authentication error. Please sign in again.',
  [SupabaseErrorType.QUERY]: 'There was a problem with the database query.',
  [SupabaseErrorType.NOT_FOUND]: 'The requested data could not be found.',
  [SupabaseErrorType.VALIDATION]: 'The data you provided is invalid.',
  [SupabaseErrorType.PERMISSION]: 'You do not have permission to perform this action.',
  [SupabaseErrorType.RATE_LIMIT]: 'Too many requests. Please try again later.',
  [SupabaseErrorType.SERVER]: 'Server error. Please try again later.',
  [SupabaseErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Returns a user-friendly message for a given error
 */
export function getUserFriendlyErrorMessage(error: PostgrestError | Error | unknown): string {
  if (!error) return userFriendlyErrorMessages[SupabaseErrorType.UNKNOWN];
  
  // Get structured error
  const structuredError = structureSupabaseError(error);
  
  // Return user-friendly message based on error type
  return userFriendlyErrorMessages[structuredError.type];
}

/**
 * Logs a Supabase error with contextual information
 */
export function logSupabaseError(
  error: PostgrestError | Error | unknown, 
  context: string = 'Supabase Operation'
): void {
  const structuredError = structureSupabaseError(error);
  
  console.error(`Supabase Error [${context}]:`, {
    type: structuredError.type,
    message: structuredError.message,
    status: structuredError.status,
    code: structuredError.code,
    details: structuredError.details
  });
}