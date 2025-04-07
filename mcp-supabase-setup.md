# Supabase MCP Server Setup & Usage

## Overview
This MCP server provides database and authentication capabilities through Supabase, exposing tools for CRUD operations and user management.

---

## Installation

1. **Install dependencies:**

```bash
npm install @supabase/supabase-js @modelcontextprotocol/server-core axios dotenv
```

2. **Set environment variables:**

Create a `.env` file in the project root with your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service_role_or_anon_key
```

---

## Running the Server

Start the Supabase MCP server:

```bash
node mcp-servers/supabase-mcp-server.js
```

The server listens on port `3002` by default.

---

## Configuration Options

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase API key (service_role preferred for admin operations)

---

## Available Tools

### 1. `query_data`
Execute a SQL query.

- **Parameters:**
  - `sql` (string, required): SQL query string
- **Example:**
```json
{ "sql": "SELECT * FROM users" }
```

---

### 2. `get_user`
Retrieve user information by user ID.

- **Parameters:**
  - `user_id` (string, required)
- **Example:**
```json
{ "user_id": "uuid-string" }
```

---

### 3. `authenticate`
Authenticate a user with email and password.

- **Parameters:**
  - `email` (string, required)
  - `password` (string, required)
- **Example:**
```json
{ "email": "user@example.com", "password": "password123" }
```

---

### 4. `create_record`
Create a new record in a specified table.

- **Parameters:**
  - `table` (string, required)
  - `record` (object, required)
- **Example:**
```json
{ "table": "profiles", "record": { "name": "Alice" } }
```

---

### 5. `update_record`
Update an existing record.

- **Parameters:**
  - `table` (string, required)
  - `record_id` (string, required)
  - `updates` (object, required)
  - `id_field` (string, optional, default `'id'`)
- **Example:**
```json
{ "table": "profiles", "record_id": "uuid", "updates": { "name": "Bob" } }
```

---

### 6. `delete_record`
Delete a record.

- **Parameters:**
  - `table` (string, required)
  - `record_id` (string, required)
  - `id_field` (string, optional, default `'id'`)
- **Example:**
```json
{ "table": "profiles", "record_id": "uuid" }
```

---

## Example Usage Pattern

Send a POST request to:

```
http://localhost:3002/tool/{tool_name}
```

with JSON body containing the parameters.

Example with `axios`:

```js
const axios = require('axios');

axios.post('http://localhost:3002/tool/create_record', {
  table: 'profiles',
  record: { name: 'Charlie' }
}).then(res => console.log(res.data));
```

---

## Integration Points

- **Backend Services:** Call MCP tools for database operations instead of direct Supabase calls.
- **Authentication:** Use `authenticate` and `get_user` for login flows.
- **Admin Panels:** Manage data via MCP server tools.
- **Automation:** Automate workflows by scripting MCP tool invocations.

---

## Notes
- The `query_data` tool expects a Postgres function `execute_raw_sql` to be created in your Supabase project for raw SQL queries.
- For production, secure the MCP server endpoints with authentication or network policies.