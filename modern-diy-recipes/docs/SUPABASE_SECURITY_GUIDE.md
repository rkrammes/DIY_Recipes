# Supabase Security Best Practices

This document outlines the security best practices for Supabase integration in the DIY Formulations application.

## Authentication and Authorization

### Client-Side Security

1. **Use the Public Anon Key Only**
   - Only use `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client-side code
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
   - Environment variables are exposed to the browser when prefixed with `NEXT_PUBLIC_`

2. **Row-Level Security (RLS)**
   - All tables should have RLS policies enabled
   - Users should only be able to access their own data
   - Example policy:
     ```sql
     CREATE POLICY "Users can view their own data"
       ON table_name FOR SELECT
       USING (auth.uid() = user_id);
     ```

3. **Secure Connection Handling**
   - Client-side connections should use graceful degradation
   - Always provide fallbacks when Supabase is unavailable
   - Use try/catch blocks around all Supabase API calls

### Server-Side Security

1. **Service Role Key Usage**
   - Use `SUPABASE_SERVICE_ROLE_KEY` only in:
     - Server-side scripts
     - API routes
     - Database setup scripts
     - Admin operations

2. **Environment Variables**
   - Keep service role keys in `.env.local` which is not committed to version control
   - Use `.env.example` to document required variables without actual values
   - Verify environment variables are loaded before using them

## Implementation Examples

### Client-Side Connection

```javascript
// Good example - Safe for client-side
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Server-Side Script

```javascript
// Good example - Only in server-side scripts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

## Security Improvements Made

1. **Removed Hardcoded Credentials**
   - Removed hardcoded JWT tokens from configuration files
   - All credentials now loaded from environment variables

2. **Improved Error Handling**
   - Added graceful degradation for when Supabase is unavailable
   - Client-side code now handles connection errors appropriately
   - Clear error messages to help debugging without exposing sensitive information

3. **Environment Variable Management**
   - Clear documentation on which variables are needed
   - Distinguished between client-side and server-side variables
   - Added fallbacks for development mode

4. **Security Warning Comments**
   - Added clear warnings in code comments about security practices
   - Documentation on which keys should be used where

## Important Files

1. `/src/lib/supabaseConfig.js` - Configuration for Supabase connections
2. `/src/Settings/setup-preferences-table.js` - Server-side table setup script
3. `/src/hooks/useAuth.ts` - Authentication hook for user management

## Recommended Tools

1. **Environment Variable Validation**
   - Consider using a package like `envalid` to validate environment variables

2. **Security Scanning**
   - Run regular security scans to detect hardcoded credentials
   - Consider using `detect-secrets` or similar tools

## Ongoing Security Practices

1. **Regular Audits**
   - Periodically audit code for security issues
   - Check for any hardcoded credentials or tokens

2. **Permissions Review**
   - Regularly review RLS policies
   - Ensure proper authorization checks are in place

3. **Update Dependencies**
   - Keep Supabase SDK and other dependencies up to date
   - Monitor for security advisories in dependencies