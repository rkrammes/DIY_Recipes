# Running DIY Formulations on Port 3000

This guide explains how to run the DIY Formulations application on port 3000 with the enhanced environment validation system.

## Quick Start

```bash
# Run with default settings (terminal UI mode)
./start-app-on-3000.sh

# OR for Windows users
start-app-on-3000.bat
```

Then visit: http://localhost:3000

## Command-Line Options

The enhanced scripts support several command-line options:

| Option | Description |
|--------|-------------|
| `--use-mock-data` or `-m` | Use mock data instead of Supabase |
| `--dev-auth` | Enable automatic development authentication |

## Examples

```bash
# Run with mock data (no Supabase required)
./start-app-on-3000.sh --use-mock-data

# Run with development authentication
./start-app-on-3000.sh --dev-auth

# Combine options
./start-app-on-3000.sh --use-mock-data --dev-auth
```

## Environment Configuration

The script automatically sets these environment variables:

- `PORT=3000`
- `NEXT_PUBLIC_PORT=3000`
- `NEXT_PUBLIC_UI_MODE=terminal`
- `NEXT_PUBLIC_ENABLE_MODULES=true`
- `NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING=true`
- `NEXT_PUBLIC_TERMINAL_UI_ENABLED=true`

For more advanced configuration, you can:

1. Create a `.env.local` file in the project root
2. Define your custom environment variables
3. Run the application with the script

## Checking Environment Status

While the application is running, you can view the environment status:

1. Navigate to http://localhost:3000/settings
2. Go to the "System" tab
3. Check the "Environment" section

Or toggle the environment status panel by clicking the "Show Env" button in the bottom-right corner of any page (development mode only).

## Troubleshooting

### Port Already in Use

If port 3000 is already in use and the script can't free it automatically:

```bash
# Find the process using port 3000
lsof -i :3000    # Mac/Linux
netstat -ano | findstr :3000    # Windows

# Kill the process manually
kill -9 <PID>    # Mac/Linux
taskkill /F /PID <PID>    # Windows
```

### Supabase Connection Issues

If you encounter Supabase connection issues:

1. Check that you have the right environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Run with mock data as a fallback:
   ```bash
   ./start-app-on-3000.sh --use-mock-data
   ```

### Environment Validation

To manually check your environment configuration:

```bash
node scripts/check-env.js
```

This script will validate your environment variables and detect any conflicts.

## Legacy Approaches

You can also use these legacy approaches to run on port 3000:

```bash
# Use the no-mock-data approach (for Supabase transparent errors)
./run-no-mock-data-fix.sh

# Use the standard port 3000 script (less features)
./start-port-3000.sh
```

## Related Documentation

For more information, see:
- [Environment Configuration Guide](./docs/ENVIRONMENT_CONFIGURATION_GUIDE.md)
- [Supabase Security Guide](./docs/SUPABASE_SECURITY_GUIDE.md)
- [Port 3000 Solution](./PORT_3000_SOLUTION.md)