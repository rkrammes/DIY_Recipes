# Official MCP Servers Guide (Updated April 2025)

## Overview
Model Context Protocol (MCP) servers expose data sources and platform APIs to LLMs in a standardized way.

---

## Official MCP Servers & SDKs

### GitHub MCP Server
- **Repository:** [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- **Install:** `npx -y @modelcontextprotocol/server-github`
- **Default URL:** `http://localhost:3000`
- **Capabilities:** Repository management, PRs, issues, file operations, search.

### Supabase MCP Server
- **Managed endpoint only:**
  Supabase provides a **hosted MCP API**, no npm package.
- **Express-based custom implementation:**
  Use internal Express server (runs on `http://localhost:3002`) exposing database and auth tools.
- **Python-based "Query MCP" implementation (Recommended):**
  A more robust alternative with read/write capabilities:
  - **Repository:** [alexander-zuev/supabase-mcp-server](https://github.com/alexander-zuev/supabase-mcp-server)
  - **Install:** `pipx install supabase-mcp-server`
  - **Features:** SQL execution, Management API, Auth Admin, migration versioning
  - **Safety:** Built-in controls for read-only, write, and destructive operations
- **Recommendation:**
  Use the Python-based "Query MCP" implementation for the most comprehensive feature set, or the Express-based custom server for simpler needs. Ensure only one Supabase registration in `mcp_settings.json`.

### Next.js + TypeScript MCP
- **SDK:** [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **Usage:** Embedded in Next.js app, no standalone server.
- **Capabilities:** Project scaffolding, component generation, type checking, code analysis.

### Vercel MCP Server
- **Template:** [Vercel MCP Server Template](https://vercel.com/templates/other/model-context-protocol-mcp-with-vercel-functions)
- **Deployment:** Deploy to Vercel, URL will be your Vercel app URL.
- **Capabilities:** Deployment automation, environment management.

---

## Best Practices for MCP Configuration in Roo Code

- **Avoid duplicate registrations** of the same MCP server.
- **Use descriptive, unique names**: `github`, `supabase`, `vercel`.
- **Supabase:** Register only one MCP server, either managed or custom.
- **Next.js SDK:** No need to register if embedded.
- **Check `mcp_settings.json` first:** Some servers (e.g., GitHub, Brave Search, Puppeteer) might already be configured by default or via setup scripts.
- **Restart Roo Code** after modifying MCP settings.

---

## Example `mcp_settings.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    },
    "supabase-express": {
      "command": "node",
      "args": ["path/to/supabase-mcp-server.js"],
      "env": {
        "SUPABASE_URL": "https://your-project-ref.supabase.co",
        "SUPABASE_KEY": "your-supabase-key"
      },
      "port": 3002
    },
    "supabase-python": {
      "command": "supabase-mcp-server",
      "env": {
        "QUERY_API_KEY": "your-api-key-from-thequery.dev",
        "SUPABASE_PROJECT_REF": "your-project-ref",
        "SUPABASE_DB_PASSWORD": "your-db-password",
        "SUPABASE_REGION": "us-east-2",
        "SUPABASE_ACCESS_TOKEN": "your-access-token",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@vercel/mcp-server"],
      "env": {
        "VERCEL_TOKEN": "your-vercel-token"
      }
    }
  }
}
```

> Note: Choose either `supabase-express` OR `supabase-python`, not both.

- Adjust URLs if running servers on different ports or deployed remotely.
- Remove any duplicate Supabase entries.
- Add new servers as needed following this format.

---

## Summary

- Use the **official GitHub MCP** via npm.
- For Supabase, consider the **Python-based "Query MCP"** (`pipx install supabase-mcp-server`) for comprehensive features, or maintain the **Express-based custom Supabase MCP** for simpler needs.
- Embed the **Next.js MCP SDK** inside your app.
- Deploy the **Vercel MCP** via the provided template.
- Register these servers in `mcp_settings.json` for Roo Code detection.