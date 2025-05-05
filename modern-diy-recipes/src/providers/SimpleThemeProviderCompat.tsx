'use client';

import React, { createContext, useContext } from 'react';
import { ThemeProvider as ConsolidatedThemeProvider, useTheme as useConsolidatedTheme } from './ConsolidatedThemeProvider';
import { Theme } from '../types/theme';

// Define the simplified interface for backward compatibility
interface SimpleThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | string) => void;
  toggleTheme: () => void;
}

// Create context for the simplified interface
const SimpleThemeContext = createContext<SimpleThemeContextType | undefined>(undefined);

/**
 * A compatibility wrapper for SimpleThemeProvider that uses the consolidated theme provider
 * but exposes only the simplified interface
 */
export function SimpleThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsolidatedThemeProvider>
      <SimpleThemeProviderAdapter>
        {children}
      </SimpleThemeProviderAdapter>
    </ConsolidatedThemeProvider>
  );
}

// Adapter component to map between the consolidated context and simple context
function SimpleThemeProviderAdapter({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, toggleTheme } = useConsolidatedTheme();
  
  return (
    <SimpleThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme
    }}>
      {children}
    </SimpleThemeContext.Provider>
  );
}

/**
 * Hook to use the simplified theme context for backward compatibility
 */
export function useSimpleTheme() {
  const context = useContext(SimpleThemeContext);
  if (context === undefined) {
    throw new Error('useSimpleTheme must be used within a SimpleThemeProvider');
  }
  return context;
}

// Re-export the Theme type for backward compatibility
export type { Theme };