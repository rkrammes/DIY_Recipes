'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Creates an SSR-safe provider that only renders children after mounting in the browser
 * This prevents hydration mismatches and browser API access during server rendering
 */
export function createSafeProvider<T>(defaultValue: T, name: string) {
  const Context = createContext<T | undefined>(undefined);
  
  function Provider({ 
    children, 
    value 
  }: { 
    children: React.ReactNode; 
    value: T 
  }) {
    const [mounted, setMounted] = useState(false);
    
    // Set mounted state after initial render
    useEffect(() => {
      setMounted(true);
    }, []);
    
    // SSR safety - don't render children until mounted in browser
    if (!mounted) {
      // Return empty div with aria-hidden to prevent layout shifts
      return <div aria-hidden="true" style={{ display: 'none' }} />;
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