'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface StandardErrorFormat {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

interface ConnectionStatus {
  directSupabaseConnected: boolean;
}

interface ConnectionErrorProps {
  error?: StandardErrorFormat | any;
  retryAction?: () => void;
  checkInterval?: number; // in ms, default 30 seconds
  showConnectionStatus?: boolean;
}

export function ConnectionErrorDisplay({ 
  error, 
  retryAction,
  checkInterval = 30000,
  showConnectionStatus = false
}: ConnectionErrorProps) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  // Function to check connection status
  const checkConnection = async () => {
    try {
      setLoading(true);
      
      // Simple ping to check direct Supabase connection
      const { error: pingError } = await supabase
        .from('recipes')
        .select('count', { count: 'exact', head: true });
      
      setStatus({ 
        directSupabaseConnected: !pingError
      });
      
      setConnectionError(null);
    } catch (err) {
      setConnectionError(err instanceof Error ? err : new Error('Unknown error checking connection'));
    } finally {
      setLoading(false);
    }
  };

  // Initialize and set up refresh interval if showConnectionStatus is true
  useEffect(() => {
    if (showConnectionStatus) {
      checkConnection();

      // Set up interval to check connection status periodically
      const intervalId = setInterval(checkConnection, checkInterval);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [checkInterval, showConnectionStatus]);

  // Handle the standardized error format
  const getErrorMessage = () => {
    if (!error) return 'Unknown error';
    
    // Handle our standard error format
    if (error.message) {
      return error.message;
    }
    
    // Handle old error format for backward compatibility
    if (error.error) {
      return error.error;
    }
    
    // Fallback for any other format
    return JSON.stringify(error);
  };

  // If we have a specific error passed in, show it
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error.status ? `Error (${error.status})` : 'Connection Error'}
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{getErrorMessage()}</p>
              {(error.details || error.code) && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium">View Error Details</summary>
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {error.code && <p>Code: {error.code}</p>}
                    {error.details && (
                      <p>
                        {typeof error.details === 'string' 
                          ? error.details 
                          : JSON.stringify(error.details, null, 2)}
                      </p>
                    )}
                  </pre>
                </details>
              )}
            </div>
            {retryAction && (
              <div className="mt-3">
                <button
                  onClick={retryAction}
                  className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm text-red-800"
                >
                  Retry Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If we're showing connection status
  if (showConnectionStatus) {
    // If we're still waiting for the initial check, show nothing or a loader
    if (loading && !connectionError && !status) {
      return null; // Or a loading indicator if preferred
    }

    // If there's a connection error or no database connection at all
    if (connectionError || !status || !status.directSupabaseConnected) {
      return (
        <div className="p-4 mb-4 border-l-4 border-red-500 bg-red-50 text-red-900">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium">Database Connection Error</h3>
          </div>
          <p className="mt-2 text-sm">
            Unable to connect to the database. Some features may not be available.
          </p>
          <button 
            onClick={checkConnection}
            className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Retry Connection
          </button>
        </div>
      );
    }
  }

  // Return null if everything is fine or we don't have anything to show
  return null;
}