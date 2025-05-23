# Server Scripts Guide

## Overview
We've consolidated our server management into 4 main scripts for better maintainability and consistency.

## Main Scripts

### 🚀 `./dev.sh`
Quick start for development with sensible defaults.
```bash
./dev.sh                    # Start with mock data
NEXT_PUBLIC_USE_MOCK_DATA=false ./dev.sh  # Start with real Supabase data
```

### 🔧 `./server.sh`
Full-featured server management with all options.
```bash
./server.sh --help          # Show all options
./server.sh --port=3001     # Custom port
./server.sh --mode=formula  # Formula database mode
./server.sh --with-api      # Include API server
./server.sh --stop          # Stop all servers
```

### 📦 `./prod.sh`
Production build and deployment.
```bash
./prod.sh                   # Build and start production server
```

### 🧪 `./test-runner.sh`
Consolidated test execution.
```bash
./test-runner.sh            # Run all tests
./test-runner.sh --test=unit  # Run unit tests only
```

## Quick Start Examples

### Development Scenarios

**Basic development:**
```bash
./dev.sh
```

**Development with real data:**
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false ./dev.sh
```

**Formula database mode:**
```bash
./server.sh --mode=formula
```

**With all features:**
```bash
./server.sh --with-api --with-font-server --with=context7,supabase
```

### Server Management

**Stop all servers:**
```bash
./server.sh --stop
```

**Restart servers:**
```bash
./server.sh --restart
```

**Clean cache and start:**
```bash
./server.sh --clean
```

## NPM Scripts
You can also use npm scripts:
```bash
npm run dev                 # Basic Next.js dev
npm run server:formula      # Formula database mode
npm run server:full         # With API and font server
npm run server:stop         # Stop servers
```

## Environment Variables

Control server behavior with environment variables:

```bash
# Data source
NEXT_PUBLIC_USE_MOCK_DATA=true/false

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Server configuration
PORT=3000
HOST=localhost
```

## Legacy Scripts
Previous individual scripts have been archived in `legacy-scripts/` directory. See `SCRIPT_MIGRATION_GUIDE.md` for migration instructions.