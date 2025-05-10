# Supabase Security Implementation Plan

## Issue Summary

The current implementation of Supabase integration in the DIY Formulations application contains several security risks:

1. Service role keys may be exposed in client-side code
2. Environment variable handling is inconsistent
3. Hardcoded fallback credentials exist in some configuration files
4. Error handling doesn't properly detect or recover from authentication issues

## Implementation Plan

This document outlines a step-by-step approach to address these issues using Context7 as a development resource (not a runtime component).

### Phase 1: Security Audit

1. **Scan for Credential Exposure**
   - Use Context7 to search for occurrences of `SUPABASE_SERVICE_ROLE_KEY`
   - Verify that service role keys are only used in server-side code
   - Document any instances of credential exposure

2. **Environment Variable Mapping**
   - Document all environment variables used by the application
   - Classify as client-side (NEXT_PUBLIC_*) or server-side
   - Verify .env.local contains all required variables

### Phase 2: Configuration Updates

1. **Update `supabaseConfig.js`**
   - Reference Context7 for best practices in configuration
   - Modify to safely handle client-side environment
   - Add fallbacks for development mode that don't contain real credentials
   - Update exported constants for better type safety

2. **Update `setup-preferences-table.js`**
   - Ensure it only uses service role key for admin operations
   - Add clear warning comments about security implications
   - Improve error handling to fail safely

3. **Fix Authentication Hooks**
   - Verify `useAuth` hook handles authentication correctly
   - Improve error state handling
   - Add development mode detection

### Phase 3: Environment Handling

1. **Create Environment Validation**
   - Add runtime validation for required environment variables
   - Create clear error messages for missing variables
   - Support different environment configurations (dev/test/prod)

2. **Document Environment Setup**
   - Create a sample .env.example with dummy values
   - Document required variables in README
   - Add setup instructions for local development

### Phase 4: Verification & Testing

1. **Test Security Measures**
   - Verify app works correctly with different environment configurations
   - Test error handling when Supabase is unavailable
   - Ensure service role keys are never exposed

2. **Documentation Updates**
   - Update security documentation with implemented changes
   - Document best practices for future development
   - Create a security checklist for new developers

## Implementation Details

### `supabaseConfig.js` Update

```javascript
/**
 * Supabase Configuration
 * IMPORTANT: Never expose service role keys in client-side code
 */

// Development mode flag for better DX
const isDevelopment = process.env.NODE_ENV === 'development';

// Safe client-side configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback for development only (not real credentials)
export const hasFallbackConfig = isDevelopment && (!SUPABASE_URL || !SUPABASE_ANON_KEY);

// Retry and timeout configuration
export const MAX_RETRIES = 3;
export const REQUEST_TIMEOUT = 15000;
export const BASE_RETRY_DELAY = 200;

// Tables and endpoints remain unchanged
```

### Environment Validation Module

```javascript
// environmentValidator.js
export function validateEnvironment() {
  const requiredClientVars = [
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredClientVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    console.warn(`Environment warning: Missing ${missing.join(', ')}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.info('Using development fallbacks');
      return true; // Continue in development
    }
    
    return false; // Fail in production
  }
  
  return true;
}
```

## Security Best Practices

1. **Keep Credentials Separate**
   - Server-side keys stay on the server
   - Client uses limited permission keys only
   - No hardcoded credentials in source control

2. **Environment Handling**
   - Use .env.local for local development (gitignored)
   - Document required variables in .env.example
   - Validate environment at runtime

3. **Row-Level Security**
   - Always use RLS policies in Supabase tables
   - Test permissions with different user accounts
   - Verify authorization in API endpoints

## Implementation Checklist

- [ ] Audit code for credential exposure
- [ ] Document all environment variables
- [ ] Update supabaseConfig.js
- [ ] Fix authentication hooks
- [ ] Add environment validation
- [ ] Create security documentation
- [ ] Test with different configurations

## References

- Supabase Security Best Practices: https://supabase.com/docs/guides/auth/managing-user-data
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- Context7 MCP Documentation: See project documentation