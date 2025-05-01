"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'synthwave-noir' | 'terminal-mono' | 'paper-ledger'; // Export the Theme type

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('synthwave-noir');

  useEffect(() => {
    // This effect runs only on the client after hydration
    // The ThemeScript handles initial theme setting to prevent FOUC
    const storedTheme = localStorage.getItem('theme');
    let initialTheme: Theme = 'synthwave-noir'; // Default to a new theme name

    if (storedTheme && ['synthwave-noir', 'terminal-mono', 'paper-ledger'].includes(storedTheme)) {
      initialTheme = storedTheme as Theme;
    }

    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Store the new theme name
    localStorage.setItem('theme', theme);

    // Set the data-theme attribute with the new theme name
    document.documentElement.setAttribute('data-theme', theme);

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