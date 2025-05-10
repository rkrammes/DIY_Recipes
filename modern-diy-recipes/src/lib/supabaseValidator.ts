/**
 * Supabase Validator
 * Provides validation and diagnostic tools for Supabase configuration
 */

import { isServiceKey } from './supabaseConfig';

// Possible statuses for Supabase connection
export enum SupabaseStatus {
  Available = 'available',
  Unavailable = 'unavailable',
  Checking = 'checking',
  ConfigError = 'config_error',
}

// Complete validation result
export interface SupabaseValidationResult {
  // Overall status
  status: SupabaseStatus;
  
  // Configuration validity
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  isAnonKeyValid: boolean;
  
  // Security check
  securityIssues: string[];
  
  // Tables status
  tables: {
    [key: string]: boolean;
  };
  
  // Connection info
  lastChecked?: Date;
  connectionError?: string;
  
  // Function status
  functions: {
    [key: string]: boolean;
  };
}

/**
 * Validates the basic Supabase configuration
 * Checks for URL, keys, and key types
 */
export function validateSupabaseConfig(): Pick<SupabaseValidationResult, 
  'hasUrl' | 'hasAnonKey' | 'hasServiceKey' | 'isAnonKeyValid' | 'securityIssues'> {
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const securityIssues: string[] = [];
  
  // Check if service role key is exposed in client code
  if (isServiceKey) {
    securityIssues.push('Service role key exposed in NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  // Check if anonKey and serviceKey are the same
  if (anonKey && serviceKey && anonKey === serviceKey) {
    securityIssues.push('The same key is used for both anon and service role');
  }
  
  return {
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    hasServiceKey: !!serviceKey,
    isAnonKeyValid: !!anonKey && !isServiceKey,
    securityIssues,
  };
}

/**
 * Generates a human-readable status message from validation results
 */
export function getSupabaseStatusMessage(result: SupabaseValidationResult): string {
  if (result.status === SupabaseStatus.Checking) {
    return 'Checking Supabase connection...';
  }
  
  if (result.status === SupabaseStatus.ConfigError) {
    if (!result.hasUrl) {
      return 'Supabase URL not configured';
    }
    
    if (!result.hasAnonKey) {
      return 'Supabase anonymous key not configured';
    }
    
    if (!result.isAnonKeyValid) {
      return 'Invalid key type - service role key used in client code';
    }
    
    return 'Supabase configuration error';
  }
  
  if (result.status === SupabaseStatus.Unavailable) {
    if (result.connectionError) {
      return `Supabase unavailable: ${result.connectionError}`;
    }
    return 'Supabase connection unavailable';
  }
  
  return 'Supabase connected';
}

/**
 * Determines if a specific feature is available based on validation status
 */
export function isSupabaseFeatureAvailable(
  feature: string, 
  result: SupabaseValidationResult
): boolean {
  // If Supabase is not available, no features are available
  if (result.status !== SupabaseStatus.Available) {
    return false;
  }
  
  // Check table-specific features
  if (feature.startsWith('table:')) {
    const tableName = feature.substring(6);
    return !!result.tables[tableName];
  }
  
  // Check function-specific features
  if (feature.startsWith('function:')) {
    const functionName = feature.substring(9);
    return !!result.functions[functionName];
  }
  
  // Check general features
  switch (feature) {
    case 'auth':
      return true;
    
    case 'storage':
      return true;
    
    case 'realtime':
      return true;
    
    case 'exec_sql':
      return !!result.functions['exec_sql'];
    
    default:
      return false;
  }
}