'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseErrorType } from '../lib/supabaseErrors';

interface ApiErrorData {
  error: {
    type: SupabaseErrorType;
    message: string;
    code?: string;
    details?: any;
  };
  meta?: Record<string, any>;
}

interface DatabaseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: ApiErrorData) => void;
  retry?: () => Promise<any>;
  retryLabel?: string;
}

/**
 * Error messages by error type
 */
const ERROR_MESSAGES: Record<SupabaseErrorType, string> = {
  [SupabaseErrorType.CONNECTION]: 'Unable to connect to the database. Please try again later.',
  [SupabaseErrorType.AUTHENTICATION]: 'Authentication error. Please sign in again.',
  [SupabaseErrorType.QUERY]: 'There was a problem with the database query.',
  [SupabaseErrorType.NOT_FOUND]: 'The requested data could not be found.',
  [SupabaseErrorType.VALIDATION]: 'The data provided is invalid.',
  [SupabaseErrorType.PERMISSION]: 'You do not have permission to perform this action.',
  [SupabaseErrorType.RATE_LIMIT]: 'Too many requests. Please try again later.',
  [SupabaseErrorType.SERVER]: 'Server error. Please try again later.',
  [SupabaseErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Database Error Boundary Component
 * 
 * Used to catch and handle database errors from API calls
 */
export function DatabaseErrorBoundary({
  children,
  fallback,
  onError,
  retry,
  retryLabel = 'Try Again'
}: DatabaseErrorBoundaryProps) {
  const [error, setError] = useState<ApiErrorData | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Reset error when children change
  useEffect(() => {
    setError(null);
  }, [children]);

  // Handle API error response
  const handleApiError = (response: Response) => {
    if (response.ok) return response;

    return response.json().then(errorData => {
      // If this is our standard API error format
      if (errorData?.error?.type) {
        const apiError = errorData as ApiErrorData;
        setError(apiError);
        if (onError) onError(apiError);
        throw apiError;
      }
      
      // Otherwise, it's some other error format
      throw new Error('API error: ' + (errorData?.message || response.statusText));
    });
  };

  // Enhanced fetch function with error handling
  const safeFetch = async (input: RequestInfo, init?: RequestInit) => {
    try {
      const response = await fetch(input, init);
      return handleApiError(response);
    } catch (err) {
      console.error('Error during fetch:', err);
      throw err;
    }
  };

  // Handle retry action
  const handleRetry = async () => {
    if (!retry) return;
    
    setIsRetrying(true);
    try {
      await retry();
      setError(null);
    } catch (err) {
      console.error('Error during retry:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  // Render error UI if we have an error
  if (error) {
    // If a custom fallback is provided, render it
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise, render our default error UI
    const errorMessage = ERROR_MESSAGES[error.error.type as SupabaseErrorType] || error.error.message;
    
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-900">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="mb-4">{errorMessage}</p>
        {retry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : retryLabel}
          </button>
        )}
      </div>
    );
  }

  // Provide context with the enhanced fetch function
  return (
    <DatabaseFetchContext.Provider value={{ safeFetch }}>
      {children}
    </DatabaseFetchContext.Provider>
  );
}

// Context for providing the enhanced fetch function
interface DatabaseFetchContextType {
  safeFetch: (input: RequestInfo, init?: RequestInit) => Promise<any>;
}

const DatabaseFetchContext = React.createContext<DatabaseFetchContextType>({
  safeFetch: fetch
});

// Hook for using the enhanced fetch function
export function useDatabaseFetch() {
  return React.useContext(DatabaseFetchContext);
}