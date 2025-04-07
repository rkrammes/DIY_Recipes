# MCP Server Verification Report

*Date: April 7, 2025*

This report details the verification status of MCP servers configured in `mcp_settings.json` for the DIY Recipes project, as tested via Roo Code.

## 1. Configured Servers & Startup Commands

Based on `/Users/ryankrammes/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`:

### GitHub (`github`)
```bash
# As configured in mcp_settings.json
GITHUB_TOKEN=your_token npx -y @modelcontextprotocol/server-github
```

### Brave Search (`brave-search`)
```bash
# As configured in mcp_settings.json
BRAVE_API_KEY=your_key npx -y @modelcontextprotocol/server-brave-search
```

### Puppeteer (`puppeteer`)
```bash
# As configured in mcp_settings.json
npx -y @modelcontextprotocol/server-puppeteer
```

### Supabase Custom (`supabase-custom`)
```bash
# As configured in mcp_settings.json (after modifications)
# Ensure required env vars (SUPABASE_URL, SUPABASE_KEY, etc.) are set
node /Users/ryankrammes/Documents/GitHub/DIY_Recipes/mcp-servers/supabase-mcp-server.js
```
*(Note: The original script `mcp-servers/supabase-mcp-server.js` required modification to use ES Module imports)*

---

## 2. Roo Code MCP Servers Tab & Tool Verification

Verification was performed by attempting to use basic tools for each configured server directly through Roo Code.

**Verification Result (April 7, 2025):**

-   **GitHub (`github`):** Visible in Roo Code. **FUNCTIONAL**. Successfully executed `search_repositories`. Initial `get_file_contents` failed ("Not Found"), likely due to incorrect repo/path args, not server issue.
-   **Brave Search (`brave-search`):** Visible in Roo Code. **FUNCTIONAL**. Successfully executed `brave_web_search`.
-   **Puppeteer (`puppeteer`):** Visible in Roo Code. **FUNCTIONAL**. Successfully executed `puppeteer_navigate`.
-   **Supabase Custom (`supabase-custom`):** Visible in Roo Code. **NON-FUNCTIONAL**. Consistently failed with "Not connected" error when attempting to use `get_schemas`, despite multiple configuration fixes in `mcp_settings.json` (see Issues section).

---

## 3. Verification Script (`verify-mcp-servers.js`)

*Note: The `verify-mcp-servers.js` script was not executed as part of this verification process. Verification was performed using direct tool invocation via Roo Code.*

*(Previous script run results from April 6, 2025, are retained below for historical context but may not reflect the current state, especially for the Supabase server.)*

```bash
# node verify-mcp-servers.js # Not run during this verification
```
Expected output (if run and working):
- `[GitHub MCP] Success:` with API response.
- `[Brave MCP] Success:` with API response.
- `[Puppeteer MCP] Success:` with API response.
- `[Supabase MCP] Success:` with API response.

*(Previous Mocked Output)*
```
Testing MCP Server: github
Invoking search_repositories on github with { query: 'language:javascript', perPage: 1 }
window.mcp.callTool not available, using mock response
[GitHub MCP] Success: { ... }
Testing MCP Server: supabase
Invoking query_data on supabase with { sql: 'SELECT 1' }
window.mcp.callTool not available, using mock response
[Supabase MCP] Success: { ... }
```

---

## 4. Screenshots / Terminal Output

-   **GitHub, Brave Search, Puppeteer** servers confirmed functional via direct tool tests in Roo Code.
-   **Supabase Custom** server failed connection tests via Roo Code.

*(Screenshots of the Roo Code MCP Servers tab showing server status would be beneficial here.)*

---

## 5. Issues Encountered & Solutions

| Issue                                                     | Attempted Solutions                                                                                                                                                                                             | Status      |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| Server does not appear in Roo Code                        | Check server process logs, ensure no port conflicts                                                                                                                                                             | N/A         |
| Authentication failures                                   | Verify tokens/keys in `.env` / `mcp_settings.json`                                                                                                                                                              | N/A         |
| Roo Code can't connect to MCP server                      | Check firewall, network settings                                                                                                                                                                                | N/A         |
| Unexpected tool errors                                    | Confirm tool parameters, check server compatibility                                                                                                                                                             | N/A         |
| **`supabase-custom` "Not connected" error in Roo Code** | - Fixed script (`supabase-mcp-server.js`) to use ES Module `import`.<br>- Updated `mcp_settings.json`: corrected `command` to `node`, added script path to `args`.<br>- Added required `SUPABASE_URL`/`KEY` to `env` in `mcp_settings.json`.<br>- Updated `args` to use absolute script path.<br>- Added `port: 3002` to `mcp_settings.json`.<br>- Manually stopped conflicting process. | **Ongoing** |

---

## 6. Recommendations for Production

-   Use persistent environment variables or secret managers for credentials.
-   Secure MCP servers with authentication/firewalls.
-   Use process managers (PM2, systemd) to keep servers running reliably.
-   Monitor logs and resource usage.
-   Regularly update MCP server packages.
-   **Consider replacing the current JavaScript-based `supabase-custom` server with the Python-based "Query MCP" implementation.** See alternative implementation section below.

## 7. Alternative Supabase MCP Implementation

Based on web research, we recommend evaluating the "Query MCP" Python-based Supabase MCP server by Alexander Zuev. This implementation offers comprehensive Supabase integration with both read and write capabilities:

### Features
- **Full Read/Write Support**: Execute any PostgreSQL query with built-in safety controls
- **Management API Access**: Programmatic access to Supabase Management API
- **Auth Admin Tools**: User management via Supabase Auth Admin SDK
- **Automatic Migration Versioning**: Database changes are automatically versioned
- **Safety Controls**: Three-tier safety system for SQL operations (safe, write, destructive)

### Installation
```bash
# Install with pipx (recommended)
pipx install supabase-mcp-server

# Or with uv
uv pip install supabase-mcp-server
```

### Configuration for Roo Code
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
      "port": 3000,
      "disabled": false,
      "alwaysAllow": [
        "get_table_schema",
        "live_dangerously",
        "execute_postgresql",
        "get_schemas",
        "get_tables",
        "call_auth_admin_method"
      ]
    }
  }
}
```

### Source
- GitHub Repository: [alexander-zuev/supabase-mcp-server](https://github.com/alexander-zuev/supabase-mcp-server)
