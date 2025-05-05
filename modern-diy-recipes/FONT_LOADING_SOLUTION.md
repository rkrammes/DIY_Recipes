# Font Loading Solution

This document describes the solution implemented to fix font loading issues in the DIY Recipes application.

## Problem

The application was experiencing font loading issues with errors like `ERR_CONNECTION_REFUSED` when trying to load font files from `localhost:3000/fonts/`. The fonts were not loading correctly, which affected the UI appearance.

## Solution Overview

The solution involves:

1. A dedicated HTTP server running on port 3000 that serves font files with the correct MIME types
2. The Next.js application running on port 3001 that uses the font server
3. The `font-loader.js` script with fallback support to load fonts from the font server

## How It Works

### 1. Font Server (Port 3000)

The dedicated font server handles font file requests with proper MIME types and cache headers:

- Runs on `http://localhost:3000`
- Serves files from the `public` directory, including the `fonts` subdirectory
- Provides the correct MIME types for font files:
  - `.woff` → `font/woff`
  - `.woff2` → `font/woff2`
- Sets appropriate cache headers for performance

### 2. Font Loader Script

The enhanced `font-loader.js` script in the `public` directory:

- Tries to load fonts from the application's path first
- Falls back to the font server (`http://localhost:3000`) if the primary source fails
- Handles loading failures gracefully
- Marks fonts as loaded when complete or after a timeout

### 3. Next.js Application (Port 3001)

The Next.js application runs on port 3001 and relies on the font server for font files.

## Usage

### Starting the Servers

To start the complete solution:

```bash
./start-nextjs-with-font-server.sh
```

This script:
1. Starts the font server on port 3000
2. Verifies the font server is accessible
3. Starts the Next.js application on port 3001

### Testing Font Loading

After starting the servers, you can test font loading:

1. Open `http://localhost:3000/font-test.html` to verify font loading directly from the font server
2. Open `http://localhost:3001` to see your application with fonts loaded from the font server

### Stopping the Servers

To stop all servers:

```bash
./stop-all-servers.sh
```

## Troubleshooting

If you encounter font loading issues:

1. Verify both servers are running:
   ```bash
   lsof -i :3000  # Check if font server is running
   lsof -i :3001  # Check if Next.js is running
   ```

2. Check the logs:
   ```bash
   tail -f logs/font-server.log  # Font server logs
   tail -f logs/nextjs.log       # Next.js logs
   ```

3. Test font server accessibility:
   ```bash
   curl -I http://localhost:3000/fonts/IBMPlexMono-Regular.woff2
   ```
   You should see a `200 OK` response with `Content-Type: font/woff2`

4. Check browser console for network errors when loading font files

## Additional Notes

- The font server is designed to be lightweight and focused solely on serving static files
- The solution separates concerns: font serving is handled by a dedicated server
- The fallback mechanism in `font-loader.js` provides resilience

## Font Files

The following font files are served by the font server:

- `IBMPlexMono-Bold.woff2`
- `IBMPlexMono-Medium.woff2`
- `IBMPlexMono-Regular.woff2`
- `JetBrainsMono-Regular.woff2`
- `Px437_IBM_VGA_8x16.woff`
- `Share_Tech_Mono.woff`