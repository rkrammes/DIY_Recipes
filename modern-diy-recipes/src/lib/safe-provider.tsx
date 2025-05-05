/**
 * Safe Provider Pattern
 * 
 * This utility creates SSR-safe providers that:
 * 1. Avoid circular dependencies
 * 2. Handle hydration mismatches
 * 3. Properly manage mounted state
 * 4. Use DOM attributes for cross-provider communication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SafeProviderOptions {
  /** Used as data attribute prefix for DOM communication */
  attributePrefix?: string;
  /** Used for setting default state in a safer manner */
  getDefaultState?: () => any;
  /** Whether to log initialization for debugging */
  debug?: boolean;
}

/**
 * Creates an SSR-safe context provider
 * @param defaultValue Default context value
 * @param name Provider name (used for data attributes)
 * @param options Additional options
 */
export function createSafeProvider<T>(
  defaultValue: T,
  name: string,
  options: SafeProviderOptions = {}
) {
  // Create the context with default value
  const Context = createContext<T>(defaultValue);
  
  // Create a mounted context to prevent hydration issues
  const MountedContext = createContext<boolean>(false);
  
  // Attribute prefix for DOM communication
  const prefix = options.attributePrefix || 'data';
  
  // Provider component
  const Provider = ({ children, value }: { children: ReactNode; value?: T }) => {
    // Track if component is mounted (client-side only)
    const [mounted, setMounted] = useState(false);
    
    // Use provided value or default
    const contextValue = value !== undefined ? value : defaultValue;
    
    // Set mounted state after initial render
    useEffect(() => {
      if (typeof window !== 'undefined') {
        // Use requestAnimationFrame to ensure we're in the browser
        // and the DOM is fully available
        requestAnimationFrame(() => {
          setMounted(true);
          
          if (options.debug) {
            console.log(`[${name}Provider] Mounted`);
          }
        });
      }
    }, []);
    
    // Add provider attributes to document for cross-provider communication
    useEffect(() => {
      if (typeof document !== 'undefined' && mounted) {
        try {
          // Convert the value to a data attribute if possible
          const serializable = { ...contextValue };
          
          // Add data attributes for values that can be serialized
          Object.entries(serializable).forEach(([key, val]) => {
            if (
              val !== undefined && 
              (typeof val === 'string' || 
               typeof val === 'number' || 
               typeof val === 'boolean')
            ) {
              document.documentElement.setAttribute(
                `${prefix}-${name.toLowerCase()}-${key.toLowerCase()}`, 
                String(val)
              );
            }
          });
          
          // Mark provider as initialized
          document.documentElement.setAttribute(
            `${prefix}-${name.toLowerCase()}-initialized`, 
            'true'
          );
        } catch (err) {
          console.error(`[${name}Provider] Error setting attributes:`, err);
        }
      }
    }, [contextValue, mounted]);
    
    return (
      <MountedContext.Provider value={mounted}>
        <Context.Provider value={contextValue}>
          {children}
        </Context.Provider>
      </MountedContext.Provider>
    );
  };
  
  // Custom hook to use this context safely
  const useValue = () => {
    const context = useContext(Context);
    const mounted = useContext(MountedContext);
    
    if (context === undefined) {
      console.warn(`use${name} must be used within a ${name}Provider`);
    }
    
    return { value: context, mounted };
  };
  
  // Hook to get a value from another provider via DOM
  const useValueFromDOM = <K extends keyof T>(key: K): T[K] | undefined => {
    const [value, setValue] = useState<T[K] | undefined>(undefined);
    
    useEffect(() => {
      if (typeof document !== 'undefined') {
        const attributeName = `${prefix}-${name.toLowerCase()}-${String(key).toLowerCase()}`;
        
        // Get initial value
        const attributeValue = document.documentElement.getAttribute(attributeName);
        if (attributeValue !== null) {
          setValue(attributeValue as unknown as T[K]);
        }
        
        // Set up mutation observer to watch for changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === 'attributes' &&
              mutation.attributeName === attributeName
            ) {
              const newValue = document.documentElement.getAttribute(attributeName);
              if (newValue !== null) {
                setValue(newValue as unknown as T[K]);
              }
            }
          });
        });
        
        // Start observing
        observer.observe(document.documentElement, { attributes: true });
        
        // Clean up
        return () => observer.disconnect();
      }
    }, [key]);
    
    return value;
  };
  
  return {
    Provider,
    useValue,
    useValueFromDOM,
    Context
  };
}

/**
 * Hook to check if we're in a browser environment
 * This is safer than checking typeof window !== 'undefined'
 */
export function useBrowser() {
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  return isBrowser;
}

/**
 * Safely access browser APIs
 * @param fn Function that uses browser APIs
 * @param fallback Fallback value if browser APIs are not available
 */
export function safeBrowser<T>(fn: () => T, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  
  try {
    return fn();
  } catch (err) {
    console.error('Error accessing browser API:', err);
    return fallback;
  }
}