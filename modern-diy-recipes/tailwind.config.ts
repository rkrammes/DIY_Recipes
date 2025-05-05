import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors
        surface: {
          DEFAULT: 'oklch(var(--surface-0) / <alpha-value>)',
          '1': 'oklch(var(--surface-1) / <alpha-value>)',
          '2': 'oklch(var(--surface-1) / 0.8)',
          '3': 'oklch(var(--surface-1) / 0.6)',
          'inverse': 'oklch(var(--surface-inverse) / <alpha-value>)',
        },
        // Text colors
        text: {
          DEFAULT: 'oklch(var(--text-primary) / <alpha-value>)',
          'secondary': 'oklch(var(--text-secondary) / <alpha-value>)',
          'inverse': 'oklch(var(--text-inverse) / <alpha-value>)',
        },
        // Interactive colors
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          'hover': 'oklch(var(--accent-hover) / <alpha-value>)',
          'active': 'oklch(var(--accent-active) / <alpha-value>)',
        },
        // Status colors
        alert: {
          'red': 'oklch(var(--error) / <alpha-value>)',
          'yellow': 'oklch(var(--warning) / <alpha-value>)',
          'green': 'oklch(var(--success) / <alpha-value>)',
        },
        success: 'oklch(var(--success) / <alpha-value>)',
        warning: 'oklch(var(--warning) / <alpha-value>)',
        error: 'oklch(var(--error) / <alpha-value>)',
      },
      backgroundColor: {
        DEFAULT: 'oklch(var(--background) / <alpha-value>)',
        primary: 'oklch(var(--surface-0) / <alpha-value>)',
        secondary: 'oklch(var(--surface-1) / <alpha-value>)',
        inverse: 'oklch(var(--surface-inverse) / <alpha-value>)',
      },
      borderColor: {
        DEFAULT: 'oklch(var(--border) / <alpha-value>)',
        subtle: 'oklch(var(--border-subtle) / <alpha-value>)',
      },
      ringColor: {
        DEFAULT: 'oklch(var(--ring) / <alpha-value>)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'glow': 'var(--glow-pulse)',
      },
      textShadow: {
        'glow': '0 0 5px oklch(var(--accent)/0.5)',
      },
      fontFamily: {
        'sans': 'var(--font-body)',
        'mono': 'var(--font-mono)',
        'heading': 'var(--font-heading)',
        'display': 'var(--font-display)',
        'terminal': 'var(--font-terminal)',
      },
      letterSpacing: {
        'tighter': 'var(--letter-spacing-display)',
        'tight': 'var(--letter-spacing-code)',
        'normal': 'var(--letter-spacing-body)',
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(.4,0,.2,1)',
      },
      animation: {
        'flicker': 'flicker 4s infinite',
        'hue-shift': 'hueShift 10s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
      },
      transitionDuration: {
        'fast': 'var(--animation-duration-fast)',
        'medium': 'var(--animation-duration-medium)',
        'slow': 'var(--animation-duration-slow)',
      },
    },
  },
  plugins: [
    // @ts-ignore
    require('tailwindcss-animate'),
    // Theme variants plugin
    plugin(function({ addVariant }) {
      // Add theme variants
      addVariant('synthwave', '[data-theme="synthwave-noir"] &');
      addVariant('terminal', '[data-theme="terminal-mono"] &');
      addVariant('paper', '[data-theme="paper-ledger"] &');
      
      // Interaction variants
      addVariant('hocus', ['&:hover', '&:focus']);
      addVariant('group-hocus', [
        ':merge(.group):hover &',
        ':merge(.group):focus &'
      ]);
      
      // Touch variants for mobile
      addVariant('touch-hover', '@media (hover: hover) { &:hover }');
      addVariant('supports-blur', '@supports (backdrop-filter: blur(4px)) { & }');
    }),
  ],
  safelist: [
    // Theme-specific classes that might be used dynamically
    'text-shadow-glow',
    'border-glow',
    'animation-flicker',
    'animation-hue-shift',
    'grid-background',
    'terminal-scanlines',
    'crt-scanlines',
    'ghost-text',
    'cursor-blink',
    'paper-texture',
    'text-emboss',
    'ruled-lines',
  ],
}

export default config