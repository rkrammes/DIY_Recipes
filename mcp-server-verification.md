# MCP Server Verification Report

## 1. Startup Commands

### GitHub MCP Server
```bash
npx -y @modelcontextprotocol/server-github
```
or with token inline:
```bash
GITHUB_TOKEN=your_token npx -y @modelcontextprotocol/server-github
```

### Supabase MCP Server
```bash
node mcp-servers/supabase-mcp-server.js
```

Ensure your `.env` contains the required credentials.

---

## 2. Roo Code MCP Servers Tab Verification
- Open Roo Code in VSCode.
- Navigate to **MCP Servers** tab.
- Confirm both **GitHub** and **Supabase** servers appear.
- If not, check server logs for errors.

---

## 3. Run Verification Script
Execute:
```bash
node verify-mcp-servers.js
```
Expected output:
- `[GitHub MCP] Success:` with API response.
- `[Supabase MCP] Success:` with API response.

---

## 4. Screenshots / Terminal Output

_Add screenshots of Roo Code MCP Servers tab showing both servers registered._

_Add terminal output from running the verification script._

---

## 5. Issues Encountered & Solutions

| Issue                                         | Solution                                             |
|-----------------------------------------------|------------------------------------------------------|
| Server does not appear in Roo Code            | Check server process logs, ensure no port conflicts  |
| Authentication failures                       | Verify tokens/keys in `.env`                         |
| Roo Code can't connect to MCP server          | Check firewall, network settings                     |
| Unexpected tool errors                        | Confirm tool parameters, check server compatibility  |

---

## 6. Recommendations for Production

- Use persistent environment variables or secret managers.
- Secure MCP servers with authentication/firewalls.
- Use process managers (PM2, systemd) to keep servers running.
- Monitor logs and resource usage.
- Regularly update MCP server packages.