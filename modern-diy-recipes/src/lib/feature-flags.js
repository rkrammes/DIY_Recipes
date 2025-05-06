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

// Log enabled features in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Enabled features:', 
    Object.keys(featureFlags)
      .filter(key => featureFlags[key])
      .join(', ')
  );
}