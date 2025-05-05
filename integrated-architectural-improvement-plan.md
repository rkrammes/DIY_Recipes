# DIY Recipes: Integrated Architectural Improvement Plan

This document outlines a comprehensive plan to improve the DIY Recipes application by addressing identified architectural issues and leveraging the available MCP servers for enhanced functionality.

## Executive Summary

After reviewing the codebase and documentation, I've identified several architectural improvements that will enhance the application's functionality, maintainability, and user experience. The plan focuses on:

1. **Theming System Consolidation**: Fixing the inconsistencies in the theme implementation
2. **MCP Integration Enhancement**: Leveraging all available MCP servers effectively
3. **Component Architecture Standardization**: Establishing a consistent pattern for component development
4. **Performance Optimization**: Addressing current performance bottlenecks
5. **API Layer Consolidation**: Creating a unified API approach with MCP integration

## 1. Theming System Consolidation

### Current Issues:
- Inconsistency between old theme names ('hackers', 'dystopia', 'neotopia') and new semantic names ('synthwave-noir', 'terminal-mono', 'paper-ledger')
- ThemeScript implementation has inconsistencies with theme mapping
- Missing Oklch color format implementation in some places
- Missing ThemeProvider in some layouts
- Multiple theme implementations (SimpleThemeProvider, FixedThemeProvider, ThemeProvider)

### Improvement Plan:

#### 1.1 Standardize Theme Naming
```typescript
// Update in types/theme.ts
export type Theme = 'synthwave-noir' | 'terminal-mono' | 'paper-ledger';

// Theme mapping for backward compatibility 
export const legacyThemeMapping: Record<string, Theme> = {
  'hackers': 'synthwave-noir',
  'dystopia': 'terminal-mono',
  'neotopia': 'paper-ledger'
};

// Reverse mapping for transitional period
export const reverseLegacyMapping: Record<Theme, string> = {
  'synthwave-noir': 'hackers',
  'terminal-mono': 'dystopia',
  'paper-ledger': 'neotopia'
};
```

#### 1.2 Consolidate Theme Provider Implementation
- Merge functionality from SimpleThemeProvider and FixedThemeProvider into a single ThemeProvider
- Ensure consistent theme application across all layouts
- Implement proper data-theme attribute setting

#### 1.3 Fix ThemeScript for FOUC Prevention
```typescript
// Fix in ThemeScript.tsx
export default function ThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Legacy theme name mapping for backward compatibility
              const legacyThemeMapping = {
                'hackers': 'synthwave-noir',
                'dystopia': 'terminal-mono',
                'neotopia': 'paper-ledger'
              };
              
              // Get theme from localStorage with fallback
              let theme = localStorage.getItem('theme') || 'synthwave-noir';
              const validThemes = ['synthwave-noir', 'terminal-mono', 'paper-ledger', 'hackers', 'dystopia', 'neotopia'];
              
              // Handle legacy theme names
              if (legacyThemeMapping[theme]) {
                theme = legacyThemeMapping[theme];
                // Update localStorage with the canonical name
                localStorage.setItem('theme', theme);
              }
              
              // Only apply if it's a valid theme
              if (validThemes.includes(theme)) {
                document.documentElement.setAttribute('data-theme', theme);
              } else {
                // Fallback to system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const defaultTheme = prefersDark ? 'synthwave-noir' : 'paper-ledger';
                document.documentElement.setAttribute('data-theme', defaultTheme);
                localStorage.setItem('theme', defaultTheme);
              }
              
              // Apply base styles immediately to prevent FOUC
              document.documentElement.style.setProperty('color-scheme', 'dark light');
            } catch (e) {
              console.warn('Theme initialization error:', e);
              // Fallback to default theme
              document.documentElement.setAttribute('data-theme', 'synthwave-noir');
            }
          })();
        `,
      }}
    />
  );
}
```

#### 1.4 Update Tailwind Configuration for Oklch
- Ensure proper Tailwind configuration to work with Oklch color format
- Update the withOpacity function to handle Oklch values correctly

## 2. MCP Integration Enhancement

### Current Implementation:
- GitHub MCP server is partially integrated
- Other MCP servers (Puppeteer, Memory, Filesystem, etc.) are not being utilized
- No unified MCP adapter pattern

### Improvement Plan:

#### 2.1 Create Unified MCP Adapter Factory
```typescript
// Create new file: lib/mcp/adapters/index.ts
import GitHubMcpAdapter from './githubMcpAdapter';
import SupabaseMcpAdapter from './supabaseMcpAdapter';
import PuppeteerMcpAdapter from './puppeteerMcpAdapter';
import FileSystemMcpAdapter from './filesystemMcpAdapter';
import BraveSearchMcpAdapter from './braveSearchMcpAdapter';
import MemoryMcpAdapter from './memoryMcpAdapter';
import SequentialThinkingAdapter from './sequentialThinkingAdapter';
import GoogleMapsMcpAdapter from './googleMapsMcpAdapter';
import EverythingMcpAdapter from './everythingMcpAdapter';

export type McpAdapterType = 
  | 'github'
  | 'supabase'
  | 'puppeteer'
  | 'filesystem'
  | 'brave-search'
  | 'memory'
  | 'sequential-thinking'
  | 'google-maps'
  | 'everything';

export function createMcpAdapter(type: McpAdapterType, options?: any) {
  switch (type) {
    case 'github':
      return new GitHubMcpAdapter(options);
    case 'supabase':
      return new SupabaseMcpAdapter(options);
    case 'puppeteer':
      return new PuppeteerMcpAdapter(options);
    case 'filesystem':
      return new FileSystemMcpAdapter(options);
    case 'brave-search':
      return new BraveSearchMcpAdapter(options);
    case 'memory':
      return new MemoryMcpAdapter(options);
    case 'sequential-thinking':
      return new SequentialThinkingAdapter(options);
    case 'google-maps':
      return new GoogleMapsMcpAdapter(options);
    case 'everything':
      return new EverythingMcpAdapter(options);
    default:
      throw new Error(`Unknown MCP adapter type: ${type}`);
  }
}
```

#### 2.2 Implement Visual Recipe Enhancement with Puppeteer MCP
- Use Puppeteer MCP for step-by-step visual guides
- Implement screenshot generation for recipe steps
- Add visual testing for UI components

#### 2.3 Add Recipe Content Enrichment with Brave Search MCP
- Enhance recipe metadata with web search results
- Implement ingredient lookup and substitution suggestions
- Add recipe tagging based on search results

#### 2.4 Implement Recipe Version Control with GitHub MCP
- Store recipe versions in GitHub repository
- Enable forking and merging recipes
- Implement visual diff comparison for recipe versions

#### 2.5 Add Memory Persistence with Memory MCP
- Store user preferences and settings
- Implement recipe recollection based on user history
- Create personalized suggestions

## 3. Component Architecture Standardization

### Current Issues:
- Multiple state management approaches (useState, useContext, ad-hoc stores)
- Inconsistent component composition patterns
- Missing abstractions for common patterns

### Improvement Plan:

#### 3.1 Implement Hooks-Based State Management
- Create domain-specific hooks for all major features
- Centralize state management with React Context
- Use reducers for complex state

#### 3.2 Create Component Composition Patterns
- Define standard layout components
- Implement slot-based component composition
- Create reusable higher-order components

#### 3.3 Standardize Error Handling
- Implement error boundaries at strategic points
- Create consistent error UI components
- Add structured error logging

## 4. Performance Optimization

### Current Issues:
- Unnecessary re-renders in UI components
- Missing component memoization
- Inefficient data fetching

### Improvement Plan:

#### 4.1 Implement Code Splitting
- Add dynamic imports for route-based code splitting
- Lazy load non-critical components
- Implement route-based bundle optimization

#### 4.2 Add Memoization to Critical Components
- Use React.memo for pure components
- Implement useMemo for expensive calculations
- Apply useCallback for stable references

#### 4.3 Optimize Data Fetching
- Implement SWR for data fetching
- Add caching for API requests
- Implement optimistic UI updates

## 5. API Layer Consolidation

### Current Issues:
- Inconsistent API calling patterns
- Missing error handling in some API calls
- No unified approach to MCP server integration

### Improvement Plan:

#### 5.1 Create Unified API Client
```typescript
// Create new file: lib/api/client.ts
import { createMcpAdapter } from '../mcp/adapters';

// Define type for API context
type ApiContext = {
  auth?: {
    token?: string;
  };
  cache?: boolean;
  timeout?: number;
};

// API client factory
export function createApiClient() {
  // Initialize adapters
  const githubAdapter = createMcpAdapter('github');
  const supabaseAdapter = createMcpAdapter('supabase');
  const braveSearchAdapter = createMcpAdapter('brave-search');
  
  // Return API methods
  return {
    // Recipe API
    recipes: {
      getAll: async (context?: ApiContext) => {
        try {
          const result = await supabaseAdapter.executeQuery('SELECT * FROM recipes ORDER BY title ASC');
          return { data: result.data, error: null };
        } catch (error) {
          console.error('Error fetching recipes:', error);
          return { data: null, error };
        }
      },
      
      getById: async (id: string, context?: ApiContext) => {
        try {
          const result = await supabaseAdapter.executeQuery(`SELECT * FROM recipes WHERE id = '${id}'`);
          return { data: result.data[0], error: null };
        } catch (error) {
          console.error(`Error fetching recipe ${id}:`, error);
          return { data: null, error };
        }
      },
      
      create: async (data: any, context?: ApiContext) => {
        // Implementation
      },
      
      update: async (id: string, data: any, context?: ApiContext) => {
        // Implementation
      },
      
      delete: async (id: string, context?: ApiContext) => {
        // Implementation
      },
      
      // Version control with GitHub MCP
      saveVersion: async (recipe: any, message: string, context?: ApiContext) => {
        try {
          const result = await githubAdapter.saveRecipeVersion(recipe, message);
          return { data: result, error: null };
        } catch (error) {
          console.error('Error saving recipe version:', error);
          return { data: null, error };
        }
      },
      
      getVersionHistory: async (recipeId: string, context?: ApiContext) => {
        try {
          const result = await githubAdapter.getRecipeVersionHistory(recipeId);
          return { data: result, error: null };
        } catch (error) {
          console.error('Error getting recipe version history:', error);
          return { data: null, error };
        }
      }
    },
    
    // Ingredient API
    ingredients: {
      // Standard CRUD operations
      // ...
      
      // Enhanced lookups with Brave Search MCP
      getIngredientInfo: async (ingredientName: string, context?: ApiContext) => {
        try {
          const result = await braveSearchAdapter.webSearch(`${ingredientName} properties cooking`);
          // Process results
          return { data: result, error: null };
        } catch (error) {
          console.error('Error getting ingredient info:', error);
          return { data: null, error };
        }
      },
      
      findSubstitutes: async (ingredientName: string, context?: ApiContext) => {
        try {
          const result = await braveSearchAdapter.webSearch(`${ingredientName} substitutes alternatives cooking`);
          // Process results
          return { data: result, error: null };
        } catch (error) {
          console.error('Error finding substitutes:', error);
          return { data: null, error };
        }
      }
    },
    
    // Other domain-specific APIs
    // ...
  };
}

// Export singleton instance
export const apiClient = createApiClient();

// Export type for use in React Query
export type ApiClient = ReturnType<typeof createApiClient>;
```

#### 5.2 Implement Secure API Authentication
- Add authentication to API requests
- Implement token refresh logic
- Create role-based access control

#### 5.3 Create React Query Integration
- Implement React Query for data fetching
- Create query hooks for all API endpoints
- Add Suspense integration

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Theming System Consolidation
- MCP Adapter Factory

### Phase 2: Enhanced Functionality (Weeks 3-4)
- GitHub MCP Integration
- Component Architecture Standardization

### Phase 3: Advanced Features (Weeks 5-6)
- Puppeteer MCP for Visual Guides
- Brave Search for Content Enrichment

### Phase 4: Optimization & Polish (Weeks 7-8)
- Performance Optimization
- API Layer Consolidation

## Success Metrics

- Theming consistency across all components and layouts
- At least 3 MCP servers fully integrated and providing value
- 30% reduction in component rendering time
- Improved developer experience with consistent patterns
- Enhanced user experience with visual recipe guides and content enrichment

## Conclusion

This integrated architectural improvement plan addresses the key issues in the current implementation while enhancing the application with advanced features through MCP integration. By focusing on standardization, performance, and leveraging MCP capabilities, the DIY Recipes application will become more maintainable, performant, and feature-rich.

The plan strikes a balance between addressing technical debt and adding new functionality, with a clear implementation timeline and success metrics to ensure progress can be tracked effectively.