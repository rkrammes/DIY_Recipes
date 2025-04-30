# Theming System Documentation Index

This document serves as the central index for all documentation related to the DIY Recipes theming system.

## Core Documentation

1. [Theming System Roadmap](./theming-system-roadmap.md) - High-level implementation plan and timeline
2. [Theming Implementation Plan](./theming-implementation-plan.md) - Detailed implementation steps and code examples
3. [Theme Migration Mapping](./theme-migration-mapping.md) - Mapping between old and new theme systems
4. [Tokens Sample Implementation](./tokens-sample-implementation.md) - Example token structure and usage

## Technical Implementation Guides

1. [Edge-Safe SSR Implementation](./edge-safe-ssr-implementation.md) - Server-side rendering optimization techniques
2. [Audio Design Implementation](./audio-design-implementation.md) - Audio system implementation details
3. [Animation System Implementation](./animation-system-implementation.md) - Animation system implementation details

## Executive Documents

1. [Theming System Executive Summary](./theming-system-executive-summary.md) - Overview for stakeholders

## Debug and Fix Documentation

1. [Theming System Debug Report](./theming-system-debug-report.md) - Analysis of current implementation issues
2. [Theming System Implementation Fix Plan](./theming-system-implementation-fix-plan.md) - Comprehensive plan to fix issues
3. [Theming System Quick Fix](./theming-system-quick-fix.md) - Immediate fixes for critical issues

## Implementation Status

The theming system implementation is currently **incomplete**. The following issues have been identified:

1. Conflicting CSS variable systems (old vs. new)
2. Missing ThemeScript component
3. Incomplete component migration
4. Incorrect theme name mapping
5. Missing body background application

See the [Theming System Debug Report](./theming-system-debug-report.md) for a detailed analysis of these issues.

## Next Steps

1. Implement the quick fixes outlined in [Theming System Quick Fix](./theming-system-quick-fix.md)
2. Follow the comprehensive plan in [Theming System Implementation Fix Plan](./theming-system-implementation-fix-plan.md)
3. Complete the component migration
4. Test and verify the theming system
5. Update documentation to reflect the final implementation

## Key Files

- `styles/tokens.css` - CSS variables for the theming system
- `app/globals.css` - Global styles and theme application
- `tailwind.config.cjs` - Tailwind configuration for theme tokens
- `providers/SettingsProvider.tsx` - Theme state management
- `components/ThemeScript.tsx` - FOUC prevention (to be created)
- `app/layout.tsx` - Root layout with theme initialization

## Theme Names

| Old Theme | New Theme | Description |
|-----------|-----------|-------------|
| `hackers` | `synthwave-noir` | Dark theme with neon accents, cyberpunk aesthetic |
| `dystopia` | `terminal-mono` | Green-on-black terminal aesthetic with amber highlights |
| `neotopia` | `paper-ledger` | Light theme with muted natural colors and subtle textures |