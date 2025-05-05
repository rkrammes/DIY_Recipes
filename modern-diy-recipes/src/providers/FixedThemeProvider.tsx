'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Theme, 
  themeColors, 
  isValidTheme,
  getSystemPreferredTheme 
} from '../types/theme';

// Define the theme context type directly
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | string) => void;
  toggleTheme: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  themeReady: boolean;
}

// Create a context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'hackers',
  setTheme: () => {},
  toggleTheme: () => {},
  audioEnabled: false,
  setAudioEnabled: () => {},
  themeReady: false
});

// Create the provider component
export function FixedThemeProvider({
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
        console.log('Setting theme to:', newTheme);
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
      // Check if we already have a theme stored
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && isValidTheme(savedTheme)) {
        setThemeState(savedTheme as Theme);
      } else {
        // Use system preference if no theme is stored
        setThemeState(getSystemPreferredTheme());
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
      
      // 3. Apply theme classes for easier CSS targeting
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
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      audioEnabled,
      setAudioEnabled,
      themeReady
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Export the useTheme hook
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}