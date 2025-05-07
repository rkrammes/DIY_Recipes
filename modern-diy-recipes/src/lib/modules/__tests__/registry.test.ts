import { ModuleRegistry, Module, NavigationItem, registerModule, isModuleEnabled, setModuleEnabled } from '../registry';

// Mock localStorage for testing
const mockLocalStorage = (function() {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ModuleRegistry', () => {
  // Create some test modules
  const testModule1: Module = {
    id: 'test-module-1',
    name: 'Test Module 1',
    icon: '🧪',
    routes: [
      { path: '/test1', component: () => null }
    ],
    components: {
      list: () => null,
      detail: () => null,
      create: () => null,
    },
    navigationItems: [
      { id: 'test1-nav', name: 'Test 1', icon: '📝' }
    ],
    isEnabled: true,
  };
  
  const testModule2: Module = {
    id: 'test-module-2',
    name: 'Test Module 2',
    icon: '📊',
    routes: [
      { path: '/test2', component: () => null }
    ],
    components: {
      list: () => null,
      detail: () => null,
      create: () => null,
    },
    navigationItems: [
      { id: 'test2-nav', name: 'Test 2', icon: '📈' }
    ],
    isEnabled: false,
  };
  
  beforeEach(() => {
    // Clear any previously registered modules
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Reset ModuleRegistry singleton
    // @ts-ignore - Accessing private property for testing
    ModuleRegistry.instance = undefined;
  });
  
  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = ModuleRegistry.getInstance();
      const instance2 = ModuleRegistry.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('registerModule', () => {
    it('should register a module', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(1);
      expect(modules[0]).toBe(testModule1);
    });
    
    it('should overwrite module with same ID', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      
      const updatedModule = {
        ...testModule1,
        name: 'Updated Module'
      };
      
      registry.registerModule(updatedModule);
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(1);
      expect(modules[0].name).toBe('Updated Module');
    });
    
    it('should store module enabled state in feature flags', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      
      // Check if feature flag is set correctly
      expect(registry.isModuleEnabled(testModule1.id)).toBe(true);
      
      registry.registerModule(testModule2);
      expect(registry.isModuleEnabled(testModule2.id)).toBe(false);
    });
  });
  
  describe('getModule', () => {
    it('should retrieve a module by ID', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      registry.registerModule(testModule2);
      
      const module = registry.getModule('test-module-1');
      expect(module).toBe(testModule1);
    });
    
    it('should return undefined for non-existent module', () => {
      const registry = ModuleRegistry.getInstance();
      
      const module = registry.getModule('non-existent');
      expect(module).toBeUndefined();
    });
  });
  
  describe('getAllModules', () => {
    it('should return all registered modules', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      registry.registerModule(testModule2);
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(2);
      expect(modules[0]).toBe(testModule1);
      expect(modules[1]).toBe(testModule2);
    });
    
    it('should return empty array if no modules registered', () => {
      const registry = ModuleRegistry.getInstance();
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(0);
    });
  });
  
  describe('getEnabledModules', () => {
    it('should return only enabled modules', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);  // enabled
      registry.registerModule(testModule2);  // disabled
      
      const modules = registry.getEnabledModules();
      expect(modules).toHaveLength(1);
      expect(modules[0]).toBe(testModule1);
    });
  });
  
  describe('isModuleEnabled and setModuleEnabled', () => {
    it('should check if a module is enabled', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      registry.registerModule(testModule2);
      
      expect(registry.isModuleEnabled('test-module-1')).toBe(true);
      expect(registry.isModuleEnabled('test-module-2')).toBe(false);
    });
    
    it('should return false for non-existent module', () => {
      const registry = ModuleRegistry.getInstance();
      
      expect(registry.isModuleEnabled('non-existent')).toBe(false);
    });
    
    it('should enable or disable a module', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      registry.registerModule(testModule2);
      
      // Disable test-module-1
      registry.setModuleEnabled('test-module-1', false);
      expect(registry.isModuleEnabled('test-module-1')).toBe(false);
      
      // Enable test-module-2
      registry.setModuleEnabled('test-module-2', true);
      expect(registry.isModuleEnabled('test-module-2')).toBe(true);
    });
    
    it('should save state to localStorage', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);
      
      registry.setModuleEnabled('test-module-1', false);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Load a new registry to test if it loads from localStorage
      // @ts-ignore - Accessing private property for testing
      ModuleRegistry.instance = undefined;
      const newRegistry = ModuleRegistry.getInstance();
      
      // We've cleared the registry, so it won't have any modules
      // but we can verify localstorage was called
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
    });
  });
  
  describe('Navigation and Routes helpers', () => {
    it('should return all navigation items from enabled modules', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);  // enabled
      registry.registerModule(testModule2);  // disabled
      
      const navItems = registry.getAllNavigationItems();
      expect(navItems).toHaveLength(1);
      expect(navItems[0].id).toBe('test1-nav');
    });
    
    it('should return all routes from enabled modules', () => {
      const registry = ModuleRegistry.getInstance();
      registry.registerModule(testModule1);  // enabled
      registry.registerModule(testModule2);  // disabled
      
      const routes = registry.getAllRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/test1');
    });
  });
  
  describe('Helper functions', () => {
    it('registerModule should register a module with the registry', () => {
      registerModule(testModule1);
      
      const registry = ModuleRegistry.getInstance();
      expect(registry.getModule('test-module-1')).toBe(testModule1);
    });
    
    it('isModuleEnabled should check if a module is enabled', () => {
      registerModule(testModule1);  // enabled
      
      expect(isModuleEnabled('test-module-1')).toBe(true);
      expect(isModuleEnabled('non-existent')).toBe(false);
    });
    
    it('setModuleEnabled should enable or disable a module', () => {
      registerModule(testModule1);  // enabled initially
      
      setModuleEnabled('test-module-1', false);
      expect(isModuleEnabled('test-module-1')).toBe(false);
    });
  });
});