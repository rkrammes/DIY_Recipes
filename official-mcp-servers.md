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
- **Custom implementation:**  
  Use internal Express server (runs on `http://localhost:3002`) exposing database and auth tools.
- **Recommendation:**  
  Use the custom server, ensure only one registration in `mcp_settings.json`.

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
  "servers": [
    {
      "name": "github",
      "url": "http://localhost:3000"
    },
    {
      "name": "supabase",
      "url": "http://localhost:3002"
    },
    {
      "name": "vercel",
      "url": "https://your-vercel-mcp.vercel.app"
    }
  ]
}
```

- Adjust URLs if running servers on different ports or deployed remotely.
- Remove any duplicate Supabase entries.
- Add new servers as needed following this format.

---

## Summary

- Use the **official GitHub MCP** via npm.
- Maintain the **custom Supabase MCP** until Supabase offers an installable server.
- Embed the **Next.js MCP SDK** inside your app.
- Deploy the **Vercel MCP** via the provided template.
- Register these servers in `mcp_settings.json` for Roo Code detection.