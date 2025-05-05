'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSafeProvider } from '../lib/safe-provider';
import { 
  Theme, 
  legacyThemeMapping, 
  reverseLegacyMapping, 
  themeColors, 
  isValidTheme,
  getNormalizedTheme,
  getSystemPreferredTheme 
} from '../types/theme';

// Define the theme context interface
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | string) => void;
  toggleTheme: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  themeReady: boolean;
}

// Create the safe provider using the MCP pattern
const { Provider, useValue } = createSafeProvider<ThemeContextType>(
  {
    theme: 'synthwave-noir',
    setTheme: () => {},
    toggleTheme: () => {},
    audioEnabled: false,
    setAudioEnabled: () => {},
    themeReady: false
  },
  'Theme'
);

/**
 * Consolidated ThemeProvider that combines functionality from all previous providers:
 * - Uses safe provider pattern for circular dependency protection
 * - Handles hydration mismatches with mounted state
 * - Supports legacy theme naming with bidirectional mapping
 * - Includes audio enablement state
 * - Implements system preference detection
 * - Provides robust fallbacks for all operations
 */
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track if client-side mounted to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  // Core theme state
  const [theme, setThemeState] = useState<Theme>('hackers');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  // Handle mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set theme
  const setTheme = (newTheme: Theme | string) => {
    if (!newTheme) return;
    
    try {
      // Check if it's a valid theme name
      if (isValidTheme(newTheme)) {
        setThemeState(newTheme);
        return;
      }
      
      // Fall back to system preference
      console.warn(`Invalid theme name: ${newTheme}, falling back to system preference`);
      setThemeState(getSystemPreferredTheme());
    } catch (error) {
      console.error('Error setting theme:', error);
      setThemeState('hackers'); // Default fallback
    }
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Check if ThemeScript already initialized the theme
      // If yes, read the current data-theme attribute instead of localStorage
      // This prevents conflicts and double initialization
      if (window.__themeScriptExecuted) {
        try {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          if (currentTheme && isValidTheme(currentTheme)) {
            console.log('ThemeProvider using theme from ThemeScript:', currentTheme);
            setThemeState(currentTheme as Theme);
          } else {
            // Fallback if attribute is missing or invalid
            const savedTheme = localStorage.getItem('theme');
            setTheme(savedTheme || getSystemPreferredTheme());
          }
        } catch (domError) {
          console.warn('Error reading data-theme attribute:', domError);
          // Fall back to localStorage
          const savedTheme = localStorage.getItem('theme');
          setTheme(savedTheme || getSystemPreferredTheme());
        }
      } else {
        // ThemeScript didn't run, initialize normally
        const savedTheme = localStorage.getItem('theme');
        setTheme(savedTheme || getSystemPreferredTheme());
      }
      
      // Initialize audio state from localStorage with default off
      const savedAudio = localStorage.getItem('audioEnabled');
      if (savedAudio !== null) {
        setAudioEnabled(savedAudio === 'true');
      }
      
      setThemeReady(true);
    } catch (error) {
      console.error('Error initializing theme:', error);
      setThemeState(getSystemPreferredTheme());
      setThemeReady(true);
    }
  }, []);

  // Update document theme attribute and localStorage when theme changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      // 1. Update data-theme attribute for CSS selectors
      document.documentElement.setAttribute('data-theme', theme);
      
      // 2. Store in localStorage for persistence
      try {
        localStorage.setItem('theme', theme);
      } catch (storageError) {
        console.warn('Could not save theme to localStorage:', storageError);
      }
      
      // 4. Apply theme classes for easier CSS targeting
      try {
        // Remove all potential theme classes
        document.documentElement.classList.remove(
          'hackers', 'dystopia', 'neotopia'
        );
        
        // Add current theme class
        document.documentElement.classList.add(theme);
      } catch (classError) {
        console.error('Error applying theme classes:', classError);
        
        // Apply fallback using inline styles if CSS classes fail
        try {
          const colors = themeColors[theme];
          if (colors) {
            document.documentElement.style.setProperty('--background', colors.bg);
            document.documentElement.style.setProperty('--text', colors.text);
            document.documentElement.style.setProperty('--accent', colors.accent);
          }
        } catch (fallbackError) {
          console.error('Theme fallback also failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, mounted]);

  // Toggle between themes in sequence
  const toggleTheme = () => {
    const themes: Theme[] = ['hackers', 'dystopia', 'neotopia'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  // Save audio preference when it changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('audioEnabled', String(audioEnabled));
    } catch (error) {
      console.warn('Could not save audio preference:', error);
    }
  }, [audioEnabled, mounted]);

  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="theme-loading" style={{ visibility: 'hidden' }}></div>;
  }

  return (
    <Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      audioEnabled,
      setAudioEnabled,
      themeReady
    }}>
      {children}
    </Provider>
  );
}

// Export the useTheme hook directly
export function useTheme() {
  const { value } = useValue();
  // Add this log to help debug
  console.log('Theme context value:', value);
  return value;
}

// Export for convenience
export type { Theme };
export { themeColors };