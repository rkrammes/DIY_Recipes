# Sample Tokens Implementation

This document provides a sample implementation of the tokens.css file that would be created as part of the theming system upgrade.

## tokens.css

```css
/* 
 * DIY Recipes - Design Token System
 * Based on the first-principles theming strategy
 */

/* Base primitive tokens */
:root {
  /* Colors (in RGB format for Tailwind opacity utilities) */
  --color-black: 0 0 0;
  --color-white: 255 255 255;
  --color-blue-500: 0 200 255;
  --color-pink-500: 255 0 255;
  --color-green-500: 0 224 80;
  --color-amber-500: 255 153 0;
  
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;
  
  /* Typography */
  --font-sans: 'Rajdhani', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-display: 'Orbitron', sans-serif;
  
  /* Border radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  
  /* Z-index */
  --z-base: 1;
  --z-menu: 10;
  --z-modal: 100;
  --z-toast: 1000;
}

/* Semantic tokens - Synthwave Noir (default) */
:root[data-theme="synthwave-noir"] {
  /* Surface tokens */
  --surface-0: 60 25 300; /* oklch format */
  --surface-1: 50 23 300;
  --surface-inverse: 95 1 315;
  
  /* Content tokens */
  --text-primary: 95 1 315;
  --text-secondary: 85 5 310;
  --text-inverse: 60 25 300;
  
  /* Interactive tokens */
  --accent: 70 30 330;
  --accent-hover: 75 32 330;
  --accent-active: 60 28 330;
  
  /* Decorative tokens */
  --border-subtle: 70 15 320 / 0.3;
  --shadow-soft: 0 2px 6px 0 oklch(0 0 0 / 0.3);
  --glow-pulse: 0 0 10px oklch(70 30 330);
  
  /* Status tokens */
  --success: 80 20 140;
  --warning: 75 18 85;
  --error: 65 30 30;
  
  /* Theme-specific effects */
  --crt-bloom-intensity: 0.5px;
  --panel-3d-shadow-color: rgba(255, 0, 255, 0.4);
  --overlay-bg: rgba(60, 25, 300, 0.9);
  --trans-duration: 0.2s;
  --trans-timing: ease-in-out;
}

/* Terminal Mono theme */
:root[data-theme="terminal-mono"] {
  /* Surface tokens */
  --surface-0: 10 2 280;
  --surface-1: 6 2 280;
  --surface-inverse: 85 1 100;
  
  /* Content tokens */
  --text-primary: 85 1 100;
  --text-secondary: 75 2 110;
  --text-inverse: 10 2 280;
  
  /* Interactive tokens */
  --accent: 65 18 90;
  --accent-hover: 70 20 90;
  --accent-active: 55 16 90;
  
  /* Decorative tokens */
  --border-subtle: 65 10 90 / 0.3;
  --shadow-soft: 0 2px 6px 0 oklch(0 0 0 / 0.3);
  --glow-pulse: 0 0 8px oklch(65 18 90);
  
  /* Status tokens */
  --success: 70 15 140;
  --warning: 70 20 85;
  --error: 60 25 30;
  
  /* Theme-specific effects */
  --ghost-text-offset: 1px;
  --ghost-text-color: rgba(0, 224, 80, 0.5);
  --flicker-intensity: 0.98;
  --overlay-bg: rgba(10, 2, 280, 0.9);
  --trans-duration: 0.2s;
  --trans-timing: ease-in-out;
}

/* Paper Ledger theme */
:root[data-theme="paper-ledger"] {
  /* Surface tokens */
  --surface-0: 94 2 90;
  --surface-1: 90 2 90;
  --surface-inverse: 25 1 70;
  
  /* Content tokens */
  --text-primary: 25 1 70;
  --text-secondary: 40 2 75;
  --text-inverse: 94 2 90;
  
  /* Interactive tokens */
  --accent: 60 16 40;
  --accent-hover: 65 17 40;
  --accent-active: 55 15 40;
  
  /* Decorative tokens */
  --border-subtle: 60 8 40 / 0.2;
  --shadow-soft: 0 1px 3px 0 oklch(0 0 0 / 0.12);
  --glow-pulse: 0 0 5px oklch(60 16 40 / 0.5);
  
  /* Status tokens */
  --success: 65 15 140;
  --warning: 70 15 85;
  --error: 65 20 30;
  
  /* Theme-specific effects */
  --paper-texture-opacity: 0.05;
  --paper-emboss-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  --overlay-bg: rgba(94, 2, 90, 0.9);
  --trans-duration: 0.3s;
  --trans-timing: ease;
}
```

## Example Component Using Tokens

Here's how a button component would use these tokens:

```tsx
// Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick 
}) => {
  return (
    <button
      className={`
        px-4 py-2 
        rounded-md 
        font-medium 
        shadow-soft 
        transition-colors 
        ${variant === 'primary' ? 'bg-accent text-surface-0 hover:bg-accent-hover active:bg-accent-active' : ''}
        ${variant === 'secondary' ? 'bg-surface-1 text-text-primary border border-accent hover:border-accent-hover' : ''}
        ${variant === 'danger' ? 'bg-[rgb(var(--error))] text-surface-0 hover:opacity-90' : ''}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## Example Tailwind Config

Here's how the Tailwind configuration would be updated to use these tokens:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const withOpacity = (variable: string) => 
  `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
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
    plugin(({ addVariant }) => {
      addVariant('hocus', ['&:hover', '&:focus']);
    }),
  ],
}

export default config;
```

## Migration Example

Here's an example of how to migrate an existing component to use the new token system:

### Before:

```tsx
<div className="bg-secondary-bg-dark text-text-dark border border-panel-border-dark">
  <h2 className="text-accent-blue-dark">Settings</h2>
  <button className="bg-accent-blue-dark text-white hover:bg-accent-blue-dark/90">
    Save
  </button>
</div>
```

### After:

```tsx
<div className="bg-surface-1 text-text-primary border border-border-subtle">
  <h2 className="text-accent">Settings</h2>
  <button className="bg-accent text-surface-0 hover:bg-accent-hover active:bg-accent-active">
    Save
  </button>
</div>
```

This approach ensures that components automatically adapt to theme changes without requiring theme-specific class variations.