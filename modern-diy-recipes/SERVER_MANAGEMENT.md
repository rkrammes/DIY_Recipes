# Server Management in DIY Formulations

This document explains the new consolidated server management system that replaces the numerous individual server scripts.

## Consolidated Scripts

We've simplified the server management with two main scripts:

1. `server.sh` - For managing server instances
2. `test-runner.sh` - For running tests

## Server Script

The `server.sh` script provides a unified interface for starting, stopping, and managing servers with various configurations.

### Basic Usage

```bash
# Start the server with default settings (NextJS on port 3000)
npm run server

# Start specific server modes
npm run server:dev       # Standard mode
npm run server:minimal   # Minimal mode
npm run server:formula   # Formula database mode
npm run server:document  # Document-centric mode

# Start with additional services
npm run server:with-api  # With API server
npm run server:with-font # With font server
npm run server:full      # With both API and font servers

# Server control
npm run server:stop     # Stop all servers
npm run server:restart  # Restart all servers
```

### Advanced Usage

For more advanced configurations, you can use the script directly with options:

```bash
# Start a specific server type on a custom port
./server.sh --type=express --port=3001

# Start with specific host binding
./server.sh --host=0.0.0.0

# Clean the cache before starting
./server.sh --clean

# Run in debug mode
./server.sh --debug

# Start with MCP integrations
./server.sh --with=context7,memory,supabase
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--mode=MODE` | Server mode (standard, minimal, document, formula) | standard |
| `--type=TYPE` | Server type (nextjs, express, static, http) | nextjs |
| `--port=PORT` | Port to run on | 3000 |
| `--host=HOST` | Host to bind to | localhost |
| `--clean` | Clean cache before starting | false |
| `--with-api` | Start with API server | false |
| `--with-font-server` | Start with Font server | false |
| `--with=INTEGRATIONS` | Comma-separated list of integrations | |
| `--debug` | Start in debug mode | false |
| `--stop` | Stop servers instead of starting | |
| `--restart` | Restart servers | |
| `--help` | Show help message | |

## Test Runner Script

The `test-runner.sh` script provides a unified interface for running different types of tests.

### Basic Usage

```bash
# Run all tests
npm run test:runner

# Run specific test types
npm run test:unit         # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:formulations # Formulation-related tests
npm run test:layouts      # Layout tests with server
npm run test:coverage     # Run tests with coverage
```

### Advanced Usage

For more advanced test configurations, you can use the script directly with options:

```bash
# Test a specific component
./test-runner.sh --component=RecipeList

# Run E2E tests with browser visible
./test-runner.sh --test=e2e --headless=false

# Run with verbose output
./test-runner.sh --verbose

# Skip linting
./test-runner.sh --skip-lint
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--test=TYPE` | Test type (all, unit, integration, e2e, etc.) | all |
| `--component=NAME` | Run tests for a specific component | |
| `--headless=BOOL` | Run in headless mode | true |
| `--with-server` | Start a server for tests | false |
| `--port=PORT` | Port for test server | 3000 |
| `--verbose` | Show verbose output | false |
| `--coverage` | Collect test coverage | false |
| `--skip-lint` | Skip linting | false |
| `--help` | Show help message | |

## MCP Integration

For MCP integrations, use the following simplified commands:

```bash
# Start with Context7 integration
npm run mcp:context7

# Start with Memory integration
npm run mcp:memory

# Start with Supabase integration
npm run mcp:supabase
```

## Why This Approach?

The new consolidated scripts provide several benefits:

1. **Reduced Complexity**: Instead of dozens of separate scripts, we now have just two main scripts with options
2. **Consistency**: All server operations follow the same patterns and conventions
3. **Flexibility**: Easy to combine options for custom configurations
4. **Documentation**: Clear, centralized documentation of all options
5. **Maintainability**: Easier to update and modify in one place

## Legacy Scripts

The legacy scripts are still available in package.json under the "Legacy Scripts" section, but we recommend using the new consolidated scripts for all new development.