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
              const storedTheme = localStorage.getItem('theme');
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'synthwave-noir' : 'light'; // Assuming 'synthwave-noir' is dark and 'light' is light
              const theme = storedTheme || systemTheme;
              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {
              console.error('Theme script error:', e);
            }
          })();
        `,
      }}
    />
  );
}