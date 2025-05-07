import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModuleRegistry, Module, NavigationItem, ModuleRoute } from './registry';

// Create a context for the module registry
interface ModuleContextType {
  modules: Module[];
  enabledModules: Module[];
  navigationItems: NavigationItem[];
  routes: ModuleRoute[];
  isModuleEnabled: (moduleId: string) => boolean;
  setModuleEnabled: (moduleId: string, enabled: boolean) => void;
  refreshModules: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

// Provider component for the ModuleContext
export const ModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const registry = ModuleRegistry.getInstance();
  const [modules, setModules] = useState<Module[]>(registry.getAllModules());
  const [enabledModules, setEnabledModules] = useState<Module[]>(registry.getEnabledModules());
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(registry.getAllNavigationItems());
  const [routes, setRoutes] = useState<ModuleRoute[]>(registry.getAllRoutes());

  // Function to refresh the modules state
  const refreshModules = () => {
    setModules(registry.getAllModules());
    setEnabledModules(registry.getEnabledModules());
    setNavigationItems(registry.getAllNavigationItems());
    setRoutes(registry.getAllRoutes());
  };

  // Function to enable or disable a module
  const handleSetModuleEnabled = (moduleId: string, enabled: boolean) => {
    registry.setModuleEnabled(moduleId, enabled);
    refreshModules();
  };

  // Function to check if a module is enabled
  const handleIsModuleEnabled = (moduleId: string) => {
    return registry.isModuleEnabled(moduleId);
  };

  // Initialize and refresh modules when the component mounts
  useEffect(() => {
    refreshModules();
  }, []);

  const value = {
    modules,
    enabledModules,
    navigationItems,
    routes,
    isModuleEnabled: handleIsModuleEnabled,
    setModuleEnabled: handleSetModuleEnabled,
    refreshModules,
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
};

// Hook to use the ModuleContext
export function useModules() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
}

// Export a HoC to wrap components that need access to the ModuleContext
export function withModules<P>(Component: React.ComponentType<P & ModuleContextType>) {
  return function WithModulesComponent(props: P) {
    return (
      <ModuleProvider>
        <Component {...props} {...useModules()} />
      </ModuleProvider>
    );
  };
}