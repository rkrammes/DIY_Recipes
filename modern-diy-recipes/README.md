# DIY Recipes Application

Modern implementation of the DIY Recipes application using Next.js, TypeScript, and Tailwind CSS.

## Important Documentation

- [Memory Agent Integration](./README-MEMORY-INTEGRATION.md) - Read about the memory agent integration and server stability fixes
- [Server Stability Fixes](./SERVER_STABILITY_FIXES.md) - Detailed documentation on server stability improvements
- [Fixed Providers](./FIXED_PROVIDERS_README.md) - Information about the fixed provider implementation

## Getting Started

For normal development, use the memory-integrated start script:

```bash
./start-with-memory.sh
```

This will start both the application and the memory agent for development tracking.

Alternatively, run the development server without memory tracking:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

## Project Structure

- `src/app` - Next.js application pages and layouts
- `src/components` - React components
- `src/providers` - Context providers for theme, auth, etc.
- `src/hooks` - Custom React hooks
- `src/lib` - Utility functions and modules
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