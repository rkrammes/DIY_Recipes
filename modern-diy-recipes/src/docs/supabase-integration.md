# Standardized Supabase Integration

This document describes the standardized approach for Supabase integration in the Modern DIY Recipes application. The approach focuses on robust error handling, proper status codes, and MCP integration.

## Architecture Overview

The Supabase integration follows a layered architecture:

1. **Error Handling Layer**: Centralized error categorization and handling
2. **API Response Layer**: Standardized API response formatting
3. **MCP Integration Layer**: Unified access to Supabase via MCP when available
4. **UI Components Layer**: Client-side error boundaries and displays

## Key Components

### 1. Supabase Error Handling Utilities (`src/lib/supabaseErrors.ts`)

Provides standardized error handling for all Supabase operations:

- Error categorization by type (connection, authentication, query, etc.)
- Conversion of Supabase errors to structured format
- Proper HTTP status code mapping
- User-friendly error messages

```typescript
// Example usage:
import { logSupabaseError, structureSupabaseError } from '../lib/supabaseErrors';

// Log errors with context
logSupabaseError(error, 'GET /api/recipes');

// Get structured error info
const structuredError = structureSupabaseError(error);
```

### 2. API Response Helpers (`src/lib/apiResponses.ts`)

Standardized response formatting for all API routes:

- Consistent success response format with status codes
- Standardized error response format
- Type-safe response helpers
- Common error response shortcuts (notFound, validation, etc.)

```typescript
// Example usage:
import { 
  createSuccessResponse, 
  createErrorResponse 
} from '../lib/apiResponses';

// Success response
return createSuccessResponse(data, 200);

// Error response
return createErrorResponse(error, 'Failed to fetch recipes');
```

### 3. MCP Supabase Client (`src/lib/mcpSupabase.ts`)

Provides a unified interface for database operations:

- MCP integration with fallback to direct Supabase
- Connection status monitoring
- Centralized database operations
- Error handling and logging

```typescript
// Example usage:
import { mcpSupabase } from '../lib/mcpSupabase';

// Get recipes
const { data, error } = await mcpSupabase.getRecipes();

// Check connection status
const status = await mcpSupabase.getConnectionStatus();
```

### 4. Client Components

#### Database Error Boundary (`src/components/DatabaseErrorBoundary.tsx`)

React component for handling database errors gracefully:

- Catches and displays database errors
- Provides retry functionality
- Enhanced fetch function with error handling
- Context provider for child components

```tsx
// Example usage:
import { DatabaseErrorBoundary } from '../components/DatabaseErrorBoundary';

<DatabaseErrorBoundary 
  fallback={<CustomErrorComponent />}
  retry={refetchData}
>
  <RecipeList />
</DatabaseErrorBoundary>
```

#### Connection Error Display (`src/components/ConnectionErrorDisplay.tsx`)

Component for displaying connection status and errors:

- Shows connection errors with details
- Monitors connection status
- Displays warnings for degraded connections
- Provides retry functionality

```tsx
// Example usage:
import { ConnectionErrorDisplay } from '../components/ConnectionErrorDisplay';

<ConnectionErrorDisplay 
  error={connectionError}
  retryAction={reconnect}
  showConnectionStatus={true}
/>
```

## API Route Pattern

All API routes follow a standardized pattern:

```typescript
export async function GET() {
  try {
    // Use the centralized MCP Supabase client
    const { data, error } = await mcpSupabase.getRecipes();
    
    if (error) {
      // Log and return standardized error response
      logSupabaseError(error, 'GET /api/recipes');
      return createErrorResponse(error, 'Failed to fetch recipes');
    }
    
    // Return standardized success response
    return createSuccessResponse(data || []);
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return createErrorResponse(error);
  }
}
```

## Error Handling Strategy

The application implements a multi-layered error handling strategy:

1. **Server-side validation** before database operations
2. **Proper error categorization** to distinguish between different types of errors
3. **Appropriate status codes** for each error type
4. **User-friendly error messages** for display
5. **Detailed error logging** for debugging
6. **Client-side error boundaries** to prevent UI crashes
7. **Connection status monitoring** for immediate feedback

## Development vs. Production

- **Development Mode**: Can use mock data via environment variables
- **Production Mode**: Requires proper Supabase configuration
- **MCP Integration**: Available in both modes for enhanced functionality

## Best Practices

1. **Always check connection status** before critical operations
2. **Use the mcpSupabase client** for all database operations
3. **Wrap UI components** in error boundaries
4. **Be explicit about error types** and status codes
5. **Provide helpful error messages** for users
6. **Log detailed errors** for debugging
7. **Use proper validation** before database operations
8. **Implement retry functionality** where appropriate
9. **Check for proper environment variables** at startup