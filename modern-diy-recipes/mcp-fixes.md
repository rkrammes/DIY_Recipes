# MCP Fixes for Server Stability Issues

## Root Cause Analysis

After reviewing the codebase, I've identified several critical issues causing server crashes:

1. **Font Loading During Server Rendering**
   - The `getAllFontVariables()` function is called directly in the layout's JSX
   - This forces Next.js to load all font objects during SSR, potentially causing memory issues

2. **Circular Dependencies**
   - `ThemeProvider` imports from animation/motion.ts
   - `AnimationProvider` imports from ThemeProvider
   - This creates an initialization loop that can cause crashes

3. **Browser API Access During SSR**
   - Audio system tries to access Web Audio API during rendering
   - Animation system accesses window/document during rendering
   - These cause errors during server-side rendering

4. **Theme System Side Effects**
   - ThemeProvider has complex useEffect hooks with multiple browser API calls
   - These are running during component initialization rather than being isolated

## Recommended Fixes

1. **Font System Fixes**
   - Move font variable application to client-side only
   - Create a ClientFonts component with useEffect that runs only in browser

   ```tsx
   'use client';
   
   import { useEffect } from 'react';
   import { getAllFontVariables } from '../lib/fonts';
   
   export function ClientFonts() {
     useEffect(() => {
       // Apply font classes only on client
       document.body.className += ` ${getAllFontVariables()}`;
     }, []);
     
     return null;
   }
   ```

2. **Break Circular Dependencies**
   - Move the Theme type to a shared types file
   - Have AnimationProvider read theme from DOM attributes instead of context

3. **SSR-Safe Providers**
   - Add mounted state to all providers
   - Only render children after mounted in browser
   - Move all browser API access to useEffect hooks

4. **Isolated Audio System**
   - Move audio initialization to a separate context
   - Only initialize on explicit user interaction
   - Never access audio APIs during rendering

## Implementation Steps

1. Create an MCP adapter that ensures proper browser environment detection
2. Update the root layout to use the safer providers
3. Add proper error boundaries around complex components
4. Implement hydration mismatch prevention techniques

## MCP Integration

```tsx
// mcp-safe-provider.ts
import { createContext, useContext, useEffect, useState } from 'react';

export function createSafeProvider<T>(defaultValue: T, name: string) {
  const Context = createContext<T | undefined>(undefined);
  
  function Provider({ children, value }: { children: React.ReactNode; value: T }) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      setMounted(true);
    }, []);
    
    // SSR safety - don't render until mounted
    if (!mounted) {
      return null;
    }
    
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  }
  
  function useValue() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  }
  
  return { Provider, useValue };
}
```

This approach ensures all providers are SSR-safe and can be composed properly without circular dependencies or browser API access during server rendering.