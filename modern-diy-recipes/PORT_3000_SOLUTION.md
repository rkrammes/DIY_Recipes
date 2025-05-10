# Running the App on Port 3000 - Solution Guide

## Summary

This document provides the solution for running the DIY Recipes app on port 3000 with transparent error handling for Supabase integration.

## Root Issues Identified

1. **Incorrect Supabase Key Configuration**:
   - The `NEXT_PUBLIC_SUPABASE_ANON_KEY` was actually a service_role key (security risk)
   - Service role keys should never be exposed client-side

2. **Missing Database Table**:
   - The `user_preferences` table was missing from the Supabase database
   - User settings couldn't be synchronized without this table

3. **Lack of Transparent Error Handling**:
   - Errors were not being displayed properly
   - The Settings module didn't show Supabase connection status

## Solution Implementation

1. **Transparent Error Handling**:
   - Modified `useUserPreferences.ts` to track Supabase availability
   - Added `supabaseAvailable` state flag
   - Implemented graceful fallback to localStorage
   - Added error display in `SystemInfo.tsx`

2. **Type-Safe Database Schema**:
   - Added `user_preferences` table to the Database interface in `supabase.ts`
   - Provided complete type definitions for proper type checking

3. **Connection Status UI**:
   - Updated `SystemInfo.tsx` to show Supabase connection status with visual indicator
   - Displayed detailed error messages when connection issues occur
   - Made status visible for all users (authenticated or not)

## Getting the App Running on Port 3000

### Option 1: Using the Custom Script (Recommended)

```bash
# 1. Stop any existing servers
./stop-all-servers.sh

# 2. Run the no-mock-data script
./run-no-mock-data-fix.sh

# 3. Navigate to http://localhost:3000/settings
# Check the System tab to see Supabase connection status
```

### Option 2: Using Next.js Directly

```bash
# 1. Stop any existing servers
./stop-all-servers.sh

# 2. Set environment variable to prevent mock data
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=true

# 3. Start Next.js development server
npm run dev

# 4. Navigate to http://localhost:3000/settings
```

### Option 3: Using the Enhanced Port 3000 Script

```bash
# Run the enhanced script with environment validation
./start-app-on-3000.sh

# For mock data mode:
./start-app-on-3000.sh --use-mock-data

# For development authentication:
./start-app-on-3000.sh --dev-auth

# Combined options:
./start-app-on-3000.sh --use-mock-data --dev-auth
```

The enhanced script includes:
- Comprehensive environment validation
- Clear status display with color coding
- Improved error handling
- Support for mock data and dev auth modes
- Windows compatibility via `start-app-on-3000.bat`

## Verifying the Solution

1. Navigate to the main interface and verify that Settings appears in the System Directories column
2. Click on the Settings option and confirm it redirects to the Settings page
3. Check the System tab in Settings to see "Supabase Available" with a green dot
4. If there are connection issues, you'll see "Supabase Unavailable" with a red dot and the error message
5. The application continues to function using localStorage when Supabase is unavailable

To automate verification:
```bash
# Run the automated UI test
./run-settings-test.sh

# Check the test-screenshots directory for visual verification
```

## Fixing the Root Issues

1. **Create the User Preferences Table**:
   ```bash
   node src/Settings/setup-preferences-table.js
   ```

2. **Fix the Supabase Key Configuration**:
   - Update `.env.local` with proper keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-not-service-role-key]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
   ```

## Technical Components Modified

1. `/src/Settings/hooks/useUserPreferences.ts`:
   - Added `supabaseAvailable` state
   - Implemented localStorage fallback
   - Added transparent error handling

2. `/src/lib/supabase.ts`:
   - Added `user_preferences` table to Database interface

3. `/src/Settings/components/SystemInfo.tsx`:
   - Added Supabase connection status display
   - Implemented error messaging

4. `/src/Settings/providers/UserPreferencesProvider.tsx`:
   - Updated context to expose connection status

5. `/src/components/TripleColumnLayout.tsx`:
   - Modified the existing Settings button in the System Directories section
   - Implemented direct redirection to the Settings page when clicked
   - Added visual styling to match other navigation elements
   - Ensures Settings is prominently visible in the UI

6. `/run-no-mock-data-fix.sh`:
   - Created script to start with transparent error handling

## Accessing the Settings Page

You can access the Settings page directly via URL:

**Direct URL**: Navigate to http://localhost:3000/settings in your browser

The Settings option is now fully integrated into the System Directories column alongside Formulations, Ingredients, Tools, and Library. Clicking on it will automatically redirect you to the Settings page.

The Settings page contains several tabs:
- Theme Settings - Visual theme configuration
- Audio Settings - Sound effects and volume control
- Account Settings - User authentication options
- User Profile - Personal information and preferences
- System Information - Shows Supabase connection status with error details

The **System Information** tab is particularly important as it displays:
- Supabase connection status with a visual indicator (green when available, red when unavailable)
- Detailed error messages when Supabase connectivity issues occur
- Connection information while maintaining application functionality

This approach ensures that when there's an issue with Supabase, it's shown transparently rather than hiding it with mock data.