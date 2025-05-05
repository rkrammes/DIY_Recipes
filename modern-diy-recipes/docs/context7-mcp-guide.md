# Context7 MCP Developer Guide

This guide provides detailed instructions for using Context7 MCP in the DIY Recipes application. Context7 MCP is a service that provides access to up-to-date documentation for various libraries used in the application.

## What is Context7 MCP?

Context7 MCP (Model Context Protocol) is a service that provides:

1. **Library Documentation**: Access to comprehensive documentation for libraries like React, Next.js, Tailwind CSS, Supabase, and more
2. **Code Examples**: Examples of common patterns and use cases
3. **Code Validation**: Validation of code against current API specifications
4. **Documentation Search**: Full-text search across multiple libraries

## Setting Up Context7 MCP

### Prerequisites

1. Install Node.js 16 or higher
2. Install Context7 CLI globally:

```bash
npm install -g context7
```

### Configuration

1. Set the following environment variables:

```bash
export CONTEXT7_TOKEN=your_token_here  # Optional, uses public token by default
export NEXT_PUBLIC_MCP_ENABLED=true
```

2. Start the application with Context7 MCP:

```bash
./start-with-context7.sh
```

## Using Context7 MCP in Development

### In Components

Use the `useContext7Mcp` hook to access documentation:

```tsx
import useContext7Mcp from '@/hooks/useContext7Mcp';

function MyComponent() {
  const { 
    getDocumentation, 
    search,
    isLoading
  } = useContext7Mcp({ autoConnect: true });

  const handleLookup = async () => {
    const docs = await getDocumentation('react', 'latest', 'hooks');
    // Use the documentation
  };

  return (
    <button onClick={handleLookup} disabled={isLoading}>
      Get React Hooks Documentation
    </button>
  );
}
```

### In Code Comments

Add Context7 directives in your code comments:

```tsx
// @context7-library: react@latest
// @context7-topic: hooks
import { useState, useEffect } from 'react';

function Counter() {
  // Implementation follows React docs from Context7
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Context7 MCP API Reference

### Getting Documentation

```tsx
const docs = await getDocumentation(
  library: string,  // e.g., 'react', 'next', 'tailwind'
  version?: string, // e.g., 'latest', '18.0.0' (defaults to 'latest')
  topic?: string    // e.g., 'hooks', 'components', 'routing'
);
```

### Searching Documentation

```tsx
const results = await search(
  query: string,       // Search query
  libraries?: string[] // Optional array of libraries to search in
);
```

### Getting Examples

```tsx
const examples = await getExamples(
  library: string,  // e.g., 'react', 'next', 'tailwind'
  version?: string, // e.g., 'latest', '18.0.0' (defaults to 'latest')
  topic: string     // e.g., 'hooks', 'components'
);
```

### Validating Code

```tsx
const validation = await validate(
  code: string,     // Code to validate
  library: string,  // e.g., 'react', 'tailwind'
  version?: string  // e.g., 'latest', '18.0.0' (defaults to 'latest')
);
```

## Using the Context7 MCP Web UI

The DIY Recipes app includes a web UI for Context7 MCP at `/context7-mcp`. Use this UI to:

1. Browse documentation
2. Search for topics
3. View code examples
4. Validate code

## Best Practices

1. **Use Context7 for API Verification**: When implementing features that use external libraries, verify your code against the latest documentation.

2. **Document Context7 Usage**: Add comments to indicate when code has been verified with Context7:

```tsx
// @context7-validated: 2025-05-04
// @context7-libraries: react@18, tailwind@3.3
function ValidatedComponent() {
  // This component has been validated against the specified libraries
}
```

3. **Check for Library Updates**: Regularly check for library updates using Context7.

4. **Share Documentation**: When collaborating, share specific documentation links:

```tsx
// See Context7: react@latest/hooks/useState
function MyComponent() {
  // Implementation based on the documentation
}
```

5. **Validate During Code Review**: During code reviews, validate code against Context7 documentation.

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify internet connection
   - Check if Context7 CLI is installed
   - Ensure the token is valid

2. **Missing Documentation**:
   - Try a different version
   - Check if the library is supported
   - Use a more generic topic

3. **Validation Failures**:
   - Verify syntax is correct
   - Check for deprecated APIs
   - Update to the latest library version

## Supported Libraries

Context7 MCP supports documentation for many libraries, including:

- React
- Next.js
- Tailwind CSS
- Supabase
- TypeScript
- Node.js
- Express
- And many more

Check the availability of a library:

```tsx
const isAvailable = await context7Mcp.isLibraryAvailable('library-name');
```

## Integration with Other MCPs

Context7 MCP works alongside other MCPs in DIY Recipes:

1. **GitHub MCP**: For code management and versioning
2. **Supabase MCP**: For data storage and retrieval
3. **Vercel MCP**: For deployment and hosting
4. **Memory MCP**: For tracking development progress

Use each MCP for its specific purpose, and use Context7 MCP specifically for documentation and API reference.