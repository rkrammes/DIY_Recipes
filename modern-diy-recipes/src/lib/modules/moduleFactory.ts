import { Module, ModuleRoute, NavigationItem } from './registry';

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isEnabled?: boolean;
  routes?: ModuleRoute[];
  components?: Partial<Module['components']>;
  navigationItems?: NavigationItem[];
  settings?: Record<string, any>;
}

/**
 * Factory function to create a Module with defaults and validation
 */
export function createModule(config: ModuleConfig): Module {
  // Validate required properties
  if (!config.id) throw new Error('Module id is required');
  if (!config.name) throw new Error('Module name is required');
  if (!config.icon) throw new Error('Module icon is required');

  // Create default empty components
  const defaultComponents = {
    list: () => null,
    detail: () => null,
    create: () => null,
  };

  // Create a module with provided config and defaults
  const module: Module = {
    id: config.id,
    name: config.name,
    icon: config.icon,
    description: config.description || '',
    routes: config.routes || [],
    components: {
      ...defaultComponents,
      ...config.components,
    },
    navigationItems: config.navigationItems || [],
    isEnabled: config.isEnabled !== undefined ? config.isEnabled : true,
    settings: config.settings || {},
  };

  return module;
}

/**
 * Helper to create navigation items for a module
 */
export function createNavigationItem(config: Partial<NavigationItem> & { id: string; name: string }): NavigationItem {
  return {
    id: config.id,
    name: config.name,
    icon: config.icon || '📄',
    path: config.path,
    children: config.children,
  };
}

/**
 * Helper to create module routes
 */
export function createModuleRoute(
  path: string,
  component: React.ComponentType<any>,
  exact: boolean = false
): ModuleRoute {
  return {
    path,
    component,
    exact,
  };
}