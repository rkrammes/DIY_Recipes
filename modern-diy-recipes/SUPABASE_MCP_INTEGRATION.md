# Supabase MCP Integration

This document explains how to use the Supabase MCP (Multi-CPU Protocol) integration for DIY Recipes.

## Overview

The Supabase MCP integration provides authentication and database access for the DIY Recipes application. It uses a custom MCP server that connects to Supabase and exposes a set of tools for authentication, database queries, and record manipulation.

## Setup

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Copy the Supabase MCP server**:
   ```
   npm run setup-supabase-mcp
   ```
   This will copy the Supabase MCP server from the parent directory to the project directory.

3. **Start the Supabase MCP server and proxy**:
   ```
   npm run start-mcp-proxy
   ```
   This will start both the Supabase MCP server and the proxy server.

4. **Open the test page**:
   Open your browser and navigate to http://localhost:3000 to test the integration.

## Development Mode

In development mode, you can use the following features:

1. **Auto-login as development user**: 
   The application will automatically log in as a development user if `NEXT_PUBLIC_AUTO_DEV_LOGIN` is set to `true` in your `.env.local` file.

2. **Edit mode**:
   You can toggle edit mode by clicking the "Toggle Edit Mode" button. Edit mode is persisted across page refreshes using localStorage.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://moygoxnmomypjlbvobta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_USER_EMAIL=dev@example.com
NEXT_PUBLIC_DEV_USER_PASSWORD=devpass123
NEXT_PUBLIC_MCP_SUPABASE_PORT=3002
NEXT_PUBLIC_MCP_API_URL=/api/mcp
NEXT_PUBLIC_AUTO_DEV_LOGIN=true
```

## Available Tools

The Supabase MCP server provides the following tools:

- `query_data`: Execute SQL queries
- `get_user`: Get user information by ID
- `authenticate`: Authenticate with email and password
- `create_record`: Create a record in a table
- `update_record`: Update a record in a table
- `delete_record`: Delete a record from a table

## Hooks

The integration provides the following hooks:

1. **useSimplifiedSupabaseMcp**: 
   A hook for interacting with the Supabase MCP server.

   ```tsx
   import { useSimplifiedSupabaseMcp } from '../hooks/useSimplifiedSupabaseMcp';

   function MyComponent() {
     const { isConnected, connect, executeQuery } = useSimplifiedSupabaseMcp();

     // Use the hook to execute a query
     const handleQuery = async () => {
       try {
         const result = await executeQuery('SELECT * FROM recipes LIMIT 5');
         console.log(result);
       } catch (error) {
         console.error('Query failed:', error);
       }
     };

     return (
       <div>
         <button onClick={connect} disabled={isConnected}>
           {isConnected ? 'Connected' : 'Connect'}
         </button>
         <button onClick={handleQuery} disabled={!isConnected}>
           Run Query
         </button>
       </div>
     );
   }
   ```

2. **useSimplifiedMcpAuth**:
   A hook for authentication with the Supabase MCP server.

   ```tsx
   import { useSimplifiedMcpAuth } from '../hooks/useSimplifiedMcpAuth';

   function MyComponent() {
     const { 
       user, 
       isLoading, 
       isEditMode, 
       error, 
       signIn, 
       signOut, 
       toggleEditMode, 
       useDevelopmentUser 
     } = useSimplifiedMcpAuth();

     return (
       <div>
         {user ? (
           <div>
             <p>Logged in as: {user.email}</p>
             <button onClick={signOut}>Logout</button>
           </div>
         ) : (
           <button onClick={useDevelopmentUser} disabled={isLoading}>
             Login as Dev User
           </button>
         )}
         <button onClick={toggleEditMode}>
           {isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
         </button>
       </div>
     );
   }
   ```

## Integration in Next.js

To use the authentication in a Next.js application, wrap your pages with the `SimplifiedMcpAuthProvider`:

```tsx
// app/layout.tsx
import { SimplifiedMcpAuthProvider } from '../hooks/useSimplifiedMcpAuth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SimplifiedMcpAuthProvider>
      {children}
    </SimplifiedMcpAuthProvider>
  );
}
```

## Test Page

A test page is available at `/supabase-mcp-test` to test the integration. It provides the following features:

- Connection status
- Authentication
- Edit mode toggle
- SQL query execution

## Troubleshooting

1. **Connection failed**: 
   - Check if the Supabase MCP server is running on port 3002
   - Check if the proxy server is running on port 3000
   - Check if the Supabase URL and Anon Key are correctly set in `.env.local`

2. **Authentication failed**:
   - Check if the development user credentials are correctly set in `.env.local`
   - Check if the Supabase MCP server is connected to Supabase

3. **Query failed**:
   - Check if you're connected to the Supabase MCP server
   - Check if the query is valid SQL
   - Check if the table exists in your Supabase database