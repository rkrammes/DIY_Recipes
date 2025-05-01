'use client';

import { useEffect } from 'react';

// This component injects a script into the document head to prevent FOUC
export default function ThemeScript() {
  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedTheme = localStorage.getItem('theme');
    let initialTheme = 'synthwave-noir'; // Default theme

    if (storedTheme && ['synthwave-noir', 'terminal-mono', 'paper-ledger'].includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      // Optional: Detect system preference if no theme is stored
      // const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // initialTheme = mediaQuery.matches ? 'synthwave-noir' : 'paper-ledger';
    }

    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // This script runs before React hydration
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const storedTheme = localStorage.getItem('theme');
              let initialTheme = 'synthwave-noir'; // Default theme

              if (storedTheme && ['synthwave-noir', 'terminal-mono', 'paper-ledger'].includes(storedTheme)) {
                initialTheme = storedTheme;
              } else {
                // Optional: Detect system preference if no theme is stored
                // const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                // initialTheme = mediaQuery.matches ? 'synthwave-noir' : 'paper-ledger';
              }

              document.documentElement.setAttribute('data-theme', initialTheme);

              // Optional: Listen for system preference changes and keyboard shortcut
              // const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              // function handleChange() {
              //   const storedTheme = localStorage.getItem('theme');
              //   if (!storedTheme) {
              //     document.documentElement.setAttribute(
              //       'data-theme',
              //       mediaQuery.matches ? 'synthwave-noir' : 'paper-ledger'
              //     );
              //   }
              // }
              // mediaQuery.addEventListener('change', handleChange);

              // document.addEventListener('keydown', function(e) {
              //   if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
              //     e.preventDefault();
              //     const currentTheme = document.documentElement.getAttribute('data-theme');
              //     const themes = ['synthwave-noir', 'terminal-mono', 'paper-ledger'];
              //     const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
              //     const nextTheme = themes[nextIndex];
              //     document.documentElement.setAttribute('data-theme', nextTheme);
              //     localStorage.setItem('theme', nextTheme);
              //   }
              // });

            } catch (e) {
              console.error('Theme script error:', e);
            }
          })();
        `,
      }}
    />
  );
}