import type { Config } from 'tailwindcss'

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
    // @ts-ignore
    require('tailwindcss-animate')
  ],
}

export default config