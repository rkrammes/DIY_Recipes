"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'synthwave-noir' | 'terminal-mono' | 'paper-ledger'; // Export the Theme type

const themeMapping: Record<string, Theme> = {
  'hackers': 'synthwave-noir',
  'dystopia': 'terminal-mono',
  'neotopia': 'paper-ledger'
};

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('synthwave-noir');

  const applyTheme = (themeName: string) => {
    const newTheme = themeMapping[themeName] || themeName;
    setTheme(newTheme as Theme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    // This effect runs only on the client after hydration
    // The ThemeScript handles initial theme setting to prevent FOUC
    const storedTheme = localStorage.getItem('theme');
    // Use applyTheme to handle mapping and setting
    applyTheme(storedTheme || 'synthwave-noir'); // Default to a new theme name if nothing stored
  }, []);

  // The second useEffect is no longer needed as applyTheme handles localStorage and attribute setting
  // useEffect(() => {
  //   // Store the new theme name
  //   localStorage.setItem('theme', theme);

  //   // Set the data-theme attribute with the new theme name
  //   document.documentElement.setAttribute('data-theme', theme);

  // }, [theme]);

  const toggleTheme = () => {
    // Determine the next theme based on the current state (which is already mapped)
    const nextTheme = theme === 'synthwave-noir'
      ? 'terminal-mono'
      : theme === 'terminal-mono'
        ? 'paper-ledger'
        : 'synthwave-noir';
    // Use applyTheme to set the new theme
    applyTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextProps {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}