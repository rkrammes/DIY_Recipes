'use client';
import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'synthwave-noir';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

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
            } catch (e) {
              console.error('Theme script error:', e);
            }
          })();
        `,
      }}
    />
  );
}