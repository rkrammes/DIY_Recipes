import React from 'react';
'use client';

import { useEffect } from 'react';

// This component injects a script into the document head to prevent FOUC
export default function ThemeScript() {
  useEffect(() => {
    // This effect runs only on the client after hydration
    const theme = localStorage.getItem('theme') || 'synthwave-noir';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // This script runs before React hydration
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'synthwave-noir';
              document.documentElement.setAttribute('data-theme', theme);
              
              // Listen for system preference changes
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              function handleChange() {
                const storedTheme = localStorage.getItem('theme');
                if (!storedTheme) {
                  // Only apply if user hasn't explicitly chosen a theme
                  document.documentElement.setAttribute(
                    'data-theme', 
                    mediaQuery.matches ? 'synthwave-noir' : 'paper-ledger'
                  );
                }
              }
              mediaQuery.addEventListener('change', handleChange);
              
              // Setup keyboard shortcut
              document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
                  e.preventDefault();
                  const currentTheme = document.documentElement.getAttribute('data-theme');
                  const themes = ['synthwave-noir', 'terminal-mono', 'paper-ledger'];
                  const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
                  const nextTheme = themes[nextIndex];
                  document.documentElement.setAttribute('data-theme', nextTheme);
                  localStorage.setItem('theme', nextTheme);
                }
              });
            } catch (e) {
              console.error('Theme script error:', e);
            }
          })();
        `,
      }}
    />
  );
}