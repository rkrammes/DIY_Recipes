# Vercel MCP Server Setup & Usage

## Overview
This MCP server provides integration with Vercel's deployment platform, exposing deployment and environment management capabilities through the MCP protocol.

---

## Installation & Setup

1. **Install dependencies**
   
   ```
   npm install express axios dotenv
   ```

2. **Environment Variables**

   Create a `.env` file with:

   ```
   VERCEL_TOKEN=your_vercel_api_token
   VERCEL_TEAM_ID=your_team_id_optional
   VERCEL_PROJECT_ID=your_project_id_optional
   ```

   - `VERCEL_TOKEN` (required): Your Vercel API token.
   - `VERCEL_TEAM_ID` (optional): Your Vercel team ID.
   - `VERCEL_PROJECT_ID` (optional): Default project ID.

3. **Run the server**

   ```
   node mcp-servers/vercel-mcp-server.js
   ```

   The server listens on port **3003**.

---

## Available Tools

All tools are accessible via HTTP POST:

```
POST http://localhost:3003/tool/{tool_name}
Content-Type: application/json
```

### 1. `deploy_project`

Deploys the latest commit of a project.

**Parameters:**

| Name       | Type   | Required | Description                     |
|------------|--------|----------|--------------------------------|
| projectId  | string | Yes      | Vercel project ID              |
| teamId     | string | No       | Vercel team ID                 |

---

### 2. `get_deployments`

Lists recent deployments.

**Parameters:**

| Name       | Type    | Required | Description                     |
|------------|---------|----------|--------------------------------|
| projectId  | string  | Yes      | Vercel project ID              |
| teamId     | string  | No       | Vercel team ID                 |
| limit      | integer | No       | Number of deployments to fetch |

---

### 3. `get_deployment_status`

Gets status of a specific deployment.

**Parameters:**

| Name         | Type   | Required | Description             |
|--------------|--------|----------|-------------------------|
| deploymentId | string | Yes      | Deployment ID           |
| teamId       | string | No       | Vercel team ID          |

---

### 4. `set_environment_variables`

Sets environment variables for a project.

**Parameters:**

| Name       | Type    | Required | Description                     |
|------------|---------|----------|--------------------------------|
| projectId  | string  | Yes      | Vercel project ID              |
| envVars    | array   | Yes      | Array of env var objects       |
| teamId     | string  | No       | Vercel team ID                 |

Each env var object:

```json
{
  "key": "MY_ENV_VAR",
  "value": "my_value",
  "target": ["production", "preview", "development"],
  "type": "encrypted"
}
```

---

### 5. `create_preview_deployment`

Creates a preview deployment.

**Parameters:**

| Name       | Type   | Required | Description            |
|------------|--------|----------|------------------------|
| projectId  | string | Yes      | Vercel project ID      |
| teamId     | string | No       | Vercel team ID         |

---

## Example Usage

See `test-vercel-mcp.js` for a script demonstrating all tool calls.

---

## Integration Points

- Use MCP client to invoke these tools programmatically.
- Chain deployment and status checks in your CI/CD workflows.
- Manage environment variables dynamically via MCP tooling.
- Extend or customize by adding more tools as needed.

---

## Notes

- Ensure your API token has sufficient permissions.
- For detailed API behavior, refer to [Vercel REST API docs](https://vercel.com/docs/rest-api).