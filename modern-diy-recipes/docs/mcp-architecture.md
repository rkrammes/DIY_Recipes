# MCP Architecture

This document describes the Model Context Protocol (MCP) architecture implemented in the DIY Recipes application. The architecture provides a standardized way to leverage AI capabilities and external services through MCP servers.

## Core Components

### 1. Base Adapter

The `BaseMcpAdapter` abstract class provides core functionality for all MCP adapters:

- Connection management (connect/disconnect)
- Function execution
- Error handling
- Server information retrieval

```typescript
export abstract class BaseMcpAdapter implements McpAdapter {
  protected client: Client | null = null;
  protected options: McpConnectionOptions;
  public isConnected: boolean = false;
  
  constructor(
    public readonly name: string,
    options: McpConnectionOptions = {}
  ) {
    // Initialization logic
  }
  
  // Abstract method to be implemented by specific adapters
  protected abstract getServerPackage(): string;
  
  // Core functionality for connection, execution, etc.
  public async connect(): Promise<void> { /* ... */ }
  public async disconnect(): Promise<void> { /* ... */ }
  public async executeFunction<T>(functionName: string, params?: any): Promise<T> { /* ... */ }
  public async getServerInfo(): Promise<{ name: string; version: string }> { /* ... */ }
  public async listTools(): Promise<string[]> { /* ... */ }
}
```

### 2. Specific Adapters

Each MCP server has a dedicated adapter that extends the base adapter:

- **GitHub Adapter**: Repository and code management functions
- **Puppeteer Adapter**: Browser automation functions
- **Supabase Adapter**: Database, auth, and storage functions
- **Vercel Adapter**: Deployment and project management functions

Each adapter provides type-safe interfaces for its functions and handles server-specific details.

### 3. Adapter Factory

The MCP Adapter Factory provides centralized adapter creation and management:

- Singleton pattern for adapter instances
- Lazy initialization
- Type-safe adapter creation
- Adapter registry

```typescript
export function getMcpAdapter(type: McpAdapterType, options: McpConnectionOptions = {}): McpAdapter {
  if (!mcpAdapters[type]) {
    mcpAdapters[type] = createMcpAdapter(type, options);
  }
  return mcpAdapters[type]!;
}
```

### 4. MCP Provider

The `McpProvider` React context makes MCP adapters available to components:

- Manages adapter lifecycle
- Provides initialization control
- Exposes adapter instances to components
- Handles initialization state and errors

```typescript
export function McpProvider({ 
  children,
  autoInitialize = false 
}: { 
  children: React.ReactNode;
  autoInitialize?: boolean;
}) {
  // State management for adapters and initialization
  
  return (
    <McpContext.Provider
      value={{
        isInitialized,
        isInitializing,
        initError,
        github: adapters.github,
        puppeteer: adapters.puppeteer,
        supabase: adapters.supabase,
        vercel: adapters.vercel,
        initialize
      }}
    >
      {children}
    </McpContext.Provider>
  );
}
```

### 5. MCP Hooks

The `useMcp` hook provides convenient access to MCP adapters:

```typescript
export function useMcp() {
  const context = useContext(McpContext);
  if (!context) {
    throw new Error('useMcp must be used within an McpProvider');
  }
  return context;
}
```

### 6. Integration Components

Components that demonstrate MCP capabilities:

- **GitHubIntegration**: Repository and issue management
- **SupabaseIntegration**: Database and storage operations
- **VercelIntegration**: Project and deployment management

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                         UI Components                          │
└───────────────┬─────────────────────────────┬─────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│        MCP Provider        │   │        React Context        │
└───────────────┬───────────┘   └─────────────────────────────┘
                │
                ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│      Adapter Factory       │◄──┤      MCP Configuration      │
└───────────────┬───────────┘   └─────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ GitHub Adapter │   │ Supabase Adapter │   │ Vercel Adapter │ ...
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  GitHub MCP   │   │  Supabase MCP  │   │  Vercel MCP   │ ...
└───────────────┘   └───────────────┘   └───────────────┘
```

## Integration Flow

1. Component needs MCP functionality
2. Component uses `useMcp` hook to access adapters
3. If not initialized, component can trigger initialization
4. Component calls adapter functions with type-safe parameters
5. Adapter executes functions on the MCP server
6. Component receives type-safe responses
7. Component updates UI based on responses

## Error Handling

1. **Connection Errors**: Handled at the provider level
2. **Execution Errors**: Propagated to components for handling
3. **Type Errors**: Caught at compile time with TypeScript
4. **Initialization Errors**: Exposed through the provider

## Adding New MCP Adapters

1. Create a new adapter class extending `BaseMcpAdapter`
2. Add adapter to factory and provider
3. Update types and interfaces
4. Create demonstration components

## Security Considerations

1. MCP adapters handle sensitive credentials securely
2. Connections are established only when needed
3. Credentials are not exposed to client components
4. Adapters validate parameters before execution

## Performance Optimizations

1. Singleton adapter instances
2. Lazy initialization
3. Connection pooling (future)
4. Request batching (future)

## Testing

1. Mock MCP adapters for unit testing
2. Integration tests with real MCP servers
3. Component tests with mock adapters

## Future Enhancements

1. Enhanced error handling and retries
2. Adapter federation for similar capabilities
3. Performance monitoring and optimization
4. Offline mode and synchronization
5. Addition of more MCP servers (see roadmap)