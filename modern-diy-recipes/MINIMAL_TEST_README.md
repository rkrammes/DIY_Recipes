# Minimal Test Environment

This is a minimal test environment created to isolate and fix server stability issues related to the theming and animation systems.

## Overview

This implementation includes:

1. **SimpleThemeProvider**: A lightweight theme provider without audio functionality
2. **Simple Animation System**: CSS-based animations without framer-motion
3. **Isolated Test Page**: A dedicated page with its own layout to prevent other components from affecting it

## How to Use

1. Run the test script:
   ```bash
   ./start-minimal.sh
   ```

2. Navigate to [http://localhost:3000/minimal-test](http://localhost:3000/minimal-test)

3. Test theme switching and simple animations to verify stability

## Debugging

If you need more detailed debugging information:

1. Run the debug script:
   ```bash
   node debug-minimal.js
   ```

2. Check the `minimal-debug.log` file for detailed error information

3. The debug script:
   - Runs Next.js with increased verbosity
   - Enables trace warnings
   - Sets a higher memory limit
   - Saves all output to a log file

## Troubleshooting

If the server crashes:

1. Check the error message in the console or debug log
2. Look for specific component or provider issues
3. Consider further simplifying the test environment
4. Check for memory issues with large components or state objects

## Incremental Feature Restoration

Once you've achieved stability with the minimal implementation, use the incremental restoration script to gradually reintroduce features:

```bash
node incremental-restore.js
```

The script provides:

1. Component status tracking
2. Dependency management to ensure proper restoration order
3. Server stability testing after each addition
4. Backup creation of stable configurations
5. Logging of restoration progress

### Restoration Process:

1. Start with the minimal test implementation
2. Verify stability with the current configuration
3. Enable one component at a time
4. Test server startup after each addition
5. Create backups of stable configurations
6. Continue until all features are restored

### Components To Restore (in recommended order):

1. Basic Theme Provider (SimpleThemeProvider.tsx) - Already enabled
2. CSS Animations (simple-motion.ts) - Already enabled
3. Framer Motion Animations (motion.ts)
4. Full Theme Provider (ThemeProvider.tsx)
5. Audio System (audio/core.ts)

## Implementation Details

- `/providers/SimpleThemeProvider.tsx`: Minimal theme provider
- `/lib/animation/simple-motion.ts`: Simple animation parameters 
- `/hooks/useSimpleAnimation.ts`: Hook for simple CSS-based animations
- `/app/minimal-test/*`: Isolated test page and layout
- `/app/minimal-test/styles.css`: Minimal CSS styles

## Benefits of This Approach

1. Isolates potential crash points
2. Tests core theme functionality without complex features
3. Provides a clean slate for testing
4. Establishes a pattern for implementing features with proper error handling