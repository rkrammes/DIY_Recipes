# Next.js + TypeScript MCP Server Setup

## Overview
This MCP server provides development automation for Next.js projects with TypeScript, exposing tools for project scaffolding, component/page generation, type checking, and code analysis.

## Installation & Startup

1. Ensure Node.js and npm are installed.
2. From the project root, install dependencies:
   ```
   npm install express axios
   ```
3. Start the server:
   ```
   node mcp-servers/nextjs-typescript-mcp-server.js
   ```
   The server listens on **port 3003** by default.

## Available Tools

### 1. `create_nextjs_project`
Create a new Next.js project with TypeScript.

- **Parameters:**
  - `project_name` (string, required): Project folder name
  - `directory` (string, optional, default `.`): Parent directory path

### 2. `create_component`
Generate a new React TypeScript component.

- **Parameters:**
  - `project_directory` (string, required): Path to Next.js project
  - `component_name` (string, required): Component name
  - `output_directory` (string, optional, default `components`): Subdirectory for component

### 3. `create_page`
Generate a new Next.js page.

- **Parameters:**
  - `project_directory` (string, required): Path to Next.js project
  - `page_name` (string, required): Page file name (without `.tsx`)

### 4. `type_check`
Run TypeScript type checking.

- **Parameters:**
  - `project_directory` (string, required): Path to Next.js project

### 5. `analyze_types`
Analyze a code snippet's types (placeholder).

- **Parameters:**
  - `code` (string, required): TypeScript code snippet

## Example Usage

Send HTTP POST requests to `http://localhost:3003/tool/{tool_name}` with JSON body.

Example creating a Next.js project:
```json
POST /tool/create_nextjs_project
{
  "project_name": "my-nextjs-app",
  "directory": "."
}
```

Example generating a component:
```json
POST /tool/create_component
{
  "project_directory": "./my-nextjs-app",
  "component_name": "Header",
  "output_directory": "components"
}
```

## Testing

Run the provided test script:
```
node test-nextjs-typescript-mcp.js
```
This demonstrates all server tools.

## Integration

Integrate this MCP server with your automation workflows or MCP clients by invoking the `/tool/{tool_name}` endpoints with relevant parameters.