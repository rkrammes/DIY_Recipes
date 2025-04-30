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

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    let initialTheme: Theme = 'synthwave-noir'; // Default to a new theme name

    if (storedTheme) {
      // Check if the stored theme is an old name and map it
      if (themeMapping[storedTheme]) {
        initialTheme = themeMapping[storedTheme];
      } else if (['synthwave-noir', 'terminal-mono', 'paper-ledger'].includes(storedTheme)) {
        // Check if the stored theme is already a new name
        initialTheme = storedTheme as Theme;
      }
    }

    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Store the new theme name
    localStorage.setItem('theme', theme);

    // Remove all old and new theme classes/attributes first
    document.documentElement.classList.remove('dark', 'light'); // Remove old classes
    document.body.className = ''; // Clear all body classes

    // Set the data-theme attribute with the new theme name
    document.documentElement.setAttribute('data-theme', theme);

    // For backward compatibility, set the body class with the old theme name if a mapping exists
    const oldTheme = Object.keys(themeMapping).find(key => themeMapping[key] === theme);
    if (oldTheme) {
      document.body.classList.add(oldTheme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'synthwave-noir') return 'terminal-mono';
      if (prevTheme === 'terminal-mono') return 'paper-ledger';
      return 'synthwave-noir'; // Cycle back to the first new theme
    });
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