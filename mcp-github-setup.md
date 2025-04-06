# GitHub MCP Server Setup & Usage

## Overview
This guide explains how to install, configure, and use the GitHub MCP server (`@modelcontextprotocol/server-github`) to enable source control automation.

---

## 1. Prerequisites

- **Node.js** installed
- A **GitHub Personal Access Token (PAT)** with:
  - `repo` (full control of private repositories)
  - `admin:repo_hook` (manage webhooks)
- Recommended to store the token securely in your `.env` file:

```
GITHUB_TOKEN=your_personal_access_token
```

---

## 2. Installation

Run the MCP GitHub server via:

```bash
npx -y @modelcontextprotocol/server-github
```

Or with the token inline:

```bash
GITHUB_TOKEN=your_token npx -y @modelcontextprotocol/server-github
```

---

## 3. Configuration Options

| Environment Variable | Description                          |
|----------------------|--------------------------------------|
| `GITHUB_TOKEN`       | **Required.** GitHub PAT with repo/admin rights |

---

## 4. Available Tools

### `search_repositories`
- **Description:** Search GitHub repositories.
- **Parameters:**
  - `query` (string, required): Search query.
  - `page` (number, optional): Page number, default 1.
  - `perPage` (number, optional): Results per page, max 100.

---

### `get_file_contents`
- **Description:** Get file or directory contents.
- **Parameters:**
  - `owner` (string, required)
  - `repo` (string, required)
  - `path` (string, required): File or directory path.
  - `branch` (string, optional): Branch name.

---

### `create_repository`
- **Description:** Create a new GitHub repository.
- **Parameters:**
  - `name` (string, required)
  - `description` (string, optional)
  - `private` (boolean, optional)
  - `autoInit` (boolean, optional): Initialize with README.

---

### `create_branch`
- **Description:** Create a branch from an existing one.
- **Parameters:**
  - `owner` (string, required)
  - `repo` (string, required)
  - `branch` (string, required): New branch name.
  - `from_branch` (string, optional): Source branch.

---

## 5. Example Usage Patterns

### Search for repositories

```json
{
  "server_name": "github",
  "tool_name": "search_repositories",
  "arguments": {
    "query": "topic:machine-learning language:python",
    "perPage": 5
  }
}
```

### Get file contents

```json
{
  "server_name": "github",
  "tool_name": "get_file_contents",
  "arguments": {
    "owner": "octocat",
    "repo": "Hello-World",
    "path": "README.md",
    "branch": "main"
  }
}
```

### Create a repository

```json
{
  "server_name": "github",
  "tool_name": "create_repository",
  "arguments": {
    "name": "my-new-repo",
    "description": "My test repository",
    "private": false,
    "autoInit": true
  }
}
```

### Create a branch

```json
{
  "server_name": "github",
  "tool_name": "create_branch",
  "arguments": {
    "owner": "octocat",
    "repo": "Hello-World",
    "branch": "feature-branch",
    "from_branch": "main"
  }
}
```

---

## 6. Integration Notes

- The GitHub MCP server exposes these tools via MCP protocol.
- Use `use_mcp_tool` calls to invoke GitHub operations.
- Ensure the MCP server is running with the correct token.
- Add the server config to your MCP settings if persistent integration is desired.