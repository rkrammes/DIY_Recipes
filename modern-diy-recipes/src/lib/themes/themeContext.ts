import { createContext, useContext } from 'react';
import { Theme } from '@/types/theme';

/**
 * Interface for theme context values
 */
export interface ThemeContextValue {
  // Core theme properties
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  themeReady: boolean;
  
  // Audio-related properties
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  
  // Theme color utilities
  getThemeColors: () => Record<string, string>;
  isDarkTheme: boolean;
}

// Create a context with default values
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'hackers',
  setTheme: () => {},
  toggleTheme: () => {},
  themeReady: false,
  audioEnabled: false,
  setAudioEnabled: () => {},
  getThemeColors: () => ({}),
  isDarkTheme: true,
});

/**
 * Hook for accessing theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}