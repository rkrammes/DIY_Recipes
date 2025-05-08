# DIY Formulations Application

Modern implementation of the DIY Formulations application using Next.js, TypeScript, and Tailwind CSS.

## Interface Options

This application provides multiple interface options:

1. **KRAFT_AI Terminal Interface** - The classic retro-futuristic terminal interface with three themes (hackers, dystopia, neotopia).
2. **Module-based Modern Interface** - A modular architecture with dynamically loaded features.
3. **Document-centric Interface** - A modern document-centric interface for formulation editing.

## Quick Start Commands

### KRAFT_AI Terminal Interface

Start the classic terminal interface:

```bash
./start-kraft-terminal.sh
```

### Module System Interface

Start the module-based interface:

```bash
./start-enhanced-modules.sh
```

### Basic Development Server

Start the default development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Important Documentation

- [Memory Agent Integration](./README-MEMORY-INTEGRATION.md) - Read about the memory agent integration and server stability fixes
- [Server Stability Fixes](./SERVER_STABILITY_FIXES.md) - Detailed documentation on server stability improvements
- [Fixed Providers](./FIXED_PROVIDERS_README.md) - Information about the fixed provider implementation
- [Module Registry System](./MODULE_REGISTRY_SYSTEM.md) - Details on the modular architecture
- [Font Loading Solution](./README-FONT-SOLUTION.md) - Information about the font loading implementation
- [Feature Toggle System](./README-FEATURE-TOGGLE.md) - Documentation for the feature toggle system

## Server Stability

If you encounter server stability issues, you can use the minimal implementation:

```bash
./start-minimal.sh
```

Or test the fixed providers specifically:

```bash
./test-fixed-providers.sh
```

## Memory Agent

The memory agent helps track development progress, decisions, and integration status. To use it standalone:

```bash
node ../../start-development.js
```

This provides an interactive shell with commands for managing tasks and recording decisions.

## Theme System

The application includes three distinct themes:

1. **Hackers** - Green text on black, CRT scan lines, hacker aesthetic
2. **Dystopia** - Amber/orange text, dark ambiance, dystopian future feel
3. **Neotopia** - Blue text, clean and futuristic interface

You can switch between themes using the theme controls in the interface.

## Module Registry System

The application uses a module registry system for feature modularity and extensibility:

- Modules automatically register with the central registry
- Each module defines its routes, components, and navigation items
- The system supports enabling/disabling modules via feature flags
- Navigation is dynamically generated based on the available modules

## Project Structure

- `src/app` - Next.js application pages and layouts
- `src/components` - React components
- `src/modules` - Modular features (formulations, ingredients, etc.)
- `src/providers` - Context providers for theme, auth, etc.
- `src/hooks` - Custom React hooks
- `src/lib` - Utility functions and modules
  - `src/lib/modules` - Module registry system
  - `src/lib/themes` - Theme management
  - `src/lib/data` - Data access repositories
- `src/styles` - Global styles and CSS modules

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Memory Agent Documentation](../../agents/memory/USAGE.md)

## Deployment

```bash
npm run build
npm run start
```

For production deployment, we recommend using Vercel or a similar platform.