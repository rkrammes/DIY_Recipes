'use client';

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeContext } from './themeContext';
import { 
  getNormalizedTheme, 
  getNextTheme, 
  getSystemPreferredTheme,
  getThemeColors,
  isDarkTheme,
  AVAILABLE_THEMES,
  Theme 
} from './themeUtils';

// Script to apply theme before React hydration
const THEME_SCRIPT = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'hackers';
      document.documentElement.setAttribute('data-theme', theme);
      const root = document.documentElement;
      
      // Apply critical CSS for dark themes
      const darkThemes = ['hackers', 'dystopia'];
      if (darkThemes.includes(theme)) {
        root.style.colorScheme = 'dark';
        root.style.backgroundColor = theme === 'hackers' ? '#121212' : '#0a0a0f';
        root.style.color = theme === 'hackers' ? '#33ff33' : '#eceadf';
      } else {
        root.style.colorScheme = 'light';
        root.style.backgroundColor = '#ffffff';
        root.style.color = '#333333';
      }
      
      // Set a flag that theme is initialized
      window.themeInitialized = true;
    } catch(e) {
      console.error('Error applying theme:', e);
    }
  })();
`;

/**
 * Props for UnifiedThemeProvider
 */
interface UnifiedThemeProviderProps {
  children: React.ReactNode;
}

/**
 * UnifiedThemeProvider - A consolidated theme provider that
 * combines theme, audio, and animation settings.
 */
export default function UnifiedThemeProvider({ children }: UnifiedThemeProviderProps) {
  // State variables
  const [theme, setThemeState] = useState<Theme>('hackers');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [themeReady, setThemeReady] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // Initialize theme on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Skip if running on server
    if (typeof window === 'undefined') return;
    
    try {
      // Get theme from localStorage or system preference
      const storedTheme = localStorage.getItem('theme');
      const initialTheme = getNormalizedTheme(
        storedTheme || getSystemPreferredTheme()
      );
      
      // Get audio preference from localStorage
      const storedAudio = localStorage.getItem('audioEnabled');
      const initialAudio = storedAudio !== null ? storedAudio === 'true' : true;
      
      // Set initial states
      setThemeState(initialTheme);
      setAudioEnabled(initialAudio);
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', initialTheme);
      
      // Mark theme as ready
      setThemeReady(true);
    } catch (error) {
      console.error('Error initializing theme:', error);
      
      // Fallback to default theme
      setThemeState('hackers');
      setThemeReady(true);
    }
  }, []);
  
  // Handler for setting theme
  const setTheme = useCallback((newTheme: Theme) => {
    // Skip if running on server
    if (typeof window === 'undefined') return;
    
    try {
      // Normalize the theme
      const normalizedTheme = getNormalizedTheme(newTheme);
      
      // Update state
      setThemeState(normalizedTheme);
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', normalizedTheme);
      
      // Store in localStorage
      localStorage.setItem('theme', normalizedTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, []);
  
  // Handler for toggling theme
  const toggleTheme = useCallback(() => {
    setTheme(getNextTheme(theme));
  }, [theme, setTheme]);
  
  // Handler for setting audio enabled
  const handleSetAudioEnabled = useCallback((enabled: boolean) => {
    setAudioEnabled(enabled);
    
    // Store in localStorage if available
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('audioEnabled', enabled.toString());
      } catch (error) {
        console.error('Error storing audio preference:', error);
      }
    }
  }, []);
  
  // Get theme colors function
  const getColors = useCallback(() => {
    return getThemeColors(theme);
  }, [theme]);
  
  // Context value
  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    themeReady,
    audioEnabled,
    setAudioEnabled: handleSetAudioEnabled,
    getThemeColors: getColors,
    isDarkTheme: isDarkTheme(theme),
  }), [theme, setTheme, toggleTheme, themeReady, audioEnabled, handleSetAudioEnabled, getColors]);
  
  // Don't render children until component is mounted
  if (!isMounted) {
    return (
      <>
        {/* Apply theme script before hydration */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <div className="text-primary bg-background h-screen"></div>
      </>
    );
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}