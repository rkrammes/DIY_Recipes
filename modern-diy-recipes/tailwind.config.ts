import type { Config } from 'tailwindcss'

// Helper function for opacity-aware color variables
function withOpacity(variable: string): string {
  return `oklch(var(${variable}))`;
}

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx,md,mdx}',
    './src/components/**/*.{ts,tsx,js,jsx,md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors
        surface: {
          DEFAULT: withOpacity('--surface-0'),
          '1': withOpacity('--surface-1'),
          'inverse': withOpacity('--surface-inverse'),
        },
        // Text colors
        text: {
          DEFAULT: withOpacity('--text-primary'),
          'secondary': withOpacity('--text-secondary'),
          'inverse': withOpacity('--text-inverse'),
        },
        // Interactive colors
        accent: {
          DEFAULT: withOpacity('--accent'),
          'hover': withOpacity('--accent-hover'),
          'active': withOpacity('--accent-active'),
        },
        // Status colors
        alert: {
          'red': withOpacity('--error'),
          'yellow': withOpacity('--warning'),
          'green': withOpacity('--success'),
        },
        // Border colors
        border: {
          'subtle': withOpacity('--border-subtle'),
        },
      },
      backgroundColor: {
        // Reference the new background color definition
        DEFAULT: withOpacity('--background'),
        primary: withOpacity('--surface-0'),
        secondary: withOpacity('--surface-1'),
        inverse: withOpacity('--surface-inverse'),
        overlay: withOpacity('--surface-1'), // Assuming overlay uses surface-1
      },
      borderColor: {
        // Reference the new border color definition
        DEFAULT: withOpacity('--border'),
      },
      outlineColor: {
        // Reference the new ring color definition for outline
        DEFAULT: withOpacity('--ring'),
        ring: withOpacity('--ring'), // Explicitly map ring for outline-ring
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
      },
      fontFamily: {
        'sans': 'var(--font-sans)',
        'mono': 'var(--font-mono)',
        'heading': 'var(--font-display)',
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addVariant }: { addVariant: (name: string, definition: string | string[]) => void }) {
      // Add a variant for hover OR focus states
      addVariant('hocus', ['&:hover', '&:focus']);

      // Add theme-specific variants
      addVariant('synthwave', '[data-theme="synthwave-noir"] &');
      addVariant('terminal', '[data-theme="terminal-mono"] &');
      addVariant('paper', '[data-theme="paper-ledger"] &');
    },
  ],
}

export default config;