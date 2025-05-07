import { ReactNode } from 'react';

/**
 * Interface for navigation items within a module
 */
export interface NavigationItem {
  id: string;
  name: string;
  icon: string | ReactNode;
  path?: string;
  children?: NavigationItem[];
}

/**
 * Interface for module routes
 */
export interface ModuleRoute {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

/**
 * Interface for a module in the registry system
 */
export interface Module {
  id: string;
  name: string;
  icon: string | ReactNode;
  description?: string;
  routes: ModuleRoute[];
  components: {
    list: React.ComponentType<any>;
    detail: React.ComponentType<{id: string}>;
    create: React.ComponentType<any>;
    [key: string]: React.ComponentType<any>;
  };
  navigationItems: NavigationItem[];
  isEnabled: boolean;
  settings?: Record<string, any>;
}

/**
 * ModuleRegistry - A singleton class to manage application modules
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, Module> = new Map();
  private featureFlags: Map<string, boolean> = new Map();

  private constructor() {
    // Initialize feature flags from environment or localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const storedFlags = localStorage.getItem('featureFlags');
        if (storedFlags) {
          const parsedFlags = JSON.parse(storedFlags);
          Object.keys(parsedFlags).forEach(key => {
            this.featureFlags.set(key, !!parsedFlags[key]);
          });
        }
      } catch (e) {
        console.warn('Error loading feature flags from localStorage:', e);
      }
    }
  }

  /**
   * Get the singleton instance of ModuleRegistry
   */
  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Register a new module
   */
  public registerModule(module: Module): void {
    if (this.modules.has(module.id)) {
      console.warn(`Module with ID ${module.id} is already registered. Overwriting.`);
    }
    
    // Store the module
    this.modules.set(module.id, module);
    
    // Store module's enabled state in feature flags if not already set
    const moduleFeatureKey = `module_${module.id}`;
    if (!this.featureFlags.has(moduleFeatureKey)) {
      this.featureFlags.set(moduleFeatureKey, module.isEnabled);
      this.saveFeatureFlags();
    }
    
    console.log(`Module "${module.name}" (${module.id}) registered successfully`);
  }

  /**
   * Get a module by its ID
   */
  public getModule(id: string): Module | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules
   */
  public getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all enabled modules
   */
  public getEnabledModules(): Module[] {
    return this.getAllModules().filter(module => this.isModuleEnabled(module.id));
  }

  /**
   * Check if a module is enabled
   */
  public isModuleEnabled(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;
    
    const featureFlagKey = `module_${moduleId}`;
    // If we have a feature flag for this module, use it
    if (this.featureFlags.has(featureFlagKey)) {
      return this.featureFlags.get(featureFlagKey) as boolean;
    }
    
    // Otherwise, use the module's default isEnabled value
    return module.isEnabled;
  }

  /**
   * Enable or disable a module
   */
  public setModuleEnabled(moduleId: string, enabled: boolean): void {
    const featureFlagKey = `module_${moduleId}`;
    this.featureFlags.set(featureFlagKey, enabled);
    this.saveFeatureFlags();
  }

  /**
   * Get all navigation items from enabled modules
   */
  public getAllNavigationItems(): NavigationItem[] {
    return this.getEnabledModules()
      .flatMap(module => module.navigationItems)
      .filter(Boolean);
  }

  /**
   * Get all routes from enabled modules
   */
  public getAllRoutes(): ModuleRoute[] {
    return this.getEnabledModules()
      .flatMap(module => module.routes)
      .filter(Boolean);
  }

  /**
   * Save feature flags to localStorage
   */
  private saveFeatureFlags(): void {
    if (typeof window !== 'undefined') {
      try {
        const flagsObj = Object.fromEntries(this.featureFlags);
        localStorage.setItem('featureFlags', JSON.stringify(flagsObj));
      } catch (e) {
        console.warn('Error saving feature flags to localStorage:', e);
      }
    }
  }
}

// Create a convenience export for the getInstance method
export const getModuleRegistry = ModuleRegistry.getInstance;

// Export a helper function to register a module
export function registerModule(module: Module): void {
  ModuleRegistry.getInstance().registerModule(module);
}

// Export a helper function to check if a module is enabled
export function isModuleEnabled(moduleId: string): boolean {
  return ModuleRegistry.getInstance().isModuleEnabled(moduleId);
}

// Export a helper function to enable or disable a module
export function setModuleEnabled(moduleId: string, enabled: boolean): void {
  ModuleRegistry.getInstance().setModuleEnabled(moduleId, enabled);
}