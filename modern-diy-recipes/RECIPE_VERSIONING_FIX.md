# Recipe Versioning Fix Guide

## Issue Identification

Based on our diagnostic tests, we've identified the following issues:

1. The application is currently running in Terminal UI mode instead of Standard UI mode
2. The Supabase connection is working correctly with proper credentials in the .env file
3. The recipe_iterations and iteration_ingredients tables exist and have data
4. The application needs to be configured to use the Standard UI mode and enable recipe versioning

## Fix Implementation

Follow these steps to fix the recipe versioning issue:

### 1. Stop the Current Application

First, stop the current running application by pressing `Ctrl+C` in the terminal where it's running.

### 2. Enable Standard UI Mode

Create a `.env.local` file in the project root with the following settings:

```
NEXT_PUBLIC_UI_MODE=standard
USE_TERMINAL_UI=false
ENABLE_RECIPE_VERSIONING=true
```

### 3. Create Feature Flags File

Create the `src/lib/feature-flags.js` file with the following content:

```javascript
/**
 * Feature flags for DIY Recipes application
 */

// Feature flags to control enabled features
const featureFlags = {
  // Core features
  recipeVersioning: true,        // Enable recipe versioning/iterations
  recipeComparison: true,        // Enable comparing different recipe versions
  aiSuggestions: false,          // Enable AI suggestions for recipes
  ingredientSubstitution: false, // Enable ingredient substitution suggestions
  
  // UI modes
  useTerminalUI: false,          // Use retro terminal UI instead of standard UI
  useAnimations: true,           // Enable UI animations
  
  // Development features
  useSupabase: true,             // Use Supabase for data storage
  useMockData: false,            // Use mock data instead of real data
  debugMode: true,               // Enable debug logs and features
};

// Allow overriding flags via environment variables
if (typeof window !== 'undefined') {
  // Browser environment
  const envFlags = window.__FEATURE_FLAGS__ || {};
  Object.assign(featureFlags, envFlags);
  
  // Override from URL if testing
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('recipe_versioning')) {
    featureFlags.recipeVersioning = urlParams.get('recipe_versioning') === 'true';
  }
  
  if (urlParams.has('terminal_ui')) {
    featureFlags.useTerminalUI = urlParams.get('terminal_ui') === 'true';
  }
  
  if (urlParams.has('mock_data')) {
    featureFlags.useMockData = urlParams.get('mock_data') === 'true';
  }
} else {
  // Server environment
  if (process.env.ENABLE_RECIPE_VERSIONING) {
    featureFlags.recipeVersioning = process.env.ENABLE_RECIPE_VERSIONING === 'true';
  }
  
  if (process.env.USE_TERMINAL_UI) {
    featureFlags.useTerminalUI = process.env.USE_TERMINAL_UI === 'true';
  }
  
  if (process.env.NEXT_PUBLIC_UI_MODE === 'standard') {
    featureFlags.useTerminalUI = false;
  }
  
  if (process.env.NEXT_PUBLIC_UI_MODE === 'terminal') {
    featureFlags.useTerminalUI = true;
  }
}

// Export feature flags
export default featureFlags;

// Helper to check if a feature is enabled
export function isFeatureEnabled(featureName) {
  return featureFlags[featureName] === true;
}
```

### 4. Update the RecipeDetails Component

In the `src/components/RecipeDetails.tsx` file, modify the error boundary for recipe versions:

Find this section:

```jsx
<ErrorBoundary fallback={
  <div className="p-4 border border-alert-amber bg-alert-amber-light rounded-md">
    <p className="text-alert-amber-text font-medium">Recipe versioning encountered an issue</p>
    <p className="text-sm mt-1">This feature requires a database connection to work properly.</p>
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer font-medium">Troubleshooting</summary>
      <div className="mt-2 p-2 bg-surface-1 rounded overflow-auto">
        <p>1. Verify your Supabase connection is working</p>
        <p>2. Check that you have run the SQL setup script</p>
        <p>3. Try refreshing the page</p>
      </div>
    </details>
    <button 
      onClick={() => window.location.reload()}
      className="mt-3 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
    >
      Refresh Page
    </button>
  </div>
}>
```

And replace it with:

```jsx
<ErrorBoundary fallback={
  <div className="p-4 border border-alert-amber bg-alert-amber-light rounded-md">
    <p className="text-alert-amber-text font-medium">Recipe versioning encountered an issue</p>
    <p className="text-sm mt-1">This feature requires a database connection to work properly.</p>
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer font-medium">Troubleshooting</summary>
      <div className="mt-2 p-2 bg-surface-1 rounded overflow-auto">
        <p>1. Verify your Supabase connection is working</p>
        <p>2. Check that you have run the SQL setup script</p>
        <p>3. Try refreshing the page</p>
        <p>4. Check if you're in Terminal UI mode</p>
      </div>
    </details>
    <div className="flex flex-col md:flex-row gap-2 mt-3">
      <button 
        onClick={() => window.location.reload()}
        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
      >
        Refresh Page
      </button>
      <button 
        onClick={() => {
          // Force standard UI mode and reload
          const url = new URL(window.location.href);
          url.searchParams.set('terminal_ui', 'false');
          url.searchParams.set('recipe_versioning', 'true');
          window.location.href = url.toString();
        }}
        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm rounded"
      >
        Use Standard UI
      </button>
    </div>
  </div>
}>
```

### 5. Start the Application with Standard UI

Create a `start-with-supabase.sh` script in the project root with the following content:

```bash
#!/bin/bash

# Stop any running server
echo "Stopping any running servers..."
pkill -f "node.*3000" || true
sleep 2

# Clear cache
echo "Clearing Next.js cache..."
rm -rf .next/cache

# Set environment mode
export UI_MODE="standard"
export USE_TERMINAL_UI="false"
export DEBUG="supabase:*"

# Start the server with the correct configuration
echo "Starting server in standard mode with Supabase..."
NEXT_PUBLIC_UI_MODE=standard USE_TERMINAL_UI=false npm run dev
```

Make it executable with:

```bash
chmod +x start-with-supabase.sh
```

And run it:

```bash
./start-with-supabase.sh
```

### 6. Access the Application with Forced Parameters

Navigate to the application with forced parameters to ensure standard UI:

```
http://localhost:3000/?terminal_ui=false&recipe_versioning=true
```

Or directly to a recipe:

```
http://localhost:3000/recipe-test?id=971e9734-d147-4066-9b55-b80a080de24f&terminal_ui=false&recipe_versioning=true
```

## Verification

After implementing the fixes:

1. Verify you see the standard UI instead of the terminal interface
2. Open a recipe and check for the Recipe Versions section
3. Try creating a new version and confirm it works
4. Verify you can edit version details and save changes

If you still encounter issues after implementing these fixes, please check the console for error messages and verify that the Supabase connection is working correctly.