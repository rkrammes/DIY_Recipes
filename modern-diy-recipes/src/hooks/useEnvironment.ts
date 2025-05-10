/**
 * useEnvironment Hook
 * 
 * A React hook that provides access to environment configuration and feature flags.
 * This hook is a central point for accessing environment information in components.
 */

import { useMemo } from 'react';
import { getEnvironmentStatus, validateClientEnvironment, validateFeatureFlags, isFeatureEnabled as checkFeature, getUiMode } from '@/lib/environmentValidator';

export interface UseEnvironmentResult {
  // Environment information
  isDevelopment: boolean;
  environment: string;
  theme: string;
  uiMode: 'terminal' | 'document' | 'standard';
  
  // Validation
  isValid: boolean;
  clientValid: boolean;
  featureFlagsValid: boolean;
  
  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKeySet: boolean;
    isConfigured: boolean;
  };
  
  // Feature flags
  isFeatureEnabled: (featureName: string) => boolean;
  
  // Lists of features
  enabledFeatures: string[];
  disabledFeatures: string[];
  
  // Full status object
  status: Record<string, any>;
}

/**
 * Hook for accessing environment configuration and feature flags
 * @returns Environment configuration and utility functions
 */
export function useEnvironment(): UseEnvironmentResult {
  // Get all environment data
  const status = useMemo(() => getEnvironmentStatus(), []);
  const clientValid = useMemo(() => validateClientEnvironment(), []);
  const featureFlagsValid = useMemo(() => validateFeatureFlags(), []);
  const uiMode = useMemo(() => getUiMode(), []);
  
  // Extract features
  const features = useMemo(() => {
    const allFeatures = status.features || {};
    const enabled: string[] = [];
    const disabled: string[] = [];
    
    Object.entries(allFeatures).forEach(([feature, isEnabled]) => {
      if (isEnabled) {
        enabled.push(feature);
      } else {
        disabled.push(feature);
      }
    });
    
    return { enabled, disabled };
  }, [status]);
  
  return {
    // Environment info
    isDevelopment: status.isDevelopment,
    environment: status.environment || 'unknown',
    theme: status.theme || 'hackers',
    uiMode,
    
    // Validation
    isValid: clientValid && featureFlagsValid,
    clientValid,
    featureFlagsValid,
    
    // Supabase configuration
    supabase: {
      url: status.supabaseUrl,
      anonKey: status.supabaseAnonKey,
      serviceRoleKeySet: status.serviceRoleKeySet,
      isConfigured: status.supabaseUrl === 'Set' && status.supabaseAnonKey === 'Set'
    },
    
    // Feature flags
    isFeatureEnabled: checkFeature,
    
    // Features lists
    enabledFeatures: features.enabled,
    disabledFeatures: features.disabled,
    
    // Full status
    status
  };
}