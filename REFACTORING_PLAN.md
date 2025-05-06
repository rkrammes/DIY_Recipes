# DIY Recipes Application Refactoring Plan

## Strategic Vision

The goal is to transform the DIY Recipes application into a modular platform that can easily incorporate additional functionality beyond formulations, while keeping it simple enough for family use. This requires:

1. **Modular Architecture**: Clear boundaries between core and module-specific code
2. **Simplified Data Access**: Consistent patterns for working with data
3. **Family-Friendly UX**: Less complex authentication and permissions
4. **Developer Experience**: Making future development straightforward

## Phase 1: Foundation - Core Architecture

### 1. Create Module Registry System

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

### 2. Data Layer Refactoring

**Implementation Details:**
- Implement a dual storage strategy using IndexedDB for local-first with optional Supabase sync
- Create `/src/lib/data/dataService.ts` with common CRUD operations
- Implement repository pattern with module-specific repositories
- Convert existing recipe data logic to use this new pattern

**Example Implementation:**
```typescript
// Base repository class with common functionality
export class Repository<T extends { id: string }> {
  constructor(protected storeName: string) {}
  
  async getAll(): Promise<T[]> {...}
  async getById(id: string): Promise<T | null> {...}
  async create(item: Omit<T, 'id'>): Promise<T> {...}
  async update(id: string, updates: Partial<T>): Promise<T> {...}
  async delete(id: string): Promise<void> {...}
}

// Module-specific repository
export class FormulationRepository extends Repository<Formulation> {
  constructor() {
    super('formulations');
  }
  
  // Additional formulation-specific methods
  async getWithIngredients(id: string): Promise<FormulationWithIngredients | null> {...}
}
```

### 3. Simplified Authentication

**Implementation Details:**
- Keep `DevAuthProvider` as the primary authentication method
- Create a family member registry with hardcoded users
- Implement simple role-based permissions (viewer, editor, admin)
- Remove complex Supabase auth code

## Phase 2: UI Architecture and Components

### 4. Modular Layout System

**Implementation Details:**
- Create `/src/components/layout/ModularTripleColumn.tsx` based on current layout
- Make layout components configurable for different module needs
- Extract navigation into a separate `ModuleNavigation` component
- Implement dynamic breadcrumbs for navigation context

### 5. Component Organization

**Implementation Details:**
- Create a clear directory structure:
  ```
  /src/components/
    /core/         # Application-wide components
    /layout/       # Layout components
    /ui/           # Reusable UI primitives
    /modules/      # Module-specific components
      /formulations/
      /future-module-1/
      /future-module-2/
  ```
- Move existing components to appropriate locations
- Create barrel exports (index.ts) for cleaner imports

### 6. Theme Consolidation

**Implementation Details:**
- Create a single `ThemeProvider` that combines the best features of existing providers
- Define a clear theme interface with consistent tokens
- Keep the existing visual themes (hackers, dystopia, neotopia)
- Implement performance optimizations to prevent unnecessary re-renders

## Phase 3: Module System Implementation

### 7. Create Module Infrastructure

**Implementation Details:**
- Implement `ModuleWrapper` HOC for consistent module features
- Create hooks for module-specific functionality (`useActiveModule`, `useModuleNavigation`)
- Build dynamic module routes in Next.js app router
- Implement module settings persistence

### 8. Refactor Formulations as First Module

**Implementation Details:**
- Move all formulation-related components to `/src/components/modules/formulations/`
- Create `FormulationsModule` implementation
- Update imports throughout the codebase
- Register the module in the registry

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
- Create generic data hooks that can be used across modules
- Implement error handling utilities to reduce duplication
- Standardize patterns for loading states and optimistic updates

```typescript
// Example generic data hook
export function useModuleData<T extends BaseItem>(options: {
  moduleName: string;
  initialData?: T[];
  filters?: Record<string, any>;
}) {
  // Implementation with loading, error, CRUD operations
}

// Specialized hook using the generic hook
export function useFormulations(options = {}) {
  return useModuleData({ 
    moduleName: 'formulations',
    ...options
  });
}
```

## Phase 4: Developer Experience & Family Support

### 10. Documentation and Onboarding

**Implementation Details:**
- Create `FAMILY_GUIDE.md` with simple instructions for family users
- Add detailed comments to key code sections
- Create a simple module creation guide for future development
- Document common patterns and conventions

### 11. Development Workflow

**Implementation Details:**
- Consolidate startup scripts into a few clear options:
  - `npm run dev` - Main development mode
  - `npm run dev:offline` - Development without online services
  - `npm run dev:new-module` - Scaffolding for new modules
- Implement a simple CLI for module creation
- Create a consistent testing approach with focus on critical paths

### 12. Test Strategy

**Implementation Details:**
- Focus testing on shared components and critical flows
- Implement visual regression tests for UI components
- Create test fixtures for common module testing scenarios
- Add simple smoke tests for major functionality

## Implementation Order

1. **Start with the Module Registry and core interfaces** - This provides the foundation
2. **Create the simplified Data Service layer** - This will clean up one of the most complex areas
3. **Implement the modular layout and navigation system** - This enables module independence
4. **Refactor DIY Formulations into the first module** - This validates the architecture
5. **Implement shared hooks and utilities** - These support all modules
6. **Create documentation and tooling** - These improve long-term maintainability

This approach allows incremental improvements while maintaining a working application throughout the process. Each phase builds on the previous one, gradually transforming the codebase into a more maintainable, extensible system that's well-suited for a personal family application.

## Key Issues to Address

1. **Consolidate duplicated API logic** across hooks (useSupabaseMcp.ts, useSimplifiedSupabaseMcp.ts)
2. **Refactor overly complex hooks** (especially useRecipe.ts at 600+ lines) into smaller, focused hooks
3. **Standardize error handling patterns** across hooks and components
4. **Consolidate multiple theme providers** (ThemeProvider, FixedThemeProvider, SimpleThemeProvider)
5. **Implement proper memoization** in list components to prevent unnecessary re-renders
6. **Create a unified data service layer** to abstract Supabase interactions
7. **Fix inconsistent file naming** (GitHubIntegraation.tsx vs GithubIntegration.tsx)
8. **Reorganize components** by feature and split large components (RecipeDetails.tsx)
9. **Implement barrel exports** (index.ts) for cleaner imports
10. **Remove or conditionally enable** excessive console.log statements
11. **Create a simplified family onboarding guide** and documentation
12. **Consolidate startup scripts** into a single clear development experience