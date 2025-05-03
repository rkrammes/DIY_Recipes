// DIY_Recipes/providers/SettingsProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the new Theme type
type Theme = 'synthwave-noir' | 'terminal-mono' | 'paper-ledger';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Add other settings state and functions here later
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Placeholder for theme state, will implement logic later
  const [theme, setTheme] = useState<Theme>('synthwave-noir');

  // Placeholder useEffect for theme detection and persistence
  useEffect(() => {
    // TODO: Implement theme detection (localStorage, prefers-color-scheme)
    // TODO: Implement theme persistence to localStorage
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

