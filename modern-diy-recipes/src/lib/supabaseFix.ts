/**
 * Supabase Fix - Implements transparent error handling for Supabase issues
 * Based on recommendations from NO_MOCK_DATA_SUPABASE_FIX.md
 */

import { useEffect, useState } from 'react';
import { supabase } from './supabaseConfig';

/**
 * Checks if Supabase is available and properly configured
 * @returns Promise resolving to a boolean and any error message
 */
export async function checkSupabaseConnection(): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    // Try a simple query that shouldn't require significant permissions
    const { data, error } = await supabase.from('recipe_metadata').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Connection exists but there's an error (likely permissions or missing table)
      return { 
        available: false, 
        error: `Supabase error: ${error.message} (${error.code})` 
      };
    }
    
    return { available: true };
  } catch (e) {
    // Unexpected error (network, configuration, etc.)
    const error = e as Error;
    return { 
      available: false, 
      error: `Connection error: ${error.message}` 
    };
  }
}

/**
 * React hook to track Supabase connection status
 * Provides live status updates and error information
 */
export function useSupabaseStatus() {
  const [status, setStatus] = useState<{
    available: boolean;
    checking: boolean;
    error?: string;
    lastChecked?: Date;
  }>({
    available: false,
    checking: true,
  });

  useEffect(() => {
    let mounted = true;
    
    async function checkConnection() {
      if (!mounted) return;
      
      setStatus(prev => ({ ...prev, checking: true }));
      
      try {
        const result = await checkSupabaseConnection();
        
        if (mounted) {
          setStatus({
            available: result.available,
            checking: false,
            error: result.error,
            lastChecked: new Date(),
          });
        }
      } catch (e) {
        const error = e as Error;
        
        if (mounted) {
          setStatus({
            available: false,
            checking: false,
            error: `Error checking connection: ${error.message}`,
            lastChecked: new Date(),
          });
        }
      }
    }
    
    // Check immediately
    checkConnection();
    
    // And then periodically
    const interval = setInterval(checkConnection, 30000); // every 30 seconds
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}

/**
 * Updates the Supabase URL and keys based on environment variables
 * Used for runtime reconfiguration when needed
 */
export function updateSupabaseConfig() {
  // This function would dynamically update the Supabase client
  // Based on changed environment variables
  // Implementation would depend on how supabaseConfig.ts is structured
  
  // This is a placeholder that would need to be implemented
  // based on the specific configuration approach
}