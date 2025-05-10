'use client';

/**
 * Environment Status Page
 * Displays environment configuration and status
 * Only available in development mode
 */

import { useState, useEffect } from 'react';
import { getEnvironmentStatus, validateClientEnvironment, validateFeatureFlags, getUiMode } from '@/lib/environmentValidator';
import { useRouter } from 'next/navigation';

export default function EnvironmentStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Redirect in production
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [router]);

  // Get status on mount
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const getStatus = async () => {
      setLoading(true);
      
      try {
        // Get environment status locally
        const envStatus = getEnvironmentStatus();
        const clientValid = validateClientEnvironment();
        const featureFlagsValid = validateFeatureFlags();
        const uiMode = getUiMode();
        
        setStatus({
          environment: envStatus,
          validation: {
            client: clientValid,
            featureFlags: featureFlagsValid,
            valid: clientValid && featureFlagsValid
          },
          uiMode
        });
      } catch (error) {
        console.error('Error getting environment status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getStatus();
  }, []);

  // Generate list of enabled features
  const enabledFeatures = status?.environment?.features 
    ? Object.entries(status.environment.features)
        .filter(([_, enabled]: [string, any]) => enabled)
        .map(([feature]: [string, any]) => feature)
    : [];
    
  // Check if we're in production mode
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Environment status page is only available in development mode.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Environment Status</h1>
        <p>Loading environment configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Status</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <div className="bg-gray-800 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-mono">Mode:</div>
            <div className={status?.environment?.isDevelopment ? 'text-green-400' : 'text-blue-400'}>
              {status?.environment?.environment || 'unknown'}
            </div>
            
            <div className="font-mono">UI Mode:</div>
            <div>{status?.uiMode || 'unknown'}</div>
            
            <div className="font-mono">Theme:</div>
            <div>{status?.environment?.theme || 'unknown'}</div>
            
            <div className="font-mono">Validation:</div>
            <div className={status?.validation?.valid ? 'text-green-400' : 'text-red-400'}>
              {status?.validation?.valid ? 'Valid' : 'Invalid'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Supabase</h2>
        <div className="bg-gray-800 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-mono">URL:</div>
            <div className={status?.environment?.supabaseUrl === 'Set' ? 'text-green-400' : 'text-red-400'}>
              {status?.environment?.supabaseUrl || 'Not set'}
            </div>
            
            <div className="font-mono">Anon Key:</div>
            <div className={status?.environment?.supabaseAnonKey === 'Set' ? 'text-green-400' : 'text-red-400'}>
              {status?.environment?.supabaseAnonKey || 'Not set'}
            </div>
            
            <div className="font-mono">Service Role:</div>
            <div className={status?.environment?.serviceRoleKeySet ? 'text-green-400' : 'text-yellow-400'}>
              {status?.environment?.serviceRoleKeySet ? 'Set' : 'Not set'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Enabled Features</h2>
        <div className="bg-gray-800 p-4 rounded-md">
          {enabledFeatures.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
              {enabledFeatures.map((feature: string) => (
                <li key={feature} className="text-green-400">
                  ✓ {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No features enabled</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-gray-400 text-sm">
        This page is only visible in development mode. Information shown here should not be exposed in production.
      </div>
    </div>
  );
}