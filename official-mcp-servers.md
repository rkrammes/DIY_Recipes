# Official MCP Servers Guide

## Overview
Model Context Protocol (MCP) servers expose data sources and platform APIs to Large Language Models (LLMs) in a standardized, secure way. They enable LLM apps to interact with GitHub, Supabase, Next.js, Vercel, and more via tools and resources.

---

## GitHub MCP Server

### Repository
[modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

### Installation
```bash
npm install -g @modelcontextprotocol/server-github
# or via npx
npx -y @modelcontextprotocol/server-github
```

### Configuration
- `GITHUB_TOKEN`: Personal access token with repo/read/write permissions
- Optionally configure repo scope or org filters

### Available Tools
- `github_search_repositories`: Search repos
- `github_get_file_contents`: Fetch file/directory contents
- `github_create_issue`: Create issues
- `github_create_pull_request`: PR operations
- `github_push_files`: Commit changes
- and more (full list in repo)

### Usage Example
```json
{
  "server_name": "github",
  "tool_name": "github_search_repositories",
  "arguments": {
    "query": "org:my-org topic:mcp"
  }
}
```

### Integration
- Connect as an MCP server endpoint
- Use with SDK clients or LLM agents

---

## Supabase MCP Server

### Documentation
[Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)

### Installation
Supabase provides a managed MCP server; no install needed. Alternatively, deploy your own:

```bash
npm install -g @modelcontextprotocol/server-supabase
# or
npx -y @modelcontextprotocol/server-supabase
```

### Configuration
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Service role key (with read/write access)

### Tools
- Query tables
- Generate TypeScript types
- Manage schemas

### Usage
Connect via MCP client with your Supabase credentials.

---

## Next.js / TypeScript MCP Integration

### SDK Repository
[modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)

### Installation
```bash
npm install @modelcontextprotocol/typescript-sdk
```

### Usage
Embed MCP client/server inside your Next.js app for custom tools or resource access.

### Example
```typescript
import { createServer } from '@modelcontextprotocol/typescript-sdk';

const server = createServer({
  tools: [/* your tools */]
});
```

---

## Vercel MCP Server

### Template
[Vercel MCP Server Template](https://vercel.com/templates/other/model-context-protocol-mcp-with-vercel-functions)

### Deployment
- Use the template to deploy an MCP server as Vercel serverless functions
- Customize tools for deployments, domains, env vars, etc.

### Configuration
- `VERCEL_TOKEN`: Personal access token
- Project/team IDs as needed

### Usage
Connect your LLM apps to the deployed MCP endpoint.

---

## Configuration Best Practices
- Store tokens in `.env` files, not in code
- Use least privilege tokens
- Rotate secrets regularly
- Limit server access via IP allowlists or auth

---

## Troubleshooting
- **Permission denied (EACCES) during global install:** Use `sudo npm install -g` to grant necessary permissions.
- **Supabase MCP server install fails with 404:** The package `@modelcontextprotocol/server-supabase` is not available on npm. Supabase currently provides a managed MCP server; follow their hosted setup instead.
- **Auth errors:** Check tokens and scopes.
- **Connection issues:** Verify server URL and network.
- **Tool errors:** Confirm request schema matches tool input.
- Enable verbose logs for debugging.

---
## Roo Code Integration & Visibility

### Ensuring MCP Servers Appear in Roo Code

- **Start each MCP server** with correct tokens and configs.
- Use **unique, descriptive server names** (e.g., `github`, `supabase`, `vercel`, `custom-xyz`).
- Roo Code automatically detects reachable MCP servers by these names.
- For persistent integration, configure Roo Code's MCP settings or UI to include these servers if applicable.
- **GitHub MCP server:** Appears as `github` when running.
- **Custom servers:** Must be running and expose MCP protocol with unique names.

### Verification Process

1. **Launch Roo Code.**
2. **Start each MCP server** (`npx -y @modelcontextprotocol/server-github`, etc.).
3. **Open the MCP Servers tab** in Roo Code.
4. Confirm servers appear under their configured names.
5. Test by invoking a simple tool (e.g., `get_file_contents`).

### Troubleshooting Visibility Issues

- **Server not running:** Ensure MCP server process is active.
- **Wrong server name:** Use the expected server name string.
- **Port conflicts:** Check that each server listens on a unique, reachable port.
- **Network issues:** Verify localhost or remote server connectivity.
- **Token/auth errors:** Confirm correct tokens are supplied.
- **Roo Code cache:** Restart Roo Code if new servers do not appear.
- **Custom servers:** Ensure they implement the MCP protocol correctly.

---
## Summary
Use the official MCP servers and SDKs for GitHub, Supabase, Next.js, and Vercel to ensure secure, maintainable, and standardized integration of LLMs with your core platforms.
Use the official MCP servers and SDKs for GitHub, Supabase, Next.js, and Vercel to ensure secure, maintainable, and standardized integration of LLMs with your core platforms.