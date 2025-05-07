# DIY Recipes/Formulations Application Refactoring Plan

## Strategic Vision

The goal is to transform the DIY Recipes application into a modular platform that can easily incorporate additional functionality beyond formulations, while keeping it simple enough for family use. This plan takes into account the ongoing terminology transition from "recipe" to "formulation" and builds on that work.

## Current Status Assessment

- **Next.js App Router**: The application uses the Next.js app router with numerous routes and test pages
- **Component Terminology**: A transition from "recipe" to "formulation" terminology is in progress with wrapper components
- **Data Management**: Primarily uses Supabase with local fallbacks and the MCP integration
- **Authentication**: Multiple authentication approaches (Supabase, DevAuth, McpAuth)
- **UI Structure**: Triple column layout with various view modes including document-centric views

## Phase 1: Core Architecture Refactoring

### 1. Complete Terminology Transition

**Implementation Details:**
- Finish implementing wrapper components and hooks as described in `TERMINOLOGY_TRANSITION_PLAN.md`
- Focus particularly on consistent props and return values
- Create a glossary of terms for family members to reference

### 2. Create Module Registry System

**Implementation Details:**
- Create `/src/lib/modules/registry.ts` with ModuleRegistry class
- Define module interface with required components and metadata
- Implement registration/retrieval methods
- Create a simple feature flag system for enabling/disabling modules

**Example Interface:**
```typescript
export interface Module {
  id: string;
  name: string;
  icon: string;
  routes: ModuleRoute[];
  components: {
    list: React.ComponentType;
    detail: React.ComponentType<{id: string}>;
    create: React.ComponentType;
  };
  navigationItems: NavigationItem[];
  isEnabled: boolean;
}
```

### 3. Data Layer Refactoring

**Implementation Details:**
- Create a repository pattern that works with Supabase
- Implement `/src/lib/data/repository.ts` with base repository class
- Create module-specific repositories (FormulationRepository, IngredientRepository)
- Abstract away Supabase-specific implementation details

**Example Implementation:**
```typescript
// Base repository class with common functionality
export class Repository<T extends { id: string }> {
  constructor(protected tableName: string) {}
  
  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
      
    if (error) throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
    return data || [];
  }
  
  // Additional methods (getById, create, update, delete)
}

// Module-specific repository
export class FormulationRepository extends Repository<Formulation> {
  constructor() {
    super('recipes'); // Using the actual table name, not the terminology
  }
  
  // Formulation-specific methods
  async getWithIngredients(id: string): Promise<FormulationWithIngredients | null> {
    // Implementation that uses existing recipe_ingredients table
  }
}
```

### 4. Simplified Authentication

**Implementation Details:**
- Consolidate around the `DevAuthProvider` for family use
- Create a family member registry with predefined users
- Implement simple role-based permissions
- Maintain Supabase auth as an option but simplify the implementation

## Phase 2: UI Architecture Improvements

### 5. Extract Reusable Layout Components

**Implementation Details:**
- Create a cleaner separation between layout and content
- Extract the triple column layout into a configurable component
- Create a standardized header/footer system for all modules
- Implement module-specific layouts when needed

### 6. Consolidate Theme Providers

**Implementation Details:**
- Merge the multiple theme implementations (FixedThemeProvider, SimpleThemeProvider, etc.)
- Create a single, comprehensive theme system
- Maintain the existing visual themes (hackers, dystopia, neotopia)
- Add family member preferences for themes

### 7. Performance Optimization

**Implementation Details:**
- Add appropriate memoization to list components
- Implement React.memo for frequently re-rendered components
- Add useCallback for event handlers and functions in components
- Optimize data fetching with SWR patterns

## Phase 3: Module System Implementation

### 8. Create Formulations as First Module

**Implementation Details:**
- Move all formulation-related components to `/src/components/modules/formulations/`
- Register the formulations module in the registry
- Update imports to use the new location
- Create a fully modular implementation of the formulations module

```typescript
// Register formulations module
ModuleRegistry.registerModule({
  id: 'formulations',
  name: 'DIY Formulations',
  icon: '🧪',
  isEnabled: true,
  routes: [
    { path: '/formulations', component: FormulationsPage },
    { path: '/formulations/:id', component: FormulationDetailsPage }
  ],
  components: {
    list: FormulationList,
    detail: FormulationDetails,
    create: FormulationForm
  },
  navigationItems: [
    { id: 'all', name: 'All Formulations', icon: '📋' },
    { id: 'ingredients', name: 'Ingredients', icon: '🧪' }
  ]
});
```

### 9. Hook Refactoring

**Implementation Details:**
- Break down large hooks (useRecipe, useRecipeIteration) into smaller, focused hooks
- Create generic data hooks that work with the repository pattern
- Implement error handling utilities to reduce duplication
- Standardize patterns for loading states and optimistic updates

```typescript
// Example generic data hook
export function useModuleData<T extends BaseItem>(options: {
  repository: Repository<T>;
  initialData?: T[];
  filters?: Record<string, any>;
}) {
  // Implementation with loading, error, CRUD operations
}

// Specialized hook using the generic hook and repository
export function useFormulations(options = {}) {
  const repository = useMemo(() => new FormulationRepository(), []);
  return useModuleData({ 
    repository,
    ...options
  });
}
```

### 10. Implement Dynamic Navigation

**Implementation Details:**
- Create a `ModuleNavigation` component that reads from the module registry
- Support nested navigation within modules
- Implement module-specific settings
- Maintain the existing visual style but with modular content

## Phase 4: Developer Experience & Family Support

### 11. Consolidate Startup Scripts

**Implementation Details:**
- Simplify the numerous startup scripts
- Create a small set of clear npm scripts for different development scenarios
- Document the development workflow for family members
- Add clear error messages and help text

### 12. Documentation Updates

**Implementation Details:**
- Create `FAMILY_GUIDE.md` with simple instructions
- Add code comments that explain design decisions
- Create a module creation guide
- Add simple tutorials for common tasks

## Implementation Order

1. **Complete terminology transition** - Finish the work already in progress
2. **Create the repository pattern** - Simplify data access while maintaining Supabase
3. **Implement module registry** - Create the foundation for multiple modules
4. **Reorganize components by module** - Start with formulations
5. **Simplify authentication** - Make it family-friendly
6. **Refactor layouts and navigation** - Support the modular architecture
7. **Consolidate startup scripts** - Improve the development experience

## Key Issues to Address

1. **Consolidate duplicated API logic** across hooks (useSupabaseMcp.ts, useSimplifiedSupabaseMcp.ts)
2. **Refactor overly complex hooks** (especially useRecipe.ts at 600+ lines) into smaller, focused hooks
3. **Standardize error handling patterns** across hooks and components
4. **Consolidate multiple theme providers** (ThemeProvider, FixedThemeProvider, SimpleThemeProvider)
5. **Implement proper memoization** in list components to prevent unnecessary re-renders
6. **Create a unified data access pattern** that works well with Supabase
7. **Fix inconsistent file naming** (GitHubIntegraation.tsx vs GithubIntegration.tsx)
8. **Reorganize components** by feature and split large components (RecipeDetails.tsx)
9. **Implement barrel exports** (index.ts) for cleaner imports
10. **Remove or conditionally enable** excessive console.log statements
11. **Create a simplified family onboarding guide** and documentation
12. **Consolidate startup scripts** into a single clear development experience

This approach provides a natural progression from the current state of the application, building on the terminology transition work that's already in progress while setting the stage for a modular architecture that can support additional modules beyond formulations.