# Script Migration Guide

## Overview
We've consolidated 59 individual start scripts into 3 main scripts for better maintainability.

## Main Scripts

### 1. `./server.sh` - Main server management
The primary script for all server operations with flexible options.

### 2. `./dev.sh` - Quick development start
Convenience wrapper for common development setup.

### 3. `./prod.sh` - Production build & start
Handles production builds and deployment.

## Migration Table

| Old Script | New Command |
|------------|-------------|
| `start-port-3000.sh` | `./server.sh --port=3000` |
| `start-port-8080.sh` | `./server.sh --port=8080` |
| `start-with-mock-data-3000.sh` | `NEXT_PUBLIC_USE_MOCK_DATA=true ./dev.sh` |
| `start-without-mock-data-3000.sh` | `NEXT_PUBLIC_USE_MOCK_DATA=false ./dev.sh` |
| `start-terminal-interface.sh` | `./server.sh --mode=terminal` |
| `start-formula-database.sh` | `./server.sh --mode=formula` |
| `start-document-mode.sh` | `./server.sh --mode=document` |
| `start-with-api.sh` | `./server.sh --with-api` |
| `start-with-font-server.sh` | `./server.sh --with-font-server` |
| `start-with-supabase.sh` | `./server.sh --with=supabase` |
| `start-with-context7.sh` | `./server.sh --with=context7` |
| `start-clean.sh` | `./server.sh --clean` |
| `verified-start-3000.sh` | `./dev.sh` (with real data) |

## NPM Scripts
You can also use npm scripts for common operations:

```bash
npm run dev                  # Standard Next.js dev
npm run server               # Use server.sh
npm run server:formula       # Formula database mode
npm run server:document      # Document mode
npm run server:full          # With API and font server
npm run server:stop          # Stop all servers
npm run server:restart       # Restart servers
```

## Environment Variables
Control behavior with environment variables:

```bash
# Use mock data (development)
NEXT_PUBLIC_USE_MOCK_DATA=true ./dev.sh

# Use real Supabase data
NEXT_PUBLIC_USE_MOCK_DATA=false ./dev.sh

# Custom port
PORT=8080 ./dev.sh
```

## Examples

### Development with mock data:
```bash
./dev.sh
```

### Development with real Supabase data:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false ./dev.sh
```

### Production build and start:
```bash
./prod.sh
```

### Start with all features:
```bash
./server.sh --with-api --with-font-server --with=context7,supabase
```

### Clean start on port 3001:
```bash
./server.sh --clean --port=3001
```

## Archived Scripts
All old scripts have been moved to `legacy-scripts/` directory. They are no longer maintained but kept for reference.