# SSR Safety Fixes

This document outlines the improvements made to ensure server-side rendering (SSR) stability and prevent circular dependencies in the DIY Recipes application.

## Problems Fixed

### 1. Circular Dependencies
We identified and resolved circular dependencies between providers:
- Animation provider was importing the Theme type from the FixedThemeProvider
- This created a circular dependency chain causing issues during server rendering
- Fixed by importing the Theme type from the shared types file instead

### 2. SSR Hydration Mismatches
Fixed hydration mismatches caused by:
- Accessing browser APIs during server rendering
- Different component hierarchies between server and client rendering
- Conditional rendering based on environment variables

### 3. Environment Variable Access
Improved environment variable handling:
- Added checks for `typeof window !== 'undefined'` before accessing env variables
- Used standardized naming for MCP-related environment variables
- Used `process.env.NEXT_PUBLIC_MCP_ENABLED` for controlling MCP features

## Implementation Details

### 1. Safe Provider Pattern
We implemented a consistent pattern for creating SSR-safe providers:
```tsx
// Create a safe provider using the MCP pattern
const { Provider, useValue } = createSafeProvider<MyContextType>(
  {
    // Default values that work server-side
  },
  'ComponentName'
);

// Component implementation
export function MyProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state after initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    }
  }, []);
  
  // Don't render children until mounted
  if (!mounted) {
    return <div aria-hidden="true" style={{ display: 'none' }} />;
  }
  
  return (
    <Provider value={/* context value */}>
      {children}
    </Provider>
  );
}

// Export the hook with the safe provider
export const useMyHook = useValue;
```

### 2. Proper Provider Hierarchy
We established a clear hierarchy for providers to prevent circular dependencies:
1. ThemeProvider - No dependencies on other providers
2. AudioProvider - Depends on theme via DOM attributes 
3. FixedAnimationProvider - Depends on theme via DOM attributes

This hierarchy ensures that each provider can access what it needs without creating circular import chains.

### 3. Types in Shared Files
Moved shared types to dedicated files:
- `/types/theme.ts` - Theme types and utilities
- These types can be imported by multiple providers without creating circular dependencies

### 4. SSR-Safe Component Mounting
Implemented a safe pattern for client-side initialization:
```tsx
// In client components
useEffect(() => {
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }
}, []);

// Provide fallback content during SSR
if (!mounted) {
  return <SSRFallbackContent />;
}
```

### 5. Environment Detection
Improved environment detection:
```tsx
// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';
const isDevelopment = isBrowser && process.env.NODE_ENV === 'development';
const useMcpComponents = isBrowser && process.env.NEXT_PUBLIC_MCP_ENABLED === 'true';
```

## Best Practices

### 1. Avoiding Circular Dependencies
- Keep shared types in dedicated files
- Use DOM attributes for communication between providers
- Use the Observer pattern instead of direct imports

### 2. SSR Safety
- Always check `typeof window !== 'undefined'` before accessing browser APIs
- Use a mounted state to prevent rendering client-only components during SSR
- Provide fallback content during SSR and initial hydration

### 3. Error Handling
- Wrap browser API access in try/catch blocks
- Provide fallbacks for all features
- Implement graceful degradation

### 4. Provider Design
- Use the safe provider pattern consistently
- Establish a clear provider hierarchy
- Document dependencies between providers

## Testing

These changes have been tested in the following scenarios:
1. Server-side rendering
2. Client-side hydration
3. Development and production environments
4. With and without MCP features enabled

## Context7 MCP Integration

We used Context7 MCP to:
1. Verify Tailwind CSS usage patterns for theme handling
2. Confirm best practices for Next.js SSR safety
3. Validate our approach to circular dependency resolution
4. Document the correct implementation patterns for future reference

This allowed us to incorporate the latest best practices from the documentation of all libraries we use.

## Future Considerations

These changes provide a solid foundation, but consider these future improvements:
1. Further code splitting to reduce bundle size
2. Implement more granular error boundaries
3. Add comprehensive logging for SSR issues
4. Create automated tests specifically for SSR stability