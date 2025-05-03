
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
  const [theme, setTheme] = useState<Theme>('synthwave-noir');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('synthwave-noir'); // Default to dark theme if system prefers dark
    } else {
      setTheme('paper-ledger'); // Default to light theme if system prefers light or no preference
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
