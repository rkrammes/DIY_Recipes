# Font Server Solution

This directory contains a solution for the font loading issues in the Kraft_AI (DIY_Recipes) app.

## Problem
The application was experiencing font loading errors with `ERR_CONNECTION_REFUSED` messages when trying to load font files from the `/fonts/` directory.

## Solution
We've created a dedicated font server that runs on port 3000 and properly serves the font files from the `public/fonts/` directory. This server handles the correct MIME types and sets proper caching headers.

## How to Use

### Option 1: Run Font Server Only
If you already have your Next.js app running on a different port, you can start just the font server:

```bash
./start-font-test.sh
```

This will:
1. Check if port 3000 is already in use and free it if needed
2. Start a dedicated Express server on port 3000 that serves only the font files

### Option 2: Run Complete Environment
To start both the font server and the Next.js app:

```bash
./start-with-font-server.sh
```

This will:
1. Start the font server on port 3000
2. Start the Next.js app using the fixed server script on port 3456

## Testing the Font Server

1. Open http://localhost:3000/ in your browser to see the font test page
2. Check http://localhost:3000/server-status to verify the server is running correctly
3. You can verify font loading by accessing files directly:
   - http://localhost:3000/fonts/IBMPlexMono-Regular.woff2
   - http://localhost:3000/fonts/JetBrainsMono-Regular.woff2
   - etc.

## Technical Details

The font server:
- Uses Express.js to serve static files
- Sets proper MIME types for font files
- Adds caching headers for better performance
- Provides detailed logs about file requests
- Serves font files from the `public/fonts/` directory
- Includes a test page to verify all fonts are loading correctly

## Troubleshooting

If you continue to experience font loading issues:

1. Check the logs in `logs/font-server.log`
2. Verify that your application's font-loader.js is looking for fonts at `/fonts/` (not at a specific domain/port)
3. Make sure no other process is using port 3000
4. Verify that the font files exist in the `public/fonts/` directory
5. Check browser console for network errors related to font loading