'use client';

import { isValidTheme, getNormalizedTheme, themeColors, Theme } from '../types/theme';

/**
 * ThemeScript Component
 * 
 * This component injects a script into the document head to prevent FOUC (Flash of Unstyled Content).
 * It runs before hydration to ensure the correct theme is applied immediately.
 */
export default function ThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // IMPORTANT: This script runs before React hydration and should
              // only handle the initial theme to prevent FOUC (Flash of Unstyled Content)
              // Full theming functionality is handled by the ThemeProvider.
              
              // Get theme from localStorage with fallback to system preference
              let storedTheme;
              try {
                storedTheme = localStorage.getItem('theme');
              } catch (storageError) {
                console.warn('LocalStorage access error:', storageError);
              }
              
              // Determine theme
              let theme;
              const validThemes = ['hackers', 'dystopia', 'neotopia'];
              
              // If we have a stored theme, use it if valid
              if (storedTheme) {
                if (validThemes.includes(storedTheme)) {
                  theme = storedTheme;
                } else {
                  // Fallback to system preference
                  try {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'hackers' : 'neotopia';
                  } catch (mediaError) {
                    console.warn('Media query error:', mediaError);
                    theme = 'hackers'; // Default fallback
                  }
                }
              } else {
                // No stored theme, use system preference
                try {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'hackers' : 'neotopia';
                } catch (mediaError) {
                  console.warn('Media query error:', mediaError);
                  theme = 'hackers'; // Default fallback
                }
              }
              
              // Set data-theme attribute for CSS selector matching
              document.documentElement.setAttribute('data-theme', theme);
              
              // Apply base styles immediately to prevent FOUC
              document.documentElement.style.setProperty('color-scheme', 
                theme === 'neotopia' ? 'light' : 'dark');
              
              // Apply minimal theme background color directly to minimize flashing
              // The ThemeProvider will take over once it's mounted
              const themeColors = ${JSON.stringify(themeColors)};
              if (themeColors[theme]) {
                document.documentElement.style.setProperty('background-color', themeColors[theme].bg);
                
                // Don't set other properties that will be handled by ThemeProvider
                // to avoid conflicts and double initialization
              }
              
              // NOTE: We don't set up event listeners here as those will be handled
              // by the proper React ThemeProvider once it's mounted
              
              // Store a flag to indicate this script ran successfully
              window.__themeScriptExecuted = true;
            } catch (e) {
              console.warn('Theme initialization error:', e);
              // Minimal fallback to ensure at least something renders
              document.documentElement.setAttribute('data-theme', 'hackers');
              document.documentElement.style.setProperty('color-scheme', 'dark');
            }
          })();
        `,
      }}
    />
  );
}