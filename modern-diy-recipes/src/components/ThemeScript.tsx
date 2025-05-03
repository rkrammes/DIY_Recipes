'use client';

// This component injects a script into the document head to prevent FOUC
export default function ThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'synthwave-noir';
              const validThemes = ['synthwave-noir', 'terminal-mono', 'paper-ledger'];
              
              // Only apply if it's a valid theme
              if (validThemes.includes(theme)) {
                document.documentElement.setAttribute('data-theme', theme);
              } else {
                // Fallback to system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute(
                  'data-theme',
                  prefersDark ? 'synthwave-noir' : 'paper-ledger'
                );
              }
            } catch (e) {
              console.warn('Theme initialization error:', e);
              // Fallback to default theme
              document.documentElement.setAttribute('data-theme', 'synthwave-noir');
            }
          })();
        `,
      }}
    />
  );
}