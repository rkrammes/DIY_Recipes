import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateClientEnvironment, 
  validateServerEnvironment,
  isFeatureEnabled,
  getEnvironmentStatus,
  validateFeatureFlags,
  getUiMode
} from '../environmentValidator';

// Mock feature-flags module
vi.mock('../feature-flags', () => {
  return {
    default: {
      recipeVersioning: true,
      useTerminalUI: false,
      useMockData: false,
      useSupabase: true
    },
    isFeatureEnabled: (name: string) => {
      const flags = {
        recipeVersioning: true,
        useTerminalUI: false, 
        useMockData: false,
        useSupabase: true
      };
      return flags[name] === true;
    }
  };
});

// Mock modules/featureFlags
vi.mock('../modules/featureFlags', () => {
  return {
    isModuleFeatureEnabled: (moduleId: string, featureKey?: string) => {
      if (moduleId === 'test-module' && featureKey === 'enabled-feature') {
        return true;
      }
      return false;
    }
  };
});

describe('environmentValidator', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    
    // Mock NODE_ENV
    process.env.NODE_ENV = 'development';
  });
  
  afterEach(() => {
    // Restore process.env
    process.env = originalEnv;
  });
  
  describe('validateClientEnvironment', () => {
    it('should return true in development when variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      expect(validateClientEnvironment()).toBe(true);
    });
    
    it('should return true when all required variables are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      
      expect(validateClientEnvironment()).toBe(true);
    });
    
    it('should return false in production when variables are missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      expect(validateClientEnvironment()).toBe(false);
    });
  });
  
  describe('validateServerEnvironment', () => {
    it('should return false when server variables are missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      expect(validateServerEnvironment()).toBe(false);
    });
    
    it('should return true when all server variables are present', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
      
      expect(validateServerEnvironment()).toBe(true);
    });
  });
  
  describe('isFeatureEnabled', () => {
    it('should check environment variables first', () => {
      process.env.NEXT_PUBLIC_ENABLE_MODULES = 'true';
      
      expect(isFeatureEnabled('modules')).toBe(true);
      
      process.env.NEXT_PUBLIC_ENABLE_MODULES = 'false';
      
      expect(isFeatureEnabled('modules')).toBe(false);
    });
    
    it('should fall back to feature flags system', () => {
      // This feature is enabled in our mocked feature flags
      expect(isFeatureEnabled('recipe-versioning')).toBe(true);
    });
    
    it('should handle module-specific features', () => {
      expect(isFeatureEnabled('test-module:enabled-feature')).toBe(true);
      expect(isFeatureEnabled('test-module:disabled-feature')).toBe(false);
    });
    
    it('should return false for unknown features', () => {
      expect(isFeatureEnabled('non-existent-feature')).toBe(false);
    });
  });
  
  describe('getEnvironmentStatus', () => {
    it('should return correct environment status', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.NEXT_PUBLIC_DEFAULT_THEME = 'dystopia';
      process.env.NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING = 'true';
      
      const status = getEnvironmentStatus();
      
      expect(status.isDevelopment).toBe(true);
      expect(status.environment).toBe('development');
      expect(status.supabaseUrl).toBe('Set');
      expect(status.supabaseAnonKey).toBe('Set');
      expect(status.theme).toBe('dystopia');
      expect(status.recipeVersioningEnabled).toBe(true);
    });
  });
  
  describe('validateFeatureFlags', () => {
    it('should detect conflicting UI mode settings', () => {
      process.env.NEXT_PUBLIC_TERMINAL_UI_ENABLED = 'true';
      process.env.NEXT_PUBLIC_DOCUMENT_MODE_ENABLED = 'true';
      
      expect(validateFeatureFlags()).toBe(false);
    });
    
    it('should allow non-conflicting settings', () => {
      process.env.NEXT_PUBLIC_TERMINAL_UI_ENABLED = 'true';
      process.env.NEXT_PUBLIC_DOCUMENT_MODE_ENABLED = 'false';
      
      expect(validateFeatureFlags()).toBe(true);
    });
  });
  
  describe('getUiMode', () => {
    it('should use environment variable if present', () => {
      process.env.NEXT_PUBLIC_UI_MODE = 'document';
      
      expect(getUiMode()).toBe('document');
    });
    
    it('should fall back to feature flags', () => {
      delete process.env.NEXT_PUBLIC_UI_MODE;
      process.env.NEXT_PUBLIC_TERMINAL_UI_ENABLED = 'true';
      
      expect(getUiMode()).toBe('terminal');
    });
    
    it('should default to standard mode', () => {
      delete process.env.NEXT_PUBLIC_UI_MODE;
      process.env.NEXT_PUBLIC_TERMINAL_UI_ENABLED = 'false';
      process.env.NEXT_PUBLIC_DOCUMENT_MODE_ENABLED = 'false';
      
      expect(getUiMode()).toBe('standard');
    });
  });
});