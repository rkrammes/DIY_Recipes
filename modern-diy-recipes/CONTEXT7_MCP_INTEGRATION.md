# Context7 MCP Integration for DIY Recipes

This document provides guidelines for using the Context7 MCP integration in DIY Recipes. Context7 MCP provides access to up-to-date documentation for various libraries used in the app.

## Setup

1. Install the Context7 CLI globally:

```bash
npm install -g context7
```

2. Start the app with Context7 MCP integration:

```bash
./start-with-context7.sh
```

Alternatively, you can set the environment variables manually:

```bash
export NEXT_PUBLIC_MCP_ENABLED=true
export CONTEXT7_TOKEN=your_token_here  # Optional, uses public token by default
npm run dev
```

## Using Context7 MCP in Development

### Accessing the Context7 MCP UI

Once the app is running, visit the Context7 MCP integration page:

```
http://localhost:3000/context7-mcp
```

This page provides a UI for accessing documentation, searching for topics, viewing code examples, and validating your code.

### Using the Context7 MCP Hook

You can use the `useContext7Mcp` hook in your components to access Context7 MCP functionality:

```tsx
import useContext7Mcp from '@/hooks/useContext7Mcp';

function MyComponent() {
  const {
    isConnected,
    isLoading,
    error,
    getDocumentation,
    search,
    getExamples,
    validate
  } = useContext7Mcp({ autoConnect: true });

  // Example: Get React hooks documentation
  const fetchHooksDocs = async () => {
    try {
      const docs = await getDocumentation('react', 'latest', 'hooks');
      console.log(docs);
    } catch (error) {
      console.error('Error fetching hooks documentation:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchHooksDocs} disabled={isLoading || !isConnected}>
        Get React Hooks Docs
      </button>
      {/* Rest of your component */}
    </div>
  );
}
```

## Usage Guidelines

### When to Use Context7 MCP

Context7 MCP is most useful in the following scenarios:

1. **Learning a new library**: Get up-to-date documentation for libraries you're learning
2. **Checking API correctness**: Validate your code against official API documentation
3. **Finding code examples**: Get examples for common use cases
4. **Searching for specific topics**: Find information across multiple libraries

### Best Practices

1. **Use code comments to indicate Context7 MCP usage**:

```tsx
// @context7-validated: react@latest
function MyComponent() {
  // This component has been validated against React's latest API
}
```

2. **Document validation results**:

```tsx
// @context7-validation: success
// @context7-validation-date: 2025-01-15
function MyComponent() {
  // ...
}
```

3. **Reference documentation sources**:

```tsx
// @context7-docs: tailwind@latest/animation
function AnimatedButton() {
  // Implementation based on Tailwind CSS animation documentation
}
```

## Troubleshooting

### Common Issues

1. **Connection Issues**:
   - Make sure Context7 is installed globally
   - Check your internet connection
   - Verify that the Context7 token is valid (if using a custom token)

2. **Missing Documentation**:
   - Some libraries may have limited documentation
   - Try searching for alternative terms
   - Use the public token for basic access, or obtain a full token for comprehensive documentation

3. **Validation Errors**:
   - Check that you're using the correct library name
   - Verify that the code is valid syntax for the selected library
   - Some APIs may have changed in the latest version

## Context7 MCP Command Line

You can also use Context7 directly from the command line:

```bash
# Get documentation for a library
npx context7 docs react

# Search for a term across libraries
npx context7 search "useEffect"

# Validate code
npx context7 validate --library=react --file=my-component.tsx
```

## Integration Status

The Context7 MCP integration is currently in **beta**. It provides access to documentation for major libraries used in DIY Recipes, including:

- Next.js
- React
- Tailwind CSS
- Supabase
- TypeScript
- And many more

## Full API Reference

For a complete list of Context7 MCP functions, refer to `src/lib/mcp/adapters/context7McpAdapter.ts`.