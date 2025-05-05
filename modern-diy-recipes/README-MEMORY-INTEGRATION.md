# DIY Recipes with Memory Agent Integration

This document explains the server stability fixes implemented and how to use the new memory agent integration for development tracking.

## Server Stability Fixes

The DIY Recipes application was experiencing server stability issues due to:

1. **Circular Dependencies**
   - ThemeProvider importing from animation modules
   - AnimationProvider importing from ThemeProvider
   - These circular imports caused Next.js to crash during server-side rendering

2. **Browser API Access During SSR**
   - Components accessing browser-only APIs like localStorage and AudioContext during server rendering
   - Missing checks for server vs client environment

3. **Provider Initialization Order**
   - Providers were not properly ordered by dependencies
   - Side effects were triggered in the wrong order

### How We Fixed It

1. **Provider Restructuring**
   - Implemented a clear provider hierarchy with AuthProvider at the top
   - Separated ThemeProvider, AudioProvider, and AnimationProvider to break circular dependencies
   - Used DOM attributes (`data-theme`) for inter-provider communication instead of direct imports

2. **SSR Safety Measures**
   - Added client-side only mounting state to prevent hydration mismatches
   - Implemented proper checks for `typeof window === 'undefined'`
   - Created fallback rendering during SSR

3. **Fixed Layout Component**
   - Created a dedicated `fixed-layout.tsx` that properly orders all providers
   - Dynamically imports client components to prevent SSR issues
   - Uses React Fragment or McpAuthProvider based on environment

## Memory Agent Integration

The application now integrates with a Memory Agent that tracks development progress, decisions, and context across sessions.

### What the Memory Agent Does

1. **Development Tracking**
   - Records tasks and their current status
   - Tracks development sessions
   - Monitors progress over time

2. **Decision Recording**
   - Documents architectural and implementation decisions
   - Preserves the context and rationale for choices
   - Maintains history of alternatives considered

3. **Integration Monitoring**
   - Tracks the status of external services and integrations
   - Monitors API endpoints and their health
   - Records configuration details

### How to Use the Memory Agent

#### Starting a Development Session

Use the new start script that integrates the Memory Agent:

```bash
./start-with-memory.sh
```

This script:
1. Initializes the Memory Agent
2. Cleans the Next.js cache
3. Records the start of a development session
4. Starts the Next.js development server
5. Records the end of the session when you exit

#### Available Memory Agent Commands

During development, you can interact with the Memory Agent in a separate terminal:

```bash
node ../../start-development.js
```

This provides an interactive shell with these commands:

- `tasks` - Show current tasks
- `record-decision` - Record a new architecture or implementation decision
- `record-task` - Record a new development task
- `update-task [id]` - Update a task's status
- `service-status` - Check integration status
- `end-session` - End the current development session

#### Memory Agent API

The Memory Agent also exposes an API at `http://localhost:3001/memory/` with these endpoints:

- `POST /recordTask` - Record or update a task
- `POST /recordDecision` - Record a decision
- `POST /recordIntegrationStatus` - Record integration status
- `GET /getTasks` - Get tasks with optional filters
- `GET /getDecisions` - Get decisions with optional filters
- `GET /getIntegrationStatuses` - Get integration statuses
- `GET /getStatusSummary` - Get overall development status

## Best Practices

1. **Start Every Session with Memory Agent**
   - Always use `./start-with-memory.sh` to ensure development tracking
   - Check current tasks at the beginning of each session

2. **Record Important Decisions**
   - Document architectural choices
   - Record implementation approaches
   - Note alternatives considered

3. **Update Task Status**
   - Mark tasks as in_progress when you start working on them
   - Update to completed when finished
   - Add notes about problems encountered

4. **Server Stability**
   - Maintain proper provider ordering
   - Always check for browser API access during SSR
   - Use mounted state for client components

## Troubleshooting

### Server Crashes During Development

If the server still crashes:

1. Use the minimal implementation with:
   ```bash
   ./start-minimal.sh
   ```

2. Check the logs for circular dependency warnings:
   ```bash
   grep -i circular logs/dev-server.log
   ```

3. Verify that browser APIs are properly guarded:
   ```bash
   grep -i "window\." src/**/*.tsx
   ```

### Memory Agent Issues

If the Memory Agent is not responding:

1. Check if it's running:
   ```bash
   ps aux | grep start-development
   ```

2. Restart it if needed:
   ```bash
   node ../../start-development.js
   ```

3. Verify environment variables are set correctly for MCP access

---

## Future Improvements

1. Full test coverage for all providers
2. Automated circular dependency detection
3. Memoization of provider values for better performance
4. Integration of Memory Agent with CI/CD pipeline

---

Created with DIY Recipes Memory Agent - 2025-05-04