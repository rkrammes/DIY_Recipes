# DIY Recipes Font Loading Solution

## Overview

This repository includes a robust solution for font loading in the DIY Recipes application. The solution addresses connection issues when loading fonts by implementing a dedicated font server running on port 3000, with a fallback mechanism in the font loader script.

## Components

### 1. Dedicated Font Server (Port 3000)

A lightweight HTTP server dedicated to serving font files with proper MIME types and caching headers:

- Runs on: `http://localhost:3000`
- Serves files from: `public/fonts/`
- Sets proper MIME types:
  - `.woff` → `font/woff`
  - `.woff2` → `font/woff2`
- Sets appropriate cache headers for performance

### 2. Enhanced Font Loader Script

The enhanced `font-loader.js` script implements a fallback mechanism:

- First attempts to load fonts from the main application
- Falls back to the dedicated font server if the primary source fails
- Handles failures gracefully with helpful console messages
- Supports timeout to prevent indefinite loading

### 3. Next.js Application (Port 3001)

The Next.js application runs on a separate port to avoid conflicts:

- Runs on: `http://localhost:3001`
- Uses the font server for font resources
- Configured to work alongside the font server

## Quick Start

### Starting the Complete Solution

To start both the font server and Next.js application:

```bash
# Step 1: Start the font server on port 3000
./start-font-server-port-3000.sh

# Step 2: Start Next.js on port 3001
./start-nextjs-on-3001.sh
```

### Stopping the Servers

```bash
# Stop both servers at once
./stop-all-servers.sh

# Or stop them individually
./stop-font-server.sh
./stop-nextjs.sh
```

## Testing Font Loading

### Font Test Page

A dedicated font test page is available at `http://localhost:3000/font-test.html`. This page:

- Displays all available fonts
- Shows font loading status
- Provides debugging information
- Displays font network requests

### Browser Testing

1. Open the browser's developer tools (F12 or Cmd+Option+I)
2. Go to the Network tab
3. Filter for "font" or "woff"
4. Reload the page and verify fonts load with 200 status codes

## Troubleshooting

### Checking Server Status

```bash
# Check if the font server is running
lsof -i :3000 | grep LISTEN

# Check if Next.js is running
lsof -i :3001 | grep LISTEN
```

### Viewing Logs

```bash
# Font server logs
tail -f logs/font-server.log

# Next.js logs
tail -f logs/nextjs.log
```

### Testing Font Access

```bash
# Test direct access to a font file
curl -I http://localhost:3000/fonts/IBMPlexMono-Regular.woff2
```

### Common Issues

1. **ERR_CONNECTION_REFUSED**
   - Ensure the font server is running (`lsof -i :3000`)
   - Check `logs/font-server.log` for errors
   - Verify no firewall is blocking the connection

2. **Fonts not loading in the application**
   - Ensure `font-loader.js` is being included in your application
   - Check the browser console for error messages
   - Verify the fallback URL is correctly set to `http://localhost:3000`

3. **CORS errors**
   - If you see CORS errors, ensure the font server includes appropriate headers

## Font Files

The following font files are included:

- IBM Plex Mono: Regular (400), Medium (500), Bold (700)
- JetBrains Mono: Regular (400)
- VGA Font: Regular (400)
- Share Tech Mono: Regular (400)

## Script Reference

| Script | Description |
|--------|-------------|
| `start-font-server-port-3000.sh` | Starts just the font server on port 3000 |
| `start-nextjs-on-3001.sh` | Starts just the Next.js app on port 3001 |
| `start-nextjs-with-font-server.sh` | Starts both servers in the correct order |
| `stop-font-server.sh` | Stops just the font server |
| `stop-nextjs.sh` | Stops just the Next.js app |
| `stop-all-servers.sh` | Stops both servers |

## Technical Details

### HTTP Server Configuration

The font server uses Node.js's built-in HTTP module to serve files with the correct MIME types and cache headers:

```javascript
// Set proper MIME types for font files
const MIME_TYPES = {
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  // other MIME types...
};

// Add cache headers for fonts
if (extname === '.woff' || extname === '.woff2') {
  headers['Cache-Control'] = 'public, max-age=31536000';
}
```

### Font Loader Fallback Mechanism

The font loader implements a fallback mechanism:

```javascript
function loadFontWithFallback(font) {
  // First try the default URL
  const primaryFontFace = new FontFace(
    font.family,
    `url(${font.url})`,
    { weight: font.weight.toString() }
  );
  
  return primaryFontFace.load()
    .then(loadedFace => {
      console.log(`✅ Loaded font from primary URL: ${font.url}`);
      document.fonts.add(loadedFace);
      return loadedFace;
    })
    .catch(err => {
      // Try the fallback server instead
      const fallbackUrl = `${FALLBACK_FONT_SERVER}${font.url}`;
      console.log(`🔄 Trying fallback URL: ${fallbackUrl}`);
      
      // Fallback loading logic...
    });
}
```

## Further Improvements

Potential future enhancements:

1. **CDN Integration**: Move font hosting to a CDN for production
2. **Preloading**: Add font preloading with `<link rel="preload">` tags
3. **Font Subsetting**: Reduce font file sizes by subsetting
4. **Variable Fonts**: Implement variable fonts for more flexibility
5. **Font Loading API Enhancement**: Expand the font loader API for more control