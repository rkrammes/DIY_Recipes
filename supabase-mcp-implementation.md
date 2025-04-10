# Supabase MCP Server Implementation Guide

## Issue Analysis

The current Supabase MCP server implementation is experiencing connectivity issues, specifically:

```
SSE error: Invalid content type, expected "text/event-stream"
```

This error indicates that the client is attempting to establish a Server-Sent Events (SSE) connection, but the server is not responding with the correct content type.

## Current Implementation Issues

The current implementation in `mcp-servers/supabase-mcp-server.cjs` has several limitations:

1. It uses a traditional Express.js REST API approach with regular HTTP endpoints
2. It lacks SSE (Server-Sent Events) support, which is required by the MCP protocol
3. It doesn't set the `Content-Type: text/event-stream` header for SSE connections
4. It doesn't maintain an open connection for streaming updates

## Solution Options

### Option 1: Modify the Express-based Implementation

The existing Express-based implementation (`supabase-mcp-server.cjs`) can be updated to support SSE by:

1. Adding the `@modelcontextprotocol/server-core` library
2. Implementing proper SSE endpoints with the correct content type
3. Maintaining open connections for streaming updates

```javascript
// Example implementation (for reference only)
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { createMcpServer } = require('@modelcontextprotocol/server-core');
const dotenv = require('dotenv');

dotenv.config();

// ... existing code ...

// Create MCP server with SSE support
const mcpServer = createMcpServer({
  name: "supabase-custom-server",
  version: "1.0.0",
  tools: {
    query_data: async ({ sql }) => {
      const { data, error } = await supabase.rpc('execute_raw_sql', { query: sql });
      if (error) throw error;
      return data;
    },
    // ... other tools ...
  }
});

// Integrate with Express
app.use(mcpServer.middleware());

// ... rest of the implementation ...
```

### Option 2: Use the Python-based "Query MCP" Implementation (Recommended)

As mentioned in both the `official-mcp-servers.md` and `mcp-server-verification.md` files, the Python-based "Query MCP" implementation is recommended for more comprehensive features:

1. Install using `pipx install supabase-mcp-server`
2. Configure in `mcp_settings.json` with the appropriate credentials
3. Ensure the Python environment is properly set up

```json
{
  "mcpServers": {
    "supabase-custom": {
      "command": "supabase-mcp-server",
      "env": {
        "QUERY_API_KEY": "your-api-key-from-thequery.dev",
        "SUPABASE_PROJECT_REF": "your-project-ref",
        "SUPABASE_DB_PASSWORD": "your-db-password",
        "SUPABASE_REGION": "us-east-2",
        "SUPABASE_ACCESS_TOKEN": "your-access-token",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      },
      "port": 3000
    }
  }
}
```

## Implementation Steps

### For Option 1 (Express-based solution):

1. Install the required dependencies:
   ```bash
   npm install @modelcontextprotocol/server-core
   ```

2. Create a new file `mcp-servers/supabase-mcp-server.js` with ES Module syntax and SSE support

3. Update the configuration in VSCode's `mcp_settings.json` to point to the new file

4. Restart the MCP server and VSCode

### For Option 2 (Python-based solution):

1. Install the Python-based implementation:
   ```bash
   pipx install supabase-mcp-server
   ```

2. Configure the environment variables based on your Supabase project:
   - `QUERY_API_KEY`: API key from thequery.dev
   - `SUPABASE_PROJECT_REF`: Your project reference
   - `SUPABASE_DB_PASSWORD`: Database password
   - `SUPABASE_REGION`: Region (e.g., us-east-2)
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key

3. Update the configuration in VSCode's `mcp_settings.json` to use the Python implementation

4. Restart the MCP server and VSCode

## Conclusion

The SSE error is occurring because the current Express-based implementation doesn't support Server-Sent Events, which is required by the MCP protocol. To fix this, either:

1. Update the Express implementation to use the `@modelcontextprotocol/server-core` library for proper SSE support, or
2. Switch to the recommended Python-based "Query MCP" implementation for more comprehensive features

The Python-based implementation is recommended as it provides more features and is specifically designed for Supabase integration with the MCP protocol.