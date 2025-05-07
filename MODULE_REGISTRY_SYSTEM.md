# Module Registry System

## Overview

The Module Registry System provides a modular architecture for the DIY Formulations application. It allows for extensibility, feature toggling, and better organization of components and routes.

## Components

1. **ModuleRegistry (registry.ts)**
   - Singleton class for managing modules
   - Handles registration of modules
   - Tracks enabled status of modules with feature flags
   - Provides methods for retrieving modules, navigation items, and routes

2. **ModuleContext (moduleContext.tsx)**
   - React Context for providing module data to components
   - Includes ModuleProvider component
   - Provides hooks for accessing module data (useModules)
   - Includes functionality for enabling/disabling modules

3. **ModuleFactory (moduleFactory.ts)**
   - Helper for creating module definitions
   - Provides validation and defaults for modules
   - Includes helper functions for creating navigation items and routes

4. **FeatureFlags integration (featureFlags.ts)**
   - Extends base feature flags with module-specific flags
   - Provides type safety for module feature flags
   - Includes helper functions for checking module features

## Module Definition

A module is defined with the following structure:

```typescript
export interface Module {
  id: string;                           // Unique identifier
  name: string;                         // Display name
  icon: string | ReactNode;             // Icon for the module
  description?: string;                 // Description of the module
  routes: ModuleRoute[];                // Routes associated with the module
  components: {                         // Components associated with the module
    list: React.ComponentType<any>;     // List view component
    detail: React.ComponentType<{id: string}>; // Detail view component
    create: React.ComponentType<any>;   // Create form component
    [key: string]: React.ComponentType<any>; // Other custom components
  };
  navigationItems: NavigationItem[];    // Navigation items for the module
  isEnabled: boolean;                   // Whether the module is enabled by default
  settings?: Record<string, any>;       // Module-specific settings
}
```

## Usage

### Registering a Module

```typescript
import { createModule, registerModule } from '@/lib/modules';

const myModule = createModule({
  id: 'my-module',
  name: 'My Module',
  icon: '📦',
  description: 'This is my module',
  isEnabled: true,
  
  // Define the module routes
  routes: [
    { path: '/my-module', component: MyModuleListComponent },
    { path: '/my-module/:id', component: MyModuleDetailComponent },
    { path: '/my-module/new', component: MyModuleCreateComponent },
  ],
  
  // Define the module's main components
  components: {
    list: MyModuleListComponent,
    detail: MyModuleDetailComponent,
    create: MyModuleCreateComponent,
  },
  
  // Define the navigation items for this module
  navigationItems: [
    { id: 'all_items', name: 'All Items', icon: '📋', path: '/my-module' },
    { id: 'create_item', name: 'Create New', icon: '➕', path: '/my-module/new' },
  ],
  
  // Module-specific settings
  settings: {
    defaultView: 'list',
    enableFeatureX: true,
  }
});

// Register the module
registerModule(myModule);
```

### Using Modules in React Components

```typescript
import { useModules } from '@/lib/modules';

function MyComponent() {
  const { 
    modules,             // All modules
    enabledModules,      // Only enabled modules
    navigationItems,     // Navigation items from all enabled modules
    routes,              // Routes from all enabled modules
    isModuleEnabled,     // Function to check if a module is enabled
    setModuleEnabled,    // Function to enable/disable a module
    refreshModules       // Function to refresh module data
  } = useModules();
  
  // Use module data...
  
  return (
    <div>
      <h1>Modules</h1>
      <ul>
        {enabledModules.map(module => (
          <li key={module.id}>{module.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Using Module Layouts

```typescript
import ModuleLayout from '@/components/layouts/ModuleLayout';

function MyPage() {
  const [selectedId, setSelectedId] = useState(null);
  
  return (
    <ModuleLayout
      moduleId="my-module"
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      listContent={
        <MyModuleListComponent 
          onSelect={setSelectedId} 
          selectedId={selectedId}
        />
      }
      detailContent={
        selectedId && <MyModuleDetailComponent id={selectedId} />
      }
    />
  );
}
```

## Benefits

1. **Extensibility**: New modules can be added without modifying existing code
2. **Feature Toggling**: Modules can be enabled/disabled at runtime
3. **Consistent UI**: Common layout patterns can be applied across modules
4. **Organized Code**: Modules keep related components and functionality together
5. **Dynamic Navigation**: Navigation is generated from module definitions
6. **Better User Experience**: Users only see enabled modules and features

## Integration with Formulations Module

The formulations module (previously recipes) has been fully integrated with the Module Registry System. This includes:

1. **Module Definition**: Created a formulation module definition
2. **Component Integration**: Integrated formulation components with the module system
3. **Repository Pattern**: Implemented repository pattern for data access
4. **Navigation**: Added navigation items for the formulation module
5. **Feature Flags**: Implemented feature flags for the formulation module
6. **Layout Integration**: Integrated the formulation module with ModuleLayout

## Future Enhancements

1. **Module Marketplace**: Allow users to discover and install new modules
2. **Module Settings UI**: Create UI for managing module settings
3. **Module Versioning**: Track module versions for updates
4. **Module Dependencies**: Implement module dependencies system
5. **Module Events**: Create event system for inter-module communication