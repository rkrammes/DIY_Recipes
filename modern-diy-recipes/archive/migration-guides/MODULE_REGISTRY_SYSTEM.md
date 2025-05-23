# Module Registry System

The DIY Formulations application implements a modular architecture using a Module Registry pattern. This document explains how the system works and how to extend it with new modules.

## Core Concepts

The Module Registry system is built on these core concepts:

1. **Registry** - A singleton registry that manages all modules
2. **Modules** - Self-contained features that register with the registry
3. **Navigation** - Dynamic navigation based on registered modules
4. **Feature Flags** - Enable/disable modules without code changes
5. **Consistent UI** - Theme-aware components for consistent UX

## File Structure

```
src/
├── lib/
│   └── modules/
│       ├── registry.ts         - Core registry implementation
│       ├── moduleContext.tsx   - React context for modules
│       ├── moduleFactory.ts    - Factory functions for module creation
│       ├── featureFlags.ts     - Feature flag implementation
│       └── index.ts            - Public API exports
└── modules/
    ├── index.ts                - Module initialization
    └── formulations/           - Formulation module implementation
        ├── index.ts            - Module definition and registration
        ├── components/         - Module-specific components
        └── hooks/              - Module-specific hooks
```

## Registry Implementation

The `ModuleRegistry` class in `registry.ts` implements a singleton pattern with methods for:

- Registering modules
- Retrieving modules
- Enabling/disabling modules
- Getting navigation items from all modules
- Managing module settings

## Module Structure

Each module defines:

1. **ID and Name** - Unique identifier and display name
2. **Icon** - Visual representation
3. **Routes** - URL paths and components for navigation
4. **Components** - Core UI components for list, detail, and creation views
5. **Navigation Items** - Items to show in navigation menus
6. **Settings** - Module-specific configuration

Example module definition:

```typescript
const formulationsModule = createModule({
  id: 'formulations',
  name: 'DIY Formulations',
  icon: '🧪',
  description: 'Create and manage DIY product formulations with version control',
  isEnabled: true,
  
  // Routes define URL paths and associated components
  routes: [
    {
      path: '/formulations',
      component: ModuleFormulationList,
    },
    // Additional routes...
  ],
  
  // Core components for the module
  components: {
    list: ModuleFormulationList,
    detail: ModuleFormulationDetails,
    create: ModuleFormulationForm,
    // Additional components...
  },
  
  // Navigation items to display in menus
  navigationItems: [
    {
      id: 'all_formulations',
      name: 'All Formulations',
      icon: '📋',
      path: '/formulations',
      // Optional sub-items...
    },
    // Additional navigation items...
  ],
  
  // Module-specific settings
  settings: {
    defaultView: 'list',
    enableVersioning: true,
    // Additional settings...
  }
});

// Register the module
registerModule(formulationsModule);
```

## React Integration

The module system integrates with React through:

1. **ModuleProvider** - Context provider that makes module data available
2. **useModules** - Hook for accessing the module registry from components
3. **DynamicModuleNavigation** - Navigation component that renders based on registered modules

## Using Modules in Components

To use modules in a component:

```tsx
import { useModules } from '@/lib/modules';

function MyComponent() {
  const { 
    enabledModules,
    navigationItems,
    isModuleEnabled,
    setModuleEnabled
  } = useModules();
  
  // Use module data in your component...
  
  return (
    <div>
      {/* Render UI based on module data */}
      {navigationItems.map(item => (
        <NavigationItem key={item.id} {...item} />
      ))}
    </div>
  );
}
```

## Adding a New Module

To create a new module:

1. Create a directory for your module in `src/modules/`
2. Define module components in a `components/` subdirectory
3. Create an `index.ts` file with your module definition
4. Register the module with `registerModule`
5. Import your module in the root `src/modules/index.ts`

## Theme Integration

The Module Registry system integrates with the theme system:

1. The `DynamicModuleNavigation` component adapts its appearance based on the current theme
2. Module components can use theme-aware styling
3. The `EnhancedModularLayout` wrapper provides themed containers for modules

## Feature Flags

Modules can be enabled or disabled using feature flags:

1. Local storage persistence of enabled/disabled state
2. UI controls for toggling modules
3. Environment variable overrides for default state

## Advanced Usage

### Nested Navigation

Modules can define nested navigation structures:

```typescript
navigationItems: [
  {
    id: 'parent_item',
    name: 'Parent Item',
    icon: '📁',
    children: [
      {
        id: 'child_item',
        name: 'Child Item',
        icon: '📄',
        path: '/path/to/child'
      }
    ]
  }
]
```

### Module Dependencies

Modules can specify dependencies on other modules:

```typescript
dependencies: [
  {
    moduleId: 'ingredients',
    required: true
  }
]
```

### Custom Module Routes

For advanced routing needs, modules can specify custom route rendering:

```typescript
routes: [
  {
    path: '/complex-path/:id',
    component: ({ params }) => {
      return <ComplexComponent id={params.id} />;
    }
  }
]
```

## Best Practices

1. **Modularity** - Keep modules self-contained and focused on specific features
2. **Loose Coupling** - Use events or shared hooks for inter-module communication
3. **Consistent UX** - Follow the application's design language in module components
4. **Lazy Loading** - Consider dynamic imports for large modules
5. **Testing** - Write tests for module components and their integration

## Troubleshooting

If modules aren't appearing in navigation:

1. Check that the module is registered in `src/modules/index.ts`
2. Verify `isEnabled` is set to `true` in the module definition
3. Check for console errors during initialization
4. Make sure the `ModuleProvider` is wrapping your component
5. Check that the module's navigation items have valid paths